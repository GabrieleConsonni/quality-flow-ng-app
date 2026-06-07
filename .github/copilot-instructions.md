# GitHub Copilot Instructions (Workspace Standard)

## Single source of truth
Always follow the workspace AI rules from the shared repo:

- ../prompt-alkyra/AGENTS.md

## Overrides
- Respect explicit agent override: @agent:*
- Respect explicit work item override: @work:*

## CodeScene MCP
Always apply CodeScene MCP rules defined in:

- ../prompt-alkyra/RULES/CODESCENE_MCP.md

## Security
Always follow:

- ../prompt-alkyra/RULES/SECURITY.md

## Repo-specific notes
- `quality-flow-ng-app` mirrors the conventions of `alkyra-ng-app` (Angular 20, pnpm, DevExtreme, `@akeron-ng/tiara-ng`, `@akeron-ng/tiara-ng-suite`, Biome).
- This FE replaces the legacy Streamlit UI of `quality-flow` through an incremental **refactor** (not a fidelity migration). UX, page structure and state management are redesigned from scratch; only domain entities and validated business rules carry over from Streamlit.
- Refactor order (section by section): Test suites → Home → Configurations (Brokers & Queues, Database, MockServers) → Datasources (Json, Dataset) → Logs.
- Before introducing any new graphical UI element, search `@akeron-ng/tiara-ng` and `@akeron-ng/tiara-ng-suite` first. If no suitable component exists, stop and ask the user.
- See `AGENT.md` at the repo root for the full repo-specific contract.
- For quality-flow refactor tasks (paired with `quality-flow`), see `../prompt-alkyra/PROMPTS/03_REFACTOR_QUALITY_FLOW.md`.
