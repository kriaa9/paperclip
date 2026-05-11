---
title: Setup Commands
summary: Onboard, run, doctor, and configure
---

Instance setup and diagnostics commands.

## `jasminia run`

One-command bootstrap and start:

```sh
pnpm jasminia run
```

Does:

1. Auto-onboards if config is missing
2. Runs `jasminia doctor` with repair enabled
3. Starts the server when checks pass

Choose a specific instance:

```sh
pnpm jasminia run --instance dev
```

## `jasminia onboard`

Interactive first-time setup:

```sh
pnpm jasminia onboard
```

If Jasmin.ia is already configured, rerunning `onboard` keeps the existing config in place. Use `jasminia configure` to change settings on an existing install.

First prompt:

1. `Quickstart` (recommended): local defaults (embedded database, no LLM provider, local disk storage, default secrets)
2. `Advanced setup`: full interactive configuration

Start immediately after onboarding:

```sh
pnpm jasminia onboard --run
```

Non-interactive defaults + immediate start (opens browser on server listen):

```sh
pnpm jasminia onboard --yes
```

On an existing install, `--yes` now preserves the current config and just starts Jasmin.ia with that setup.

## `jasminia doctor`

Health checks with optional auto-repair:

```sh
pnpm jasminia doctor
pnpm jasminia doctor --repair
```

Validates:

- Server configuration
- Database connectivity
- Secrets adapter configuration, including AWS Secrets Manager non-secret env
  config when selected
- Storage configuration
- Missing key files

## `jasminia configure`

Update configuration sections:

```sh
pnpm jasminia configure --section server
pnpm jasminia configure --section secrets
pnpm jasminia configure --section storage
```

`--section secrets` updates the deployment-level provider used as the fallback
for secrets that do not target a specific company vault. Per-company provider
vaults (named instances, default vault selection, multiple vaults per provider,
coming-soon GCP/Vault) live in the board UI under
`Company Settings → Secrets → Provider vaults` and the
`/api/companies/{companyId}/secret-provider-configs` API.

## `jasminia env`

Show resolved environment configuration:

```sh
pnpm jasminia env
```

This now includes bind-oriented deployment settings such as `JASMINIA_BIND` and `JASMINIA_BIND_HOST` when configured.

## `jasminia allowed-hostname`

Allow a private hostname for authenticated/private mode:

```sh
pnpm jasminia allowed-hostname my-tailscale-host
```

## Local Storage Paths

| Data | Default Path |
|------|-------------|
| Config | `~/.jasminia/instances/default/config.json` |
| Database | `~/.jasminia/instances/default/db` |
| Logs | `~/.jasminia/instances/default/logs` |
| Storage | `~/.jasminia/instances/default/data/storage` |
| Secrets key | `~/.jasminia/instances/default/secrets/master.key` |

Override with:

```sh
JASMINIA_HOME=/custom/home JASMINIA_INSTANCE_ID=dev pnpm jasminia run
```

Or pass `--data-dir` directly on any command:

```sh
pnpm jasminia run --data-dir ./tmp/jasminia-dev
pnpm jasminia doctor --data-dir ./tmp/jasminia-dev
```
