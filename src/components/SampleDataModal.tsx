import React from 'react';
import { X, Sparkles, FileText, CheckCircle2 } from 'lucide-react';

interface SampleDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SampleDataModal: React.FC<SampleDataModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const sampleMarkdown = `# Candidatures envoyées — Indeed + LinkedIn
> Date d'export : 19-11-2026 | Indeed : 12 | LinkedIn : 14

## Indeed (12)
| Date | Titre | Entreprise | Lieu | Statut | Lien |
|---|---|---|---|---|---|
| 16 nov. | Senior DevOps Engineer | CloudScale Inc. | Paris (Remote) | Candidature envoyée | [Voir l'offre](https://myjobs.indeed.com/viewjob?jk=abc123xyz) |
| 14 nov. | Full Stack TypeScript | NovaTech Labs | Lyon | Candidature consultée | [Voir l'offre](https://myjobs.indeed.com/viewjob?jk=def456uvw) |

## LinkedIn (14)
| Date (approx.) | Titre | Entreprise | Lieu | Statut / Extras | Lien |
|---|---|---|---|---|---|
| 12 nov. (3w ago) | Lead Frontend Architect | FinTech Global | Paris | Application viewed · Resume downloaded | [Lien LinkedIn](https://www.linkedin.com/jobs/view/12345678/) |

## Statistiques rapides
- **Total combiné** : 26 candidatures
- **Période couverte** : Octobre – Novembre 2026
`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-2 text-indigo-400 font-semibold">
            <Sparkles className="w-5 h-5 text-amber-400" />
            <span>Simulated Output Sample (Markdown Export)</span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="bg-emerald-950/30 border border-emerald-900/50 rounded-xl p-3 flex items-center space-x-3 text-xs text-emerald-300">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              This is an example of the structured Markdown report generated automatically by the selected automation script.
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed whitespace-pre-wrap">
            {sampleMarkdown}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-semibold transition"
          >
            Close Preview
          </button>
        </div>
      </div>
    </div>
  );
};
