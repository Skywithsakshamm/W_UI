import React, { useRef, useState, useEffect } from 'react';
import { 
  UploadCloud, 
  FileText, 
  FileCheck, 
  X, 
  Sparkles, 
  AlertCircle,
  FileSpreadsheet,
  Search,
  Wand2,
  ArrowRight,
  Zap,
  CheckCircle2,
  Compass,
  FileBox,
  Calendar,
  Clock
} from 'lucide-react';
import { SampleDocument } from '../types';
import { MineIntelLogo } from './MineIntelLogo';

interface UploadZoneProps {
  fileName: string;
  fileType: string;
  fileSize?: number;
  customPrompt: string;
  onCustomPromptChange: (prompt: string) => void;
  onFileSelected: (file: File) => void;
  onClearFile: () => void;
  onSelectSample?: (sample: SampleDocument) => void;
  onGenerate: () => void;
  canGenerate: boolean;
  isProcessing: boolean;
}

// Preset intelligent prompts for the AI search engine
const PROMPT_TEMPLATES = [
  {
    id: 'exec',
    label: '📊 Executive Briefing & ROI',
    prompt: 'Synthesize key executive findings, strategic growth trajectories, and highlight high-priority leadership decision items.',
  },
  {
    id: 'risk',
    label: '⚠️ Risk & Compliance Matrix',
    prompt: 'Extract an exhaustive Risk & Compliance Matrix detailing operational vulnerabilities, likelihood ratings, and remediation timelines.',
  },
  {
    id: 'kpi',
    label: '📈 EBITDA & Financial KPI Audit',
    prompt: 'Perform an in-depth Financial Audit analyzing EBITDA margin shifts, OpEx line items, and capital expenditure forecasts.',
  },
  {
    id: 'tech',
    label: '🔬 Technical Architecture Deep-Dive',
    prompt: 'Execute a Technical Deep-Dive examining system bottlenecks, infrastructure constraints, security vectors, and scalability roadmaps.',
  },
  {
    id: 'action',
    label: '⚡ Immediate Strategic Action Plan',
    prompt: 'Deliver a concise Action Plan with bulleted core takeaways, KPI deviations, immediate 30-60-90 day milestones, and resource needs.',
  },
  {
    id: 'governance',
    label: '📋 Governance & Regulatory Audit',
    prompt: 'Conduct a comprehensive governance audit cross-referencing industry standards, statutory disclosures, and compliance checkpoints.',
  }
];

export const UploadZone: React.FC<UploadZoneProps> = ({
  fileName,
  fileType,
  fileSize,
  customPrompt,
  onCustomPromptChange,
  onFileSelected,
  onClearFile,
  onSelectSample,
  onGenerate,
  canGenerate,
  isProcessing,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragError, setDragError] = useState<string | null>(null);
  const [isGeneratingPrompt, setIsGeneratingPrompt] = useState(false);
  const [promptGeneratedSuccess, setPromptGeneratedSuccess] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(() => new Date());
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isProcessing) setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    setDragError(null);

    if (isProcessing) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      validateAndUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      validateAndUpload(file);
    }
  };

  const validateAndUpload = (file: File) => {
    if (file.size > 25 * 1024 * 1024) {
      setDragError('File exceeds 25MB limit. Please upload a smaller document.');
      return;
    }
    setDragError(null);
    onFileSelected(file);
  };

  // AI Auto Prompt Generator function
  const handleAutoGeneratePrompt = () => {
    setIsGeneratingPrompt(true);
    setPromptGeneratedSuccess(false);

    setTimeout(() => {
      // Pick dynamic context-aware prompt based on filename or cycle through advanced presets
      const lowerName = fileName.toLowerCase();
      let selectedPrompt = '';

      if (lowerName.includes('financ') || lowerName.includes('kpi') || lowerName.includes('q3') || lowerName.includes('audit')) {
        selectedPrompt = 'Extract an exhaustive financial audit analyzing quarterly revenue growth, EBITDA margin trends, OpEx variances, and cash flow projections.';
      } else if (lowerName.includes('risk') || lowerName.includes('secur') || lowerName.includes('incident') || lowerName.includes('hazard')) {
        selectedPrompt = 'Perform a thorough risk and compliance assessment detailing high-impact vulnerability vectors, regulatory checkpoints, and rapid remediation protocols.';
      } else if (lowerName.includes('tech') || lowerName.includes('architect') || lowerName.includes('system') || lowerName.includes('spec')) {
        selectedPrompt = 'Execute a deep technical synthesis evaluating architectural bottlenecks, multi-system interoperability, failover safeguards, and long-term scalability.';
      } else {
        // Pick an alternating high-power executive prompt
        const randomIndex = Math.floor(Math.random() * PROMPT_TEMPLATES.length);
        selectedPrompt = PROMPT_TEMPLATES[randomIndex].prompt;
      }

      onCustomPromptChange(selectedPrompt);
      setIsGeneratingPrompt(false);
      setPromptGeneratedSuccess(true);

      setTimeout(() => setPromptGeneratedSuccess(false), 2400);
    }, 450);
  };

  const isPdf = fileType.includes('pdf') || fileName.toLowerCase().endsWith('.pdf');

  return (
    <div className="w-full bg-white dark:bg-[#0b162a] rounded-3xl border border-blue-900/20 dark:border-blue-500/20 shadow-md transition-all p-6 sm:p-8 lg:p-10">
      
      {/* Top Header: Upload Document Title & Quick Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-neutral-200/80 dark:border-blue-900/40 pb-5 mb-7">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800/60 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-xs">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-outfit text-xl sm:text-2xl font-extrabold text-neutral-900 dark:text-white tracking-tight">
              Upload Document &amp; Ingest
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 dark:text-blue-200/70">
              Provide PDF files, DOCX, or spreadsheets for multi-modal parsing &amp; intelligence synthesis
            </p>
          </div>
        </div>

        {fileName && (
          <button
            id="btn-clear-document"
            type="button"
            onClick={onClearFile}
            disabled={isProcessing}
            className="self-start sm:self-auto text-xs sm:text-sm font-semibold text-neutral-500 hover:text-rose-500 dark:text-neutral-400 dark:hover:text-rose-400 flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-neutral-200 dark:border-blue-900/50 hover:border-rose-300 dark:hover:border-rose-900 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            Clear Document
          </button>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. EXPANDED LARGE UPLOAD DOCUMENT BLOCK                                   */}
      {/* ========================================================================= */}
      <div className="mb-8">
        {fileName ? (
          /* High-Profile Selected File Card */
          <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-5 p-5 sm:p-6 rounded-2xl border-2 border-blue-500/40 bg-blue-50/40 dark:bg-blue-950/40 shadow-sm">
            <div className="flex items-center gap-4.5 overflow-hidden">
              <div className="flex items-center justify-center w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex-shrink-0 shadow-lg shadow-blue-500/25">
                {isPdf ? (
                  <FileText className="w-7 h-7 sm:w-8 sm:h-8" />
                ) : (
                  <FileSpreadsheet className="w-7 h-7 sm:w-8 sm:h-8" />
                )}
              </div>
              <div className="truncate">
                <div className="flex items-center gap-2.5">
                  <span className="font-outfit font-extrabold text-base sm:text-lg text-neutral-900 dark:text-white truncate">
                    {fileName}
                  </span>
                  <span className="text-[11px] uppercase font-extrabold tracking-wider px-2.5 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/80 text-blue-700 dark:text-blue-300">
                    {isPdf ? 'PDF' : 'DOC'}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-3.5 mt-2 text-xs sm:text-sm font-medium text-neutral-500 dark:text-blue-200/70">
                  <span className="font-mono">{formatFileSize(fileSize)}</span>
                  <span>•</span>
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 font-bold">
                    <FileCheck className="w-4 h-4" /> Ready for AI Synthesis
                  </span>
                  <span>•</span>
                  <span className="text-neutral-400 dark:text-neutral-500">Multi-Page Ingestion Active</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                id="btn-replace-file"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="px-4 py-2 text-xs sm:text-sm font-bold rounded-xl border border-neutral-300 dark:border-blue-800 hover:bg-white dark:hover:bg-blue-900/60 text-neutral-700 dark:text-neutral-200 transition-all disabled:opacity-50 active:scale-95"
              >
                Change File
              </button>
            </div>
          </div>
        ) : (
          /* Large, Spacious Executive Dropzone */
          <div
            id="dropzone-area"
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`group cursor-pointer relative flex flex-col items-center justify-center p-10 sm:p-14 lg:p-16 rounded-3xl border-2 border-dashed transition-all duration-200 ${
              isDragOver
                ? 'border-blue-500 bg-blue-50/70 dark:bg-blue-950/50 scale-[0.99] ring-4 ring-blue-500/20'
                : 'border-neutral-300 dark:border-blue-900/50 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50/30 dark:hover:bg-blue-950/20'
            }`}
          >
            <div className="w-20 h-20 rounded-3xl flex items-center justify-center bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 mb-5 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-300 shadow-md shadow-blue-500/15">
              <UploadCloud className="w-10 h-10" />
            </div>

            <h3 className="font-outfit text-lg sm:text-2xl font-bold text-neutral-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors text-center">
              Drag &amp; drop your PDF or document here
            </h3>
            <p className="text-xs sm:text-base text-neutral-500 dark:text-neutral-400 mt-1.5 text-center max-w-md">
              High-speed multi-modal parsing for PDF, DOCX, TXT, and CSV files (up to 25MB)
            </p>

            <div className="mt-6 inline-flex items-center gap-2.5 px-6 py-3 rounded-2xl text-sm font-bold bg-neutral-900 text-white dark:bg-blue-600 dark:text-white shadow-md group-hover:bg-blue-600 dark:group-hover:bg-blue-500 transition-all duration-200">
              <UploadCloud className="w-4.5 h-4.5" />
              <span>Browse Computer Files</span>
            </div>

            {/* Live System Date & Time Display */}
            <div 
              onClick={(e) => e.stopPropagation()}
              className="mt-6 pt-5 border-t border-neutral-200/70 dark:border-blue-900/40 w-full max-w-xl"
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-xs text-neutral-600 dark:text-blue-200/80">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#071326] border border-neutral-200/90 dark:border-blue-900/60 shadow-2xs font-semibold text-neutral-800 dark:text-blue-100">
                  <Calendar className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>
                    {currentDateTime.toLocaleDateString(undefined, {
                      weekday: 'short',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </div>

                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-white dark:bg-[#071326] border border-neutral-200/90 dark:border-blue-900/60 shadow-2xs font-mono font-bold text-neutral-900 dark:text-white">
                  <Clock className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span>
                    {currentDateTime.toLocaleTimeString(undefined, {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                  <span className="text-[10px] font-medium text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/80">
                    LIVE
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.doc,.docx,.txt,.md,.csv,application/pdf,text/plain"
          onChange={handleFileChange}
          className="hidden"
        />

        {dragError && (
          <div className="mt-3 flex items-center gap-2 text-xs sm:text-sm font-medium text-rose-500 dark:text-rose-400">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{dragError}</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* AI POWERED AUTO PROMPT GENERATOR SEARCH ENGINE                            */}
      {/* ========================================================================= */}
      <div className="p-6 sm:p-7 rounded-3xl bg-neutral-50/80 dark:bg-[#071326]/80 border border-blue-200/80 dark:border-blue-900/50 shadow-inner">
        {/* Engine Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-xl bg-blue-600 text-white shadow-xs">
              <Search className="w-4.5 h-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-outfit text-base sm:text-lg font-extrabold text-neutral-900 dark:text-white tracking-tight">
                  AI Auto Prompt Generator &amp; Search Engine
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                  MineIntel Neural
                </span>
              </div>
              <p className="text-xs text-neutral-500 dark:text-blue-200/70 mt-0.5">
                Type your custom objective, or click Auto-Generate for high-precision executive instructions
              </p>
            </div>
          </div>

          {/* Quick Auto Prompt Generator Button */}
          <button
            id="btn-auto-generate-prompt"
            type="button"
            onClick={handleAutoGeneratePrompt}
            disabled={isProcessing || isGeneratingPrompt}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-md shadow-blue-500/20 active:scale-95 transition-all disabled:opacity-50"
          >
            <Wand2 className={`w-4 h-4 ${isGeneratingPrompt ? 'animate-spin' : 'text-amber-300'}`} />
            <span>{isGeneratingPrompt ? 'Synthesizing...' : '✨ Auto-Generate Prompt'}</span>
          </button>
        </div>

        {/* The Search Bar Engine Container */}
        <div className="relative mb-3.5">
          <div className="relative flex items-center rounded-2xl border-2 border-neutral-300 dark:border-blue-900/60 bg-white dark:bg-[#070e1c] focus-within:border-blue-500 dark:focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-500/20 transition-all shadow-xs overflow-hidden">
            <div className="pl-4 pr-2 flex items-center gap-1.5 text-neutral-400 dark:text-blue-400">
              <Search className="w-5 h-5" />
              <div className="flex items-end gap-0.5 h-3">
                <span className="w-0.5 h-2 bg-blue-500 animate-pulse rounded-full" />
                <span className="w-0.5 h-3 bg-amber-400 animate-pulse rounded-full" />
                <span className="w-0.5 h-1.5 bg-sky-400 animate-pulse rounded-full" />
              </div>
            </div>

            <input
              id="input-ai-prompt-engine"
              type="text"
              value={customPrompt}
              onChange={(e) => onCustomPromptChange(e.target.value)}
              placeholder="Search or enter analytical instructions (e.g., 'Summarize key risk points and EBITDA impact')..."
              disabled={isProcessing}
              className="w-full py-3.5 sm:py-4 pr-10 text-xs sm:text-sm font-medium text-neutral-900 dark:text-neutral-100 placeholder:text-neutral-400 dark:placeholder:text-neutral-500 bg-transparent focus:outline-none"
            />

            {customPrompt && (
              <button
                type="button"
                onClick={() => onCustomPromptChange('')}
                className="p-2 text-neutral-400 hover:text-neutral-600 dark:hover:text-white mr-2 transition-colors"
                title="Clear prompt"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {promptGeneratedSuccess && (
            <div className="absolute right-3 -bottom-6 flex items-center gap-1.5 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Executive prompt synthesized &amp; applied!</span>
            </div>
          )}
        </div>

        {/* Quick-Select Smart Prompt Tags */}
        <div className="pt-2">
          <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-neutral-500 dark:text-blue-300/70 mb-2 font-outfit">
            <Zap className="w-3 h-3 text-amber-500" />
            <span>Instant Executive Prompt Templates:</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {PROMPT_TEMPLATES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onCustomPromptChange(item.prompt)}
                disabled={isProcessing}
                className={`text-xs px-3 py-1.5 rounded-xl border transition-all text-left ${
                  customPrompt === item.prompt
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                    : 'bg-white dark:bg-[#0b162a] border-neutral-200 dark:border-blue-900/40 text-neutral-700 dark:text-blue-200 hover:border-blue-400 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-950/50'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Action Button: Generate Executive Report */}
        <div className="mt-6 pt-5 border-t border-neutral-200/80 dark:border-blue-900/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="text-xs text-neutral-500 dark:text-blue-200/70">
            {canGenerate ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Ready to generate executive report with active prompt
              </span>
            ) : (
              <span>Upload a PDF or document above to begin synthesis</span>
            )}
          </div>

          <button
            id="btn-generate-report"
            type="button"
            onClick={onGenerate}
            disabled={!canGenerate || isProcessing}
            className={`flex items-center justify-center gap-3 px-8 py-4 rounded-2xl text-sm sm:text-base font-extrabold shadow-lg transition-all duration-200 ${
              canGenerate && !isProcessing
                ? 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/30 hover:shadow-blue-500/40 hover:scale-[1.01] active:scale-[0.99] cursor-pointer ring-2 ring-blue-400/30'
                : 'bg-neutral-200 dark:bg-[#14233c] text-neutral-400 dark:text-neutral-500 cursor-not-allowed border border-neutral-300 dark:border-blue-900/30'
            }`}
          >
            <MineIntelLogo variant="icon-only" size={24} />
            <span>{isProcessing ? 'Synthesizing Report...' : 'Generate Executive Report'}</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
