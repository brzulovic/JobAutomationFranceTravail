import React from 'react';
import { Terminal, Cpu, Sparkles, ShieldCheck } from 'lucide-react';

interface NavbarProps {
  selectedCount: number;
  onOpenSampleModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenSampleModal }) => {
  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2.5 rounded-xl shadow-inner flex items-center justify-center">
            <Cpu className="w-6 h-6 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-indigo-200 to-indigo-400 bg-clip-text text-transparent">
                JobAutomation Toolkit
              </span>
              <span className="bg-indigo-500/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full border border-indigo-500/30 font-medium">
                v2.4 Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 hidden sm:block">
              Playwright & Console JS Generator for Indeed, LinkedIn, Gmail & France Travail
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onOpenSampleModal}
            className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-lg text-sm font-medium border border-slate-700 transition shadow-sm hover:border-slate-600"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span className="hidden md:inline">Simulated Sample Data</span>
          </button>
          
          <div className="hidden lg:flex items-center space-x-1.5 text-xs text-emerald-400 bg-emerald-950/50 px-3 py-1.5 rounded-lg border border-emerald-800/50">
            <ShieldCheck className="w-4 h-4" />
            <span>Read-Only Safe Browser Mode</span>
          </div>
        </div>
      </div>
    </header>
  );
};
