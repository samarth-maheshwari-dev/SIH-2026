import React, { useState, useEffect, useRef } from 'react';
import { runPython, isE2BConfigured, closeSandbox, type LabRunResult } from '../../services/e2bService';
import { getAIStatus, type AIProviderInfo } from '../../services/aiService';
import { FlaskConical, Play, Loader2, Trash2, TerminalSquare, Sparkles, Database, BarChart3, Wrench } from 'lucide-react';
import type { LabSnippet } from '../../types';

const DEMO_SNIPPETS: LabSnippet[] = [
  {
    id: 'demo_python',
    title: 'Python Data Wrangling',
    skillId: 'tech_python',
    description: 'Load a sample statistical dataset and run descriptive analysis.',
    code: `# StackConnect Virtual Lab — Python demo
import statistics

sample_prices = [142.5, 148.0, 151.2, 149.8, 155.4, 147.9, 150.1, 152.6]

print("=== CPI Price Sample Analysis ===")
print(f"Count:   {len(sample_prices)}")
print(f"Mean:    {statistics.mean(sample_prices):.2f}")
print(f"Median:  {statistics.median(sample_prices):.2f}")
print(f"Std dev: {statistics.pstdev(sample_prices):.2f}")

print()
print("Done! This sandbox runs real Python in a secure E2B container.")
`
  },
  {
    id: 'demo_pandas',
    title: 'Pandas Statistical Merge',
    skillId: 'tech_python',
    description: 'Merge two survey datasets on a key, group by, and compute summaries.',
    code: `# StackConnect Virtual Lab — Pandas & NumPy
import pandas as pd
import numpy as np

# Simulate two official survey returns
state = pd.DataFrame({
    'state_code': [1, 2, 3, 4],
    'state_name': ['Raj', 'Maharashtra', 'Karnataka', 'Delhi']
})
returns = pd.DataFrame({
    'state_code': [1, 1, 2, 3, 3, 3, 4],
    'district': ['Jaipur', 'Udaipur', 'Pune', 'BLR', 'MYS', 'UBR', 'Central'],
    'households_surveyed': np.random.randint(20, 80, 7)
})

merged = pd.merge(returns, state, on='state_code')
summary = merged.groupby('state_name')['households_surveyed'].agg(['sum', 'mean'])

print(merged)
print()
print("=== Summary by State ===")
print(summary.round(1))
`
  },
  {
    id: 'demo_plot',
    title: 'Visualize CPI Trend',
    skillId: 'tech_viz',
    description: 'Generate a matplotlib line chart of a price index series.',
    code: `# StackConnect Virtual Lab — Data Visualization
import matplotlib.pyplot as plt
import numpy as np

months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun']
cpi = [118.4, 119.1, 120.0, 121.3, 122.7, 124.0]

fig, ax = plt.subplots(figsize=(6, 4))
ax.plot(months, cpi, marker='o', linewidth=2, color='#6366f1')
ax.set_title('CPI Inflation Trend (Official Statistics Demo)')
ax.set_xlabel('Month'); ax.set_ylabel('Index Value')
ax.grid(alpha=0.3)

# The plot renders below the output automatically.
plt.tight_layout()
plt.show()
`
  },
  {
    id: 'demo_sql',
    title: 'Query a Survey Table',
    skillId: 'tech_sql',
    description: 'Run a SQL-style query over an in-memory dataset.',
    code: `# StackConnect Virtual Lab — SQL on survey data
import sqlite3
conn = sqlite3.connect(':memory:')
cur = conn.cursor()
cur.execute("CREATE TABLE officers (name TEXT, dept TEXT, level INT)")
data = [('Rajesh', 'FOD', 2), ('Priya', 'IT', 3), ('Amitabh', 'NAD', 3), ('Sunita', 'NSSTA', 3)]
cur.executemany("INSERT INTO officers VALUES (?, ?, ?)", data)
cur.execute("SELECT dept, COUNT(*) FROM officers GROUP BY dept")
for row in cur.fetchall():
    print(row)
`
  }
];

const DEFAULT_CHECK_CODE = `# Check the environment
import sys, platform
print(f"Python {sys.version.split()[0]} on {platform.system()} {platform.machine()}")
print("Sandbox ready — StackConnect Virtual Lab")`;

export const VirtualLab: React.FC = () => {
  const [code, setCode] = useState<string>(DEMO_SNIPPETS[0].code);
  const [output, setOutput] = useState<LabRunResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isE2B] = useState(isE2BConfigured());
  const [aiStatus, setAiStatus] = useState<AIProviderInfo[]>([]);
  const [envCheck, setEnvCheck] = useState<string>('');
  const outputRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getAIStatus().then(setAiStatus).catch(() => setAiStatus([]));
  }, []);

  useEffect(() => {
    // Run env check on mount to show connectivity.
    runPython(DEFAULT_CHECK_CODE)
      .then(r => setEnvCheck(`${r.stdout}${r.stderr}${r.error ? '\nERROR: ' + r.error : ''}`))
      .catch(e => setEnvCheck(`E2B not reachable: ${(e as Error).message}`));
    return () => { closeSandbox(); };
  }, []);

  const handleRun = async () => {
    setIsRunning(true);
    setOutput(null);
    try {
      const result = await runPython(code);
      setOutput(result);
    } catch (e) {
      setOutput({
        stdout: '',
        stderr: '',
        error: (e as Error).message,
        plots: [],
        text: null
      });
    } finally {
      setIsRunning(false);
      setTimeout(() => outputRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  const aiOnline = aiStatus.some(s => s.online);
  const preferred = aiStatus.find(s => s.online);
  const e2bBadge = isE2B
    ? <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-[10px] font-mono font-bold">E2B SANDBOX</span>
    : <span className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-500 border border-amber-500/30 text-[10px] font-mono font-bold" title="Set VITE_E2B_API_KEY later">DEMO/LOCAL MODE</span>;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="eng-card p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <FlaskConical className="w-5 h-5 text-emerald-500" />
              Virtual Lab (E2B Sandbox)
            </h1>
            {e2bBadge}
          </div>
          <p className="text-xs opacity-75 mt-1 font-medium">
            Run real Python code in a secure E2B container. Practice the skills you're learning — no local install needed.
          </p>
        </div>

        <div className="flex items-center gap-4 text-[11px] font-mono">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${aiOnline ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-slate-500/10 border-slate-600/30 text-slate-400'}`}>
            <Sparkles className="w-3.5 h-3.5" />
            <span>{preferred ? `${preferred.label} online` : 'AI offline (auto-fallback active)'}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Snippets / Exercises */}
        <div className="lg:col-span-4 space-y-4">
          <div className="eng-card p-5 space-y-3">
            <h2 className="font-bold text-sm flex items-center gap-2">
              <Wrench className="w-4 h-4 text-emerald-500" />
              Practice Exercises
            </h2>
            <p className="text-[11px] opacity-70 font-medium">Ready-made snippets mapped to competency skills.</p>
            <div className="space-y-2">
              {DEMO_SNIPPETS.map(s => (
                <button
                  key={s.id}
                  onClick={() => setCode(s.code)}
                  className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    code === s.code ? 'bg-emerald-500/10 border-emerald-500' : 'eng-card opacity-80 hover:opacity-100'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span>{s.title}</span>
                    <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-500">{s.skillId}</span>
                  </div>
                  <p className="text-[11px] opacity-75 mt-1 font-medium line-clamp-2">{s.description}</p>
                </button>
              ))}
            </div>
            {!isE2B && (
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-[11px]">
                <p className="font-bold text-amber-500 mb-1">No E2B key configured</p>
                <p className="opacity-80">Set <code className="font-mono">VITE_E2B_API_KEY</code> in your <code className="font-mono">.env</code> to run in a real cloud sandbox. Until then the lab runs locally.</p>
              </div>
            )}
          </div>

          {envCheck && (
            <div className="eng-card p-4 space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold">
                <TerminalSquare className="w-4 h-4 text-slate-400" />
                Environment Check
              </div>
              <pre className="text-[10px] font-mono opacity-80 whitespace-pre-wrap leading-relaxed">{envCheck}</pre>
            </div>
          )}
        </div>

        {/* Code editor + output */}
        <div className="lg:col-span-8 space-y-4">
          <div className="eng-card p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-sm flex items-center gap-2">
                <TerminalSquare className="w-4 h-4 text-emerald-500" />
                Python Editor
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCode('')}
                  title="Clear editor"
                  className="p-2 rounded-lg eng-card hover:border-slate-400 text-xs cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={handleRun}
                  disabled={isRunning}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all ${
                    isRunning ? 'eng-card opacity-50' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                  }`}
                >
                  {isRunning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                  {isRunning ? 'Running...' : 'Run Code'}
                </button>
              </div>
            </div>

            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck={false}
              rows={14}
              className="w-full eng-input rounded-xl p-4 text-[12px] font-mono leading-relaxed resize-y"
              placeholder="# Write Python code here..."
            />
          </div>

          <div ref={outputRef} className="eng-card p-5">
            <div className="flex items-center gap-2 text-sm font-bold mb-3">
              <TerminalSquare className="w-4 h-4 text-slate-400" />
              Output
            </div>

            {!output && !isRunning && (
              <div className="py-8 text-center text-xs opacity-60">
                <BarChart3 className="w-8 h-8 mx-auto mb-2 text-slate-500" />
                Run the code above to see stdout, stderr, and generated plots here.
              </div>
            )}

            {isRunning && (
              <div className="py-8 text-center">
                <Loader2 className="w-8 h-8 mx-auto mb-2 text-emerald-500 animate-spin" />
                <p className="text-xs font-mono opacity-70">Executing in sandbox...</p>
              </div>
            )}

            {output && !isRunning && (
              <div className="space-y-4">
                {output.error && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30">
                    <p className="text-xs font-bold text-rose-500 mb-1">Execution Error</p>
                    <pre className="text-[11px] font-mono whitespace-pre-wrap text-rose-400">{output.error}</pre>
                  </div>
                )}

                {(output.stdout || output.text) && (
                  <div className="p-3 rounded-xl bg-slate-900/30 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 overflow-x-auto">
                    <pre className="text-[11px] font-mono whitespace-pre-wrap leading-relaxed">
                      {output.stdout || output.text || ''}
                    </pre>
                  </div>
                )}

                {output.stderr && (
                  <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30">
                    <pre className="text-[11px] font-mono whitespace-pre-wrap text-amber-600">{output.stderr}</pre>
                  </div>
                )}

                {output.plots.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-bold flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-emerald-500" />
                      Generated Plots
                    </p>
                    {output.plots.map((src, i) => (
                      <img key={i} src={src} alt={`Plot ${i + 1}`} className="max-w-full rounded-xl border border-slate-200 dark:border-slate-800" />
                    ))}
                  </div>
                )}

                {!output.error && !output.stdout && !output.text && !output.stderr && output.plots.length === 0 && (
                  <div className="py-6 text-center text-xs opacity-60">
                    <Database className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                    Code ran successfully with no output.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VirtualLab;