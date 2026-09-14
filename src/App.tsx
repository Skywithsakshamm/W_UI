import React, { useState, useEffect } from 'react';
import { 
  Header 
} from './components/Header';
import { 
  UploadZone 
} from './components/UploadZone';
import { 
  ProcessingOverlay 
} from './components/ProcessingOverlay';
import { 
  ReportViewer 
} from './components/ReportViewer';
import { 
  ReportHistoryDrawer 
} from './components/ReportHistoryDrawer';
import { 
  FunnelVisual 
} from './components/FunnelVisual';
import { 
  MineIntelLogo 
} from './components/MineIntelLogo';
import { 
  IntelligenceVisualCore 
} from './components/IntelligenceVisualCore';
import { 
  GeneratedReport, 
  ReportType, 
  ReportDepth, 
  ReportTone, 
  SampleDocument 
} from './types';
import { 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  Zap, 
  AlertCircle
} from 'lucide-react';

export default function App() {
  // Theme State
  const [isDark, setIsDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [isDark]);

  // Document & File State
  const [fileName, setFileName] = useState<string>('');
  const [fileType, setFileType] = useState<string>('');
  const [fileSize, setFileSize] = useState<number | undefined>(undefined);
  const [fileBase64, setFileBase64] = useState<string>('');
  const [rawText, setRawText] = useState<string>('');

  // Configuration State
  const [reportType, setReportType] = useState<ReportType>('executive');
  const [depth, setDepth] = useState<ReportDepth>('standard');
  const [tone, setTone] = useState<ReportTone>('analytical');
  const [customFocus, setCustomFocus] = useState<string>('');

  // Execution & Output State
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentReport, setCurrentReport] = useState<GeneratedReport | null>(null);

  // History Drawer State
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);

  // Saved Reports History
  const [reportsHistory, setReportsHistory] = useState<GeneratedReport[]>(() => {
    try {
      const saved = localStorage.getItem('saved_reports_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('saved_reports_history', JSON.stringify(reportsHistory));
    } catch (e) {
      console.error('Failed to persist reports history:', e);
    }
  }, [reportsHistory]);

  // Handle file selection
  const handleFileSelected = (file: File) => {
    setFileName(file.name);
    setFileType(file.type || 'application/octet-stream');
    setFileSize(file.size);
    setErrorMessage(null);

    const reader = new FileReader();

    if (file.type.includes('pdf') || file.type.includes('image')) {
      reader.onload = () => {
        const result = reader.result as string;
        setFileBase64(result);
        setRawText('');
      };
      reader.readAsDataURL(file);
    } else {
      // Text, Markdown, CSV
      reader.onload = () => {
        const text = reader.result as string;
        setRawText(text);
        setFileBase64('');
      };
      reader.readAsText(file);
    }
  };

  const handleClearFile = () => {
    setFileName('');
    setFileType('');
    setFileSize(undefined);
    setFileBase64('');
    setRawText('');
    setErrorMessage(null);
  };

  const handleSelectSample = (sample: SampleDocument) => {
    setFileName(sample.fileName);
    setFileType('application/pdf');
    setFileSize(sample.content.length * 2);
    setRawText(sample.content);
    setFileBase64('');
    setErrorMessage(null);

    // Auto-prime tailored executive prompt into the AI prompt generator
    if (sample.category.toLowerCase().includes('finan')) {
      setCustomFocus('Extract an exhaustive financial audit analyzing quarterly revenue growth, EBITDA margin trends, OpEx variances, and cash flow projections.');
    } else if (sample.category.toLowerCase().includes('tech') || sample.category.toLowerCase().includes('eng')) {
      setCustomFocus('Execute a deep technical synthesis evaluating architectural bottlenecks, multi-system interoperability, failover safeguards, and latency SLAs.');
    } else if (sample.category.toLowerCase().includes('bio') || sample.category.toLowerCase().includes('health')) {
      setCustomFocus('Synthesize clinical efficacy endpoints, adverse event safety profiles, placebo variance, and regulatory approval pathways.');
    } else {
      setCustomFocus('Perform a thorough risk and compliance assessment detailing high-impact vulnerability vectors, regulatory checkpoints, and rapid remediation protocols.');
    }
  };

  // Generate Report
  const handleGenerateReport = async () => {
    if (!fileBase64 && (!rawText || rawText.trim().length === 0)) {
      setErrorMessage('Please upload a document or enter source text to analyze.');
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/generate-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName,
          fileType: fileType || 'text/plain',
          fileBase64: fileBase64 || undefined,
          rawText: rawText || undefined,
          reportType,
          depth,
          tone,
          customFocus,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();

      const newReport: GeneratedReport = {
        id: `rpt-${Date.now().toString(36)}`,
        fileName: fileName || 'Direct Text Input',
        fileType,
        reportMarkdown: data.reportMarkdown,
        metadata: data.metadata,
        customFocus,
      };

      setCurrentReport(newReport);
      setReportsHistory((prev) => [newReport, ...prev.slice(0, 19)]); // keep last 20
    } catch (err: any) {
      console.error('Report synthesis failed:', err);
      setErrorMessage(err.message || 'Failed to synthesize document into report. Please check API credentials.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteReport = (id: string) => {
    setReportsHistory((prev) => prev.filter((r) => r.id !== id));
    if (currentReport?.id === id) {
      setCurrentReport(null);
    }
  };

  const handleClearAllHistory = () => {
    setReportsHistory([]);
  };

  const canGenerate = Boolean(fileBase64 || rawText.trim().length > 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#f4f8ff] dark:bg-[#070e1c] text-neutral-900 dark:text-neutral-50 transition-colors duration-200">
      {/* Top Navigation */}
      <Header
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        onOpenHistory={() => setIsHistoryOpen(true)}
        historyCount={reportsHistory.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Error notification banner */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl border border-rose-200 dark:border-rose-900/60 bg-rose-50/90 dark:bg-rose-950/50 text-rose-800 dark:text-rose-200 text-xs sm:text-sm font-medium flex items-center justify-between gap-3 shadow-xs">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
              <span>{errorMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="text-rose-600 hover:text-rose-800 dark:text-rose-400 font-bold text-xs sm:text-sm cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* View Mode 1: Report Viewer if a report has been generated */}
        {currentReport ? (
          <ReportViewer
            report={currentReport}
            onReset={() => setCurrentReport(null)}
          />
        ) : (
          /* View Mode 2: Report Generator Dashboard */
          <div className="space-y-6">
            {/* Hero Dashboard Banner with MineIntel Logo, Heading, and Unique Visual Core Animation */}
            <div className="relative rounded-3xl border border-blue-900/20 dark:border-blue-500/20 bg-white dark:bg-[#0b162a] shadow-md overflow-hidden p-6 sm:p-8 lg:p-9 transition-all">
              <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-6 lg:gap-8 relative z-10">
                {/* Left Side: Headline & Capabilities (7 cols) */}
                <div className="lg:col-span-7 max-w-2xl">
                  {/* AI Powered Report Generator Program heading */}
                  <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-neutral-900 dark:text-white leading-tight">
                    AI Powered Report Generator Program
                  </h1>

                  <p className="mt-2.5 text-sm sm:text-base text-neutral-600 dark:text-blue-200/80 leading-relaxed font-medium">
                    Transform raw PDF documents, spreadsheets, or operational notes into structured executive intelligence reports with tailored depth and strategic insights.
                  </p>

                  {/* Key feature pills with MineIntel blue & gold accents */}
                  <div className="flex flex-wrap items-center gap-3 mt-5 pt-1">
                    <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-700 dark:text-blue-200">
                      <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
                      <span>Multi-Page PDF Parsing</span>
                    </div>
                    <span className="text-neutral-300 dark:text-blue-800">•</span>
                    <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-700 dark:text-blue-200">
                      <Zap className="w-4.5 h-4.5 text-amber-500" />
                      <span>Strategic Risk Matrices</span>
                    </div>
                    <span className="text-neutral-300 dark:text-blue-800">•</span>
                    <div className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-700 dark:text-blue-200">
                      <FileText className="w-4.5 h-4.5 text-blue-500" />
                      <span>Instant Markdown & PDF Export</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Unique & Attractive Animated Intelligence Core (5 cols) */}
                <div className="lg:col-span-5 flex items-center justify-center w-full">
                  <IntelligenceVisualCore isDark={isDark} />
                </div>
              </div>
            </div>

            {/* Document Ingestion & AI Auto Prompt Engine */}
            <div className="w-full">
              <UploadZone
                fileName={fileName}
                fileType={fileType}
                fileSize={fileSize}
                customPrompt={customFocus}
                onCustomPromptChange={setCustomFocus}
                onFileSelected={handleFileSelected}
                onClearFile={handleClearFile}
                onSelectSample={handleSelectSample}
                onGenerate={handleGenerateReport}
                canGenerate={canGenerate}
                isProcessing={isProcessing}
              />
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-neutral-200/80 dark:border-blue-900/40 bg-white/70 dark:bg-[#070e1c]/80 py-4.5 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-2.5 text-xs sm:text-sm text-neutral-500 dark:text-blue-200/70">
          <MineIntelLogo variant="icon-only" size={22} />
          <span className="font-bold text-neutral-800 dark:text-neutral-200">MineIntel</span>
          <span>•</span>
          <span>AI Powered Report Generator Program</span>
        </div>
      </footer>

      {/* Active Processing Overlay with animated funnel & MineIntel logo */}
      {isProcessing && (
        <ProcessingOverlay
          fileName={fileName}
          isDark={isDark}
          onCancel={() => setIsProcessing(false)}
        />
      )}

      {/* Slide-over Report History Drawer */}
      <ReportHistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        reports={reportsHistory}
        onSelectReport={(rpt) => {
          setCurrentReport(rpt);
          setIsHistoryOpen(false);
        }}
        onDeleteReport={handleDeleteReport}
        onClearAll={handleClearAllHistory}
      />
    </div>
  );
}
