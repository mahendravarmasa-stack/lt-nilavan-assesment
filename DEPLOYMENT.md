# DEPLOYMENT.md
# lt-nilavan — Production Deployment Guide

**Stack:** Ubuntu 22.04 LTS · Nginx · PM2 · Node.js 18 (nvm) · Let's Encrypt SSL  
**App:** Next.js 15 (lt-nilavan)

---

## Phase 1 — AWS EC2 Instance

### 1.1 Launch EC2

1. AWS Console → EC2 → **Launch Instance**
2. AMI: **Ubuntu Server 22.04 LTS (HVM), SSD**
3. Instance type: **t2.micro** (free tier)
4. Key pair: create new → download `nilavan-key.pem`
5. Security Group inbound rules:

| Type | Protocol | Port | Source |
|------|----------|------|--------|
| SSH | TCP | 2222 | My IP |
| HTTP | TCP | 80 | 0.0.0.0/0 |
| HTTPS | TCP | 443 | 0.0.0.0/0 |

### 1.2 First Login

```bash
chmod 400 nilavan-key.pem
ssh -i nilavan-key.pem ubuntu@YOUR_EC2_PUBLIC_IP
```

---

## Phase 2 — Server Hardening

### 2.1 System Update

```bash
sudo apt update && sudo apt upgrade -y
```

### 2.2 Create Non-Root Deploy User

```bash
sudo adduser deploy
sudo usermod -aG sudo deploy
```

### 2.3 Configure SSH Key for Deploy User

```bash
# On LOCAL machine — get your public key
cat ~/.ssh/id_rsa.pub

# On SERVER — add it for deploy user
sudo mkdir -p /home/deploy/.ssh
sudo nano /home/deploy/.ssh/authorized_keys
# Paste your public key and save

sudo chmod 700 /home/deploy/.ssh
sudo chmod 600 /home/deploy/.ssh/authorized_keys
sudo chown -R deploy:deploy /home/deploy/.ssh
```

### 2.4 Harden SSH

```bash
sudo nano /etc/ssh/sshd_config
```

Set these values:
```
Port 2222
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
```

```bash
sudo systemctl restart sshd

# TEST in a NEW terminal before closing current session:
ssh -i nilavan-key.pem -p 2222 deploy@YOUR_EC2_PUBLIC_IP
```

### 2.5 UFW Firewall

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow 2222/tcp comment 'SSH'
sudo ufw allow 80/tcp  comment 'HTTP'
sudo ufw allow 443/tcp comment 'HTTPS'
sudo ufw enable
sudo ufw status verbose
```

Expected output:
```
Status: active
To                         Action      From
--                         ------      ----
2222/tcp                   ALLOW IN    Anywhere
80/tcp                     ALLOW IN    Anywhere
443/tcp                    ALLOW IN    Anywhere
```

---

## Phase 3 — Install Runtime

### 3.1 Switch to Deploy User

```bash
su - deploy
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
cd /home/deploy
git clone https://github.com/Leadtap/lt-nilavan.git
cd lt-nilavan/lt-nilavan-live
```

### 4.2 Configure Environment

```bash
nano .env.local
```

Add:
```env
SENDGRID_API_KEY=your_sendgrid_api_key_here
SENDGRID_TO_EMAIL=info@nilavanrealtors.com
```

```bash
chmod 600 .env.local
```

### 4.3 Install and Build

```bash
npm install
npm run build
```

### 4.4 Start with PM2

```bash
pm2 start npm --name "lt-nilavan" -- start
pm2 save
pm2 startup
# Copy-paste the command it outputs exactly

pm2 list
pm2 logs lt-nilavan --lines 20
```

Expected PM2 output:
```
┌────┬──────────────┬─────────┬─────────┬──────────┐
│ id │ name         │ version │ mode    │ status   │
├────┼──────────────┼─────────┼─────────┼──────────┤
│ 0  │ lt-nilavan   │ 0.1.0   │ fork    │ online   │
└────┴──────────────┴─────────┴─────────┴──────────┘
```

---

## Phase 5 — Nginx Configuration

### 5.1 Install Nginx

```bash
sudo apt install nginx -y
sudo systemctl enable nginx
```

### 5.2 Create Site Config

```bash
sudo nano /etc/nginx/sites-available/lt-nilavan
```

Paste:
```nginx
server {
    listen 80;
    server_name YOUR_DOMAIN.com www.YOUR_DOMAIN.com;

    # Block .git directory — prevents source code exposure
    location ~ /\.git {
        deny all;
        return 404;
    }

    # Block all hidden files
    location ~ /\. {
        deny all;
        return 404;
    }

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;

    # Proxy to Next.js
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/lt-nilavan /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx
```

---

## Phase 6 — SSL Certificate

### 6.1 Point Domain to Server

In your DNS registrar add an A record: `yourdomain.com` → EC2 Public IP. Wait ~5 minutes.

### 6.2 Install and Run Certbot

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
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
curl -I https://yourdomain.com

# HTTP redirects to HTTPS
curl -I http://yourdomain.com
# Expected: 301 Moved Permanently

# .git is blocked
curl -I https://yourdomain.com/.git/config
# Expected: 404 Not Found

# Security headers present
curl -I https://yourdomain.com | grep -E "X-Frame|X-Content|Strict"
```

---

## Phase 8 — Ongoing Operations

```bash
# View logs
pm2 logs lt-nilavan

# Restart app
pm2 restart lt-nilavan

# Deploy updates
cd /home/deploy/lt-nilavan/lt-nilavan-live
git pull origin main
npm install
npm run build
pm2 restart lt-nilavan

# Monitor dashboard
pm2 monit
```

---

## Architecture Diagram

```
Internet
    │
    ▼
[AWS Security Group] ── ports 80, 443, 2222 only
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
| nvm over apt Node.js | Allows version pinning; easy to upgrade without breaking system packages |
| PM2 over systemd directly | Simpler log management, easy restart/monitoring commands |
| Nginx as reverse proxy | Handles SSL termination, security headers; Next.js not exposed directly |
| Non-root deploy user | Limits blast radius if app is compromised |
| UFW + AWS Security Group | Two firewall layers — defence in depth |
| Let's Encrypt over paid SSL | Free, auto-renewing, trusted by all browsers |
| Custom SSH port 2222 | Reduces automated bot scanning noise on port 22 |
