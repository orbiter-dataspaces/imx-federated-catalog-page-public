# IMX Federated Catalog Page

![HM26 Showcase](public/hm26-showcase-logowall.png)

An interactive catalog that lets you browse and search Gaia-X verifiable credentials from the International Manufacturing-X (IMX) initiative. You can filter by credential type, use case, and status, copy credential JSON with one click, and jump into detailed views for each entry.

---

## What does the app look like?

### Home Page

![Home Page](screenshots/app-screenshot.png)

The home page is split into four rows. Each row has a small icon and label on the left side and a grid of clickable tiles on the right.

| Row | What it contains | What happens when you click a tile |
|---|---|---|
| **Overview** | IMX topics (Manufacturing-X, Standards, Architecture, Showcase) | Opens a topic page with presentation slides about that topic |
| **Use Cases** | Battery Passport, Ski Maintenance, Edge AI, Shopfloor Management | Opens a topic page explaining that use case with slides |
| **Catalogues** | Service Catalogue (×2) and Federated Trust | Opens the **Trusted Services & Devices Catalog** table, pre-filtered for that use case |
| **Applications** | Partner app tiles (Explitia, Nestfield, R-Strategy, etc.) | Opens the external partner application in a new browser tab. Tiles without a link are coming soon. |

---

### Trusted Services & Devices Catalog (`/vc-catalog`)

![VC Catalog](screenshots/screenshot-vc-catalog.png)

A table view of the same credentials. This view is useful when you want to quickly scan many entries at once.

**← Back button** — returns you to the home page

**Use Case filter** — same as in the card catalog: choose *All*, *Digital Battery Passport*, or *Ski Maintenance*

**Table columns:**
| Column | What it shows |
|---|---|
| **Name** | The registered name of the participant, application, or service |
| **Country** | A flag and country code derived from the credential's `gx:registrationNumber` field |
| **Type** | The credential type with the `imx:` prefix removed (e.g. "Provider", "Application", "Service") |
| **Issuer** | The DID of the organisation that issued the credential |
| **Endpoint** | A clickable link to the service endpoint, if one is registered. Placeholder values ("anyurl", "example.com") are hidden automatically. |

> On mobile screens the table switches to individual cards — one card per credential — with the same information stacked vertically.

---

## Server deployment recipe (for IT / ops)

If you want to host this app on a virtual server so colleagues can reach it through a URL, here is the complete recipe — minimum specs, operating system, tools, and step-by-step install from GitHub.

### Minimum hardware

| Resource | Minimum | Recommended | Notes |
|---|---|---|---|
| **CPU** | 1 vCPU | 2 vCPU | Next.js uses one core well; a second core gives build headroom |
| **RAM** | 1 GB (+ swap) | 2 GB | `npm install` and `next build` can briefly spike to ~1 GB |
| **Disk** | 2 GB free | 5 GB free | Project + `node_modules` + build output ≈ 700 MB; the rest is OS + logs |
| **Network** | Outbound HTTPS (to pull from GitHub + npm) and inbound TCP **3000** (or 80/443 if you use a reverse proxy) |

Cloud sizes that fit this profile:

| Provider | Suitable instance | Approx. price |
|---|---|---|
| Hetzner Cloud | **CX22** (2 vCPU / 4 GB) | ~€4/month |
| AWS EC2 | **t3.micro** (2 vCPU / 1 GB) | ~$8/month |
| Azure | **B1s** (1 vCPU / 1 GB) | ~$8/month |
| DigitalOcean | **Basic Droplet** (1 vCPU / 1 GB) | $6/month |

### Operating system

Any modern 64-bit Linux. Recommended (in order of preference):

1. **Ubuntu 24.04 LTS** or **22.04 LTS** ← the recipe below assumes this
2. **Debian 12**
3. **Rocky Linux 9** / **RHEL 9** (swap `apt` for `dnf`)

Windows Server and macOS also work but are not the typical hosting target.

### Required tools

| Tool | Minimum version | Purpose |
|---|---|---|
| **Node.js** | 18.x (22.x LTS recommended) | Runtime for the Next.js app |
| **npm** | 9.x (ships with Node.js) | Installs JavaScript dependencies |
| **git** | any recent version | Pulls the source code from GitHub |
| **PM2** *(optional)* | latest | Keeps the app running after you log out |
| **Caddy** or **nginx** *(optional)* | latest | Reverse proxy + automatic HTTPS |
| **Docker** *(optional)* | 20.10+ | Run the app in a container instead of installing Node.js |

### Step-by-step — fresh Ubuntu 22.04 / 24.04 VM

Log in via SSH as a user with `sudo` rights and run these commands in order:

```bash
# 1. Update the operating system
sudo apt update && sudo apt upgrade -y

# 2. Install git and curl
sudo apt install -y git curl

# 3. Install Node.js 22 LTS from the official NodeSource repository
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

# 4. Verify the install
node --version     # expect v22.x.x
npm --version      # expect 10.x.x or higher

# 5. Pull the project from GitHub
git clone https://github.com/orbiter-dataspaces/imx-federated-catalog-page-public.git
cd imx-federated-catalog-page-public

# 6. Install JavaScript dependencies (~1–2 minutes)
npm install

# 7. Build the production bundle
npm run build

# 8. Start the app on port 3000
npm run start
```

Open `http://<your-server-ip>:3000` in a browser — the app is live.

> If your cloud provider has a firewall (AWS Security Group, Hetzner Firewall, etc.), open port **3000** for inbound TCP, or open **80/443** if you plan to use the reverse-proxy step below.

### Keep it running after you log out

`npm run start` stops as soon as you close the SSH session. Use **PM2** to keep it alive:

```bash
sudo npm install -g pm2
pm2 start "npm run start" --name imx-catalog
pm2 save
pm2 startup        # follow the printed command to enable auto-start on reboot
```

### Put it on port 80/443 with HTTPS (recommended for public use)

**Caddy** gives you free Let's Encrypt HTTPS in three lines:

```bash
sudo apt install -y caddy
echo "yourdomain.example.com {
    reverse_proxy localhost:3000
}" | sudo tee /etc/caddy/Caddyfile
sudo systemctl reload caddy
```

Point your domain's DNS A record at the server's public IP — Caddy will issue and renew the certificate automatically.

### Docker alternative (no Node.js on the host)

If you prefer to avoid installing Node.js on the server, the repository ships a production Dockerfile:

```bash
sudo apt install -y docker.io git
git clone https://github.com/orbiter-dataspaces/imx-federated-catalog-page-public.git
cd imx-federated-catalog-page-public
sudo docker build -t imx-federated-catalog .
sudo docker run -d --name imx-catalog --restart unless-stopped -p 3000:3000 imx-federated-catalog
```

Pre-built images are also published automatically to GitHub Container Registry on every release.

### Updating to a new version

```bash
cd imx-federated-catalog-page-public
git pull
npm install
npm run build
pm2 restart imx-catalog       # or: sudo docker compose up -d --build
```

---

## First-time setup — step by step

> **Never used a terminal before?**
> A terminal (also called "command line" or "shell") is a text-based window where you type commands. On **Mac** press `Cmd + Space`, type `Terminal`, and hit Enter. On **Windows** press the Windows key, type `cmd`, and hit Enter.

---

### Step 1 — Install Node.js

Node.js is the engine that runs this app. Think of it like installing a game runtime before you can play the game.

1. Go to **https://nodejs.org**
2. Download the version labelled **"LTS"** (Long-Term Support) — this is the stable one
3. Run the installer and click **Next** on every screen (the defaults are fine)
4. When the installer finishes, open a terminal and type the following, then press Enter:

```
node --version
```

You should see something like `v22.x.x`. If you do, Node.js is installed correctly. If you see an error, restart your computer and try again.

---

### Step 2 — Download the project

**Option A — with Git (recommended)**

If you have Git installed, open a terminal and run:

```bash
git clone https://github.com/orbiter-dataspaces/imx-federated-catalog-page-public.git
cd imx-federated-catalog-page-public
```

**Option B — without Git**

1. Go to the GitHub page for this project
2. Click the green **"Code"** button near the top right
3. Click **"Download ZIP"**
4. Unzip the downloaded file somewhere on your computer (e.g. your Desktop)
5. Open a terminal and navigate to that folder:

```bash
# On Mac/Linux:
cd ~/Desktop/imx-federated-catalog-page-public

# On Windows (adjust the path to wherever you unzipped it):
cd C:\Users\YourName\Desktop\imx-federated-catalog-page-public
```

---

### Step 3 — Install the app's dependencies

Dependencies are small helper packages the app needs to run (like plugins). This step downloads all of them automatically.

In your terminal (make sure you are inside the project folder from Step 2), run:

```bash
npm install
```

You will see a lot of text scroll by — that is normal. It can take 1–2 minutes depending on your internet connection. When it finishes, your terminal prompt will appear again.

> **If you see "npm: command not found"** — Node.js did not install correctly. Go back to Step 1 and try reinstalling it.

---

### Step 4 — Start the app

```bash
npm run dev
```

After a few seconds you will see output like this:

```
▲ Next.js 16.x.x
- Local:        http://localhost:3000

✓ Ready in 2.1s
```

Open your web browser (Chrome, Firefox, Edge — any of them) and go to:

```
http://localhost:3000
```

The app is now running on your computer. You should see the IMX catalog home page.

> **To stop the app**, go back to the terminal and press `Ctrl + C`.

---

## Common problems & fixes

**The page won't load / I see "This site can't be reached"**

Make sure the terminal is still running `npm run dev`. If you closed it, run `npm run dev` again. If port 3000 is already used by another app on your machine, Next.js will automatically try port 3001 — check the terminal output for the actual URL.

---

**I see a long error after running `npm install`**

Your Node.js version may be too old. Check it:

```bash
node --version
```

If it shows anything below `v18`, reinstall Node.js from https://nodejs.org (download the LTS version).

---

**The terminal says "Permission denied"**

On Mac/Linux, add `sudo` in front of the command and enter your password when asked:

```bash
sudo npm install
```

---

**The app opens but shows no credentials**

Make sure the `IMXC/` folder exists inside the project directory and contains `.json` files. If you downloaded the ZIP from GitHub, these files should already be included.

---

## Run a production build (optional)

If you want to run the app the same way it would run on a live server (faster, no debug output):

```bash
npm run build
npm run start
```

Then open `http://localhost:3000` as before.

---

## Run with Docker (optional)

If you have Docker installed, you can skip Node.js entirely and run the whole app inside a container:

```bash
docker build -t imx-federated-catalog .
docker run -p 3000:3000 imx-federated-catalog
```

Then open `http://localhost:3000`.

> **What is Docker?** Docker packages the app and all its requirements into a self-contained box that runs the same on any computer. Download it from https://www.docker.com/products/docker-desktop.

---

## For developers

### Available scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the development server with hot reload |
| `npm run build` | Compile a production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint to check code quality |
| `npm run test` | Run the Vitest test suite |

### Project structure

```
app/                  Next.js App Router — pages and layouts
  api/credentials/    API route that reads and normalises IMXC/*.json files
  catalog/            Card-based credential explorer
  vc-catalog/         Table-based credential catalog with country flags
  topic/[slug]/       Dynamic topic pages driven by lib/topics.ts
components/           Reusable UI components (shadcn/ui based)
lib/
  topics.ts           Topic metadata (slugs, slide ranges, extra images)
  utils.ts            Tailwind class-merge helper
IMXC/                 Verifiable Credential JSON files (the actual data)
credentials/          Additional credential files
public/               Static assets (images, icons, slide PNGs)
styles/               Global Tailwind CSS
workflows/            CI and release GitHub Actions
```

### Tech stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript** with strict mode
- **Tailwind CSS 4** + shadcn/ui primitives
- **Vitest** + Testing Library for tests
- **Semantic Release** for automated versioning

### Contributing

1. Fork the repository and create a feature branch
2. Run `npm install` to install dependencies
3. Make your changes and add or update tests as needed
4. Ensure `npm run lint` and `npm run test` both pass
5. Use semantic-release commit prefixes (`feat:`, `fix:`, `chore:`) in your commit messages
6. Open a pull request against `master`

### CI / CD

- **CI workflow** — runs lint and tests on every pull request
- **Release workflow** — triggered on push to `master`; runs Semantic Release, publishes a GitHub release, and builds + pushes a Docker image to GHCR

---

## License

Maintained by the Orbiter Dataspaces team. Licensing terms are TBD — contact the maintainers before redistribution.
