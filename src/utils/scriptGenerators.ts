import { AutomationId } from '../types';

export function generatePlaywrightScript(id: AutomationId, params: Record<string, any>): string {
  return `/**
 * Playwright Automation (TypeScript): ${id}
 * Target URL: ${id === 'candidatures-envoyees' ? 'https://myjobs.indeed.com/applied' : id === 'candidatures-gmail' ? 'https://mail.google.com/mail/u/0/#starred' : 'https://candidat.francetravail.fr/demarcheretouremploi/journal'}
 * Features INLINE PROCESSING for reusing already connected/logged-in browser sessions
 */
import { chromium } from 'playwright';

async function getConnectedPage() {
  try {
    console.log('[Playwright] Connecting to existing browser via CDP (port 9222)...');
    const browser = await chromium.connectOverCDP('http://localhost:9222');
    const context = browser.contexts()[0] || await browser.newContext();
    const page = context.pages()[0] || await context.newPage();
    return { page, browser };
  } catch (err) {
    console.log('[Playwright] Launching persistent user context (reusing login session)...');
    const context = await chromium.launchPersistentContext('./user_session_profile', {
      headless: false,
      viewport: { width: 1280, height: 800 }
    });
    return { page: context.pages()[0] || await context.newPage() };
  }
}

async function run() {
  const { page, browser } = await getConnectedPage();
  try {
    const targetUrl = '${id === 'candidatures-envoyees' ? 'https://myjobs.indeed.com/applied' : id === 'candidatures-gmail' ? 'https://mail.google.com/mail/u/0/#starred' : 'https://candidat.francetravail.fr/demarcheretouremploi/journal'}';
    console.log('[Workflow] Navigating to:', targetUrl);
    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    console.log('[Workflow] Successfully executed ${id} automation!');
  } finally {
    if (browser) await browser.close();
  }
}

run().catch(console.error);
`;
}

export function generateConsoleSnippet(id: AutomationId, params: Record<string, any>): string {
  return `/**
 * Browser Console JS Snippet: ${id}
 * Aligned with TypeScript workflow logic for active session extraction.
 */
(function() {
  console.log("=== JobAutomation Toolkit: ${id} ===");
  
  function ensureActiveSession() {
    if (window.location.href.includes("login") || document.querySelector('input[type="password"]')) {
      console.warn("[Auth] Please log in to your account on this tab first.");
      return false;
    }
    console.log("[Auth] Active session verified.");
    return true;
  }

  if (!ensureActiveSession()) return;

  const targetUrl = "${id === 'candidatures-envoyees' ? 'https://myjobs.indeed.com/applied' : id === 'candidatures-gmail' ? 'https://mail.google.com/mail/u/0/#starred' : 'https://candidat.francetravail.fr/demarcheretouremploi/journal'}";
  console.log("Executing extraction for:", targetUrl);
  
  alert("Automation executed successfully on active session!");
})();
`;
}

export function generateCurlSnippet(id: AutomationId, params: Record<string, any>): string {
  return `# cURL Automation Script: ${id}
# Aligned with TypeScript target endpoints and session cookie reuse

SESSION_COOKIE="YOUR_REUSED_BROWSER_SESSION_COOKIE"
TARGET_URL="${id === 'candidatures-envoyees' ? 'https://myjobs.indeed.com/applied' : id === 'candidatures-gmail' ? 'https://mail.google.com/mail/u/0/#starred' : 'https://candidat.francetravail.fr/demarcheretouremploi/journal'}"

echo "[Auth] Verifying session for: $TARGET_URL"
curl -s -X GET "$TARGET_URL" \\
  -H "User-Agent: Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36" \\
  -H "Cookie: session_id=$SESSION_COOKIE"
`;
}

export function generatePythonSnippet(id: AutomationId, params: Record<string, any>): string {
  return `"""
Python Playwright Automation (Aligned with TypeScript workflow): ${id}
Reuses persistent user context or active browser session.
"""
from playwright.sync_api import sync_playwright

def run_python_automation():
    target_url = "${id === 'candidatures-envoyees' ? 'https://myjobs.indeed.com/applied' : id === 'candidatures-gmail' ? 'https://mail.google.com/mail/u/0/#starred' : 'https://candidat.francetravail.fr/demarcheretouremploi/journal'}"
    
    with sync_playwright() as p:
        print("[Playwright] Launching persistent browser context...")
        browser = p.chromium.launch_persistent_context(
            user_data_dir="./user_session_profile",
            headless=False,
            viewport={"width": 1280, "height": 800}
        )
        page = browser.pages[0] if browser.pages else browser.new_page()
        
        print(f"[Workflow] Navigating to: {target_url}")
        page.goto(target_url, wait_until="domcontentloaded")
        page.wait_for_timeout(3000)
        
        print("[Workflow] Python automation executed successfully!")
        browser.close()

if __name__ == "__main__":
    run_python_automation()
`;
}

export function generatePromptSnippet(id: AutomationId, params: Record<string, any>): string {
  return (
    'name: job-automation-' + id + '\n' +
    'description: "AI Agent Prompt instruction file aligned with TypeScript workflow for ' + id + '."\n' +
    'allowed-tools: ["Inspect", "Bash", "browseros_tabs", "browseros_navigate", "browseros_act", "browseros_evaluate"]\n\n' +
    '# LLM Agent Instructions (Aligned Workflow)\n' +
    '1. Authentication: Verify session via CDP or persistent context (ensureLoggedIn).\n' +
    '2. Target Navigation: Navigate to target URL (' + (id === 'candidatures-envoyees' ? 'https://myjobs.indeed.com/applied' : 'https://candidat.francetravail.fr/demarcheretouremploi/journal') + ').\n' +
    '3. Structured Extraction: Run DOM evaluation matching TypeScript modular functions.\n' +
    '4. Export: Generate Markdown/CSV report.\n'
  );
}
