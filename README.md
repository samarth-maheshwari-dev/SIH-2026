# StackConnect · MoSPI Skill Intelligence Platform

**Smart India Hackathon SIH-2026 · Problem Statement PS-101 — AI-enabled Skill Intelligence Platform for MoSPI**

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  AI Skill Assessment  •  Role-Gap Analysis  •  iGOT Courses
  Virtual Lab  •  NSSTA Admin Console
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

StackConnect transforms how **MoSPI's 1,480 statistical officers** are assessed and upskilled. Instead of Excel-based skill tracking and one-size-fits-all training, it delivers a **full assessment → gap analysis → personalised upskilling loop** built on the real **NSSTA (National Statistical Systems Training Academy)** curriculum.

---

## 🎯 The Problem

India's **Official Statistical System (OSS)** spans Junior Statistical Officers (JSO), Statistical Officers (SO), Assistant Directors (AD), and senior leadership. Each role demands distinct competencies across **statistical, technical, digital-governance, and behavioural** domains — yet:

- Skill gaps are tracked manually (no centralised competency map)
- Training is generic, not matched to an officer's actual gaps
- No practice environment between assessment and course completion

## ✅ The Solution

StackConnect automates the entire loop:

```
  AI Quiz Assessment  →  Competency Profile  →  Role-Gap Analysis
                              ↓
  Personalised iGOT Courses  ←  Virtual Lab Practice  ←  Gap Engine
```

---

## ⚙️ Core Features

### 1. AI Competency Assessment Studio
- **20-question AI-generated quizzes** — fresh on every refresh (Fisher-Yates shuffle, 60+ fallback pool)
- **Upload any document** (PDF / DOCX / TXT) — the engine parses it and generates a quiz from *its* content
- **Mastery radar + 5-step learning path** on completion
- **Competency level upgrades** persist to the database

### 2. Competency & Skill-Gap Engine (server-side)
- Compares an officer's current skill levels against their **role's requirement vector** (JSO / SO / AD / DG-CSO)
- Computes **weighted role-readiness %**, **high/medium/aligned gaps**, and a **prioritised learning path**
- Pure server logic — `server/engine.js` — sourced from **real NSSTA competency domains**

### 3. iGOT Karmayogi Course Integration
- **12 courses** mapped to specific skills (`nssta` / `igot_karmayogi` / `mospi_internal` providers)
- Gap engine **recommends the course that closes the officer's specific gap**
- Enrolment updates skill levels via `UNIQUE(user, skill)` upsert

### 4. Virtual Data-Science Lab
- **Real Python code execution** in a secure sandbox — no local install needed
- **E2B cloud sandbox** (production) with **local `python -c` fallback** (demo-safe)
- Preloaded MoSPI exercises: CPI price-sample analysis, Pandas survey-data merge
- Blocklist (`os.system`, `subprocess`, `socket`, `pickle`, …), 15s timeout, 50KB output cap

### 5. NSSTA Admin Console
- **Departmental competency heatmap**
- **Role Requirement Vector manager** (edit required skill levels per role)
- **Officer Directory** with profile-completion analytics

---

## 🔐 Security (Production-Grade)

| Control | Implementation |
|---|---|
| **Auth** | bcrypt (12 rounds) + JWT (24h expiry), server-side only |
| **Secrets** | Keys held in `.env` (gitignored) — **zero secrets in browser bundle** |
| **AI Proxy** | `/api/ai/chat` server proxy → OmniRoute → Ollama; clients never see keys |
| **Helmet/CSP** | Strict Content-Security-Policy, HSTS, nosniff, X-Frame-Options |
| **CORS** | Whitelist — only `localhost` origins; disallowed origins get no CORS headers |
| **Rate Limiting** | Auth 50/15min · AI & E2B 10/min |
| **Input Validation** | Email regex, password 8–72, `<script>` rejected, 2MB body cap |
| **Fail-Closed JWT** | Production refuses to start without `JWT_SECRET`; demo-login disabled in prod |
| **Sandbox** | 20K code limit, 50KB output, 15s timeout, dangerous-pattern blocklist |

---

## 🗄️ Dataset & Provenance

Reference curriculum and metadata are sourced from **public MoSPI / NSSTA materials**:

- **nssta.gov.in** — academy mandate, campus, partner institutions, training areas
- **mospi.gov.in** — divisional structure, designations, statistical methodologies
- **PIB Press Release PRID/2114354** — NSSTA establishment details

| Category | Count |
|---|---|
| Skills (Statistical / Technical / Digital / Behavioural) | **17** |
| Role Requirement Vectors (JSO, SO, AD, DG-CSO) | **4** |
| NSSTA Training Programmes | **8** |
| iGOT Courses (skill-mapped) | **12** |
| Officer Personas | **4** |

---

## 🧱 Technology Stack

### Frontend
- **React 19** + **TypeScript 6** + **Vite 8**
- **Tailwind CSS 4** — "Emerald Prism" design system (OLED dark, glass morphism, aurora mesh)
- **Recharts** — competency radar & skill-delta visualisation
- **Lucide React** icons · **pdfjs-dist** / **mammoth** document parsing

### Backend
- **Node.js 24** + **Express 5**
- **bcryptjs**, **jsonwebtoken**, **helmet**, **express-rate-limit**, **cors**
- **dotenv** (environments never leak to git)

### AI Pipeline
- **OmniRoute Gateway** (`auto/best-coding`) → **Ollama** (Gemma4) fallback
- 20-Q compact-JSON generation with `repairQuizJson()` truncation recovery

### Database
- **SQLite** via native `node:sqlite` (zero external deps, portable)
- Tables: `users` · `quiz_attempts` · `skill_scores` · `enrollments`
- bcrypt-hashed passwords, quiz history, `UNIQUE(user, skill)` skill upserts

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 24+** (for native `node:sqlite`)
- `npm`

### Setup
```bash
# 1. Install dependencies
npm install

# 2. Configure environment (keys stay local, never committed)
cp .env.example .env
# → set JWT_SECRET (REQUIRED), OMNIROUTE_KEY, E2B_API_KEY (optional)

# 3. Run frontend + backend together
npm run dev
# Frontend  → http://localhost:5173
# Backend   → http://localhost:3000
```

### Production build
```bash
npm run build && node server.js
```

---

## 📁 Repository Structure

```
StackConnect/
├── server.js                # Express backend: auth, AI proxy, E2B, SQLite
├── server/
│   ├── engine.js            # Competency + recommendation engine
│   └── seedData.js          # SKILLS / ROLES / COURSES catalog
├── src/
│   ├── components/
│   │   ├── admin/           # Admin console, heatmap, role manager
│   │   ├── auth/            # Login, register, user-switch
│   │   ├── common/          # Sidebar, header, iGOT sync
│   │   └── learner/         # Dashboard, radar, courses, quiz, Virtual Lab
│   ├── data/                # Taxonomy, personas, NSSTA programmes
│   ├── services/            # AI, quiz engine, E2B, file parsing, server API
│   ├── types/               # TypeScript models
│   ├── App.tsx              # Root container
│   └── main.tsx             # Entry point
├── scripts/                 # Logo generation, seed extraction
├── .env.example             # Safe config template
└── vite.config.ts           # Vite /api → Express proxy
```

---

## 🔌 Ports & Dev URLs

| Service | URL |
|---|---|
| Frontend (Vite) | `http://localhost:5173` |
| Backend (Express) | `http://localhost:3000` |
| OmniRoute AI Gateway | `http://localhost:20128` |
| Ollama (fallback LLM) | `http://localhost:11434` |

---

## 📜 License

Developed for **Smart India Hackathon (SIH) 2026** — Problem Statement PS-101, Ministry of Statistics & Programme Implementation (MoSPI).

© 2026 StackConnect Team. All rights reserved.
