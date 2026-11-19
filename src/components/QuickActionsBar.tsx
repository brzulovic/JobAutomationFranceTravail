import React from 'react';
import { ThemeDefinition } from '../data/themes';
import { Sparkles, BookOpen, RotateCcw, Copy, Download, Check, FileSpreadsheet, Layers } from 'lucide-react';

interface QuickActionsBarProps {
  theme: ThemeDefinition;
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
  theme,
  onFormat,
  onOpenDoc,
  onResetParams,
  onCopy,
  onDownload,
  onExportCsv,
  onOpenBatch,
  copied
}) => {
  const isLight = theme.isLight;

  return (
    <div className={`${theme.cardBg} border ${theme.borderClass} rounded-xl p-2.5 flex flex-wrap items-center justify-between gap-2 shadow-sm`}>
      <div className="flex items-center space-x-1.5 text-xs text-slate-500 font-mono">
        <Sparkles className="w-3.5 h-3.5 text-amber-500" />
        <span>Quick Actions:</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <button
          onClick={onFormat}
          className={`${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'} px-2.5 py-1 rounded text-[11px] font-medium border transition flex items-center space-x-1`}
        >
          <Sparkles className="w-3 h-3 text-indigo-500" />
          <span>Format</span>
        </button>

        <button
          onClick={onExportCsv}
          className={`${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'} px-2.5 py-1 rounded text-[11px] font-medium border transition flex items-center space-x-1`}
        >
          <FileSpreadsheet className="w-3 h-3 text-emerald-500" />
          <span>Export CSV</span>
        </button>

        <button
          onClick={onOpenBatch}
          className={`${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'} px-2.5 py-1 rounded text-[11px] font-medium border transition flex items-center space-x-1`}
        >
          <Layers className="w-3 h-3 text-amber-500" />
          <span>Batch Gen</span>
        </button>

        <button
          onClick={onOpenDoc}
          className={`${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'} px-2.5 py-1 rounded text-[11px] font-medium border transition flex items-center space-x-1`}
        >
          <BookOpen className="w-3 h-3 text-blue-500" />
          <span>Docs</span>
        </button>

        <button
          onClick={onResetParams}
          className={`${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'} px-2.5 py-1 rounded text-[11px] font-medium border transition flex items-center space-x-1`}
        >
          <RotateCcw className="w-3 h-3 text-rose-500" />
          <span>Reset</span>
        </button>

        <div className={`h-4 w-[1px] ${isLight ? 'bg-slate-300' : 'bg-slate-800'} mx-1`}></div>

        <button
          onClick={onDownload}
          className={`${isLight ? 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300' : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border-slate-700'} px-2.5 py-1 rounded text-[11px] font-medium border transition flex items-center space-x-1`}
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
