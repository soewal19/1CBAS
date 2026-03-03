# CI/CD Deployment Guide (Vercel & GitHub Actions)

This folder contains best-practice DevOps scripts for deploying the 1CBAS architecture.

## 1. GitHub Actions (Continuous Integration)
File: `github-actions-ci.yml`

**Purpose**: Runs automatically on every push or Pull Request to `main`. It initializes the SQLite db, spins up the Node.js API and Vite Frontend, and runs the entire **Playwright E2E** test suite.
**Usage**: Move `github-actions-ci.yml` to the root directory under `.github/workflows/ci.yml`.

## 2. Vercel Hosting (Continuous Deployment)
File: `vercel.json`

**Purpose**: Vercel is highly optimized for React (Vite) Single Page Applications. 
**Usage**: 
1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com/), create a New Project, and import your GitHub repository.
3. Vercel will automatically detect `vercel.json`. It builds the `/client/dist` folder and serves `index.html` for all frontend routes (fixing 404s on page refresh).

> **Note on Database for Production:**
> Vercel is a Serverless platform. SQLite (which writes to a local file) is reset on serverless function spins. For a true production Vercel deployment, the backend should connect to a managed PostgreSQL proxy (like Neon, Supabase, or AWS RDS).
