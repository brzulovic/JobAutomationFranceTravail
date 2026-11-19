import React from 'react';
import { AutomationDefinition, AutomationId } from '../types';
import { Briefcase, Mail, FileText, PlusCircle, GitCompare, ChevronRight, CheckCircle2 } from 'lucide-react';

interface AutomationGridProps {
  automations: AutomationDefinition[];
  selectedId: AutomationId;
  onSelect: (id: AutomationId) => void;
}

export const AutomationGrid: React.FC<AutomationGridProps> = ({ automations, selectedId, onSelect }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Briefcase': return <Briefcase className="w-5 h-5 text-indigo-400" />;
      case 'Mail': return <Mail className="w-5 h-5 text-violet-400" />;
      case 'FileText': return <FileText className="w-5 h-5 text-blue-400" />;
      case 'PlusCircle': return <PlusCircle className="w-5 h-5 text-emerald-400" />;
      case 'GitCompare': return <GitCompare className="w-5 h-5 text-amber-400" />;
      default: return <Briefcase className="w-5 h-5 text-indigo-400" />;
    }
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case 'Extraction': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'Email Parsing': return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
      case 'France Travail': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'Pipeline Cross-Check': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Select Automation Workflow
        </h2>
        <span className="text-xs text-slate-500">{automations.length} workflows available</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {automations.map((auto) => {
          const isSelected = auto.id === selectedId;
          return (
            <button
              key={auto.id}
              onClick={() => onSelect(auto.id)}
              className={`text-left p-4 rounded-xl border transition-all relative flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/90 border-indigo-500 shadow-lg shadow-indigo-950/50 ring-1 ring-indigo-500/50'
                  : 'bg-slate-900/60 border-slate-800 hover:bg-slate-800/50 hover:border-slate-700'
              }`}
            >
              {isSelected && (
                <div className="absolute top-3 right-3 text-indigo-400">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              )}

              <div>
                <div className="flex items-center space-x-2.5 mb-2.5">
                  <div className={`p-2 rounded-lg ${isSelected ? 'bg-indigo-950/80' : 'bg-slate-800'}`}>
                    {getIcon(auto.icon)}
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getCategoryBadge(auto.category)}`}>
                    {auto.category}
                  </span>
                </div>

                <h3 className="font-semibold text-white text-sm mb-1 line-clamp-1">
                  {auto.title}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                  {auto.subtitle}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-indigo-400 font-medium">
                <span>Configure & Generate</span>
                <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'translate-x-1' : ''}`} />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
