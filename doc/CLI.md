# CLI Reference

Jasmin.ia CLI now supports both:

- instance setup/diagnostics (`onboard`, `doctor`, `configure`, `env`, `allowed-hostname`, `env-lab`)
- control-plane client operations (issues, approvals, agents, activity, dashboard)

## Base Usage

Use repo script in development:

```sh
pnpm jasminiaai --help
```

First-time local bootstrap + run:

```sh
pnpm jasminiaai run
```

Choose local instance:

```sh
pnpm jasminiaai run --instance dev
```

## Deployment Modes

Mode taxonomy and design intent are documented in `doc/DEPLOYMENT-MODES.md`.

Current CLI behavior:

- `jasminiaai onboard` and `jasminiaai configure --section server` set deployment mode in config
- server onboarding/configure ask for reachability intent and write `server.bind`
- `jasminiaai run --bind <loopback|lan|tailnet>` passes a quickstart bind preset into first-run onboarding when config is missing
- runtime can override mode with `JASMINIA_DEPLOYMENT_MODE`
- `jasminiaai run` and `jasminiaai doctor` still do not expose a direct low-level `--mode` flag

Canonical behavior is documented in `doc/DEPLOYMENT-MODES.md`.

Allow an authenticated/private hostname (for example custom Tailscale DNS):

```sh
pnpm jasminiaai allowed-hostname dotta-macbook-pro
```

Bring up the default local SSH fixture for environment testing:

```sh
pnpm jasminiaai env-lab up
pnpm jasminiaai env-lab doctor
pnpm jasminiaai env-lab status --json
pnpm jasminiaai env-lab down
```

All client commands support:

- `--data-dir <path>`
- `--api-base <url>`
- `--api-key <token>`
- `--context <path>`
- `--profile <name>`
- `--json`

Company-scoped commands also support `--company-id <id>`.

Use `--data-dir` on any CLI command to isolate all default local state (config/context/db/logs/storage/secrets) away from `~/.jasminia`:

```sh
pnpm jasminiaai run --data-dir ./tmp/jasminia-dev
pnpm jasminiaai issue list --data-dir ./tmp/jasminia-dev
```

## Context Profiles

Store local defaults in `~/.jasminia/context.json`:

```sh
pnpm jasminiaai context set --api-base http://localhost:3100 --company-id <company-id>
pnpm jasminiaai context show
pnpm jasminiaai context list
pnpm jasminiaai context use default
```

To avoid storing secrets in context, set `apiKeyEnvVarName` and keep the key in env:

```sh
pnpm jasminiaai context set --api-key-env-var-name JASMINIA_API_KEY
export JASMINIA_API_KEY=...
```

## Company Commands

```sh
pnpm jasminiaai company list
pnpm jasminiaai company get <company-id>
pnpm jasminiaai company delete <company-id-or-prefix> --yes --confirm <same-id-or-prefix>
```

Examples:

```sh
pnpm jasminiaai company delete PAP --yes --confirm PAP
pnpm jasminiaai company delete 5cbe79ee-acb3-4597-896e-7662742593cd --yes --confirm 5cbe79ee-acb3-4597-896e-7662742593cd
```

Notes:

- Deletion is server-gated by `JASMINIA_ENABLE_COMPANY_DELETION`.
- With agent authentication, company deletion is company-scoped. Use the current company ID/prefix (for example via `--company-id` or `JASMINIA_COMPANY_ID`), not another company.

## Issue Commands

```sh
pnpm jasminiaai issue list --company-id <company-id> [--status todo,in_progress] [--assignee-agent-id <agent-id>] [--match text]
pnpm jasminiaai issue get <issue-id-or-identifier>
pnpm jasminiaai issue create --company-id <company-id> --title "..." [--description "..."] [--status todo] [--priority high]
pnpm jasminiaai issue update <issue-id> [--status in_progress] [--comment "..."]
pnpm jasminiaai issue comment <issue-id> --body "..." [--reopen]
pnpm jasminiaai issue checkout <issue-id> --agent-id <agent-id> [--expected-statuses todo,backlog,blocked]
pnpm jasminiaai issue release <issue-id>
```

## Agent Commands

```sh
pnpm jasminiaai agent list --company-id <company-id>
pnpm jasminiaai agent get <agent-id>
pnpm jasminiaai agent local-cli <agent-id-or-shortname> --company-id <company-id>
```

`agent local-cli` is the quickest way to run local Claude/Codex manually as a Jasmin.ia agent:

- creates a new long-lived agent API key
- installs missing Jasmin.ia skills into `~/.codex/skills` and `~/.claude/skills`
- prints `export ...` lines for `JASMINIA_API_URL`, `JASMINIA_COMPANY_ID`, `JASMINIA_AGENT_ID`, and `JASMINIA_API_KEY`

Example for shortname-based local setup:

```sh
pnpm jasminiaai agent local-cli codexcoder --company-id <company-id>
pnpm jasminiaai agent local-cli claudecoder --company-id <company-id>
```

## Secrets Commands

```sh
pnpm jasminiaai secrets list --company-id <company-id>
pnpm jasminiaai secrets declarations --company-id <company-id> [--include agents,projects] [--kind secret]
pnpm jasminiaai secrets create --company-id <company-id> --name anthropic-api-key --value-env ANTHROPIC_API_KEY
pnpm jasminiaai secrets link --company-id <company-id> --name prod-stripe-key --provider aws_secrets_manager --external-ref <provider-ref>
pnpm jasminiaai secrets doctor --company-id <company-id>
pnpm jasminiaai secrets migrate-inline-env --company-id <company-id> [--apply]
```

Secret listing and declarations never print secret values. `create` accepts
`--value-env` so shell history does not capture the value. `link` records
provider-owned references without copying the secret value into Jasmin.ia.
For AWS-backed secrets, `secrets doctor` reports missing non-secret provider
env and the expected AWS SDK runtime credential source; do not store AWS
bootstrap credentials in Jasmin.ia secrets.

Per-company provider vaults (multiple vault instances per provider, default
vault selection, coming-soon GCP/Vault) are configured from the board UI under
`Company Settings → Secrets → Provider vaults` or through
`/api/companies/{companyId}/secret-provider-configs`. There is no CLI surface
for vault management today. See the
[secrets deploy guide](../docs/deploy/secrets.md#provider-vaults) and
[API reference](../docs/api/secrets.md#provider-vaults) for the contract.

## Approval Commands

```sh
pnpm jasminiaai approval list --company-id <company-id> [--status pending]
pnpm jasminiaai approval get <approval-id>
pnpm jasminiaai approval create --company-id <company-id> --type hire_agent --payload '{"name":"..."}' [--issue-ids <id1,id2>]
pnpm jasminiaai approval approve <approval-id> [--decision-note "..."]
pnpm jasminiaai approval reject <approval-id> [--decision-note "..."]
pnpm jasminiaai approval request-revision <approval-id> [--decision-note "..."]
pnpm jasminiaai approval resubmit <approval-id> [--payload '{"...":"..."}']
pnpm jasminiaai approval comment <approval-id> --body "..."
```

## Activity Commands

```sh
pnpm jasminiaai activity list --company-id <company-id> [--agent-id <agent-id>] [--entity-type issue] [--entity-id <id>]
```

## Dashboard Commands

```sh
pnpm jasminiaai dashboard get --company-id <company-id>
```

## Heartbeat Command

`heartbeat run` now also supports context/api-key options and uses the shared client stack:

```sh
pnpm jasminiaai heartbeat run --agent-id <agent-id> [--api-base http://localhost:3100] [--api-key <token>]
```

## Local Storage Defaults

Local Jasmin.ia data lives under the selected instance root. `JASMINIA_HOME` chooses the home directory and `JASMINIA_INSTANCE_ID` chooses the instance.

```text
~/.jasminia/                                     # JASMINIA_HOME
└── instances/
    └── default/                                  # instance root (JASMINIA_INSTANCE_ID)
        ├── config.json                           # runtime config
        ├── .env                                  # instance env file
        ├── db/                                   # embedded PostgreSQL data
        ├── data/
        │   ├── storage/                          # local_disk uploads
        │   └── backups/                          # automatic DB backups
        ├── logs/
        ├── secrets/
        │   └── master.key                        # local_encrypted master key
        ├── workspaces/                           # default agent workspaces
        ├── projects/                             # project execution workspaces
        ├── companies/                            # per-company adapter homes (e.g. codex-home)
        └── codex-home/                           # per-instance codex home (when not company-scoped)
```

Default paths for the canonical install:

- config: `~/.jasminia/instances/default/config.json`
- embedded db: `~/.jasminia/instances/default/db`
- logs: `~/.jasminia/instances/default/logs`
- storage: `~/.jasminia/instances/default/data/storage`
- secrets key: `~/.jasminia/instances/default/secrets/master.key`

Override base home or instance with env vars:

```sh
JASMINIA_HOME=/custom/home JASMINIA_INSTANCE_ID=dev pnpm jasminiaai run
```

## Storage Configuration

Configure storage provider and settings:

```sh
pnpm jasminiaai configure --section storage
```

Supported providers:

- `local_disk` (default; local single-user installs)
- `s3` (S3-compatible object storage)
