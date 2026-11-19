import React from 'react';
import { AutomationDefinition } from '../types';
import { BookOpen, AlertTriangle, CheckCircle2, Lightbulb } from 'lucide-react';

interface WorkflowGuideProps {
  automation: AutomationDefinition;
}

export const WorkflowGuide: React.FC<WorkflowGuideProps> = ({ automation }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Steps Guide */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm mb-4">
          <BookOpen className="w-4 h-4" />
          <span>Execution Steps & Instructions</span>
        </div>

        <ol className="space-y-3">
          {automation.steps.map((step, idx) => (
            <li key={idx} className="flex items-start space-x-3 text-xs text-slate-300 leading-relaxed">
              <span className="bg-indigo-950 text-indigo-300 font-mono font-bold w-5 h-5 rounded-full flex items-center justify-center shrink-0 border border-indigo-800/60 text-[10px]">
                {idx + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Pitfalls & Solutions */}
      <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center space-x-2 text-amber-400 font-semibold text-sm mb-4">
          <AlertTriangle className="w-4 h-4" />
          <span>Common Pitfalls & Solutions</span>
        </div>

        <div className="space-y-3">
          {automation.pitfalls.map((pitfall, idx) => (
            <div key={idx} className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-3 space-y-1.5">
              <div className="flex items-start space-x-2 text-xs font-semibold text-rose-300">
                <span className="text-rose-400 font-bold">⚠️</span>
                <span>{pitfall.problem}</span>
              </div>
              <div className="flex items-start space-x-2 text-xs text-emerald-300 pl-4">
                <span className="text-emerald-400 font-bold">💡</span>
                <span>{pitfall.solution}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
