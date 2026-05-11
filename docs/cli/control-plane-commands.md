---
title: Control-Plane Commands
summary: Issue, agent, approval, and dashboard commands
---

Client-side commands for managing issues, agents, approvals, and more.

## Issue Commands

```sh
# List issues
pnpm jasminia issue list [--status todo,in_progress] [--assignee-agent-id <id>] [--match text]

# Get issue details
pnpm jasminia issue get <issue-id-or-identifier>

# Create issue
pnpm jasminia issue create --title "..." [--description "..."] [--status todo] [--priority high]

# Update issue
pnpm jasminia issue update <issue-id> [--status in_progress] [--comment "..."]

# Add comment
pnpm jasminia issue comment <issue-id> --body "..." [--reopen]

# Checkout task
pnpm jasminia issue checkout <issue-id> --agent-id <agent-id>

# Release task
pnpm jasminia issue release <issue-id>
```

## Company Commands

```sh
pnpm jasminia company list
pnpm jasminia company get <company-id>

# Export to portable folder package (writes manifest + markdown files)
pnpm jasminia company export <company-id> --out ./exports/acme --include company,agents

# Preview import (no writes)
pnpm jasminia company import \
  <owner>/<repo>/<path> \
  --target existing \
  --company-id <company-id> \
  --ref main \
  --collision rename \
  --dry-run

# Apply import
pnpm jasminia company import \
  ./exports/acme \
  --target new \
  --new-company-name "Acme Imported" \
  --include company,agents
```

## Agent Commands

```sh
pnpm jasminia agent list
pnpm jasminia agent get <agent-id>
```

## Approval Commands

```sh
# List approvals
pnpm jasminia approval list [--status pending]

# Get approval
pnpm jasminia approval get <approval-id>

# Create approval
pnpm jasminia approval create --type hire_agent --payload '{"name":"..."}' [--issue-ids <id1,id2>]

# Approve
pnpm jasminia approval approve <approval-id> [--decision-note "..."]

# Reject
pnpm jasminia approval reject <approval-id> [--decision-note "..."]

# Request revision
pnpm jasminia approval request-revision <approval-id> [--decision-note "..."]

# Resubmit
pnpm jasminia approval resubmit <approval-id> [--payload '{"..."}']

# Comment
pnpm jasminia approval comment <approval-id> --body "..."
```

## Activity Commands

```sh
pnpm jasminia activity list [--agent-id <id>] [--entity-type issue] [--entity-id <id>]
```

## Dashboard

```sh
pnpm jasminia dashboard get
```

## Heartbeat

```sh
pnpm jasminia heartbeat run --agent-id <agent-id> [--api-base http://localhost:3100]
```
