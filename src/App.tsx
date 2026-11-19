import React, { useState, useMemo } from 'react';
import { AUTOMATIONS } from './data/automations';
import { AutomationId, OutputMode } from './types';
import { generatePlaywrightScript, generateConsoleSnippet, generateCurlSnippet, generatePythonSnippet } from './utils/scriptGenerators';
import { Copy, Check, Download, Sliders, Code2, Terminal, Globe, FileCode } from 'lucide-react';
import { CompactStepsTable } from './components/CompactStepsTable';

export default function App() {
  const [selectedId, setSelectedId] = useState<AutomationId>('candidatures-envoyees');
  const [outputMode, setOutputMode] = useState<OutputMode>('playwright');
  const [copied, setCopied] = useState(false);

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

  const generatedCode = useMemo(() => {
    switch (outputMode) {
      case 'playwright': return generatePlaywrightScript(selectedId, currentParams);
      case 'console': return generateConsoleSnippet(selectedId, currentParams);
      case 'curl': return generateCurlSnippet(selectedId, currentParams);
      case 'python': return generatePythonSnippet(selectedId, currentParams);
      default: return '';
    }
  }, [selectedId, outputMode, currentParams]);

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
      python: 'py'
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans text-xs selection:bg-indigo-500/35">
      {/* Compact Top Bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-4 py-2.5 flex items-center justify-between sticky top-0 z-35 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="bg-indigo-600 p-1.5 rounded-lg text-white font-mono font-bold text-xs">
            JAT
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-sm tracking-tight text-white">JobAutomation Toolkit</span>
              <span className="bg-slate-800 text-slate-300 px-2 py-0.5 rounded text-[10px] font-mono border border-slate-700">
                alpine-ready v2.5
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2 font-mono text-[11px]">
          <span className="text-slate-400 hidden sm:inline">Docker:</span>
          <span className="bg-emerald-950 text-emerald-400 px-2 py-0.5 rounded border border-emerald-800/60">
            node:20-alpine
          </span>
          <span className="text-slate-400 hidden sm:inline ml-2">Port:</span>
          <span className="bg-slate-800 text-indigo-300 px-2 py-0.5 rounded border border-slate-700">
            3000
          </span>
        </div>
      </header>

      {/* Main Dense Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto p-3 sm:p-4 grid grid-cols-1 lg:grid-cols-12 gap-3 items-start">
        
        {/* Left Sidebar: Workflow Selector & Parameters */}
        <div className="lg:col-span-4 space-y-3">
          {/* Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2">
            <label className="block text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between">
              <span>Automation Workflow</span>
              <span>{AUTOMATIONS.findIndex(a => a.id === selectedId) + 1}/{AUTOMATIONS.length}</span>
            </label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value as AutomationId)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 font-medium"
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

          {/* Parameters Form */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 space-y-2.5">
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
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-white"
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
                        className="w-full bg-slate-950 border border-slate-800 rounded px-2 py-1.5 text-xs text-white font-mono"
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
          {/* Code View Card */}
          <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-lg">
            <div className="bg-slate-900 border-b border-slate-800 px-3 py-2 flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-1 overflow-x-auto">
                <button
                  onClick={() => setOutputMode('playwright')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center space-x-1 transition ${
                    outputMode === 'playwright' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                >
                  <Code2 className="w-3 h-3" />
                  <span>Playwright (.ts)</span>
                </button>
                <button
                  onClick={() => setOutputMode('console')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center space-x-1 transition ${
                    outputMode === 'console' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                >
                  <Terminal className="w-3 h-3" />
                  <span>Console (.js)</span>
                </button>
                <button
                  onClick={() => setOutputMode('curl')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center space-x-1 transition ${
                    outputMode === 'curl' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                >
                  <Globe className="w-3 h-3" />
                  <span>cURL (.sh)</span>
                </button>
                <button
                  onClick={() => setOutputMode('python')}
                  className={`px-2.5 py-1 rounded text-[11px] font-mono flex items-center space-x-1 transition ${
                    outputMode === 'python' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white bg-slate-950'
                  }`}
                >
                  <FileCode className="w-3 h-3" />
                  <span>Python (.py)</span>
                </button>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  onClick={handleDownload}
                  className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-[11px] font-medium border border-slate-700 flex items-center space-x-1"
                >
                  <Download className="w-3 h-3" />
                  <span>Download</span>
                </button>
                <button
                  onClick={handleCopy}
                  className={`px-3 py-1 rounded text-[11px] font-medium flex items-center space-x-1 transition ${
                    copied ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                  }`}
                >
                  {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            <div className="p-3 bg-slate-950/95 font-mono text-[11px] text-indigo-100 overflow-x-auto max-h-[360px] leading-relaxed">
              <pre>{generatedCode}</pre>
            </div>
          </div>

          {/* Datatable Steps List */}
          <CompactStepsTable automation={currentAutomation} />
        </div>

      </div>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 text-slate-500 py-3 px-4 text-center text-[11px] font-mono mt-auto">
        Makefile & Docker (Alpine) included. Run <code className="text-indigo-400">make docker-up</code> to start container.
      </footer>
    </div>
  );
}
