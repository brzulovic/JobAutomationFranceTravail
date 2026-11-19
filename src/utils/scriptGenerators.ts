import { AutomationId } from '../types';

export function generatePlaywrightScript(id: AutomationId, params: Record<string, any>): string {
  return `/**
 * Playwright Automation: ${id}
 * Includes mandatory ensureLoggedIn() authentication function executed first.
 */
import { chromium, Page } from 'playwright';

/**
 * 1. MANDATORY AUTHENTICATION / LOGIN STEP
 * Checks session cookies or prompts login if session is invalid/expired.
 */
async function ensureLoggedIn(page: Page, targetUrl: string) {
  console.log('[Auth] Checking authentication session for:', targetUrl);
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(2000);

  const currentUrl = page.url();
  if (currentUrl.includes('login') || currentUrl.includes('signin') || currentUrl.includes('connexion')) {
    console.log('[Auth] Session expired or not logged in. Please sign in in the browser window...');
    // Wait for user manual login or auto-login cookies
    await page.waitForURL((url) => !url.toString().includes('login') && !url.toString().includes('signin'), { timeout: 60000 });
    console.log('[Auth] Successfully authenticated!');
  } else {
    console.log('[Auth] Active session verified successfully.');
  }
}

async function runAutomation() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    // STEP 1: Execute Login / Authentication Function first
    await ensureLoggedIn(page, '${params.exportPath ? 'https://myjobs.indeed.com/applied' : 'https://candidat.francetravail.fr'}');

    console.log('[Workflow] Executing core automation steps...');
    // Core workflow execution here...
    await page.waitForTimeout(3000);
    console.log('[Workflow] Automation completed successfully.');

  } finally {
    await browser.close();
  }
}

runAutomation().catch(console.error);
`;
}

export function generateConsoleSnippet(id: AutomationId, params: Record<string, any>): string {
  return `/**
 * Browser Console JS Snippet: ${id}
 * Includes login session validation check.
 */
(function() {
  function ensureLoggedIn() {
    if (window.location.href.includes("login") || document.querySelector('input[type="password"]')) {
      console.warn("[Auth] Please log in to your account before running this snippet.");
      return false;
    }
    console.log("[Auth] Active browser session verified.");
    return true;
  }

  if (!ensureLoggedIn()) return;
  console.log("Running ${id} automation snippet...");
})();
`;
}

export function generateCurlSnippet(id: AutomationId, params: Record<string, any>): string {
  return `# cURL Automation Script: ${id}
# STEP 1: Authentication / Login Check (using session cookies)
# Set your active session cookie below before executing

SESSION_COOKIE="YOUR_ACTIVE_SESSION_COOKIE_HERE"

echo "[Auth] Verifying session cookie..."
curl -s -I -H "Cookie: session_id=$SESSION_COOKIE" "https://myjobs.indeed.com/applied" | grep -E "HTTP/|Set-Cookie"

echo "[Workflow] Executing cURL request with authenticated session..."
curl -s -X GET "https://myjobs.indeed.com/applied" \\
  -H "User-Agent: Mozilla/5.0" \\
  -H "Cookie: session_id=$SESSION_COOKIE"
`;
}

export function generatePythonSnippet(id: AutomationId, params: Record<string, any>): string {
  return `"""
Python Requests Automation: ${id}
Includes mandatory ensure_logged_in() authentication step.
"""
import requests

def ensure_logged_in(session: requests.Session, test_url: str) -> bool:
    print(f"[Auth] Checking authentication for {test_url}...")
    resp = session.get(test_url, allow_redirects=True)
    if "login" in resp.url or "connexion" in resp.url:
        print("[Auth] Error: Session cookie invalid or expired. Please update credentials.")
        return False
    print("[Auth] Active session verified successfully.")
    return True

def run_automation():
    session = requests.Session()
    session.headers.update({"User-Agent": "Mozilla/5.0"})
    
    # Inject session cookie
    session.cookies.set("session_id", "YOUR_SESSION_COOKIE_HERE")

    target_url = "https://myjobs.indeed.com/applied"
    
    # STEP 1: Login / Authentication check
    if not ensure_logged_in(session, target_url):
        return

    print("[Workflow] Executing core python request...")
    resp = session.get(target_url)
    print(f"[Workflow] Response status: {resp.status_code}")

if __name__ == "__main__":
    run_automation()
`;
}

export function generatePromptSnippet(id: AutomationId, params: Record<string, any>): string {
  return `name: job-automation-${id}
description: "AI Agent Prompt instruction file for executing ${id} automation."
allowed-tools: ["Inspect", "Bash", "browseros_tabs", "browseros_navigate", "browseros_act", "browseros_evaluate"]

# LLM Agent Instructions & Authentication Step
1. **STEP 1 (Authentication)**: Execute ensureLoggedIn() to verify active session cookies or prompt user login if redirected to a login wall.
2. Navigate to target URL after successful authentication.
3. Extract structured object array or perform workflow action.
4. Export results to requested destination.
`;
}
