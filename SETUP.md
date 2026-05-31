# DevSecOps Pipeline: Setup Guide

Complete setup from zero to a running pipeline. Follow each step in order.

---

## Prerequisites

- Docker Desktop running
- Git installed
- Terminal open in the `Devsecops` project folder

---

## Step 1 — Start Forgejo

```bash
cd infrastructure
docker compose up forgejo -d
```

Wait about 30 seconds, then open **http://localhost:3000** in your browser.

### Initial Forgejo setup (web UI)

1. Leave all database settings as-is (SQLite is pre-configured)
2. Set **Site Title**: `DevSecOps Lab`
3. Scroll to **Administrator Account Settings** and create an admin user:
   - Username: `admin`
   - Password: choose something you'll remember
   - Email: any email address
4. Click **Install Forgejo**

---

## Step 2 — Create a repository in Forgejo

1. Log in at **http://localhost:3000** with your admin account
2. Click **+** → **New Repository**
3. Repository name: `devsecops-demo`
4. Set visibility to **Private** (or Public, either is fine)
5. **Do NOT** initialise with README — leave everything unchecked
6. Click **Create Repository**

---

## Step 3 — Get the runner registration token

1. In Forgejo, go to **Site Administration** (top-right menu → Site Administration)
2. Left sidebar → **Runners**
3. Click **Create new runner** (or look for the registration token)
4. Copy the token shown on screen

---

## Step 4 — Start the runner

Back in your terminal:

```bash
# Still inside the infrastructure/ folder
cp .env.example .env
```

Open `.env` and paste your token:

```
RUNNER_TOKEN=paste_your_token_here
```

Then start the runner:

```bash
docker compose up runner -d
```

Verify it connected — back in Forgejo go to Site Administration → Runners. You should see `local-runner` listed as **Online**.

---

## Step 5 — Push the app code to Forgejo

Open a new terminal tab and navigate to the **project root** (the `Devsecops` folder, NOT `infrastructure/`):

```bash
cd ..   # back to Devsecops/ root if you were in infrastructure/

git init
git checkout -b main
git remote add origin http://localhost:3000/admin/devsecops-demo.git
git add .
git commit -m "initial commit: app + pipeline"
git push -u origin main
```

> When prompted for credentials, use the Forgejo admin username and password you created in Step 1.

---

## Step 6 — Watch the pipeline run

1. In Forgejo, open your `devsecops-demo` repository
2. Click the **Actions** tab
3. You should see a pipeline run triggered by your push
4. Click it to watch the live log — you'll see:
   - **SAST Security Scan** → Semgrep scans your TypeScript source
   - **Build** → Docker image built from the multi-stage Dockerfile
   - **SBOM** → Syft catalogues every dependency in the image
   - **Vulnerability Scan** → Trivy checks for known CVEs
   - **Deploy** → old container stopped, new one started

---

## Step 7 — View the deployed app

Once the pipeline completes successfully, open:

**http://localhost:8080**

You'll see the demo app showing version, deploy timestamp, and uptime — live-updated every 5 seconds.

---

## Step 8 — Test the full CI/CD loop (for your demo recording)

Make a small change to the app so you can show the full commit → deploy cycle:

```bash
# Edit the version in app/package.json from "1.0.0" to "1.1.0"
# Or change something visible in app/public/index.html

git add .
git commit -m "bump version to 1.1.0"
git push
```

Go to the **Actions** tab in Forgejo and watch the pipeline run again. When it finishes, refresh **http://localhost:8080** — the version number will have updated.

---

## Useful commands

```bash
# See all running containers
docker ps

# View live app logs
docker logs -f devsecops-app

# View runner logs
docker logs -f act_runner

# Stop everything
cd infrastructure && docker compose down

# Stop just the deployed app
docker stop devsecops-app
```

---

## Architecture overview

```
localhost:3000  →  Forgejo (git + Actions UI)
localhost:8080  →  Deployed app (rebuilt on every push to main)

Docker network "devsecops":
  forgejo      ←→  act_runner
  act_runner   →   host Docker socket (to build & run the app container)
```

## Pipeline stages

| Stage | Tool | What it does |
|-------|------|-------------|
| SAST | Semgrep | Static code analysis, finds security issues in source |
| Build | Docker | Compiles TypeScript, packages into a production image |
| SBOM | Syft | Generates a Software Bill of Materials (CycloneDX JSON) |
| Vulnerability Scan | Trivy | Checks image layers for known CVEs |
| Deploy | Docker | Replaces the running container with the new image |
