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
        problem: 'Indeed/LinkedIn obfuscated CSS classes',
        solution: 'Parser uses stable selectors (`a[href*="/viewjob?jk="]`, `a[href*="/jobs/view"]`) and `innerText` analysis.'
      },
      {
        problem: 'LinkedIn virtualized list (count mismatch)',
        solution: 'Script scrolls down container repeatedly until all applied cards are loaded in DOM.'
      },
      {
        problem: 'LinkedIn relative dates (e.g. 3w ago)',
        solution: 'Converted to approximate calendar date based on export date.'
      }
    ],
    steps: [
      'Navigate to Indeed Applied and LinkedIn Job Tracker pages.',
      'Verify header counters (e.g. "Candidatures envoyées N" / "Applied · N").',
      'Extract list items via page evaluation (CDP / DOM parsing).',
      'Deduplicate LinkedIn cards by job ID (`/jobs/view/{id}`).',
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
        problem: 'Clicking email rows marks them as read',
        solution: 'Read-only DOM parsing via row selectors (`tr.zA`) without clicking individual messages.'
      },
      {
        problem: 'DOM rendering residuals from previous search',
        solution: 'Filter rows using `offsetParent !== null || getClientRects().length > 0`.'
      },
      {
        problem: 'Gmail OR query syntax',
        solution: 'Use quoted phrases with `OR` (never use curly braces `{a|b}` or pipe `|`).'
      }
    ],
    steps: [
      'Open Gmail to the target search URL.',
      'Verify input query in search bar and ensure search results rendered.',
      'Extract rows (`tr.zA`) with sender (`.yW`), subject (`.y6`), date (`.xW.xY`).',
      'Classify emails into Responses, Alerts, and Noise.',
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
        problem: 'Button ref changes after each click',
        solution: 'Re-query button via grep/selector for "Afficher plus" before every click.'
      },
      {
        problem: 'Snapshot/Read truncation on long timelines',
        solution: 'Use `evaluate` script with large `maxChars` rather than snapshot.'
      },
      {
        problem: 'Irrelevant h2 month headers in intensity graph',
        solution: 'Filter out headers matching `/^\\d+ \\w+ 2026$/`.'
      }
    ],
    steps: [
      'Navigate to France Travail Journal page.',
      'Loop clicking "Afficher plus" until button disappears.',
      'Extract structured DOM tree (h2 dates, h3 titles, strong statuses).',
      'Compute quick statistics (job application replies vs web searches vs other).',
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
        problem: 'Wrong category section',
        solution: 'Must expand "Préparer sa candidature" category first before clicking sub-items.'
      },
      {
        problem: 'Lazy loaded sub-elements',
        solution: 'Resnapshot / wait after expanding accordion categories.'
      },
      {
        problem: 'Checkbox state change not registering in diff',
        solution: 'Refetch snapshot after clicking "Démarche réalisée" checkbox.'
      }
    ],
    steps: [
      'Open France Travail add démarche page.',
      'Expand "Préparer sa candidature" accordion category.',
      'Click appropriate sub-item based on type (repondre or rechercher > Sur internet).',
      'Fill dialog fields (Company/Site, Job Title, Comment, Date).',
      'Check "Démarche réalisée" if applicable and click "Ajouter aux démarches".'
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
        problem: 'Company name variations (e.g. FDJ UNITED vs FDJ)',
        solution: 'Normalizes company names (lowercase, no accents, remove suffixes like SA/SAS/Group) and uses fuzzy containment.'
      },
      {
        problem: 'Confusing job search démarches with job applications',
        solution: 'Only match FT entries starting with "Réponse à l\'offre de".'
      },
      {
        problem: 'Date discrepancy due to declaration delay',
        solution: 'Accept date delta <= 7 days as OK; delta > 7 days flagged as ⚠️ Review.'
      }
    ],
    steps: [
      'Load latest Indeed/LinkedIn sent applications and France Travail journal markdown files.',
      'Extract normalized company names and application dates.',
      'Fuzzy match each sent application against FT "Réponse à l\'offre" entries.',
      'Classify each entry into Up-to-date, Missing, or Review.',
      'Export consolidated pipeline status markdown report.'
    ]
  }
];
