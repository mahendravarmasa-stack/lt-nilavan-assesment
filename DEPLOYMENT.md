# DEPLOYMENT.md
# DevOps Assessment — lt-nilavan

**Stack:** Ubuntu 24.04 LTS · Nginx · PM2 · Node.js 18 (nvm) · Let's Encrypt SSL
**App:** Next.js 15 (lt-nilavan)

---

## Phase 1 — AWS EC2 Instance

### 1.1 Launch EC2

1. AWS Console → EC2 → **Launch Instance**
2. AMI: **Ubuntu Server 24.04 LTS (HVM), SSD**
3. Instance type: **t3.micro**
4. Key pair: create new → download `office.pem`
5. Security Group inbound rules:

| Type | Protocol | Port | Source |
|------|----------|------|--------|
| SSH | TCP | 2204 | My IP |
| HTTP | TCP | 80 | 0.0.0.0/0 |
| HTTPS | TCP | 443 | 0.0.0.0/0 |

### 1.2 First Login

```bash
chmod 400 office.pem
ssh -i office.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

---

## Phase 2 — Server Hardening

### 2.1 System Update

```bash
sudo apt update && sudo apt upgrade -y
```

### 2.2 Create Non-Root User

```bash
sudo adduser devuser
sudo usermod -aG sudo devuser
```

### 2.3 Configure SSH Key for devuser

```bash
# On LOCAL machine — get your public key
cat ~/.ssh/id_rsa.pub

# On SERVER — add it for devuser
sudo mkdir -p /home/devuser/.ssh
sudo nano /home/devuser/.ssh/authorized_keys
# Paste your public key and save

sudo chmod 700 /home/devuser/.ssh
sudo chmod 600 /home/devuser/.ssh/authorized_keys
sudo chown -R devuser:devuser /home/devuser/.ssh
```

### 2.4 Harden SSH

```bash
sudo nano /etc/ssh/sshd_config
```

Set these values:
```
Port 2204
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

```bash
sudo systemctl restart sshd

# TEST in a NEW terminal before closing current session:
ssh -i office.pem -p 2204 devuser@YOUR_EC2_PUBLIC_IP
```

### 2.5 UFW Firewall

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 2204/tcp comment 'SSH'
sudo ufw allow 80/tcp   comment 'HTTP'
sudo ufw allow 443/tcp  comment 'HTTPS'
sudo ufw enable
sudo ufw status verbose
```

Expected output:
```
Status: active
To                         Action      From
--                         ------      ----
2204/tcp                   ALLOW IN    Anywhere
80/tcp                     ALLOW IN    Anywhere
443/tcp                    ALLOW IN    Anywhere
```

---

## Phase 3 — Install Runtime

### 3.1 Switch to devuser

```bash
su - devuser
```

### 3.2 Install nvm + Node.js 18

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash
source ~/.bashrc

nvm install 18
nvm use 18
nvm alias default 18

node --version    # v18.x.x
npm --version
```

### 3.3 Install PM2

```bash
npm install -g pm2
```

---

## Phase 4 — Deploy Application

### 4.1 Clone Repository

```bash
sudo apt install git -y
cd /home/devuser
git clone https://github.com/Leadtap/lt-nilavan.git
cd lt-nilavan/lt-nilavan-live
```

### 4.2 Install and Build

```bash
npm install
npm run build
```

### 4.3 Start with PM2

```bash
pm2 start npm --name "nextjs-app" -- start
pm2 save
pm2 startup
# Copy-paste the exact command it outputs

pm2 list
pm2 logs nextjs-app --lines 20
```

Expected PM2 output:
```
┌────┬───────────────┬─────────────┬─────────┬─────────┬──────────┬────────┬──────┬───────────┬──────────┬──────────┬──────────┬──────────┐
│ id │ name          │ namespace   │ version │ mode    │ pid      │ uptime │ ↺    │ status    │ cpu      │ mem      │ user     │ watching │
├────┼───────────────┼─────────────┼─────────┼─────────┼──────────┼────────┼──────┼───────────┼──────────┼──────────┼──────────┼──────────┤
│ 0  │ nextjs-app    │ default     │ 0.39.0  │ fork    │ 319339   │ 8h     │ 1    │ online    │ 0%       │ 36.2mb   │ devuser  │ disabled │
└────┴───────────────┴─────────────┴─────────┴─────────┴──────────┴────────┴──────┴───────────┴──────────┴──────────┴──────────┴──────────┘
```

---

## Phase 5 — Nginx Configuration

### 5.1 Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 5.2 Create Site Config

```bash
sudo nano /etc/nginx/sites-available/nextjs-app
```

Paste:
```nginx
server {
    listen 80;
    server_name mahendrvarmastack.co.in;

    # Redirect all HTTP traffic to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name mahendrvarmastack.co.in;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/mahendrvarmastack.co.in/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/mahendrvarmastack.co.in/privkey.pem;

    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Content-Security-Policy "frame-ancestors 'none';" always;

    # Block access to .git directory
    location ~ /\.git {
        deny all;
        return 403;
    }

    # Reverse proxy to Next.js app
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/nextjs-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## Phase 6 — SSL Certificate

### 6.1 Point Domain to Server

In your DNS registrar, add an **A record**:
- Host: `mahendrvarmastack.co.in` → Value: EC2 Public IP
- Host: `www.mahendrvarmastack.co.in` → Value: EC2 Public IP

Wait ~5 minutes for DNS propagation before running Certbot.

### 6.2 Install and Run Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d mahendrvarmastack.co.in -d www.mahendrvarmastack.co.in
# Choose option 2 (redirect HTTP to HTTPS)

sudo certbot renew --dry-run
sudo systemctl status certbot.timer
```

---

## Phase 7 — Verification Checklist

```bash
# Firewall active
sudo ufw status

# App running via PM2
pm2 list

# Nginx running
sudo systemctl status nginx

# SSL valid
sudo certbot certificates

# HTTPS loads
curl -I https://mahendrvarmastack.co.in

# HTTP redirects to HTTPS
curl -I http://mahendrvarmastack.co.in
# Expected: 301 Moved Permanently

# .git is blocked
curl -I https://mahendrvarmastack.co.in/.git/config
# Expected: 403 Forbidden

# Security headers present
curl -I https://mahendrvarmastack.co.in | grep -E "X-Frame|X-Content|Referrer"
```

---

## Architecture Diagram

```
Internet
    │
    ▼
[AWS Security Group] ── ports 80, 443, 2204 only
    │
    ▼
[UFW Firewall] ── same rules (defence in depth)
    │
    ▼
[Nginx :80] ── 301 redirect to HTTPS
[Nginx :443] ── TLS (Let's Encrypt), Security headers, Block /.git
    │
    ▼
[Next.js :3000] ── managed by PM2 (auto-restart, auto-start on reboot)
    │
    ▼
[SendGrid API] ── outbound email only
```

---

## Decisions and Trade-offs

| Decision | Reason |
|----------|--------|
| t3.micro over t2.micro | Better CPU burst performance; more reliable during Next.js build and runtime under load |
| Ubuntu 24.04 LTS | Latest LTS release — 5 years of security updates, widely supported |
| nvm over apt Node.js | Allows version pinning; easy to upgrade without breaking system packages |
| PM2 over systemd directly | Simpler log management, built-in monitoring, easy restart commands |
| Nginx as reverse proxy | Handles SSL termination and security headers; Next.js port 3000 never exposed publicly |
| Non-root devuser | Limits blast radius if app is compromised — attacker cannot reach system files |
| UFW + AWS Security Group | Two firewall layers — if one is misconfigured the other still protects |
| Let's Encrypt over paid SSL | Free, auto-renewing, trusted by all browsers |
| Custom SSH port 2204 | Reduces automated bot scanning noise on default port 22 |
