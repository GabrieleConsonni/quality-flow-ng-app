# Quality Flow — Angular frontend

Web UI for the **Quality Flow** platform: a tool to author, run and inspect
**API / integration test suites** against message queues, databases and mock servers.

This app is the modern Angular UI that progressively replaces the legacy Streamlit
interface shipped inside the backend repo. It talks to the
[`quality-flow`](https://github.com/GabrieleConsonni/quality-flow) FastAPI backend.

## What it does

The UI is organized around the **Test Suites** domain and the supporting configuration areas:

- **Suites** — list, filter and manage test suites; quick "Run now" with a live execution drawer.
- **Suite editor** — compose a suite as ordered **Setup / Tests / Teardown** stages, with drag-to-reorder and scheduling.
- **Tests** — build tests from templates (*Send & Verify*, *Mock & Assert*) or as a fully **custom** step list.
- **Step editor** — pick step kinds grouped by intent: Producers, Consumers, Assertions, Control.
- **Execution view** — hierarchical run timeline with per-step detail and **JSON diffs** of expected vs actual.
- **Datasources & Mock servers** — manage database/JSON-array datasources and HTTP mock servers (with OpenAPI import).
- **Logs** — inspect execution logs and run history.

## Tech stack

- **Angular 20** (standalone components, signals) in an Nx-style `apps/` workspace
- **pnpm** package manager
- **Tiara design system** (`@akeron-ng/tiara-ng`, `tiara-ng-suite`) + **DevExtreme** for data-heavy UI
- **NgRx Signals** for state, **RxJS** for async flows
- **Monaco editor** + **jsondiffpatch** for JSON editing and diffing
- **OIDC** auth via `angular-oauth2-oidc` (bypassed in the `mock-auth` profile for local dev)
- **Biome** for lint/format, **Playwright** for E2E

## Prerequisites

- Node.js (LTS) and **pnpm**
- A running `quality-flow` backend (see that repo) for non-mock data

## Install

```bash
pnpm install
```

## Run (local dev)

The day-to-day profile bypasses OIDC and serves on port **4400**:

```bash
pnpm run start:mock-auth          # http://localhost:4400  (alkyra theme, mock auth)
pnpm run start:mock-auth-vulki    # same, vulki theme
```

Theme-specific dev servers (real config) are also available:

```bash
pnpm run start-alkyra-theme
pnpm run start-vulki-theme
```

> The full containerized stack (backend + this frontend behind nginx) is orchestrated
> from the workspace root via `qf-stack-dev.bat`; these scripts are the standalone FE dev servers.

## Build

```bash
pnpm run build                       # default build
pnpm run styles-build:production     # compile SCSS themes + production build
```

## Lint & format

```bash
pnpm run lint           # Biome lint
pnpm run code-format    # Biome check + autofix
```

## Test

```bash
pnpm run test           # unit tests (Karma/Jasmine, single run)

pnpm run e2e:install    # one-time: install Playwright browsers
pnpm run e2e:run        # E2E suite (e2e/playwright.config.ts)
pnpm run e2e:report     # open the last Playwright HTML report
```

## Project layout

```
apps/quality-flow-ng-app/      Angular application
  src/app/pages/               feature pages (home, test-suites, …)
  src/assets/<theme>/styles/   SCSS themes (alkyra, vulki) compiled to CSS
e2e/                           Playwright config and specs
docker/                        Dockerfile / nginx for the containerized FE
biome.jsonc                    Biome lint/format config
```

## Related repositories

- **Backend:** [`quality-flow`](https://github.com/GabrieleConsonni/quality-flow) — FastAPI API and engine.
