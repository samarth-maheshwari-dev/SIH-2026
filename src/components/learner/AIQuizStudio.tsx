import React, { useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import type { Quiz, QuizAttempt, SkillLevel } from '../../types';
import { generateQuizFromDocument, evaluateQuizAttempt } from '../../services/aiQuizEngine';
import { saveAttempt, getAttempts, type SavedAttempt } from '../../services/serverApi';
import { MOCK_SAMPLE_MANUALS } from '../../data/mockData';
import { MOSPI_SKILLS } from '../../data/taxonomy';
import { extractFileText, formatFileSize } from '../../services/fileParser';
import { RadarResultView } from './RadarResultView';
import { FileText, Upload, CheckCircle2, XCircle, Award, ArrowRight, RefreshCw, BookOpen, FileUp, Sparkles, Loader2, History } from 'lucide-react';

interface AIQuizStudioProps {
  userId: string;
  onSkillLevelUp: (skillId: string) => void;
}

type SourceMode = 'library' | 'upload' | 'paste';

export const AIQuizStudio: React.FC<AIQuizStudioProps> = ({ userId, onSkillLevelUp }) => {
  const [sourceMode, setSourceMode] = useState<SourceMode>('library');
  const [selectedDocId, setSelectedDocId] = useState<string>(MOCK_SAMPLE_MANUALS[0].id);
  const [targetSkillId, setTargetSkillId] = useState<string>(MOCK_SAMPLE_MANUALS[0].skillId);
  const [customText, setCustomText] = useState<string>('');
  const [customTitle, setCustomTitle] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState<string>('');

  // Uploaded file state
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number; text: string } | null>(null);
  const [isParsingFile, setIsParsingFile] = useState(false);
  const [fileError, setFileError] = useState<string>('');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeQuiz, setActiveQuiz] = useState<Quiz & { provider?: string } | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, number>>({});
  const [attemptResult, setAttemptResult] = useState<{ attempt: QuizAttempt; newSkillLevel: SkillLevel; levelUpEarned: boolean } | null>(null);
  const [history, setHistory] = useState<SavedAttempt[]>([]);

  // Load quiz history from server DB on mount
  React.useEffect(() => {
    getAttempts()
      .then(setHistory)
      .catch((e) => console.warn('[persist] history load failed:', (e as Error).message));
  }, []);

  const handleFileUpload = async (file: File) => {
    setFileError('');
    if (!file) return;

    // Validate extension
    const ext = (file.name.split('.').pop() || '').toLowerCase();
    if (!['pdf', 'docx', 'txt', 'md', 'csv', 'json'].includes(ext)) {
      setFileError(`Unsupported .${ext}. Please upload PDF, DOCX, or TXT.`);
      return;
    }

    setIsParsingFile(true);
    setGenerationStep(`Reading "${file.name}" — extracting document content...`);
    try {
      // AI "understands" the document by extracting its full text
      const { title, text } = await extractFileText(file);
      setUploadedFile({ name: title, size: file.size, text });
      setCustomTitle(title);
      setSourceMode('upload');
    } catch (err) {
      setFileError((err as Error).message);
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files?.[0]) handleFileUpload(e.dataTransfer.files[0]);
  };

  const handleGenerateQuiz = async () => {
    setIsGenerating(true);
    setAttemptResult(null);
    setUserAnswers({});

    let docTitle = '';
    let textContent = '';
    let finalSkillId = targetSkillId;

    if (sourceMode === 'upload' && uploadedFile) {
      // AI reads the uploaded document
      docTitle = uploadedFile.name;
      textContent = uploadedFile.text;
      setGenerationStep(`Analyzing "${uploadedFile.name}" with AI — identifying topics...`);
      await new Promise(r => setTimeout(r, 500));
    } else if (sourceMode === 'paste') {
      docTitle = customTitle || 'Pasted Notes';
      textContent = customText;
      setGenerationStep('Picking relevant topics from your notes...');
      await new Promise(r => setTimeout(r, 450));
    } else {
      // library
      const selectedDoc = MOCK_SAMPLE_MANUALS.find(d => d.id === selectedDocId);
      docTitle = selectedDoc?.title || 'MoSPI Handbook';
      textContent = selectedDoc?.description || 'MoSPI sampling and statistical guidelines.';
      finalSkillId = selectedDoc?.skillId || targetSkillId;
      setGenerationStep(`Reading official NSSTA manual: ${docTitle}...`);
      await new Promise(r => setTimeout(r, 400));
    }

    setGenerationStep('AI generating 20 multiple choice questions based on the document...');
    await new Promise(r => setTimeout(r, 450));

    const quiz = await generateQuizFromDocument(docTitle, textContent, finalSkillId);
    setActiveQuiz(quiz);
    setIsGenerating(false);
  };

  const handleAnswerSelect = (questionId: string, optionIndex: number) => {
    setUserAnswers(prev => ({ ...prev, [questionId]: optionIndex }));
  };

  const handleSubmitQuiz = async () => {
      if (!activeQuiz) return;

      const result = evaluateQuizAttempt(activeQuiz, userId, userAnswers);
      setAttemptResult(result);

      // Persist to server DB (SQLite) — attempt + skill score
            try {
              await saveAttempt({
                quizId: activeQuiz.id,
                documentTitle: activeQuiz.documentTitle,
                targetSkillId: activeQuiz.targetSkillId,
                questions: activeQuiz.questions,
                answers: userAnswers,
                scorePercent: result.attempt.scorePercent,
                passed: result.attempt.passed,
                topicScores: result.attempt.topicScores,
                newSkillLevel: result.newSkillLevel,
              });
              getAttempts().then(setHistory).catch(() => {});
            } catch (e) {
              console.warn('[persist] quiz attempt save failed:', (e as Error).message);
            }

      if (result.levelUpEarned) {
        onSkillLevelUp(activeQuiz.targetSkillId);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.5 }
        });
      }
    };

  const resetToSetup = () => {
    setActiveQuiz(null);
    setAttemptResult(null);
    setUserAnswers({});
  };

  const targetSkillName = activeQuiz ? (MOSPI_SKILLS.find(s => s.id === activeQuiz.targetSkillId)?.name || 'Competency') : '';

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="eng-card p-6 lg:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-emerald-400" />
              AI-Powered Competency Assessment
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              Practice & Self-Test
            </span>
          </div>
          <p className="text-xs opacity-75 mt-1 font-medium">
            Upload any document (PDF/DOCX/TXT) — the AI reads it, then generates a quiz from its content. Results show a mastery radar + learning path.
          </p>
        </div>
      </div>

      {!activeQuiz ? (
              <>
              {/* ===== QUIZ GENERATION CONTROLS ===== */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* Source mode selector */}
          <div className="lg:col-span-12">
            <div className="flex flex-wrap gap-2 p-1 rounded-2xl bg-white/[0.03] border border-white/8">
              {([['library', 'NSSTA Manual Library', FileText], ['upload', 'Upload Document', FileUp], ['paste', 'Paste Text', BookOpen]] as const).map(([mode, label, Icon]) => (
                <button
                  key={mode}
                  onClick={() => setSourceMode(mode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    sourceMode === mode
                      ? 'bg-gradient-to-r from-emerald-500/80 to-teal-500/80 text-white shadow-lg shadow-emerald-500/20'
                      : 'text-white/50 hover:text-white/90 hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* LIBRARY MODE */}
          {sourceMode === 'library' && (
            <div className="lg:col-span-12 eng-card p-6 lg:p-8 space-y-4">
              <h2 className="font-bold text-base flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Select MoSPI / NSSTA Manual
              </h2>
              <p className="text-xs opacity-70 font-medium">Choose from official National Statistical Systems Training Academy (NSSTA) handbooks:</p>
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                {MOCK_SAMPLE_MANUALS.map(manual => (
                  <div
                    key={manual.id}
                    onClick={() => {
                      setSelectedDocId(manual.id);
                      setTargetSkillId(manual.skillId);
                      setCustomTitle('');
                      setCustomText('');
                    }}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedDocId === manual.id && sourceMode === 'library'
                        ? 'bg-emerald-500/10 border-emerald-500 font-semibold'
                        : 'eng-card opacity-80 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-emerald-400">{manual.title}</span>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-white/5">{manual.fileSize}</span>
                    </div>
                    <p className="text-xs opacity-75 mt-1 font-medium">{manual.description}</p>
                    <p className="text-[10px] font-mono text-emerald-400/70 mt-1.5">Skill: {MOSPI_SKILLS.find(s => s.id === manual.skillId)?.name || manual.skillId}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* UPLOAD MODE */}
          {sourceMode === 'upload' && (
            <div className="lg:col-span-12 eng-card p-6 lg:p-8 space-y-4">
              <h2 className="font-bold text-base flex items-center gap-2">
                <Upload className="w-4 h-4 text-emerald-400" />
                Upload Your Document
              </h2>
              <p className="text-xs opacity-70 font-medium">The AI will read this document and generate questions directly from its content. Supports PDF, Word (.docx), and text files.</p>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative rounded-2xl border-2 border-dashed p-8 text-center cursor-pointer transition-all group ${
                  isDragging
                    ? 'border-emerald-400 bg-emerald-500/10'
                    : 'border-white/15 hover:border-emerald-400/50 hover:bg-white/[0.03]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.docx,.txt,.md,.csv,.json"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files?.[0]) handleFileUpload(e.target.files[0]);
                    e.target.value = '';
                  }}
                />
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                  <FileUp className="w-6 h-6 text-emerald-400" />
                </div>
                <p className="text-sm font-bold text-white/80">Drop your document here, or <span className="text-emerald-400">browse</span></p>
                <p className="text-[11px] opacity-50 font-medium mt-1">PDF • DOCX • TXT (max text extracted from first 8 pages)</p>

                {isParsingFile && (
                  <div className="mt-3 flex items-center justify-center gap-2 text-emerald-400 text-xs font-mono">
                    <Loader2 className="w-4 h-4 animate-spin" /> {generationStep}
                  </div>
                )}
              </div>

              {fileError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                  {fileError}
                </div>
              )}

              {uploadedFile && (
                <div className="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white/85 truncate">{uploadedFile.name}</p>
                      <p className="text-[11px] opacity-60 font-mono">{formatFileSize(uploadedFile.size)} • {uploadedFile.text?.length?.toLocaleString()} chars extracted • AI analysis ready</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { setUploadedFile(null); setCustomTitle(''); }}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-semibold text-white/50 hover:text-rose-400 hover:bg-rose-500/10 transition-all cursor-pointer whitespace-nowrap"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PASTE MODE */}
          {sourceMode === 'paste' && (
            <div className="lg:col-span-12 eng-card p-6 lg:p-8 space-y-4">
              <h2 className="font-bold text-base flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                Paste Your Excerpt
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold block mb-1">Document Name</label>
                  <input
                    type="text"
                    placeholder="e.g. CPI Methodology Note 2024"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full eng-input rounded-xl px-3 py-2 text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold block mb-1">Target Competency</label>
                  <select
                    value={targetSkillId}
                    onChange={(e) => setTargetSkillId(e.target.value)}
                    className="w-full eng-input rounded-xl px-3 py-2 text-xs font-medium"
                  >
                    {MOSPI_SKILLS.map(skill => (
                      <option key={skill.id} value={skill.id} className="bg-[#0b0f1a] text-white">{skill.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold block mb-1">Document Content</label>
                <textarea
                  rows={6}
                  placeholder="Paste manual paragraphs or notes here — the AI will generate questions from this content..."
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className="w-full eng-input rounded-xl p-3 text-xs font-medium"
                />
              </div>
            </div>
          )}

          {/* Target skill (for upload & library when needed) */}
          {(sourceMode === 'upload') && (
            <div className="lg:col-span-12">
              <label className="text-xs font-semibold block mb-1.5">Map to Competency (for radar & gap tracking)</label>
              <select
                value={targetSkillId}
                onChange={(e) => setTargetSkillId(e.target.value)}
                className="w-full eng-input rounded-xl px-3 py-2 text-xs font-medium"
              >
                {MOSPI_SKILLS.map(skill => (
                  <option key={skill.id} value={skill.id} className="bg-[#0b0f1a] text-white">{skill.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Generate button */}
          <div className="lg:col-span-12">
            <button
              onClick={handleGenerateQuiz}
              disabled={isGenerating || (sourceMode === 'upload' && !uploadedFile) || (sourceMode === 'paste' && !customText)}
              className={`w-full eng-btn-primary text-white font-bold text-sm py-3.5 rounded-xl flex items-center justify-center gap-2 cursor-pointer ${
                (sourceMode === 'upload' && !uploadedFile) || (sourceMode === 'paste' && !customText) ? 'opacity-40 cursor-not-allowed' : ''
              }`}
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>AI is generating questions...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-white" />
                  <span>Generate Quiz from {sourceMode === 'upload' ? 'Uploaded Document' : sourceMode === 'paste' ? 'Pasted Content' : 'Selected Manual'}</span>
                </>
              )}
            </button>

            {isGenerating && (
              <div className="mt-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/20 space-y-2">
                <p className="text-xs text-emerald-400 font-mono font-semibold animate-pulse flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> {generationStep}
                </p>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-400 to-teal-400 h-full w-3/4 animate-pulse rounded-full" />
                </div>
              </div>
            )}

            {sourceMode === 'paste' && !customText && (
              <p className="text-[11px] text-amber-400/80 font-medium mt-2">Paste some document content to enable the AI generator.</p>
            )}
            {sourceMode === 'upload' && !uploadedFile && (
              <p className="text-[11px] text-amber-400/80 font-medium mt-2">Upload a document to enable the AI generator.</p>
            )}
          </div>

                  </div>

                  {/* ===== QUIZ HISTORY (SQLite-backed) ===== */}
                  {history.length > 0 && (
                    <div className="mt-6">
                      <div className="flex items-center gap-2 mb-3">
                        <History className="w-4 h-4 text-emerald-400" />
                        <h3 className="text-sm font-bold">Past Assessments</h3>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          {history.length} saved · SQLite
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {history.slice(0, 6).map((h) => (
                          <div key={h.id} className="eng-card p-4 rounded-xl space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">
                                {new Date(h.createdAt).toLocaleDateString()} {new Date(h.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${h.passed ? 'bg-emerald-500/15 text-emerald-400' : 'bg-amber-500/15 text-amber-400'}`}>
                                {h.scorePercent}%
                              </span>
                            </div>
                            <p className="text-xs font-semibold leading-snug line-clamp-2">{h.documentTitle}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] opacity-60 font-medium">
                                {MOSPI_SKILLS.find(s => s.id === h.targetSkillId)?.name || h.targetSkillId}
                              </span>
                              <span className={`text-[10px] font-bold ${h.passed ? 'text-emerald-400' : 'text-amber-400'}`}>
                                {h.passed ? '✓ Passed' : 'Needs review'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                                  </>
                                ) : !attemptResult ? (
        /* ===== QUIZ PLAYER ===== */
        <div className="eng-card p-6 lg:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-white/8 pb-4">
            <div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">PROVIDER: {activeQuiz.provider === 'llm' ? 'AI (OmniRoute/Ollama)' : 'Offline Bank'}</span>
              <h2 className="text-lg font-bold mt-0.5">{activeQuiz.documentTitle}</h2>
              <p className="text-[11px] opacity-60 font-medium">Mapped to: {MOSPI_SKILLS.find(s => s.id === activeQuiz.targetSkillId)?.name || 'Competency'}</p>
            </div>
            <button
              onClick={resetToSetup}
              className="px-3.5 py-1.5 rounded-xl eng-card hover:border-emerald-400/40 text-xs font-semibold transition-all cursor-pointer"
            >
              Exit Quiz
            </button>
          </div>

          <div className="space-y-6">
            {activeQuiz.questions.map((q, idx) => (
              <div key={q.id} className="p-4 rounded-xl bg-white/[0.03] border border-white/8 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded font-mono text-[10px] font-bold bg-emerald-500/15 text-emerald-400">
                    Question {idx + 1} of {activeQuiz.totalQuestions}
                  </span>
                  <span className="text-[11px] opacity-75 font-medium">{q.subtopic}</span>
                </div>
                <p className="font-bold text-sm">{q.question}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1">
                  {q.options.map((opt, optIdx) => {
                    const isSelected = userAnswers[q.id] === optIdx;
                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleAnswerSelect(q.id, optIdx)}
                        className={`p-3 rounded-xl border text-left text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 border-emerald-500'
                            : 'eng-card opacity-80 hover:opacity-100'
                        }`}
                      >
                        <span className="font-mono font-bold mr-2 text-emerald-400">{String.fromCharCode(65 + optIdx)}.</span>
                        {opt}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            <div className="flex justify-end">
              <button
                onClick={handleSubmitQuiz}
                disabled={Object.keys(userAnswers).length < activeQuiz.totalQuestions}
                className={`px-6 py-3 rounded-xl font-bold text-xs transition-all flex items-center gap-2 cursor-pointer ${
                  Object.keys(userAnswers).length === activeQuiz.totalQuestions
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                    : 'eng-card opacity-50 cursor-not-allowed'
                }`}
              >
                <span>Submit Answers & View Radar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            {Object.keys(userAnswers).length < activeQuiz.totalQuestions && (
              <p className="text-[11px] text-amber-400/80 font-medium text-right">
                Answer all {activeQuiz.totalQuestions} questions to submit ({Object.keys(userAnswers).length}/{activeQuiz.totalQuestions} answered)
              </p>
            )}
          </div>
        </div>
      ) : (
        /* ===== RADAR RESULT VIEW ===== */
        <div className="eng-card p-6 lg:p-8 space-y-6">
          <RadarResultView
            topicScores={attemptResult.attempt.topicScores}
            overallPercent={attemptResult.attempt.scorePercent}
            skillLabel={targetSkillName}
            onPracticeAgain={resetToSetup}
            provider={activeQuiz.provider}
          />

          {attemptResult.levelUpEarned && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 max-w-md text-xs text-emerald-400 font-bold flex items-center gap-2 mx-auto">
              <Award className="w-5 h-5 shrink-0" />
              <span><strong>Competency Level Upgraded!</strong> Skill profile updated — your radar shows role-readiness progress.</span>
            </div>
          )}

          {/* Question feedback */}
          <div className="space-y-3">
            <h4 className="font-bold text-sm flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Detailed Question Feedback
            </h4>
            {activeQuiz.questions.map((q, idx) => {
              const userAns = userAnswers[q.id];
              const isCorrect = userAns === q.correctOptionIndex;
              return (
                <div key={q.id} className={`p-4 rounded-xl border space-y-2 ${isCorrect ? 'bg-emerald-500/5 border-emerald-500/30' : 'bg-rose-500/5 border-rose-500/30'}`}>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold">Q{idx + 1}: {q.question}</span>
                    {isCorrect ? (
                      <span className="text-emerald-400 flex items-center gap-1 font-bold"><CheckCircle2 className="w-4 h-4" /> Correct</span>
                    ) : (
                      <span className="text-rose-400 flex items-center gap-1 font-bold"><XCircle className="w-4 h-4" /> Incorrect</span>
                    )}
                  </div>
                  <div className="text-xs space-y-1 pt-1 font-medium">
                    <p>Your Selection: <strong className={isCorrect ? 'text-emerald-400' : 'text-rose-400'}>{q.options[userAns]}</strong></p>
                    {!isCorrect && <p>Correct Option: <strong className="text-emerald-400">{q.options[q.correctOptionIndex]}</strong></p>}
                    <div className="p-2.5 rounded-lg bg-[#0b0f1a]/60 border border-white/8 mt-2 text-[11px] leading-relaxed">
                      <strong className="text-emerald-400 block mb-0.5">Explanation:</strong>
                      {q.explanation}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIQuizStudio;
