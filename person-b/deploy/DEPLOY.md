# Deploying to your own Linux server

For whoever has SSH access to the server. This assumes a fresh Ubuntu/Debian-ish box with a
domain already pointed at its IP address (an `A` record for e.g. `api.yourdomain.com` → the
server's IP). If DNS isn't pointed yet, do that first — it can take a few minutes to propagate.

This covers the **API/backend only** (Person B's part). The frontend (Person A's React app) is
a separate deploy — see the note at the bottom.

## 1. One-time server setup

SSH into the server, then:

```bash
# Node.js (v20+; v22 to match what this was built/tested on)
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# pm2 — keeps the API running, restarts it on crash or server reboot
sudo npm install -g pm2

# nginx — reverse proxy so your domain (port 80/443) forwards to the API (port 4010)
sudo apt-get install -y nginx

# certbot — free HTTPS certificate
sudo apt-get install -y certbot python3-certbot-nginx
```

## 2. Clone the repo

```bash
git clone <the repo url> Kickstart
cd Kickstart
git checkout <branch with this code>
```

(If the repo is private, set up a deploy key or use an HTTPS token.)

## 3. First deploy

```bash
chmod +x deploy/deploy.sh
./deploy/deploy.sh
```

This installs dependencies and starts the API under pm2 on port 4010. Confirm it's running:

```bash
curl http://localhost:4010/health
pm2 status
```

Make pm2 survive a server reboot:
```bash
pm2 startup    # prints a command — copy/paste and run the line it gives you
pm2 save
```

## 4. Point your domain at it (nginx + HTTPS)

```bash
sudo cp deploy/nginx.conf.example /etc/nginx/sites-available/soccer-learn-api
sudo nano /etc/nginx/sites-available/soccer-learn-api   # replace api.yourdomain.com with your real domain
sudo ln -s /etc/nginx/sites-available/soccer-learn-api /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# Add HTTPS (also auto-configures nginx to redirect http -> https)
sudo certbot --nginx -d api.yourdomain.com
```

**HTTPS matters for phones specifically**: once the frontend is served over `https://`, any
plain `http://` call to the API gets blocked by the browser as mixed content. Judges opening
the app on their phone will hit this immediately if the API isn't also on `https`. Don't skip
the certbot step.

## 5. Verify from outside the server

From your own laptop or phone (not the server):
```bash
curl https://api.yourdomain.com/health
curl https://api.yourdomain.com/lessons
```

Give the resulting `https://api.yourdomain.com` URL to Person A, C, and D as the API base URL.

## 6. Deploying updates later

Whenever there's new content or code to push (e.g. more lesson content, Person C/D's routes
merged in), SSH in and re-run:

```bash
cd Kickstart
./deploy/deploy.sh
```

It pulls the latest branch, reinstalls deps, and reloads pm2 with zero downtime.

## Troubleshooting

- `curl localhost:4010/health` fails on the server → check `pm2 logs soccer-learn-api` for a
  crash (usually a missing dependency — rerun `npm install --omit=dev`).
- `curl https://api.yourdomain.com/health` fails from outside but works on `localhost` →
  nginx/DNS issue, not the app. Check `sudo nginx -t`, `sudo systemctl status nginx`, and that
  the domain's `A` record actually points at this server's IP (`dig api.yourdomain.com`).
- CORS errors in the browser console → shouldn't happen, the app allows all origins
  (`app.use(cors())` in `server/index.js`) — if you see this, it's likely the frontend hitting
  the wrong URL (http vs https, or a typo), not an actual CORS block.

## About the frontend (so judges can open "the app," not just the API)

This repo/deploy is just the API. For a judge to open the actual app on their phone, Person
A's React frontend needs to be built (`npm run build`) and served too — either:
- from the same server, via another nginx `server{}` block (or `location /`) serving the
  static build output on the main domain, with this API on a subdomain (`api.yourdomain.com`), or
- from a separate static host (Netlify/Vercel/GitHub Pages) pointed at this API's domain.

Either way, the frontend's API base URL just needs to be set to `https://api.yourdomain.com`
once step 4 above is done. Happy to write the nginx config for serving the built frontend
alongside this once Person A has a production build ready.
