# DevSecOps Pipeline

**Student:** Erik Heerke Witteveen | **Student number:** 413560
**Course:** DevSecOps (re-sit) | **Assessor:** Dr Mohsen Kakavand (KAMO)

---

A fully automated DevSecOps pipeline running locally via Docker. Every push to `main` triggers a security scan, build, test, vulnerability scan and deployment. No manual steps needed after the push.

## What it does

```
git push to main
  --> SAST (Semgrep)
  --> Build (Docker)
  --> Test (Jest)
  --> SBOM (Syft)
  --> Vulnerability scan (Trivy)
  --> Deploy to localhost:8080
```

- **Forgejo** (self-hosted Gitea) hosts the repository and runs the CI/CD pipeline
- **Semgrep** scans source code for security issues before anything is built
- **Docker** compiles TypeScript and packages a hardened production image
- **Jest** runs automated unit tests against the application
- **Syft** generates a Software Bill of Materials (CycloneDX JSON)
- **Trivy** scans the image for known CVEs
- **Uptime Kuma** monitors the app and Forgejo at http://localhost:3001
- The updated app is deployed automatically at **http://localhost:8080**

## Quick start

See [SETUP.md](SETUP.md) for the full guide.

```bash
cd infrastructure
cp .env.example .env   # paste your Forgejo runner token
docker compose up -d
```

Then push to `main` and watch the pipeline run at **http://localhost:3000**.

## Stack

| Component | Technology |
|-----------|-----------|
| Git host + CI | Forgejo 9 (Gitea fork) |
| CI runner | gitea/act_runner |
| Application | Node.js + TypeScript + Express |
| Containerisation | Docker (multi-stage build) |
| SAST | Semgrep |
| Testing | Jest + Supertest |
| SBOM | Syft (CycloneDX) |
| Vulnerability scan | Trivy |
| Monitoring | Uptime Kuma |

## Documentation

- [IMPLEMENTATION.md](IMPLEMENTATION.md) covers every concept implemented with evidence
- [SETUP.md](SETUP.md) is a step-by-step guide to reproduce the full setup from zero
