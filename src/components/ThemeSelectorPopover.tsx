import React, { useState, useRef, useEffect } from 'react';
import { THEMES, ThemeDefinition } from '../data/themes';
import { Palette, Check, ChevronDown } from 'lucide-react';

interface ThemeSelectorPopoverProps {
  currentTheme: ThemeDefinition;
  onSelectTheme: (id: string) => void;
  onPreviewTheme: (id: string) => void;
  onResetPreview: () => void;
}

export const ThemeSelectorPopover: React.FC<ThemeSelectorPopoverProps> = ({
  currentTheme,
  onSelectTheme,
  onPreviewTheme,
  onResetPreview
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        onResetPreview();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onResetPreview]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 bg-slate-900 text-slate-200 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-medium hover:border-indigo-500 transition shadow-sm"
      >
        <Palette className="w-3.5 h-3.5 text-indigo-400" />
        <span>Theme: {currentTheme.name}</span>
        <ChevronDown className="w-3 h-3 opacity-70" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-2 z-50 space-y-1 animate-fadeIn">
          <div className="text-[10px] font-mono text-slate-400 px-2 py-1 uppercase tracking-wider border-b border-slate-800">
            Select Theme (Hover to Preview, Click/Enter to Apply)
          </div>

          <div className="space-y-1 pt-1 max-h-72 overflow-y-auto">
            {THEMES.map((t) => {
              const isSelected = t.id === currentTheme.id;
              return (
                <button
                  key={t.id}
                  onMouseEnter={() => onPreviewTheme(t.id)}
                  onFocus={() => onPreviewTheme(t.id)}
                  onClick={() => {
                    onSelectTheme(t.id);
                    setIsOpen(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      onSelectTheme(t.id);
                      setIsOpen(false);
                    }
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-lg text-xs font-medium flex items-center justify-between transition ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-950/60 hover:bg-slate-800 text-slate-300'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full border border-slate-600 ${t.isLight ? 'bg-white' : 'bg-slate-800'}`}></div>
                    <span>{t.name}</span>
                  </div>
                  {isSelected && <Check className="w-3.5 h-3.5" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
