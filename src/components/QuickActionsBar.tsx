import React from 'react';
import { Sparkles, BookOpen, RotateCcw, Copy, Download, Check, FileSpreadsheet, Layers } from 'lucide-react';

interface QuickActionsBarProps {
  onFormat: () => void;
  onOpenDoc: () => void;
  onResetParams: () => void;
  onCopy: () => void;
  onDownload: () => void;
  onExportCsv: () => void;
  onOpenBatch: () => void;
  copied: boolean;
}

export const QuickActionsBar: React.FC<QuickActionsBarProps> = ({
  onFormat,
  onOpenDoc,
  onResetParams,
  onCopy,
  onDownload,
  onExportCsv,
  onOpenBatch,
  copied
}) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2">
      <div className="flex items-center space-x-1.5 text-xs text-slate-400 font-mono">
        <Sparkles className="w-3.5 h-3.5 text-amber-400" />
        <span>Quick Actions:</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={onFormat}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-[11px] font-medium border border-slate-700 transition flex items-center space-x-1"
          title="Format and clean code layout"
        >
          <Sparkles className="w-3 h-3 text-indigo-400" />
          <span>Format</span>
        </button>

        <button
          onClick={onExportCsv}
          className="bg-slate-800 hover:bg-slate-700 text-emerald-300 px-2.5 py-1 rounded text-[11px] font-medium border border-slate-700 transition flex items-center space-x-1"
          title="Export data structure as CSV for Excel/Google Sheets"
        >
          <FileSpreadsheet className="w-3 h-3 text-emerald-400" />
          <span>Export CSV</span>
        </button>

        <button
          onClick={onOpenBatch}
          className="bg-slate-800 hover:bg-slate-700 text-amber-300 px-2.5 py-1 rounded text-[11px] font-medium border border-slate-700 transition flex items-center space-x-1"
          title="Generate multiple automation scripts at once"
        >
          <Layers className="w-3 h-3 text-amber-400" />
          <span>Batch Gen</span>
        </button>

        <button
          onClick={onOpenDoc}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-[11px] font-medium border border-slate-700 transition flex items-center space-x-1"
        >
          <BookOpen className="w-3 h-3 text-blue-400" />
          <span>Docs</span>
        </button>

        <button
          onClick={onResetParams}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-[11px] font-medium border border-slate-700 transition flex items-center space-x-1"
        >
          <RotateCcw className="w-3 h-3 text-rose-400" />
          <span>Reset</span>
        </button>

        <div className="h-4 w-[1px] bg-slate-800 mx-1"></div>

        <button
          onClick={onDownload}
          className="bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1 rounded text-[11px] font-medium border border-slate-700 transition flex items-center space-x-1"
        >
          <Download className="w-3 h-3" />
          <span>Download</span>
        </button>

        <button
          onClick={onCopy}
          className={`px-3 py-1 rounded text-[11px] font-medium flex items-center space-x-1 transition ${
            copied ? 'bg-emerald-600 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'
          }`}
        >
          {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          <span>{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
    </div>
  );
};
