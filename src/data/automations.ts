import { AutomationDefinition } from '../types';

export const AUTOMATIONS: AutomationDefinition[] = [
  {
    id: 'candidatures-envoyees',
    title: 'Indeed & LinkedIn Sent Applications Extractor',
    subtitle: 'Dump applied jobs into combined Markdown export',
    category: 'Extraction',
    icon: 'Briefcase',
    description: 'Extracts already sent job applications from Indeed (myjobs.indeed.com/applied) and LinkedIn (linkedin.com/jobs-tracker/?stage=applied). Captures job title, company, location, date, status, and direct job link.',
    targetUrls: [
      'https://myjobs.indeed.com/applied',
      'https://www.linkedin.com/jobs-tracker/?stage=applied'
    ],
    parameters: [
      {
        id: 'siteScope',
        label: 'Target Site(s)',
        type: 'select',
        defaultValue: 'both',
        options: [
          { label: 'Both Indeed & LinkedIn', value: 'both' },
          { label: 'Indeed Only', value: 'indeed' },
          { label: 'LinkedIn Only', value: 'linkedin' }
        ],
        description: 'Choose whether to scrape Indeed, LinkedIn, or both.'
      },
      {
        id: 'exportPath',
        label: 'Export Folder Path',
        type: 'text',
        defaultValue: '~/Documents/CV',
        description: 'Directory where the markdown file will be saved.'
      },
      {
        id: 'noExport',
        label: 'Console Output Only (--no-export)',
        type: 'checkbox',
        defaultValue: false,
        description: 'If checked, prints to console/screen without writing file.'
      }
    ],
    pitfalls: [
      {
        problem: 'Session expiry / redirect to login page',
        solution: 'Always execute ensureLoggedIn() first using saved profile or session cookies.'
      },
      {
        problem: 'Indeed/LinkedIn obfuscated CSS classes',
        solution: 'Parser uses stable selectors (`a[href*="/viewjob?jk="]`, `a[href*="/jobs/view"]`) and `innerText` analysis.'
      }
    ],
    steps: [
      '1. Authenticate & ensure session cookie (ensureLoggedIn).',
      'Navigate to Indeed Applied and LinkedIn Job Tracker pages.',
      'Verify header counters (e.g. "Candidatures envoyées N" / "Applied · N").',
      'Extract list items via page evaluation (CDP / DOM parsing).',
      'Generate combined Markdown report with statistics breakdown.'
    ]
  },
  {
    id: 'candidatures-gmail',
    title: 'Gmail Application & Recruiter Response Retriever',
    subtitle: 'Search starred emails, classify recruiter responses & alerts',
    category: 'Email Parsing',
    icon: 'Mail',
    description: 'Scans Gmail (default: starred messages `is:starred` where recruiter replies are filed) to parse sender, subject, date, and classify them into Recruiter Responses, Job Alerts, and Noise.',
    targetUrls: [
      'https://mail.google.com/mail/u/0/#starred'
    ],
    parameters: [
      {
        id: 'queryMode',
        label: 'Search Query / Mode',
        type: 'select',
        defaultValue: 'starred',
        options: [
          { label: 'Starred Mail (is:starred)', value: 'starred' },
          { label: 'Recruiter Filtered (is:starred + keywords)', value: 'recruteur' },
          { label: 'Label candidatures (label:candidatures)', value: 'label' }
        ],
        description: 'Gmail search query mode for retrieving application emails.'
      },
      {
        id: 'maxPages',
        label: 'Max Pages to Scan',
        type: 'number',
        defaultValue: 1,
        description: 'Number of 100-item email batches to scroll & parse.'
      },
      {
        id: 'exportPath',
        label: 'Export Folder Path',
        type: 'text',
        defaultValue: '~/Documents/CV',
        description: 'Directory for exporting cindidatures-gmail markdown.'
      }
    ],
    pitfalls: [
      {
        problem: 'Google account sign-in wall',
        solution: 'Execute ensureLoggedIn() with persistent profile storage or OAuth cookie injection.'
      },
      {
        problem: 'Clicking email rows marks them as read',
        solution: 'Read-only DOM parsing via row selectors (`tr.zA`) without clicking individual messages.'
      }
    ],
    steps: [
      '1. Authenticate & ensure Gmail session (ensureLoggedIn).',
      'Open Gmail to the target search URL.',
      'Verify input query in search bar and ensure search results rendered.',
      'Extract rows (`tr.zA`) with sender (`.yW`), subject (`.y6`), date (`.xW.xY`).',
      'Export structured Markdown report.'
    ]
  },
  {
    id: 'france-travail-liste',
    title: 'France Travail Journal Complete Lister',
    subtitle: 'Auto-load full timeline via "Afficher plus" & export MD',
    category: 'France Travail',
    icon: 'FileText',
    description: 'Recovers the complete timeline of démarches from France Travail (candidat.francetravail.fr/demarcheretouremploi/journal) by repeatedly clicking "Afficher plus" until all pages are loaded, then extracts dates, titles, and statuses.',
    targetUrls: [
      'https://candidat.francetravail.fr/demarcheretouremploi/journal'
    ],
    parameters: [
      {
        id: 'exportPath',
        label: 'Export Folder Path',
        type: 'text',
        defaultValue: '~/Documents/CV',
        description: 'Target folder for journal-demarches-<date>.md'
      },
      {
        id: 'maxClicks',
        label: 'Max "Afficher plus" Clicks',
        type: 'number',
        defaultValue: 50,
        description: 'Safety limit for pagination clicks (full timeline ~46 clicks).'
      }
    ],
    pitfalls: [
      {
        problem: 'France Travail session timeout',
        solution: 'Run ensureLoggedIn() before loading timeline.'
      },
      {
        problem: 'Ref changes after each click',
        solution: 'Re-query button via grep/selector for "Afficher plus" before every click.'
      }
    ],
    steps: [
      '1. Authenticate & verify France Travail login (ensureLoggedIn).',
      'Navigate to France Travail Journal page.',
      'Loop clicking "Afficher plus" until button disappears.',
      'Extract structured DOM tree (h2 dates, h3 titles, strong statuses).',
      'Export dated Markdown journal report.'
    ]
  },
  {
    id: 'france-travail-recherche',
    title: 'France Travail Add Démarche (repondre | rechercher)',
    subtitle: 'Automate adding application response or web search to journal',
    category: 'France Travail',
    icon: 'PlusCircle',
    description: 'Registers a new démarche in France Travail journal (/demarcheretouremploi/journal/ajouter). Supports type=repondre (job application response) or type=rechercher (web search on Indeed/LinkedIn).',
    targetUrls: [
      'https://candidat.francetravail.fr/demarcheretouremploi/journal/ajouter'
    ],
    parameters: [
      {
        id: 'demarcheType',
        label: 'Démarche Type',
        type: 'select',
        defaultValue: 'repondre',
        options: [
          { label: 'Répondre à des offres d’emploi (repondre)', value: 'repondre' },
          { label: 'Rechercher sur internet (rechercher)', value: 'rechercher' }
        ],
        description: 'Type of démarche to record in France Travail.'
      },
      {
        id: 'targetEntity',
        label: 'Company Name or Site/App',
        type: 'text',
        defaultValue: 'Google',
        description: 'Company name (for repondre) or website/app like Indeed (for rechercher).'
      },
      {
        id: 'jobTitle',
        label: 'Job Title / Metier',
        type: 'text',
        defaultValue: 'Senior Software Engineer',
        description: 'Job title / profession for the démarche.'
      },
      {
        id: 'comment',
        label: 'Comment (Optional)',
        type: 'text',
        defaultValue: 'Postulé via LinkedIn Easy Apply',
        description: 'Optional comment/notes.'
      },
      {
        id: 'demarcheDate',
        label: 'Date (JJ/MM/AAAA)',
        type: 'text',
        defaultValue: '',
        description: 'Leave blank for today, or provide past date (e.g. 15/10/2026).'
      },
      {
        id: 'isRealized',
        label: 'Mark as Realized (Démarche réalisée)',
        type: 'checkbox',
        defaultValue: true,
        description: 'Check to set status as "Faite" if using past date.'
      }
    ],
    pitfalls: [
      {
        problem: 'Redirect to login when adding démarche',
        solution: 'Execute ensureLoggedIn() first before filling form.'
      },
      {
        problem: 'Wrong category section',
        solution: 'Must expand "Préparer sa candidature" category first before clicking sub-items.'
      }
    ],
    steps: [
      '1. Authenticate & verify login session (ensureLoggedIn).',
      'Open France Travail add démarche page.',
      'Expand "Préparer sa candidature" accordion category.',
      'Click appropriate sub-item and fill form fields.',
      'Submit and verify confirmation message.'
    ]
  },
  {
    id: 'pipeline-croise',
    title: 'Pipeline Cross-Check (FT ⇄ Indeed ⇄ LinkedIn)',
    subtitle: 'Fuzzy match sent applications against France Travail journal',
    category: 'Pipeline Cross-Check',
    icon: 'GitCompare',
    description: 'Cross-checks sent job applications (Indeed + LinkedIn) against France Travail journal démarches. Categorizes into ✅ Up-to-date, ❌ Missing from FT (to declare), and ⚠️ Date mismatches / reviews.',
    targetUrls: [
      'Local markdown files comparison'
    ],
    parameters: [
      {
        id: 'exportDir',
        label: 'Export Directory',
        type: 'text',
        defaultValue: '~/Documents/CV',
        description: 'Directory containing candidatures-<date>.md and journal-demarches-<date>.md'
      },
      {
        id: 'freshRun',
        label: 'Run Fresh Scrapers First (--fresh)',
        type: 'checkbox',
        defaultValue: false,
        description: 'Regenerate source files before cross-checking.'
      }
    ],
    pitfalls: [
      {
        problem: 'Missing exported source files',
        solution: 'Execute login & scraper steps first if --fresh is enabled.'
      },
      {
        problem: 'Company name variations',
        solution: 'Normalizes company names before fuzzy matching.'
      }
    ],
    steps: [
      '1. Verify session authentication across platforms if --fresh is set.',
      'Load latest Indeed/LinkedIn sent applications and France Travail journal markdown files.',
      'Extract normalized company names and application dates.',
      'Fuzzy match each sent application against FT "Réponse à l\'offre" entries.',
      'Export consolidated pipeline status markdown report.'
    ]
  }
];
