---
title: Environment Variables
summary: Full environment variable reference
---

All environment variables that Jasmin.ia uses for server configuration.

## Server Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3100` | Server port |
| `JASMINIA_BIND` | `loopback` | Reachability preset: `loopback`, `lan`, `tailnet`, or `custom` |
| `JASMINIA_BIND_HOST` | (unset) | Required when `JASMINIA_BIND=custom` |
| `HOST` | `127.0.0.1` | Legacy host override; prefer `JASMINIA_BIND` for new setups |
| `DATABASE_URL` | (embedded) | PostgreSQL connection string |
| `JASMINIA_HOME` | `~/.jasminia` | Base directory for all Jasmin.ia data |
| `JASMINIA_INSTANCE_ID` | `default` | Instance identifier (for multiple local instances) |
| `JASMINIA_DEPLOYMENT_MODE` | `local_trusted` | Runtime mode override |
| `JASMINIA_DEPLOYMENT_EXPOSURE` | `private` | Exposure policy when deployment mode is `authenticated` |
| `JASMINIA_API_URL` | (auto-derived) | Jasmin.ia API base URL. When set externally (e.g., via Kubernetes ConfigMap, load balancer, or reverse proxy), the server preserves the value instead of deriving it from the listen host and port. Useful for deployments where the public-facing URL differs from the local bind address. |

## Secrets

| Variable | Default | Description |
|----------|---------|-------------|
| `JASMINIA_SECRETS_MASTER_KEY` | (from file) | 32-byte encryption key (base64/hex/raw) |
| `JASMINIA_SECRETS_MASTER_KEY_FILE` | `~/.jasminia/.../secrets/master.key` | Path to key file |
| `JASMINIA_SECRETS_STRICT_MODE` | `false` | Require secret refs for sensitive env vars |

## Agent Runtime (Injected into agent processes)

These are set automatically by the server when invoking agents:

| Variable | Description |
|----------|-------------|
| `JASMINIA_AGENT_ID` | Agent's unique ID |
| `JASMINIA_COMPANY_ID` | Company ID |
| `JASMINIA_API_URL` | Jasmin.ia API base URL (inherits the server-level value; see Server Configuration above) |
| `JASMINIA_API_KEY` | Short-lived JWT for API auth |
| `JASMINIA_RUN_ID` | Current heartbeat run ID |
| `JASMINIA_TASK_ID` | Issue that triggered this wake |
| `JASMINIA_WAKE_REASON` | Wake trigger reason |
| `JASMINIA_WAKE_COMMENT_ID` | Comment that triggered this wake |
| `JASMINIA_APPROVAL_ID` | Resolved approval ID |
| `JASMINIA_APPROVAL_STATUS` | Approval decision |
| `JASMINIA_LINKED_ISSUE_IDS` | Comma-separated linked issue IDs |

## LLM Provider Keys (for adapters)

| Variable | Description |
|----------|-------------|
| `ANTHROPIC_API_KEY` | Anthropic API key (for Claude Local adapter) |
| `OPENAI_API_KEY` | OpenAI API key (for Codex Local adapter) |
