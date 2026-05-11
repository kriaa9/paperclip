---
title: CLI Overview
summary: CLI installation and setup
---

The Jasmin.ia CLI handles instance setup, diagnostics, and control-plane operations.

## Usage

```sh
pnpm jasminiaai --help
```

## Global Options

All commands support:

| Flag | Description |
|------|-------------|
| `--data-dir <path>` | Local Jasmin.ia data root (isolates from `~/.jasminia`) |
| `--api-base <url>` | API base URL |
| `--api-key <token>` | API authentication token |
| `--context <path>` | Context file path |
| `--profile <name>` | Context profile name |
| `--json` | Output as JSON |

Company-scoped commands also accept `--company-id <id>`.

For clean local instances, pass `--data-dir` on the command you run:

```sh
pnpm jasminiaai run --data-dir ./tmp/jasminia-dev
```

## Context Profiles

Store defaults to avoid repeating flags:

```sh
# Set defaults
pnpm jasminiaai context set --api-base http://localhost:3100 --company-id <id>

# View current context
pnpm jasminiaai context show

# List profiles
pnpm jasminiaai context list

# Switch profile
pnpm jasminiaai context use default
```

To avoid storing secrets in context, use an env var:

```sh
pnpm jasminiaai context set --api-key-env-var-name JASMINIA_API_KEY
export JASMINIA_API_KEY=...
```

Secret operations are available under `jasminiaai secrets`:

```sh
pnpm jasminiaai secrets declarations --company-id <company-id> --kind secret
pnpm jasminiaai secrets create --company-id <company-id> --name anthropic-api-key --value-env ANTHROPIC_API_KEY
pnpm jasminiaai secrets link --company-id <company-id> --name prod-stripe-key --provider aws_secrets_manager --external-ref <provider-ref>
pnpm jasminiaai secrets doctor --company-id <company-id>
pnpm jasminiaai secrets migrate-inline-env --company-id <company-id> --apply
```

Context is stored at `~/.jasminia/context.json`.

## Command Categories

The CLI has two categories:

1. **[Setup commands](/cli/setup-commands)** — instance bootstrap, diagnostics, configuration
2. **[Control-plane commands](/cli/control-plane-commands)** — issues, agents, approvals, activity
