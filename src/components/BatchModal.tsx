import React, { useState } from 'react';
import { AUTOMATIONS } from '../data/automations';
import { AutomationId } from '../types';
import { generatePlaywrightScript } from '../utils/scriptGenerators';
import { X, CheckSquare, Square, Download, Sparkles } from 'lucide-react';

interface BatchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const BatchModal: React.FC<BatchModalProps> = ({ isOpen, onClose }) => {
  const [selectedIds, setSelectedIds] = useState<Record<AutomationId, boolean>>({
    'candidatures-envoyees': true,
    'candidatures-gmail': true,
    'france-travail-liste': false,
    'france-travail-recherche': false,
    'pipeline-croise': false
  });

  if (!isOpen) return null;

  const toggleId = (id: AutomationId) => {
    setSelectedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleBatchDownload = () => {
    Object.entries(selectedIds).forEach(([id, checked]) => {
      if (checked) {
        const autoId = id as AutomationId;
        const code = generatePlaywrightScript(autoId, {});
        const blob = new Blob([code], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${autoId}-batch-script.ts`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2 text-indigo-400 font-bold text-sm">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Batch Automation Generator</span>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-300">
          Select multiple platforms below to download their automation scripts simultaneously:
        </p>

        <div className="space-y-2">
          {AUTOMATIONS.map((auto) => {
            const isChecked = selectedIds[auto.id];
            return (
              <div
                key={auto.id}
                onClick={() => toggleId(auto.id)}
                className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition"
              >
                <div className="flex items-center space-x-3">
                  {isChecked ? (
                    <CheckSquare className="w-4 h-4 text-indigo-400" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-600" />
                  )}
                  <div>
                    <div className="font-semibold text-white text-xs">{auto.title}</div>
                    <div className="text-[10px] text-slate-400">{auto.subtitle}</div>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                  {auto.category}
                </span>
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded text-xs font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleBatchDownload}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-1.5 rounded text-xs font-medium flex items-center space-x-1.5 shadow-md"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Selected Scripts</span>
          </button>
        </div>
      </div>
    </div>
  );
};
