import React from 'react';
import { AutomationDefinition } from '../types';
import { ListOrdered, AlertCircle } from 'lucide-react';

interface CompactStepsTableProps {
  automation: AutomationDefinition;
}

export const CompactStepsTable: React.FC<CompactStepsTableProps> = ({ automation }) => {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden text-xs">
      <div className="bg-slate-950 px-3 py-2 border-b border-slate-800 flex items-center justify-between font-medium text-slate-300">
        <div className="flex items-center space-x-2">
          <ListOrdered className="w-3.5 h-3.5 text-indigo-400" />
          <span>Execution Pipeline Steps & Pitfall Mitigation</span>
        </div>
        <span className="text-slate-500 font-mono">{automation.steps.length} steps</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-950/60 text-slate-400 border-b border-slate-800 font-mono text-[11px]">
              <th className="py-2 px-3 w-12 text-center">#</th>
              <th className="py-2 px-3">Step Description</th>
              <th className="py-2 px-3">Mitigation / Pitfall Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {automation.steps.map((step, idx) => {
              const pitfall = automation.pitfalls[idx] || automation.pitfalls[0];
              return (
                <tr key={idx} className="hover:bg-slate-800/40 transition">
                  <td className="py-2.5 px-3 text-center text-indigo-400 font-bold">
                    {(idx + 1).toString().padStart(2, '0')}
                  </td>
                  <td className="py-2.5 px-3 text-slate-200">{step}</td>
                  <td className="py-2.5 px-3 text-slate-400 flex items-center space-x-1.5">
                    <span className="text-amber-400 shrink-0">⚠️</span>
                    <span className="text-[11px] leading-tight">{pitfall ? pitfall.solution : 'Standard DOM check'}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
