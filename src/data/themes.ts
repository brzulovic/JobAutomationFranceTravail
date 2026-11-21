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
  { id: 'ice-white', name: 'Ice White (Tinted)', bgClass: 'bg-sky-50/60', cardBg: 'bg-white', textClass: 'text-sky-950', borderClass: 'border-sky-200', isLight: true },
  { id: 'mint-white', name: 'Mint White (Tinted)', bgClass: 'bg-emerald-50/50', cardBg: 'bg-white', textClass: 'text-emerald-950', borderClass: 'border-emerald-200', isLight: true },
  { id: 'lavender-white', name: 'Lavender White (Tinted)', bgClass: 'bg-purple-50/50', cardBg: 'bg-white', textClass: 'text-purple-950', borderClass: 'border-purple-200', isLight: true },
  { id: 'rose-white', name: 'Rose White (Tinted)', bgClass: 'bg-rose-50/50', cardBg: 'bg-white', textClass: 'text-rose-950', borderClass: 'border-rose-200', isLight: true },
  { id: 'violet', name: 'Deep Violet (Dark)', bgClass: 'bg-[#0c051a]', cardBg: 'bg-[#150a2b]', textClass: 'text-purple-200', borderClass: 'border-purple-950' },
  { id: 'rose', name: 'Ruby Rose (Dark)', bgClass: 'bg-[#1a0508]', cardBg: 'bg-[#2b0a11]', textClass: 'text-rose-200', borderClass: 'border-rose-950' },
  { id: 'emerald', name: 'Emerald Forest', bgClass: 'bg-zinc-950', cardBg: 'bg-zinc-900', textClass: 'text-emerald-100', borderClass: 'border-emerald-900/50' },
  { id: 'amber', name: 'Amber Gold', bgClass: 'bg-stone-950', cardBg: 'bg-stone-900', textClass: 'text-amber-100', borderClass: 'border-amber-900/50' },
  { id: 'cyberpunk', name: 'Cyberpunk Neon', bgClass: 'bg-black', cardBg: 'bg-neutral-900', textClass: 'text-cyan-300', borderClass: 'border-cyan-500/50' }
];
