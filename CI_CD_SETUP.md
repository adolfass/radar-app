# CI/CD Setup Guide

## GitHub Secrets Required

Go to **Settings → Secrets and variables → Actions** and add:

| Secret | Description | Example |
|---|---|---|
| `VDS_HOST` | VDS IP address | `157.22.175.40` |
| `VDS_USER` | SSH user for deployment | `agent` |
| `SSH_PRIVATE_KEY` | SSH private key for VDS access | `-----BEGIN OPENSSH PRIVATE KEY-----...` |

## SSH Key Setup

### 1. Generate deployment key (on your local machine)
```bash
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/radar-deploy
```

### 2. Add public key to VDS
```bash
ssh-copy-id -i ~/.ssh/radar-deploy.pub agent@157.22.175.40
```

### 3. Add private key to GitHub Secrets
```bash
cat ~/.ssh/radar-deploy | pbcopy  # macOS
# or
cat ~/.ssh/radar-deploy | xclip -selection clipboard  # Linux
```

Paste the content into GitHub → Settings → Secrets → `SSH_PRIVATE_KEY`

## Workflows

### CI (`ci.yml`)
Triggers on: `push` to `main/develop`, `pull_request` to `main`

Jobs:
- **backend-test**: Lint, test, coverage (with PostgreSQL service)
- **frontend-test**: Type check, lint, build

### CD (`cd.yml`)
Triggers on: `push` to `main`

Steps:
1. Build backend and frontend
2. SCP `backend/dist/` and `frontend/dist/` to VDS
3. Run Prisma migrations
4. Restart PM2 process

## Manual Deployment

SSH into VDS and run:
```bash
cd /var/www/radar-app
./deploy.sh all        # Deploy both
./deploy.sh backend    # Backend only
./deploy.sh frontend   # Frontend only
```

## Branch Strategy

| Branch | CI | CD |
|---|---|---|
| `main` | ✅ | ✅ Deploy to production |
| `develop` | ✅ | ❌ |
| `feature/*` | ✅ | ❌ |
