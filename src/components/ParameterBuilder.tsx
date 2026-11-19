import React from 'react';
import { AutomationDefinition, OutputMode } from '../types';
import { Settings2, Code2, Terminal } from 'lucide-react';

interface ParameterBuilderProps {
  automation: AutomationDefinition;
  parameters: Record<string, any>;
  outputMode: OutputMode;
  onChangeParam: (paramId: string, value: any) => void;
  onChangeMode: (mode: OutputMode) => void;
}

export const ParameterBuilder: React.FC<ParameterBuilderProps> = ({
  automation,
  parameters,
  outputMode,
  onChangeParam,
  onChangeMode
}) => {
  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-xl backdrop-blur-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold text-sm mb-1">
            <Settings2 className="w-4 h-4" />
            <span>Workflow Configuration & Parameters</span>
          </div>
          <h2 className="text-xl font-bold text-white">{automation.title}</h2>
          <p className="text-xs text-slate-400 mt-0.5">{automation.description}</p>
        </div>

        {/* Playwright vs Console Mode Switcher */}
        <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex items-center self-start sm:self-auto shrink-0">
          <button
            onClick={() => onChangeMode('playwright')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              outputMode === 'playwright'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>Playwright Script (.ts)</span>
          </button>
          <button
            onClick={() => onChangeMode('console')}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-xs font-semibold transition ${
              outputMode === 'console'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-950'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Browser Console JS</span>
          </button>
        </div>
      </div>

      {/* Target URLs Badge */}
      <div className="mb-5 flex flex-wrap items-center gap-2 text-xs">
        <span className="text-slate-400 font-medium">Target URL(s):</span>
        {automation.targetUrls.map((url, idx) => (
          <span key={idx} className="bg-slate-950 text-indigo-300 font-mono px-2.5 py-1 rounded-lg border border-slate-800">
            {url}
          </span>
        ))}
      </div>

      {/* Dynamic Parameter Form Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {automation.parameters.map((param) => {
          const value = parameters[param.id] !== undefined ? parameters[param.id] : param.defaultValue;

          return (
            <div key={param.id} className="space-y-1.5">
              <label className="block text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>{param.label}</span>
                <span className="text-[10px] text-slate-500 font-mono">param: {param.id}</span>
              </label>

              {param.type === 'select' ? (
                <select
                  value={value}
                  onChange={(e) => onChangeParam(param.id, e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                >
                  {param.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : param.type === 'checkbox' ? (
                <label className="flex items-center space-x-3 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 cursor-pointer hover:border-slate-700 transition">
                  <input
                    type="checkbox"
                    checked={Boolean(value)}
                    onChange={(e) => onChangeParam(param.id, e.target.checked)}
                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-slate-200 font-medium">{param.description}</span>
                </label>
              ) : (
                <input
                  type={param.type === 'number' ? 'number' : 'text'}
                  value={value}
                  onChange={(e) => onChangeParam(param.id, param.type === 'number' ? Number(e.target.value) : e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                  placeholder={param.description}
                />
              )}

              {param.type !== 'checkbox' && (
                <p className="text-[11px] text-slate-500">{param.description}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
