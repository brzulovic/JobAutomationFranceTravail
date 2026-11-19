import React, { useState, useEffect, useMemo } from 'react';
import { AUTOMATIONS } from './data/automations';
import { THEMES, ThemeDefinition } from './data/themes';
import { AutomationId, OutputMode } from './types';
import { generatePlaywrightScript, generateConsoleSnippet, generateCurlSnippet, generatePythonSnippet, generatePromptSnippet } from './utils/scriptGenerators';
import { highlightCode } from './utils/highlighter';
import { downloadCsvSample } from './utils/csvExporter';
import { Sliders, Code2, Terminal, Globe, FileCode, FileText, Palette, Clock, ChevronRight } from 'lucide-react';
import { CompactStepsTable } from './components/CompactStepsTable';
import { QuickActionsBar } from './components/QuickActionsBar';
import { BatchModal } from './components/BatchModal';

const RECENT_KEY = 'jat_recent_automations';
const THEME_KEY = 'jat_theme_id';

export default function App() {
  const [selectedId, setSelectedId] = useState<AutomationId>('candidatures-envoyees');
  const [outputMode, setOutputMode] = useState<OutputMode>('playwright');
  const [copied, setCopied] = useState(false);
  const [showDocModal, setShowDocModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);

  // Theme state
  const [themeId, setThemeId] = useState<string>(() => {
    return localStorage.getItem(THEME_KEY) || 'slate';
  });

  // Recent automations state
  const [recentIds, setRecentIds] = useState<AutomationId[]>(() => {
    try {
      const saved = localStorage.getItem(RECENT_KEY);
      return saved ? JSON.parse(saved) : ['candidatures-envoyees'];
    } catch {
      return ['candidatures-envoyees'];
    }
  });

  const currentTheme: ThemeDefinition = useMemo(() => {
    return THEMES.find(t => t.id === themeId) || THEMES[0];
  }, [themeId]);

  useEffect(() => {
    localStorage.setItem(THEME_KEY, themeId);
  }, [themeId]);

  // Update recent list when selection changes
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

  const handleResetParams = () => {
    const defaults: Record<string, any> = {};
    currentAutomation.parameters.forEach((p) => {
      defaults[p.id] = p.defaultValue;
    });
    setParametersState((prev) => ({
      ...prev,
      [selectedId]: defaults
    }));
  };

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

  const highlightedHTML = useMemo(() => {
    return highlightCode(generatedCode, outputMode);
  }, [generatedCode, outputMode]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDownload = () => {
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
  };

  return (
    <div className={`min-h-screen ${currentTheme.bgClass} ${currentTheme.textClass} flex flex-col font-sans text-xs selection:bg-indigo-500/35 transition-colors duration-200`}>
      {/* Compact Top Bar with Theme Toggle */}
      <header className={`${currentTheme.cardBg} border-b ${currentTheme.borderClass} px-4 py-2.5 flex items-center justify-between sticky top-0 z-35 shadow-sm`}>
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white font-mono font-bold text-xs">
            JAT
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm tracking-tight">JobAutomation Toolkit</span>
              <span className="bg-slate-800 text-slate-300 dark:bg-slate-800 dark:text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-700">
                v2.8
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3 font-mono text-[11px]">
          {/* Theme Switcher Dropdown */}
          <div className="flex items-center space-x-1.5">
            <Palette className="w-3.5 h-3.5 text-indigo-400" />
            <select
              value={themeId}
              onChange={(e) => setThemeId(e.target.value)}
              className="bg-slate-900 text-slate-200 border border-slate-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-indigo-500"
            >
              {THEMES.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <span className="hidden sm:inline text-slate-400">|</span>
          <span className="hidden sm:inline text-emerald-400">node:alpine</span>
        </div>
      </header>

      {/* Main Dense Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        
        {/* Left Sidebar: Workflow Selector, Recent Automations & Parameters */}
        <div className="lg:col-span-4 space-y-3">
          {/* Selector */}
          <div className={`${currentTheme.cardBg} border ${currentTheme.borderClass} rounded-xl p-3 space-y-2 shadow-sm`}>
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Automation Workflow</span>
              <span>{AUTOMATIONS.findIndex(a => a.id === selectedId) + 1}/{AUTOMATIONS.length}</span>
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value as AutomationId)}
              className="w-full bg-slate-950 text-white border border-slate-800 rounded-lg px-2.5 py-2 text-xs focus:outline-none focus:border-indigo-500 font-medium"
            >
              {AUTOMATIONS.map((a) => (
                <option key={a.id} value={a.id}>
                  [{a.category}] {a.title}
                </option>
              ))}
            </select>
            <p className="text-[11px] text-slate-400 leading-tight pt-1">
              {currentAutomation.description}
            </p>
          </div>

          {/* Recent Automations Section */}
          <div className={`${currentTheme.cardBg} border ${currentTheme.borderClass} rounded-xl p-3 space-y-2 shadow-sm`}>
            <div className="flex items-center space-x-1.5 text-slate-400 font-mono text-[11px] border-b border-slate-800/80 pb-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
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
                        : 'bg-slate-900/60 hover:bg-slate-800/80 text-slate-300'
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
            <div className="flex items-center space-x-1.5 text-slate-300 font-mono text-[11px] border-b border-slate-800 pb-1.5">
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              <span>Runtime Parameters</span>
            </div>

            <div className="space-y-2">
              {currentAutomation.parameters.map((param) => {
                const val = currentParams[param.id] !== undefined ? currentParams[param.id] : param.defaultValue;
                return (
                  <div key={param.id} className="space-y-1">
                    <div className="flex justify-between text-[11px] font-mono text-slate-400">
                      <span>{param.label}</span>
                      <span className="text-slate-600">{param.id}</span>
                    </div>

                    {param.type === 'select' ? (
                      <select
                        value={val}
                        onChange={(e) => handleParamChange(param.id, e.target.value)}
                        className="w-full bg-slate-950 text-white border border-slate-800 rounded px-2 py-1.5 text-xs"
                      >
                        {param.options?.map((opt) => (
                          <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                      </select>
                    ) : param.type === 'checkbox' ? (
                      <label className="flex items-center space-x-2 bg-slate-950 border border-slate-800 rounded px-2 py-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={Boolean(val)}
                          onChange={(e) => handleParamChange(param.id, e.target.checked)}
                          className="rounded border-slate-700 bg-slate-900 text-indigo-600 w-3.5 h-3.5"
                        />
                        <span className="text-slate-300 text-[11px]">{param.description}</span>
                      </label>
                    ) : (
                      <input
                        type={param.type === 'number' ? 'number' : 'text'}
                        value={val}
                        onChange={(e) => handleParamChange(param.id, param.type === 'number' ? Number(e.target.value) : e.target.value)}
                        className="w-full bg-slate-950 text-white border border-slate-800 rounded px-2 py-1.5 text-xs font-mono"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Area: Code Generator & Datatable Steps */}
        <div className="lg:col-span-8 space-y-3">
          {/* Quick Actions Bar */}
          <QuickActionsBar
            onFormat={() => { setCopied(true); setTimeout(() => setCopied(false), 1000); }}
            onOpenDoc={() => setShowDocModal(true)}
            onResetParams={handleResetParams}
            onCopy={handleCopy}
            onDownload={handleDownload}
            onExportCsv={() => downloadCsvSample(selectedId)}
            onOpenBatch={() => setShowBatchModal(true)}
            copied={copied}
          />

          {/* Code View Card with Syntax Highlighting */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-1 overflow-x-auto">
                <button
                  onClick={() => setOutputMode('playwright')}
                  className={`px-2 py-1 rounded text-[11px] font-mono flex items-center space-x-1 transition ${
                    outputMode === 'playwright' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                >
                  <Code2 className="w-3 h-3" />
                  <span>Playwright (.ts)</span>
                </button>
                <button
                  onClick={() => setOutputMode('console')}
                  className={`px-2 py-1 rounded text-[11px] font-mono flex items-center space-x-1 transition ${
                    outputMode === 'console' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                >
                  <Terminal className="w-3 h-3" />
                  <span>Console (.js)</span>
                </button>
                <button
                  onClick={() => setOutputMode('curl')}
                  className={`px-2 py-1 rounded text-[11px] font-mono flex items-center space-x-1 transition ${
                    outputMode === 'curl' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  <span>cURL (.sh)</span>
                </button>
                <button
                  onClick={() => setOutputMode('python')}
                  className={`px-2 py-1 rounded text-[11px] font-mono flex items-center space-x-1 transition ${
                    outputMode === 'python' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                >
                  <FileCode className="w-3 h-3" />
                  <span>Python (.py)</span>
                </button>
                <button
                  onClick={() => setOutputMode('prompt')}
                  className={`px-2 py-1 rounded text-[11px] font-mono flex items-center space-x-1 transition ${
                    outputMode === 'prompt' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                >
                  <FileText className="w-3 h-3 text-amber-400" />
                  <span>Prompt (.prompt)</span>
                </button>
              </div>

              <span className="text-[10px] font-mono text-slate-500">Prism Syntax Highlighting Active</span>
            </div>

            <div className="p-3 bg-slate-950/95 font-mono text-[11px] overflow-x-auto max-h-[360px] leading-relaxed">
              <pre>
                <code dangerouslySetInnerHTML={{ __html: highlightedHTML }} />
              </pre>
            </div>
          </div>

          {/* Datatable Steps List */}
          <CompactStepsTable automation={currentAutomation} />
        </div>

      </div>

      {/* Documentation Modal */}
      {showDocModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-2xl w-full p-5 space-y-4 shadow-2xl text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white text-sm">Documentation: {currentAutomation.title}</h3>
              <button
                onClick={() => setShowDocModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono bg-slate-800 px-2 py-1 rounded"
              >
                Close
              </button>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">{currentAutomation.description}</p>
            <div className="space-y-2">
              <h4 className="text-xs font-mono text-indigo-400 uppercase">Target URLs</h4>
              {currentAutomation.targetUrls.map((url, i) => (
                <div key={i} className="bg-slate-950 p-2 rounded text-xs font-mono text-indigo-200 border border-slate-800">
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
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 py-3 px-4 text-center text-[11px] font-mono mt-auto">
        Makefile & Docker (Alpine) included. Run <code className="text-indigo-400">make docker-up</code> to start container.
      </footer>
    </div>
  );
}
