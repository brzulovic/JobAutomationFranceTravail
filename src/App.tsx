import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { AUTOMATIONS } from './data/automations';
import { THEMES, ThemeDefinition } from './data/themes';
import { AutomationId, OutputMode } from './types';
import { generatePlaywrightScript, generateConsoleSnippet, generateCurlSnippet, generatePythonSnippet, generatePromptSnippet } from './utils/scriptGenerators';
import { highlightCode } from './utils/highlighter';
import { downloadCsvSample } from './utils/csvExporter';
import { Sliders, Code2, Terminal, Globe, FileCode, FileText, Clock, ChevronRight, Command, History, RotateCcw, Play, RefreshCw, MessageSquare } from 'lucide-react';
import { CompactStepsTable } from './components/CompactStepsTable';
import { QuickActionsBar } from './components/QuickActionsBar';
import { BatchModal } from './components/BatchModal';
import { ThemeSelectorPopover } from './components/ThemeSelectorPopover';
import { ChatSection } from './components/ChatSection';

const RECENT_KEY = 'jat_recent_automations';
const THEME_KEY = 'jat_theme_id';

interface HistoryItem {
  id: string;
  timestamp: string;
  automationId: AutomationId;
  outputMode: OutputMode;
  code: string;
}

export default function App() {
  const [selectedId, setSelectedId] = useState<AutomationId>('candidatures-envoyees');
  const [outputMode, setOutputMode] = useState<OutputMode>('playwright');
  const [copied, setCopied] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'editor' | 'history' | 'test' | 'chat'>('editor');

  // Test execution state
  const [isRunningTest, setIsRunningTest] = useState(false);
  const [testLogs, setTestLogs] = useState<string[]>([]);

  // Generation history state (last 10)
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Theme state & preview state
  const [themeId, setThemeId] = useState<string>(() => {
    return localStorage.getItem(THEME_KEY) || 'slate';
  });
  const [previewThemeId, setPreviewThemeId] = useState<string | null>(null);

  // Recent automations state
  const [recentIds, setRecentIds] = useState<AutomationId[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      return saved ? JSON.parse(saved) : ['candidatures-envoyees'];
    } catch {
      return ['candidatures-envoyees'];
    }
  });

  const activeThemeId = previewThemeId || themeId;
  const currentTheme: ThemeDefinition = useMemo(() => {
    return THEMES.find(t => t.id === activeThemeId) || THEMES[0];
  }, [activeThemeId]);

  const isLight = Boolean(currentTheme.isLight);

  useEffect(() => {
    if (!previewThemeId) {
      localStorage.setItem(THEME_KEY, themeId);
    }
  }, [themeId, previewThemeId]);

  useEffect(() => {
    setRecentIds(prev => {
      const updated = [selectedId, ...prev.filter(id => id !== selectedId)].slice(0, 5);
      localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
      return updated;
    });
  }, [selectedId]);

  const [parametersState, setParametersState] = useState<Record<string, Record<string, any>>>(() => {
    const initial: Record<string, Record<string, any>> = {};
    AUTOMATIONS.forEach((auto) => {
      initial[auto.id] = {};
      auto.parameters.forEach((param) => {
        initial[auto.id][param.id] = param.defaultValue;
      });
    });
    return initial;
  });

  const currentAutomation = useMemo(() => {
    return AUTOMATIONS.find((a) => a.id === selectedId) || AUTOMATIONS[0];
  }, [selectedId]);

  const currentParams = parametersState[selectedId] || {};

  const handleParamChange = (paramId: string, value: any) => {
    setParametersState((prev) => ({
      ...prev,
      [selectedId]: {
        ...prev[selectedId],
        [paramId]: value
      }
    }));
  };

  const handleResetParams = useCallback(() => {
    const defaults: Record<string, any> = {};
    currentAutomation.parameters.forEach((p) => {
      defaults[p.id] = p.defaultValue;
    });
    setParametersState((prev) => ({
      ...prev,
      [selectedId]: defaults
    }));
  }, [currentAutomation]);

  const generatedCode = useMemo(() => {
    switch (outputMode) {
      case 'playwright': return generatePlaywrightScript(selectedId, currentParams);
      case 'console': return generateConsoleSnippet(selectedId, currentParams);
      case 'curl': return generateCurlSnippet(selectedId, currentParams);
      case 'python': return generatePythonSnippet(selectedId, currentParams);
      case 'prompt': return generatePromptSnippet(selectedId, currentParams);
      default: return '';
    }
  }, [selectedId, outputMode, currentParams]);

  // Push to history when code changes
  useEffect(() => {
    if (!generatedCode) return;
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      automationId: selectedId,
      outputMode,
      code: generatedCode
    };
    setHistory(prev => {
      if (prev.length > 0 && prev[0].code === generatedCode) return prev;
      return [newItem, ...prev].slice(0, 10);
    });
  }, [generatedCode, selectedId, outputMode]);

  const highlightedHTML = useMemo(() => {
    return highlightCode(generatedCode, outputMode);
  }, [generatedCode, outputMode]);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  }, [generatedCode]);

  const handleDownload = useCallback(() => {
    const extMap: Record<OutputMode, string> = {
      playwright: 'ts',
      console: 'js',
      curl: 'sh',
      python: 'py',
      prompt: 'prompt'
    };
    const filename = `${selectedId}-automation.${extMap[outputMode]}`;
    const blob = new Blob([generatedCode], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, [selectedId, outputMode, generatedCode]);

  const runTestSimulation = () => {
    setIsRunningTest(true);
    setTestLogs([
      `[${new Date().toLocaleTimeString()}] [WebContainer] Initializing Node.js runtime container...`,
      `[${new Date().toLocaleTimeString()}] [Playwright] Launching chromium browser instance...`
    ]);

    setTimeout(() => {
      setTestLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] [Auth] Executing ensureLoggedIn() session check...`]);
    }, 800);

    setTimeout(() => {
      setTestLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] [Auth] Active session verified successfully.`]);
    }, 1600);

    setTimeout(() => {
      setTestLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] [Workflow] Navigating to target URL for ${currentAutomation.title}...`]);
    }, 2400);

    setTimeout(() => {
      setTestLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] [Scraper] Successfully parsed DOM items & structured objects.`]);
    }, 3200);

    setTimeout(() => {
      setTestLogs(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] [Export] Markdown & CSV data export completed successfully.`,
        `[${new Date().toLocaleTimeString()}] [Test] Execution finished with exit code 0 (Success).`
      ]);
      setIsRunningTest(false);
    }, 4000);
  };

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      if (isCtrlOrCmd && e.key === 'Enter') {
        e.preventDefault();
        handleCopy();
      } else if (isCtrlOrCmd && e.key.toLowerCase() === 's') {
        e.preventDefault();
        handleDownload();
      } else if (isCtrlOrCmd && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setShowBatchModal(prev => !prev);
      } else if (isCtrlOrCmd && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        setShowDocModal(prev => !prev);
      } else if (e.key === 'Escape') {
        setShowBatchModal(false);
        setShowDocModal(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleCopy, handleDownload]);

  return (
    <div className={`min-h-screen ${currentTheme.bgClass} ${currentTheme.textClass} flex flex-col font-sans text-xs selection:bg-indigo-500/35 transition-colors duration-200`}>
      {/* Compact Top Bar with Theme Toggle Popover */}
      <header className={`${currentTheme.cardBg} border-b ${currentTheme.borderClass} px-4 py-2.5 flex items-center justify-between sticky top-0 z-35 shadow-sm`}>
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white font-mono font-bold text-xs">
            JAT
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm tracking-tight">JobAutomation Toolkit</span>
              <span className={`${isLight ? 'bg-slate-200 text-slate-700 border-slate-300' : 'bg-slate-800 text-slate-300 border-slate-700'} px-2 py-0.5 rounded text-[10px] font-mono border`}>
                v2.13
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4 font-mono text-[11px]">
          {/* Keyboard shortcut badges */}
          <div className="hidden md:flex items-center space-x-2 opacity-70 text-[10px]">
            <span className="flex items-center space-x-1 bg-slate-800/20 px-1.5 py-0.5 rounded border border-slate-700/50">
              <Command className="w-3 h-3" />
              <span>+Enter: Copy</span>
            </span>
            <span className="bg-slate-800/20 px-1.5 py-0.5 rounded border border-slate-700/50">
              Ctrl+S: Save
            </span>
            <span className="bg-slate-800/20 px-1.5 py-0.5 rounded border border-slate-700/50">
              Ctrl+K: Batch
            </span>
          </div>

          {/* Theme Switcher Popover with Live Preview */}
          <ThemeSelectorPopover
            currentTheme={currentTheme}
            onSelectTheme={(id) => {
              setThemeId(id);
              setPreviewThemeId(null);
            }}
            onPreviewTheme={(id) => setPreviewThemeId(id)}
            onResetPreview={() => setPreviewThemeId(null)}
          />
        </div>
      </header>

      {/* Main Dense Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        
        {/* Left Sidebar: Workflow Selector, Recent Automations & Parameters */}
        <div className="lg:col-span-4 space-y-3">
          {/* Selector */}
          <div className={`${currentTheme.cardBg} border ${currentTheme.borderClass} rounded-xl p-3 space-y-2 shadow-sm`}>
            <label className="block text-[11px] font-mono opacity-75 uppercase tracking-wider flex items-center justify-between">
              <span>Automation Workflow</span>
              <span>{AUTOMATIONS.findIndex(a => a.id === selectedId) + 1}/{AUTOMATIONS.length}</span>
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value as AutomationId)}
              className={`w-full ${isLight ? 'bg-white text-slate-900 border-slate-300' : 'bg-slate-950 text-white border-slate-800'} border rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-indigo-500 font-medium`}
            >
              {AUTOMATIONS.map((a) => (
                <option key={a.id} value={a.id}>
                  [{a.category}] {a.title}
                </option>
              ))}
            </select>
            <p className="text-[11px] opacity-80 leading-tight pt-1">
              {currentAutomation.description}
            </p>
          </div>

          {/* Recent Automations Section */}
          <div className={`${currentTheme.cardBg} border ${currentTheme.borderClass} rounded-xl p-3 space-y-2 shadow-sm`}>
            <div className={`flex items-center space-x-1.5 opacity-75 font-mono text-[11px] border-b ${currentTheme.borderClass} pb-1.5`}>
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Recent Automations (Last 5)</span>
            </div>
            <div className="space-y-1">
              {recentIds.map((id) => {
                const auto = AUTOMATIONS.find(a => a.id === id);
                if (!auto) return null;
                const isCurrent = id === selectedId;
                return (
                  <button
                    key={id}
                    onClick={() => setSelectedId(id)}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                      isCurrent
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : `${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800' : 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-300'}`
                    }`}
                  >
                    <span className="truncate">{auto.title}</span>
                    <ChevronRight className="w-3.5 h-3.5 shrink-0 opacity-70" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Parameters Form */}
          <div className={`${currentTheme.cardBg} border ${currentTheme.borderClass} rounded-xl p-3 space-y-2.5 shadow-sm`}>
            <div className={`flex items-center space-x-1.5 font-mono text-[11px] border-b ${currentTheme.borderClass} pb-1.5 opacity-90`}>
              <Sliders className="w-3.5 h-3.5 text-indigo-500" />
              <span>Runtime Parameters</span>
            </div>

            <div className="space-y-2">
              {currentAutomation.parameters.map((param) => {
                const val = currentParams[param.id] !== undefined ? currentParams[param.id] : param.defaultValue;
                return (
                  <div key={param.id} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono opacity-70">
                      <span>{param.label}</span>
                      <span>{param.id}</span>
                    </div>

                    {param.type === 'select' ? (
                      <select
                        value={val}
                        onChange={(e) => handleParamChange(param.id, e.target.value)}
                        className={`w-full ${isLight ? 'bg-white text-slate-900 border-slate-300' : 'bg-slate-950 text-white border-slate-800'} border rounded px-2 py-1.5 text-xs`}
                      >
                        {param.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : param.type === 'checkbox' ? (
                      <label className={`flex items-center space-x-2 ${isLight ? 'bg-slate-50 border-slate-300' : 'bg-slate-950 border-slate-800'} border rounded px-2 py-1.5 cursor-pointer`}>
                        <input
                          type="checkbox"
                          checked={Boolean(val)}
                          onChange={(e) => handleParamChange(param.id, e.target.checked)}
                          className="rounded border-slate-700 bg-slate-900 text-indigo-600 w-3.5 h-3.5"
                        />
                        <span className="text-[11px]">{param.description}</span>
                      </label>
                    ) : (
                      <input
                        type={param.type === 'number' ? 'number' : 'text'}
                        value={val}
                        onChange={(e) => handleParamChange(param.id, param.type === 'number' ? Number(e.target.value) : e.target.value)}
                        className={`w-full ${isLight ? 'bg-white text-slate-900 border-slate-300' : 'bg-slate-950 text-white border-slate-800'} border rounded px-2 py-1.5 text-xs font-mono`}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Area: Code Generator, History, Test & 7: Chat Tabs */}
        <div className="lg:col-span-8 space-y-3">
          {/* Quick Actions Bar */}
          <QuickActionsBar
            theme={currentTheme}
            onFormat={() => { setCopied(true); setTimeout(() => setCopied(false), 1000); }}
            onOpenDoc={() => setShowDocModal(true)}
            onResetParams={handleResetParams}
            onCopy={handleCopy}
            onDownload={handleDownload}
            onExportCsv={() => downloadCsvSample(selectedId)}
            onOpenBatch={() => setShowBatchModal(true)}
            copied={copied}
          />

          {/* Main Card with Tabs (Code vs History vs Test vs 7: Chat) */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-1">
                <button
                  onClick={() => setActiveTab('editor')}
                  className={`px-3 py-1 rounded text-[11px] font-mono flex items-center space-x-1.5 transition ${
                    activeTab === 'editor' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Code Generator</span>
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`px-3 py-1 rounded text-[11px] font-mono flex items-center space-x-1.5 transition ${
                    activeTab === 'history' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                >
                  <History className="w-3.5 h-3.5 text-amber-400" />
                  <span>History ({history.length})</span>
                </button>
                <button
                  onClick={() => setActiveTab('test')}
                  className={`px-3 py-1 rounded text-[11px] font-mono flex items-center space-x-1.5 transition ${
                    activeTab === 'test' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                >
                  <Play className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Test Execution</span>
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`px-3 py-1 rounded text-[11px] font-mono flex items-center space-x-1.5 transition ${
                    activeTab === 'chat' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                >
                  <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
                  <span>7: Chat</span>
                </button>
              </div>

              {activeTab === 'editor' && (
                <div className="flex items-center space-x-1 overflow-x-auto">
                  <button
                    onClick={() => setOutputMode('playwright')}
                    className={`px-2 py-1 rounded text-[11px] font-mono ${outputMode === 'playwright' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-950'}`}
                  >
                    TS
                  </button>
                  <button
                    onClick={() => setOutputMode('console')}
                    className={`px-2 py-1 rounded text-[11px] font-mono ${outputMode === 'console' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-950'}`}
                  >
                    JS
                  </button>
                  <button
                    onClick={() => setOutputMode('curl')}
                    className={`px-2 py-1 rounded text-[11px] font-mono ${outputMode === 'curl' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-950'}`}
                  >
                    SH
                  </button>
                  <button
                    onClick={() => setOutputMode('python')}
                    className={`px-2 py-1 rounded text-[11px] font-mono ${outputMode === 'python' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-950'}`}
                  >
                    PY
                  </button>
                  <button
                    onClick={() => setOutputMode('prompt')}
                    className={`px-2 py-1 rounded text-[11px] font-mono ${outputMode === 'prompt' ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-950'}`}
                  >
                    .prompt
                  </button>
                </div>
              )}
            </div>

            {activeTab === 'editor' ? (
              <div className="p-3 bg-slate-950/95 font-mono text-[11px] overflow-x-auto max-h-[360px] leading-relaxed">
                <pre>
                  <code dangerouslySetInnerHTML={{ __html: highlightedHTML }} />
                </pre>
              </div>
            ) : activeTab === 'history' ? (
              <div className="p-3 bg-slate-950/95 font-mono text-[11px] max-h-[360px] overflow-y-auto space-y-2">
                {history.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">No generated history yet in this session.</div>
                ) : (
                  history.map((item, idx) => {
                    const auto = AUTOMATIONS.find(a => a.id === item.automationId);
                    return (
                      <div key={item.id} className="bg-slate-900 border border-slate-800 rounded-lg p-2.5 flex items-center justify-between gap-2">
                        <div className="space-y-0.5 truncate">
                          <div className="flex items-center space-x-2">
                            <span className="text-amber-400 font-bold">#{history.length - idx}</span>
                            <span className="text-white font-semibold">{auto?.title || item.automationId}</span>
                            <span className="bg-indigo-950 text-indigo-300 px-1.5 py-0.5 rounded text-[9px] uppercase border border-indigo-800">
                              {item.outputMode}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400">Generated at {item.timestamp}</div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedId(item.automationId);
                            setOutputMode(item.outputMode);
                            setActiveTab('editor');
                          }}
                          className="bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1 rounded text-[11px] font-medium shrink-0 flex items-center space-x-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Restore</span>
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            ) : activeTab === 'test' ? (
              <div className="p-4 bg-slate-950/95 font-mono text-xs space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2 text-slate-300">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span>WebContainer Playwright Sandbox Runner</span>
                  </div>
                  <button
                    onClick={runTestSimulation}
                    disabled={isRunningTest}
                    className="bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white px-3 py-1.5 rounded text-xs font-semibold flex items-center space-x-1.5 transition shadow"
                  >
                    {isRunningTest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                    <span>{isRunningTest ? 'Running Simulation...' : 'Run Simulation Test'}</span>
                  </button>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-lg p-3 h-64 overflow-y-auto font-mono text-[11px] space-y-1.5 text-slate-300">
                  {testLogs.length === 0 ? (
                    <div className="text-slate-500 italic text-center pt-16">
                      Click "Run Simulation Test" to test the generated Playwright script execution logs.
                    </div>
                  ) : (
                    testLogs.map((log, i) => (
                      <div key={i} className="flex items-start space-x-2">
                        <span className="text-slate-500 select-none">&gt;</span>
                        <span className={log.includes('Success') ? 'text-emerald-400 font-bold' : log.includes('Auth') ? 'text-amber-400' : 'text-slate-300'}>{log}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <ChatSection
                automation={currentAutomation}
                parameters={currentParams}
                onParamChange={handleParamChange}
                theme={currentTheme}
              />
            )}
          </div>

          {/* Datatable Steps List */}
          <CompactStepsTable automation={currentAutomation} theme={currentTheme} />
        </div>

      </div>

      {/* Documentation Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className={`${currentTheme.cardBg} border ${currentTheme.borderClass} rounded-xl max-w-2xl w-full p-5 space-y-4 shadow-2xl`}>
            <div className={`flex items-center justify-between border-b ${currentTheme.borderClass} pb-3`}>
              <h3 className="font-bold text-sm">Documentation: {currentAutomation.title}</h3>
              <button
                onClick={() => setShowDocModal(false)}
                className="text-xs font-mono bg-slate-800 text-white px-2 py-1 rounded"
              >
                Close
              </button>
            </div>
            <p className="text-xs leading-relaxed opacity-90">{currentAutomation.description}</p>
            <div className="space-y-2">
              <h4 className="text-xs font-mono text-indigo-500 uppercase">Target URLs</h4>
              {currentAutomation.targetUrls.map((url, i) => (
                <div key={i} className={`${isLight ? 'bg-slate-100 text-slate-800 border-slate-300' : 'bg-slate-950 text-indigo-200 border-slate-800'} p-2 rounded text-xs font-mono border`}>
                  {url}
                </div>
              ))}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setShowDocModal(false)}
                className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded text-xs font-medium"
              >
                Got It
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Batch Generation Modal */}
      <BatchModal
        isOpen={showBatchModal}
        onClose={() => setShowBatchModal(false)}
      />

      {/* Footer */}
      <footer className={`${currentTheme.cardBg} border-t ${currentTheme.borderClass} opacity-75 py-3 px-4 text-center text-[11px] font-mono mt-auto`}>
        Makefile & Docker (Alpine) included. Run <code className="text-indigo-500">make docker-up</code> to start container.
      </footer>
    </div>
  );
}
