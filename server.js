/**
 * StackConnect Production Server
 * Express backend: Auth (bcrypt + JWT) → AI proxy (OmniRoute → Ollama) → E2B sandbox
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';
import { config as loadEnv } from 'dotenv';
loadEnv(); // ⚡ MUST run before reading process.env — loads .env (never committed)
import { computeCompetency, recommend, getSeededRoles, getSeededCourses } from './server/engine.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const NODE_ENV = process.env.NODE_ENV || 'development';
const JWT_SECRET = process.env.JWT_SECRET || '';
if (!JWT_SECRET) {
  if (NODE_ENV === 'production') {
    console.error('❌ JWT_SECRET is REQUIRED in production. Set JWT_SECRET in .env — refusing to start.');
    process.exit(1);
  }
  console.warn('⚠️  JWT_SECRET not set — dev fallback only. Set JWT_SECRET in .env for production.');
}
const OMNIROUTE_URL = process.env.OMNIROUTE_URL || 'http://localhost:20128/v1/chat/completions';
const OMNIROUTE_KEY = process.env.OMNIROUTE_KEY || '';
const OMNIROUTE_MODEL = process.env.OMNIROUTE_MODEL || 'auto/best-coding';
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'gemma4:latest';
const E2B_KEY = process.env.E2B_API_KEY || '';

// ─── Database (SQLite via node:sqlite) ─────────────────

const DATA_DIR = join(__dirname, 'data');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
const DB_PATH = join(DATA_DIR, 'stackconnect.db');
const db = new DatabaseSync(DB_PATH);

// WAL for concurrent reads + integrity
db.exec(`
  PRAGMA journal_mode = WAL;
  PRAGMA foreign_keys = ON;

  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT,
    role TEXT NOT NULL DEFAULT 'learner',
    designation TEXT DEFAULT '',
    department TEXT DEFAULT '',
    avatar_url TEXT DEFAULT '',
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS quiz_attempts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    quiz_id TEXT NOT NULL,
    document_title TEXT NOT NULL,
    target_skill_id TEXT NOT NULL,
    questions_json TEXT NOT NULL,
    answers_json TEXT NOT NULL,
    score_percent INTEGER NOT NULL,
    passed INTEGER NOT NULL DEFAULT 0,
    topic_scores_json TEXT NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS skill_scores (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    skill_id TEXT NOT NULL,
    level INTEGER NOT NULL DEFAULT 1,
    last_assessed_at TEXT NOT NULL,
    assessed_via TEXT NOT NULL DEFAULT 'quiz',
    UNIQUE(user_id, skill_id)
  );

  CREATE TABLE IF NOT EXISTS enrollments (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id),
    course_id TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'in_progress',
    progress_percent INTEGER NOT NULL DEFAULT 0,
    enrolled_at TEXT NOT NULL,
    completed_at TEXT,
    UNIQUE(user_id, course_id)
  );

  CREATE INDEX IF NOT EXISTS idx_attempts_user ON quiz_attempts(user_id);
  CREATE INDEX IF NOT EXISTS idx_scores_user ON skill_scores(user_id);
`);

function rowToUser(row) {
  if (!row) return null;
  return {
    id: row.id, name: row.name, email: row.email,
    role: row.role, designation: row.designation,
    department: row.department, createdAt: row.created_at,
  };
}

function findUserByEmail(email) {
  const row = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
  return row || null;
}

function findUserById(id) {
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(id);
  return row || null;
}

// ─── Demo personas (judges click → instant auth) ───────
const DEMO_PERSONAS = [
  { id: 'demo_admin',   name: 'Priya Iyer',        email: 'priya.iyer@mospi.gov.in',  designation: 'Deputy Director, MoSPI',  role: 'admin' },
  { id: 'demo_learner',  name: 'Rajesh Kumar',      email: 'rajesh.kumar@jsu.gov.in',  designation: 'NSSTA Learner',           role: 'learner' },
  { id: 'demo_judge',    name: 'Dr. Anita Sharma',   email: 'anita.sharma@gov.in',       designation: 'DG-CSO',                 role: 'admin' },
];

// ─── JWT helpers ───────────────────────────────────────
function generateToken(user) {
  return jwt.sign(
    { id: user.id || user.email, email: user.email, name: user.name, role: user.role || 'learner', designation: user.designation || '' },
    JWT_SECRET,
    { expiresIn: '24h' }
  );
}

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'Authentication required' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

// ─── Middleware ─────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"], // React inline style props need this
      imgSrc: ["'self'", 'data:', 'https://api.dicebear.com', 'https://images.unsplash.com'],
      fontSrc: ["'self'", 'data:'],
      connectSrc: ["'self'", 'http://localhost:3000', 'http://localhost:5173'],
      objectSrc: ["'none'"],
      frameAncestors: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// Rate limiting — block brute force / abuse
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 50, // 50 login/register attempts per IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many authentication attempts. Try again later.' },
});
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 min
  max: 10, // 10 AI generations per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI request limit reached. Please wait a moment.' },
});

app.use('/api/auth', authLimiter);
app.use('/api/ai', aiLimiter);
app.use('/api/e2b', aiLimiter);

app.use(express.json({ limit: '2mb' }));
const ALLOWED_ORIGINS = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
];
app.use(cors({
  origin(origin, cb) {
    // Non-browser clients (curl, server-side) have no Origin — allow
    if (!origin || ALLOWED_ORIGINS.includes(origin)) return cb(null, true);
    // Block disallowed origins (no CORS headers sent)
    return cb(null, false);
  },
  credentials: true,
}));

// ─── Auth Routes ───────────────────────────────────────

// Register new account
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
    if (typeof name !== 'string' || name.trim().length < 2 || name.length > 80) return res.status(400).json({ error: 'Name must be 2-80 characters' });
    if (/[<>]/.test(name)) return res.status(400).json({ error: 'Name contains invalid characters' });
    if (typeof password !== 'string' || password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters' });
    if (password.length > 72) return res.status(400).json({ error: 'Password too long (max 72 chars)' });
    // Basic email sanity — rejects obvious junk, keeps .gov.in/.com flexibility
    if (typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 200) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    const emailNorm = email.toLowerCase().trim();
    if (findUserByEmail(emailNorm)) return res.status(409).json({ error: 'Email already registered' });

    const hash = await bcrypt.hash(password, 12);
    const userId = `user_${Date.now()}_${Math.random().toString(36).slice(2,6)}`;
    db.prepare('INSERT INTO users(id, name, email, password_hash, role, designation, department, created_at) VALUES(?,?,?,?,?,?,?,?)')
      .run(userId, name.trim(), emailNorm, hash, 'learner', 'Government Officer', 'MoSPI', new Date().toISOString());

    const token = generateToken({ id: userId, email: emailNorm, name: name.trim(), role: 'learner', designation: 'Government Officer' });
    res.json({
      token,
      user: { name: name.trim(), email: emailNorm, role: 'learner', designation: 'Government Officer' },
    });
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Login with password
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' });

    const user = findUserByEmail(email.toLowerCase().trim());
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' });

    const token = generateToken(user);
    res.json({
      token,
      user: { name: user.name, email: user.email, role: user.role, designation: user.designation },
    });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Demo persona login (no password) — upserts persona into DB as a real user
// ⚠️ ONLY enabled in development/demo mode. In production, demo login is disabled.
app.post('/api/auth/demo-login', (req, res) => {
  if (NODE_ENV === 'production') {
    return res.status(403).json({ error: 'Demo login disabled in production' });
  }
  const { personaId } = req.body;
  const persona = DEMO_PERSONAS.find(p => p.id === personaId);
  if (!persona) return res.status(404).json({ error: 'Demo persona not found' });

  // Ensure user exists in DB (id = persona email — stable, queryable)
  const existing = findUserByEmail(persona.email);
  if (!existing) {
    db.prepare('INSERT OR IGNORE INTO users(id, name, email, password_hash, role, designation, department, created_at) VALUES(?,?,?,?,?,?,?,?)')
      .run(persona.email, persona.name, persona.email, null, persona.role, persona.designation, 'MoSPI', new Date().toISOString());
  }

  const token = generateToken({ id: persona.email, email: persona.email, name: persona.name, role: persona.role, designation: persona.designation });
  res.json({
    token,
    user: { name: persona.name, email: persona.email, role: persona.role, designation: persona.designation },
  });
});

// Validate token
app.get('/api/auth/me', authMiddleware, (req, res) => {
  res.json({ user: req.user });
});

// ─── Data Persistence Routes (SQLite-backed) ──────────

// Save a quiz attempt + update skill score (atomic)
app.post('/api/attempts', authMiddleware, (req, res) => {
  try {
    const {
      quizId, documentTitle, targetSkillId, questions,
      answers, scorePercent, passed, topicScores, newSkillLevel,
    } = req.body;

    const userId = req.user.id || req.user.email; // stable identity
    const now = new Date().toISOString();

    // Upsert skill score (take highest level)
    db.prepare(`
      INSERT INTO skill_scores(id, user_id, skill_id, level, last_assessed_at, assessed_via)
      VALUES(?, ?, ?, ?, ?, 'quiz')
      ON CONFLICT(user_id, skill_id) DO UPDATE SET
        level = MAX(skill_scores.level, excluded.level),
        last_assessed_at = excluded.last_assessed_at
    `).run(`score_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      userId, targetSkillId, Math.min(3, newSkillLevel || 1), now);

    // Insert attempt
    db.prepare(`
      INSERT INTO quiz_attempts(id, user_id, quiz_id, document_title, target_skill_id,
        questions_json, answers_json, score_percent, passed, topic_scores_json, created_at)
      VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      `att_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      userId, quizId, documentTitle, targetSkillId,
      JSON.stringify(questions || []), JSON.stringify(answers || {}),
      scorePercent || 0, passed ? 1 : 0, JSON.stringify(topicScores || {}), now
    );

    res.json({ ok: true, savedAt: now });
  } catch (e) {
    console.error('Save attempt error:', e);
    res.status(500).json({ error: 'Failed to save attempt' });
  }
});

// Fetch a user's quiz history
app.get('/api/attempts', authMiddleware, (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT * FROM quiz_attempts WHERE user_id = ? ORDER BY created_at DESC LIMIT 50'
    ).all(req.user.id || req.user.email);
    const attempts = rows.map(r => ({
      id: r.id, quizId: r.quiz_id, documentTitle: r.document_title,
      targetSkillId: r.target_skill_id, scorePercent: r.score_percent,
      passed: !!r.passed, createdAt: r.created_at,
      topicScores: JSON.parse(r.topic_scores_json || '{}'),
    }));
    res.json({ attempts });
  } catch (e) {
    console.error('Get attempts error:', e);
    res.status(500).json({ error: 'Failed to load attempts' });
  }
});

// Fetch a user's skill scores
app.get('/api/skills', authMiddleware, (req, res) => {
  try {
    const rows = db.prepare(
      'SELECT skill_id, level, last_assessed_at, assessed_via FROM skill_scores WHERE user_id = ?'
    ).all(req.user.id || req.user.email);
    res.json({ skills: rows });
  } catch (e) {
    console.error('Get skills error:', e);
    res.status(500).json({ error: 'Failed to load skills' });
  }
});

// Update skill level (from course completion, admin, etc.)
app.post('/api/skills', authMiddleware, (req, res) => {
  try {
    const { skillId, level, assessedVia } = req.body;
    if (!skillId) return res.status(400).json({ error: 'skillId required' });
    const userId = req.user.id || req.user.email;
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO skill_scores(id, user_id, skill_id, level, last_assessed_at, assessed_via)
      VALUES(?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id, skill_id) DO UPDATE SET
        level = excluded.level, last_assessed_at = excluded.last_assessed_at, assessed_via = excluded.assessed_via
    `).run(`score_${Date.now()}_${Math.random().toString(36).slice(2,6)}`,
      userId, skillId, Math.min(3, Math.max(0, Number(level) || 0)), now, assessedVia || 'manual');
    res.json({ ok: true });
  } catch (e) {
    console.error('Save skill error:', e);
    res.status(500).json({ error: 'Failed to save skill' });
  }
});

// ─── Competency & Recommendation Engine Routes ────────

// Full competency snapshot + recommendations for the logged-in user
app.get('/api/engine/competency', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id || req.user.email;
    const skillRows = db.prepare('SELECT skill_id, level, last_assessed_at, assessed_via FROM skill_scores WHERE user_id = ?').all(userId);
    const attemptRows = db.prepare('SELECT target_skill_id, score_percent, created_at FROM quiz_attempts WHERE user_id = ?').all(userId);
    const roleId = req.query.roleId || 'role_jsso';
    const result = computeCompetency(skillRows, attemptRows, roleId);
    res.json(result);
  } catch (e) {
    console.error('Engine competency error:', e);
    res.status(500).json({ error: 'Failed to compute competency' });
  }
});

// Recommendations only (respects ?limit)
app.get('/api/engine/recommendations', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id || req.user.email;
    const skillRows = db.prepare('SELECT skill_id, level, last_assessed_at, assessed_via FROM skill_scores WHERE user_id = ?').all(userId);
    const attemptRows = db.prepare('SELECT target_skill_id, score_percent, created_at FROM quiz_attempts WHERE user_id = ?').all(userId);
    const roleId = req.query.roleId || 'role_jsso';
    const competency = computeCompetency(skillRows, attemptRows, roleId);
    const recs = recommend(competency, { limit: Number(req.query.limit) || 6 });
    res.json(recs);
  } catch (e) {
    console.error('Engine recommendations error:', e);
    res.status(500).json({ error: 'Failed to compute recommendations' });
  }
});

// Roles + courses catalog (for dropdowns / admin)
app.get('/api/engine/catalog', authMiddleware, (req, res) => {
  try {
    res.json({ roles: getSeededRoles(), courses: getSeededCourses() });
  } catch (e) {
    console.error('Engine catalog error:', e);
    res.status(500).json({ error: 'Failed to load catalog' });
  }
});

// ─── AI Chat Proxy (server-side — NO keys in browser) ──

app.post('/api/ai/chat', authMiddleware, async (req, res) => {
  const { messages, max_tokens, temperature } = req.body;
  if (!messages) return res.status(400).json({ error: 'messages required' });

  // ── Try OmniRoute first ──
  if (OMNIROUTE_KEY) {
    try {
      console.log(`[AI] Trying OmniRoute (${OMNIROUTE_MODEL})...`);
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 120000);

      const response = await fetch(OMNIROUTE_URL, {
        method: 'POST',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OMNIROUTE_KEY}`,
        },
        body: JSON.stringify({
          model: OMNIROUTE_MODEL,
          messages,
          max_tokens: max_tokens || 8000,
          temperature: temperature ?? 0.7,
        }),
      });
      clearTimeout(timeout);

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          console.log(`[AI] OmniRoute OK (${content.length} chars)`);
          return res.json({ content, provider: 'omniroute' });
        }
        console.warn('[AI] OmniRoute returned empty content');
      } else {
        const body = await response.text().catch(() => '');
        console.error(`[AI] OmniRoute HTTP ${response.status}: ${body.slice(0, 200)}`);
      }
    } catch (e) {
      console.error('[AI] OmniRoute failed:', e.message);
    }
  }

  // ── Fallback: Ollama ──
  try {
    console.log(`[AI] Trying Ollama (${OLLAMA_MODEL})...`);
    const response = await fetch(`${OLLAMA_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        messages,
        stream: false,
        options: {
          temperature: temperature ?? 0.7,
          num_predict: max_tokens || 6000,
        },
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.message?.content;
      if (content) {
        console.log(`[AI] Ollama OK (${content.length} chars)`);
        return res.json({ content, provider: 'ollama' });
      }
    }
  } catch (e) {
    console.error('[AI] Ollama failed:', e.message);
  }

  return res.status(503).json({ error: 'No AI provider available' });
});

// ─── E2B Code Execution (server-side) ──────────────────

import { spawn } from 'child_process';

// Local Python sandbox — used when E2B_API_KEY is not set
function runLocalPython(code) {
  return new Promise((resolve, reject) => {
    // Never allow filesystem-destructive or network-scanning patterns in demo
    const blocked = [
      /os\.system/i, /subprocess/i, /socket/i, /shutil\.rmtree/i,
      /__import__/i, /eval\s*\(/, /exec\s*\(/, /pickle/i, /open\(\s*['"]\//i,
      /open\(\s*['"]\/etc/i, /requests\./i, /urllib/i, /paramiko/i, /scp\b/i,
      /winreg/i, /ctypes/i, /pty/i, /getpass/i,
    ];
    for (const pattern of blocked) {
      if (pattern.test(code)) {
        return reject(new Error('Security: this pattern is not allowed in the sandbox'));
      }
    }

    const py = spawn('python', ['-c', code], {
      timeout: 15000,
      env: { ...process.env, PYTHONUNBUFFERED: '1' },
    });

    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => { py.kill('SIGKILL'); stdout += '\n[Execution timed out after 15s]'; }, 15000);

    py.stdout.on('data', (d) => { stdout += d.toString(); if (stdout.length > 50000) { py.kill('SIGKILL'); stdout += '\n[Output truncated at 50KB]'; } });
    py.stderr.on('data', (d) => { stderr += d.toString(); if (stderr.length > 50000) { py.kill('SIGKILL'); stderr += '\n[Output truncated at 50KB]'; } });
    py.on('close', (code2) => {
      clearTimeout(timer);
      if (code2 !== 0 && stderr.trim()) {
        resolve({ output: stdout, error: stderr });
      } else {
        resolve({ output: stdout, error: stderr });
      }
    });
    py.on('error', (err) => reject(err));
  });
}

app.post('/api/e2b/execute', authMiddleware, async (req, res) => {
  const { code } = req.body;
  if (!code) return res.status(400).json({ error: 'Code required' });
  if (typeof code !== 'string' || code.length > 20000) {
    return res.status(400).json({ error: 'Code exceeds 20,000 character limit' });
  }

  // ── If E2B key is configured, use the real cloud sandbox ──
  if (E2B_KEY) {
    try {
      const { CodeInterpreter } = await import('@e2b/code-interpreter');
      const sandbox = await CodeInterpreter.create({ apiKey: E2B_KEY });
      const execution = await sandbox.runCode(code);
      await sandbox.kill();

      return res.json({
        output: execution.logs?.stdout?.join('\n') || '',
        error: execution.logs?.stderr?.join('\n') || execution.error?.message || '',
      });
    } catch (e) {
      console.error('[E2B] Cloud execution error:', e.message);
      console.log('[E2B] Falling back to local Python sandbox...');
      // fall through to local
    }
  } else {
    console.log('[E2B] No API key — using local Python sandbox');
  }

  // ── Local Python sandbox fallback (no key needed — works offline) ──
  try {
    const result = await runLocalPython(code);
    return res.json({ output: result.output, error: result.error });
  } catch (e) {
    console.error('[E2B] Local execution error:', e.message);
    return res.status(500).json({ error: e.message });
  }
});

// ─── Serve static build (production) ───────────────────

const distPath = join(__dirname, 'dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  // Express 5: use a regexp or middleware for SPA fallback
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api/')) {
      res.sendFile(join(distPath, 'index.html'));
    } else {
      next();
    }
  });
}

// ─── Start ─────────────────────────────────────────────

app.listen(PORT, () => {
  console.log('');
  console.log('🚀 StackConnect Production Server');
  console.log('─'.repeat(50));
  console.log(`   URL:           http://localhost:${PORT}`);
  console.log(`   JWT Secret:    ${JWT_SECRET.slice(0, 12)}...`);
  console.log(`   OmniRoute:     ${OMNIROUTE_KEY ? '✅ configured (' + OMNIROUTE_MODEL + ')' : '❌ not set'}`);
  console.log(`   Ollama:        ${OLLAMA_URL} (${OLLAMA_MODEL})`);
  console.log(`   E2B:           ${E2B_KEY ? '✅ configured' : '❌ not set (set E2B_API_KEY in .env)'}`);
  console.log(`   Database:      ${DB_PATH} (SQLite)`);
  console.log(`   Static files:  ${fs.existsSync(distPath) ? '✅ serving dist/' : '⚠️ no dist/ folder (run npm run build first)'}`);
  console.log('─'.repeat(50));
  console.log('');
});
