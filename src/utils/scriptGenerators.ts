import { AutomationId } from '../types';

export function generatePlaywrightScript(id: AutomationId, params: Record<string, any>): string {
  switch (id) {
    case 'candidatures-envoyees':
      return `/**
 * Playwright Automation: Indeed & LinkedIn Sent Applications Extractor
 * Target Site Scope: ${params.siteScope}
 * Export Path: ${params.exportPath}
 * No Export: ${params.noExport}
 */
import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function runExtractor() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const exportDir = '${params.exportPath}';
  const noExport = ${params.noExport};
  const results: any = { indeed: [], linkedin: [] };

  try {
    if ('${params.siteScope}' === 'both' || '${params.siteScope}' === 'indeed') {
      console.log('Navigating to Indeed Applied Jobs...');
      await page.goto('https://myjobs.indeed.com/applied', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);

      const indeedItems = await page.evaluate(() => {
        const rows = Array.from(document.querySelectorAll("li"))
          .filter(li => li.querySelector('a[href*="/viewjob?jk="]'));
        return rows.map(li => {
          const lines = (li.innerText || "").split("\\n").map(s => s.trim()).filter(Boolean);
          const a = li.querySelector('a[href*="/viewjob?jk="]');
          const jk = (a?.getAttribute("href")?.match(/jk=([a-z0-9]+)/) || [])[1];
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
      });
      results.indeed = indeedItems;
      console.log(\`Extracted \${indeedItems.length} Indeed applications.\`);
    }

    if ('${params.siteScope}' === 'both' || '${params.siteScope}' === 'linkedin') {
      console.log('Navigating to LinkedIn Job Tracker...');
      await page.goto('https://www.linkedin.com/jobs-tracker/?stage=applied', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(4000);

      const linkedinItems = await page.evaluate(() => {
        const anchors = Array.from(document.querySelectorAll('a[href*="/jobs/view"]'))
          .filter(a => a.innerText.includes("\\n"));
        const seen = new Set();
        const items = [];
        for (const a of anchors) {
          const href = a.getAttribute("href");
          const id = (href?.match(/\\/jobs\\/view\\/(\\d+)/) || [])[1];
          if (seen.has(id)) continue;
          seen.add(id);
          const block = (a.parentElement ? a.parentElement.innerText : a.innerText);
          const lines = a.innerText.split("\\n").map(s => s.trim()).filter(Boolean);
          const applied = (block.match(/Applied +([0-9]+\\s?[a-z]+ ago|today)/i) || [])[1] || "";
          const title = (lines[0] || "").replace(/ \\(Verified job\\)$/, "");
          const compLine = lines.find(l => l.includes("·")) || "";
          const entreprise = compLine.split("·")[0]?.trim() || "";
          const lieu = compLine.split("·")[1] ? compLine.split("·")[1].trim() : "";
          const extras = block.split("\\n").map(s => s.trim()).filter(Boolean)
            .filter(l => /^(Resume downloaded|Application viewed|Referred|\\+\\d+|Yes|No)$/i.test(l));
          items.push({ id, titre: title, entreprise, lieu, applied, extras, lien: "https://www.linkedin.com/jobs/view/" + id + "/" });
        }
        return items;
      });
      results.linkedin = linkedinItems;
      console.log(\`Extracted \${linkedinItems.length} LinkedIn applications.\`);
    }

    if (!noExport) {
      const dateStr = new Date().toISOString().slice(0, 10).split('-').reverse().join('-');
      const filename = \`candidatures-\${dateStr}.md\`;
      const fullPath = path.resolve(exportDir, filename);
      
      let md = \`# Candidatures envoyées — Indeed + LinkedIn\\n\\nExport date: \${new Date().toLocaleString()}\\n\\n\`;
      md += \`## Indeed (\${results.indeed.length})\\n\` + JSON.stringify(results.indeed, null, 2) + \`\\n\\n\`;
      md += \`## LinkedIn (\${results.linkedin.length})\\n\` + JSON.stringify(results.linkedin, null, 2);

      if (!fs.existsSync(exportDir)) {
        fs.mkdirSync(exportDir, { recursive: true });
      }
      fs.writeFileSync(fullPath, md, 'utf-8');
      console.log(\`Successfully exported to \${fullPath}\`);
    } else {
      console.log('Results:', JSON.stringify(results, null, 2));
    }

  } finally {
    await browser.close();
  }
}

runExtractor().catch(console.error);
`;

    case 'candidatures-gmail':
      return `/**
 * Playwright Automation: Gmail Application & Response Retriever
 * Query Mode: ${params.queryMode}
 * Max Pages: ${params.maxPages}
 * Export Path: ${params.exportPath}
 */
import { chromium } from 'playwright';
import * as fs from 'fs';
import * as path from 'path';

async function runGmailRetriever() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  const queryMap: Record<string, string> = {
    starred: 'is:starred',
    recruteur: 'is:starred (Objet:"Votre candidature" OR Objet:"Retour candidature")',
    label: 'label:candidatures'
  };

  const queryString = queryMap['${params.queryMode}'] || 'is:starred';
  const searchUrl = \`https://mail.google.com/mail/u/0/#search/\${encodeURIComponent(queryString)}\`;
  
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(4000);

  const items = await page.evaluate(() => {
    const rows = Array.from(document.querySelectorAll("tr.zA"))
      .filter(r => r.offsetParent !== null || r.getClientRects().length > 0);
    return rows.map(r => ({
      expediteur: ((r.querySelector(".yW") as HTMLElement)?.innerText || "").trim(),
      objet: ((r.querySelector(".y6") as HTMLElement)?.innerText || "").trim(),
      date: ((r.querySelector(".xW.xY") as HTMLElement)?.innerText || "").trim()
    }));
  });

  console.table(items);
  await browser.close();
}

runGmailRetriever().catch(console.error);
`;

    case 'france-travail-liste':
      return `/**
 * Playwright Automation: France Travail Journal Complete Lister
 */
import { chromium } from 'playwright';

async function runJournalLister() {
  const browser = await chromium.launch({ headless: false });
  const page = await (await browser.newContext()).newPage();
  await page.goto('https://candidat.francetravail.fr/demarcheretouremploi/journal', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);

  while (await page.locator('button:has-text("Afficher plus")').first().isVisible().catch(() => false)) {
    await page.locator('button:has-text("Afficher plus")').first().click();
    await page.waitForTimeout(1500);
  }

  const data = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("main h3")).map(el => el.textContent?.trim());
  });
  console.log(data);
  await browser.close();
}
runJournalLister();
`;

    case 'france-travail-recherche':
      return `/**
 * Playwright Automation: France Travail Add Démarche (${params.demarcheType})
 */
import { chromium } from 'playwright';

async function runAdd() {
  const browser = await chromium.launch({ headless: false });
  const page = await (await browser.newContext()).newPage();
  await page.goto('https://candidat.francetravail.fr/demarcheretouremploi/journal/ajouter', { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(3000);
  await page.locator('text="Préparer sa candidature"').first().click();
  await page.waitForTimeout(1000);
  console.log('Form ready for ${params.targetEntity} / ${params.jobTitle}');
  await browser.close();
}
runAdd();
`;

    case 'pipeline-croise':
      return `/**
 * Node.js Pipeline Cross-Check Script
 */
console.log('Running Pipeline Cross-Check for ${params.exportDir}');
`;

    default:
      return '// Select script';
  }
}

export function generateConsoleSnippet(id: AutomationId, params: Record<string, any>): string {
  switch (id) {
    case 'candidatures-envoyees':
      return `/**
 * Browser Console JS Snippet: Indeed & LinkedIn Extractor
 */
(function() {
  const rows = Array.from(document.querySelectorAll("li, a[href*='/jobs/view']"));
  console.log("Found items:", rows.length);
  return rows.map(r => r.innerText);
})();
`;

    case 'candidatures-gmail':
      return `/**
 * Browser Console JS Snippet: Gmail Scraper
 */
(function() {
  const rows = Array.from(document.querySelectorAll("tr.zA"));
  return rows.map(r => r.innerText);
})();
`;

    case 'france-travail-liste':
      return `/**
 * Browser Console JS Snippet: France Travail Journal Lister
 */
(function() {
  return Array.from(document.querySelectorAll("main h3")).map(e => e.textContent);
})();
`;

    case 'france-travail-recherche':
      return `console.log("France Travail Helper: ${params.targetEntity} - ${params.jobTitle}");`;

    case 'pipeline-croise':
      return `console.log("Pipeline cross-check snippet");`;

    default:
      return '// Console snippet';
  }
}

export function generateCurlSnippet(id: AutomationId, params: Record<string, any>): string {
  switch (id) {
    case 'candidatures-envoyees':
      return `# cURL Automation Snippet: Indeed & LinkedIn Applied
# Note: Requires cookie session header for authentication (-b "cookie=...")

curl -X GET "https://myjobs.indeed.com/applied" \\
  -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" \\
  -H "Cookie: INDEE_SESSION_ID=YOUR_SESSION_COOKIE_HERE"

curl -X GET "https://www.linkedin.com/jobs-tracker/?stage=applied" \\
  -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" \\
  -H "Cookie: li_at=YOUR_LINKEDIN_SESSION_COOKIE_HERE"
`;

    case 'candidatures-gmail':
      return `# cURL Gmail Search Snippet
# Mode: ${params.queryMode}
curl -X GET "https://mail.google.com/mail/u/0/h/ ?s=q&q=is%3Astarred" \\
  -H "Cookie: GMAIL_AUTH_COOKIE=YOUR_COOKIE_HERE"
`;

    case 'france-travail-liste':
      return `# cURL France Travail Journal Snippet
curl -X GET "https://candidat.francetravail.fr/demarcheretouremploi/journal" \\
  -H "User-Agent: Mozilla/5.0" \\
  -H "Cookie: iva_sid=YOUR_SESSION_COOKIE"
`;

    case 'france-travail-recherche':
      return `# cURL France Travail Add Démarche (${params.demarcheType})
curl -X POST "https://candidat.francetravail.fr/demarcheretouremploi/journal/ajouter" \\
  -H "Content-Type: application/json" \\
  -H "Cookie: iva_sid=YOUR_SESSION_COOKIE" \\
  -d '{"type": "${params.demarcheType}", "entity": "${params.targetEntity}", "metier": "${params.jobTitle}"}'
`;

    case 'pipeline-croise':
      return `# cURL pipeline check helper
echo "Pipeline cross-check operates on local markdown exports (${params.exportDir})."
`;

    default:
      return '# cURL snippet';
  }
}

export function generatePythonSnippet(id: AutomationId, params: Record<string, any>): string {
  switch (id) {
    case 'candidatures-envoyees':
      return `"""
Python Requests Automation: Indeed & LinkedIn Extractor
Target Site Scope: ${params.siteScope}
Export Path: ${params.exportPath}
"""
import requests
from bs4 import BeautifulSoup

headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Cookie": "YOUR_SESSION_COOKIE_HERE"
}

def fetch_applications():
    if "${params.siteScope}" in ["both", "indeed"]:
        url = "https://myjobs.indeed.com/applied"
        resp = requests.get(url, headers=headers)
        print(f"Indeed Status: {resp.status_code}")

    if "${params.siteScope}" in ["both", "linkedin"]:
        url = "https://www.linkedin.com/jobs-tracker/?stage=applied"
        resp = requests.get(url, headers=headers)
        print(f"LinkedIn Status: {resp.status_code}")

if __name__ == "__main__":
    fetch_applications()
`;

    case 'candidatures-gmail':
      return `"""
Python Requests Automation: Gmail Search (${params.queryMode})
"""
import requests

cookies = {"SID": "YOUR_GMAIL_SESSION_COOKIE"}
url = "https://mail.google.com/mail/u/0/h/"

resp = requests.get(url, cookies=cookies)
print(f"Gmail Response Status: {resp.status_code}")
`;

    case 'france-travail-liste':
      return `"""
Python Requests Automation: France Travail Journal Lister
"""
import requests

cookies = {"iva_sid": "YOUR_FRANCE_TRAVAIL_SESSION_COOKIE"}
url = "https://candidat.francetravail.fr/demarcheretouremploi/journal"

resp = requests.get(url, cookies=cookies)
print(f"France Travail Journal Status: {resp.status_code}")
`;

    case 'france-travail-recherche':
      return `"""
Python Requests Automation: France Travail Add Démarche
Type: ${params.demarcheType}
Entity: ${params.targetEntity}
Job: ${params.jobTitle}
"""
import requests

payload = {
    "type": "${params.demarcheType}",
    "entity": "${params.targetEntity}",
    "metier": "${params.jobTitle}",
    "comment": "${params.comment}"
}

print("Payload prepared for France Travail API:", payload)
`;

    case 'pipeline-croise':
      return `"""
Python Pipeline Cross-Check Script
Export Dir: ${params.exportDir}
"""
import os

export_dir = "${params.exportDir}"
print(f"Checking markdown exports in {export_dir}...")
`;

    default:
      return '# Python script';
  }
}
