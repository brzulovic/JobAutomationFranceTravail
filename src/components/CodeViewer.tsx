import React, { useState } from 'react';
import { OutputMode } from '../types';
import { Copy, Check, Download, Code, Terminal, Sparkles } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  outputMode: OutputMode;
  automationId: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ code, outputMode, automationId }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleDownload = () => {
    const ext = outputMode === 'playwright' ? 'ts' : 'js';
    const filename = `${automationId}-automation.${ext}`;
    const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
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
    <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col">
      {/* Header Bar */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="flex space-x-1.5">
            <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
            <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
          </div>
          <div className="h-4 w-[1px] bg-slate-800 mx-1"></div>
          <div className="flex items-center space-x-2 text-xs font-mono text-slate-300">
            {outputMode === 'playwright' ? (
              <>
                <Code className="w-4 h-4 text-indigo-400" />
                <span>{automationId}-automation.ts (Playwright Node.js)</span>
              </>
            ) : (
              <>
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span>{automationId}-console.js (Browser Console Snippet)</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={handleDownload}
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3 py-1.5 rounded-lg text-xs font-medium border border-slate-700 transition"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </button>
          
          <button
            onClick={handleCopy}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium transition shadow-sm ${
              copied
                ? 'bg-emerald-600 text-white'
                : 'bg-indigo-600 hover:bg-indigo-500 text-white'
            }`}
          >
            {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy Code'}</span>
          </button>
        </div>
      </div>

      {/* Code Display Area */}
      <div className="p-4 overflow-x-auto max-h-[500px] font-mono text-xs text-indigo-100 bg-slate-950/95 leading-relaxed selection:bg-indigo-500/30">
        <pre className="font-mono">{code}</pre>
      </div>

      {/* Footer Info */}
      <div className="bg-slate-900/50 border-t border-slate-800/80 px-4 py-2.5 text-[11px] text-slate-400 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>
            {outputMode === 'playwright'
              ? 'Ready to run with "npx tsx <filename>.ts" (requires Playwright installed)'
              : 'Paste this snippet directly into your browser developer console (F12)'}
          </span>
        </div>
        <span className="font-mono text-slate-500">{code.split('\n').length} lines</span>
      </div>
    </div>
  );
};
