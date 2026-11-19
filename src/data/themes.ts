export interface ThemeDefinition {
  id: string;
  name: string;
  bgClass: string;
  cardBg: string;
  textClass: string;
  borderClass: string;
  isLight?: boolean;
}

export const THEMES: ThemeDefinition[] = [
  { id: 'slate', name: 'Default Slate', bgClass: 'bg-slate-950', cardBg: 'bg-slate-900', textClass: 'text-slate-100', borderClass: 'border-slate-800' },
  { id: 'pure-white', name: 'Pure White Clean', bgClass: 'bg-white', cardBg: 'bg-slate-50', textClass: 'text-slate-900', borderClass: 'border-slate-200', isLight: true },
  { id: 'soft-white', name: 'Soft White Variant', bgClass: 'bg-stone-50', cardBg: 'bg-white', textClass: 'text-stone-900', borderClass: 'border-stone-200', isLight: true },
  { id: 'warm-white', name: 'Warm White Canvas', bgClass: 'bg-amber-50/30', cardBg: 'bg-white', textClass: 'text-amber-950', borderClass: 'border-amber-200/60', isLight: true },
  { id: 'emerald', name: 'Emerald Forest', bgClass: 'bg-zinc-950', cardBg: 'bg-zinc-900', textClass: 'text-emerald-100', borderClass: 'border-emerald-900/50' },
  { id: 'violet', name: 'Deep Violet', bgClass: 'bg-purple-950/40', cardBg: 'bg-purple-900/30', textClass: 'text-purple-100', borderClass: 'border-purple-800/50' },
  { id: 'amber', name: 'Amber Gold', bgClass: 'bg-stone-950', cardBg: 'bg-stone-900', textClass: 'text-amber-100', borderClass: 'border-amber-900/50' },
  { id: 'rose', name: 'Ruby Rose', bgClass: 'bg-rose-950/30', cardBg: 'bg-rose-900/20', textClass: 'text-rose-100', borderClass: 'border-rose-800/50' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', bgClass: 'bg-black', cardBg: 'bg-neutral-900', textClass: 'text-cyan-300', borderClass: 'border-cyan-500/50' }
];
