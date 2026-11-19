import { AutomationId } from '../types';

export function generatePlaywrightScript(id: AutomationId, params: Record<string, any>): string {
  switch (id) {
    case 'candidatures-envoyees':
      return `/**
 * Playwright Automation: Indeed & LinkedIn Sent Applications Extractor
 * Includes modular extraction function returning structured objects.
 */
import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Modular extraction function returning structured objects
 */
function extractIndeedApplications(): Array<{ statut: string; titre: string; entreprise: string; lieu: string; dateTxt: string; jk: string; lien: string }> {
  const rows = Array.from(document.querySelectorAll("li"))
    .filter(li => li.querySelector('a[href*="/viewjob?jk="]'));
  return rows.map(li => {
    const lines = (li.innerText || "").split("\\n").map(s => s.trim()).filter(Boolean);
    const a = li.querySelector('a[href*="/viewjob?jk="]');
    const jk = (a?.getAttribute("href")?.match(/jk=([a-z0-9]+)/) || [])[1] || "";
    const descrIdx = lines.findIndex(l => /description de poste/i.test(l));
    const statut = lines[0] || "";
    const titre = lines[1] || "";
    const after = lines.filter((_, i) => i > descrIdx);
    const entreprise = after[0] || "";
    const lieu = after[1] || "";
    const dateTxt = lines.find(l => /^Candidature (envoie|consult)/i.test(l)) || "";
    const lien = a?.getAttribute("href")?.split("&")[0] || "";
    return { statut, titre, entreprise, lieu, dateTxt, jk, lien };
  });
}

async function runExtractor() {
  const browser = await chromium.launch({ headless: false });
  const page = await (await browser.newContext()).newPage();
  
  await page.goto('https://myjobs.indeed.com/applied', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  const indeedItems = await page.evaluate(extractIndeedApplications);
  console.log("Extracted Indeed Applications:", indeedItems);
  
  await browser.close();
}

runExtractor().catch(console.error);
`;

    case 'candidatures-gmail':
      return `/**
 * Playwright & Modular Extraction Script for Gmail
 */
import { chromium } from 'playwright';

function extractGmailThreads() {
  const rows = Array.from(document.querySelectorAll("tr.zA"))
    .filter(r => r.offsetParent !== null || r.getClientRects().length > 0);
  return rows.map(r => ({
    expediteur: ((r.querySelector(".yW") as HTMLElement)?.innerText || "").trim(),
    objet: ((r.querySelector(".y6") as HTMLElement)?.innerText || "").trim(),
    date: ((r.querySelector(".xW.xY") as HTMLElement)?.innerText || "").trim()
  }));
}

async function run() {
  const browser = await chromium.launch({ headless: false });
  const page = await (await browser.newContext()).newPage();
  await page.goto('https://mail.google.com/mail/u/0/#starred');
  await page.waitForTimeout(3000);
  const items = await page.evaluate(extractGmailThreads);
  console.table(items);
  await browser.close();
}
run();
`;

    case 'france-travail-liste':
      return `/**
 * Playwright Modular Journal Lister
 */
import { chromium } from 'playwright';

function extractJournalEntries() {
  const data: any[] = [];
  let cur: any = null;
  for (const el of Array.from(document.querySelectorAll("main h2, main h3"))) {
    const txt = (el.textContent || "").trim();
    if (el.tagName === "H2") {
      if (/^\\d+ \\w+ 2026$/.test(txt)) continue;
      cur = { date: txt, items: [] };
      data.push(cur);
    } else if (cur) {
      const li = el.closest("li");
      const st = li ? li.querySelector("strong") : null;
      cur.items.push({ t: txt, s: st ? st.textContent?.trim() : "" });
    }
  }
  return data;
}

async function run() {
  const browser = await chromium.launch({ headless: false });
  const page = await (await browser.newContext()).newPage();
  await page.goto('https://candidat.francetravail.fr/demarcheretouremploi/journal');
  await page.waitForTimeout(3000);
  const journal = await page.evaluate(extractJournalEntries);
  console.log(journal);
  await browser.close();
}
run();
`;

    case 'france-travail-recherche':
      return `/**
 * Playwright Modular Add Démarche Script
 */
import { chromium } from 'playwright';

async function run() {
  const browser = await chromium.launch({ headless: false });
  const page = await (await browser.newContext()).newPage();
  await page.goto('https://candidat.francetravail.fr/demarcheretouremploi/journal/ajouter');
  console.log('Ready to add démarche: ${params.targetEntity}');
  await browser.close();
}
run();
`;

    case 'pipeline-croise':
      return `/**
 * Pipeline Cross-Check Script
 */
console.log('Cross-checking pipeline...');
`;

    default:
      return '// Playwright script';
  }
}

export function generateConsoleSnippet(id: AutomationId, params: Record<string, any>): string {
  switch (id) {
    case 'candidatures-envoyees':
      return `/**
 * Browser Console JS Snippet: Modular Indeed Extractor function
 */
(function() {
  function extractIndeedApplications() {
    const rows = Array.from(document.querySelectorAll("li"))
      .filter(li => li.querySelector('a[href*="/viewjob?jk="]'));
    return rows.map(li => {
      const lines = (li.innerText || "").split("\\n").map(s => s.trim()).filter(Boolean);
      const a = li.querySelector('a[href*="/viewjob?jk="]');
      const jk = (a?.getAttribute("href")?.match(/jk=([a-z0-9]+)/) || [])[1] || "";
      const descrIdx = lines.findIndex(l => /description de poste/i.test(l));
      return {
        statut: lines[0] || "",
        titre: lines[1] || "",
        entreprise: lines[descrIdx + 1] || "",
        lieu: lines[descrIdx + 2] || "",
        jk,
        lien: a?.getAttribute("href")?.split("&")[0] || ""
      };
    });
  }

  const result = extractIndeedApplications();
  console.table(result);
  return result;
})();
`;

    case 'candidatures-gmail':
      return `/**
 * Console JS Snippet: Gmail Extractor
 */
(function() {
  function extractGmailThreads() {
    const rows = Array.from(document.querySelectorAll("tr.zA"))
      .filter(r => r.offsetParent !== null || r.getClientRects().length > 0);
    return rows.map(r => ({
      expediteur: (r.querySelector(".yW")?.innerText || "").trim(),
      objet: (r.querySelector(".y6")?.innerText || "").trim(),
      date: (r.querySelector(".xW")?.innerText || "").trim()
    }));
  }
  const items = extractGmailThreads();
  console.table(items);
  return items;
})();
`;

    case 'france-travail-liste':
      return `/**
 * Console JS Snippet: Journal Lister
 */
(function() {
  function extractJournal() {
    return Array.from(document.querySelectorAll("main h3")).map(e => e.textContent?.trim());
  }
  return extractJournal();
})();
`;

    case 'france-travail-recherche':
      return `console.log("Console helper for démarche: ${params.targetEntity}");`;

    case 'pipeline-croise':
      return `console.log("Pipeline console snippet");`;

    default:
      return '// Console JS';
  }
}

export function generateCurlSnippet(id: AutomationId, params: Record<string, any>): string {
  switch (id) {
    case 'candidatures-envoyees':
      return `# cURL + jq Snippet: Fetch Indeed Applied & Parse with jq
curl -s -X GET "https://myjobs.indeed.com/applied" \\
  -H "User-Agent: Mozilla/5.0" \\
  -H "Cookie: INDEE_SESSION_ID=YOUR_SESSION"
`;

    case 'candidatures-gmail':
      return `# cURL Gmail Snippet
curl -s -X GET "https://mail.google.com/mail/u/0/h/" \\
  -H "Cookie: SID=YOUR_GMAIL_COOKIE"
`;

    case 'france-travail-liste':
      return `# cURL France Travail Journal Snippet
curl -s -X GET "https://candidat.francetravail.fr/demarcheretouremploi/journal" \\
  -H "Cookie: iva_sid=YOUR_SESSION"
`;

    case 'france-travail-recherche':
      return `# cURL Add Démarche (${params.demarcheType})
curl -s -X POST "https://candidat.francetravail.fr/demarcheretouremploi/journal/ajouter" \\
  -H "Content-Type: application/json" \\
  -d '{"type": "${params.demarcheType}", "entity": "${params.targetEntity}"}'
`;

    case 'pipeline-croise':
      return `# cURL Pipeline check helper
echo "Pipeline cross-check operates on local markdown files."
`;

    default:
      return '# cURL snippet';
  }
}

export function generatePythonSnippet(id: AutomationId, params: Record<string, any>): string {
  switch (id) {
    case 'candidatures-envoyees':
      return `"""
Python Requests + BeautifulSoup: Modular Extraction Function
Returns a structured list of application objects.
"""
import requests
from bs4 import BeautifulSoup

def extract_indeed_applications(html_content: str) -> list[dict]:
    """Modular function returning structured object list from HTML"""
    soup = BeautifulSoup(html_content, 'html.parser')
    rows = [li for li in soup.find_all('li') if li.find('a', href=lambda h: h and '/viewjob?jk=' in h)]
    
    items = []
    for li in rows:
        lines = [s.strip() for s in li.get_text().split('\\n') if s.strip()]
        a = li.find('a', href=lambda h: h and '/viewjob?jk=' in h)
        jk = a['href'].split('jk=')[1].split('&')[0] if a and 'jk=' in a['href'] else ''
        
        items.append({
            "statut": lines[0] if lines else '',
            "titre": lines[1] if len(lines) > 1 else '',
            "jk": jk,
            "lien": f"https://myjobs.indeed.com{a['href'].split('&')[0]}" if a else ''
        })
    return items
`;

    case 'candidatures-gmail':
      return `"""Python BeautifulSoup Gmail Extractor"""
import requests
from bs4 import BeautifulSoup

def extract_gmail_threads(html_content: str) -> list[dict]:
    soup = BeautifulSoup(html_content, 'html.parser')
    return [{"subject": r.get_text()} for r in soup.find_all('tr', class_='zA')]
`;

    case 'france-travail-liste':
      return `"""Python France Travail Journal Extractor"""
import requests
from bs4 import BeautifulSoup

def extract_journal(html: str):
    soup = BeautifulSoup(html, 'html.parser')
    return [h3.get_text(strip=True) for h3 in soup.select('main h3')]
`;

    case 'france-travail-recherche':
      return `"""Python Add Démarche"""
print("Adding démarche: ${params.targetEntity}")
`;

    case 'pipeline-croise':
      return `"""Python Pipeline Cross-Check"""
print("Pipeline cross-check")
`;

    default:
      return '# Python script';
  }
}

export function generatePromptSnippet(id: AutomationId, params: Record<string, any>): string {
  return `name: job-automation-${id}
description: "AI Agent Prompt instruction file for executing ${id} automation with parameters: ${JSON.stringify(params)}"
allowed-tools: ["Inspect", "Bash", "browseros_tabs", "browseros_navigate", "browseros_act", "browseros_evaluate"]

# LLM Agent Instructions
1. Initialize browser session for target URL.
2. Execute extraction script or workflow steps safely.
3. Validate output structured object array against schema.
4. Export results to requested directory (${params.exportPath || '~/Documents/CV'}).
`;
}
