---
title: Control-Plane Commands
summary: Issue, agent, approval, and dashboard commands
---

Client-side commands for managing issues, agents, approvals, and more.

## Issue Commands

```sh
# List issues
pnpm jasminiaai issue list [--status todo,in_progress] [--assignee-agent-id <id>] [--match text]

# Get issue details
pnpm jasminiaai issue get <issue-id-or-identifier>

# Create issue
pnpm jasminiaai issue create --title "..." [--description "..."] [--status todo] [--priority high]

# Update issue
pnpm jasminiaai issue update <issue-id> [--status in_progress] [--comment "..."]

# Add comment
pnpm jasminiaai issue comment <issue-id> --body "..." [--reopen]

# Checkout task
pnpm jasminiaai issue checkout <issue-id> --agent-id <agent-id>

# Release task
pnpm jasminiaai issue release <issue-id>
```

## Company Commands

```sh
pnpm jasminiaai company list
pnpm jasminiaai company get <company-id>

# Export to portable folder package (writes manifest + markdown files)
pnpm jasminiaai company export <company-id> --out ./exports/acme --include company,agents

# Preview import (no writes)
pnpm jasminiaai company import \
  <owner>/<repo>/<path> \
  --target existing \
  --company-id <company-id> \
  --ref main \
  --collision rename \
  --dry-run

# Apply import
pnpm jasminiaai company import \
  ./exports/acme \
  --target new \
  --new-company-name "Acme Imported" \
  --include company,agents
```

## Agent Commands

```sh
pnpm jasminiaai agent list
pnpm jasminiaai agent get <agent-id>
```

## Approval Commands

```sh
# List approvals
pnpm jasminiaai approval list [--status pending]

# Get approval
pnpm jasminiaai approval get <approval-id>

# Create approval
pnpm jasminiaai approval create --type hire_agent --payload '{"name":"..."}' [--issue-ids <id1,id2>]

# Approve
pnpm jasminiaai approval approve <approval-id> [--decision-note "..."]

# Reject
pnpm jasminiaai approval reject <approval-id> [--decision-note "..."]

# Request revision
pnpm jasminiaai approval request-revision <approval-id> [--decision-note "..."]

# Resubmit
pnpm jasminiaai approval resubmit <approval-id> [--payload '{"..."}']

# Comment
pnpm jasminiaai approval comment <approval-id> --body "..."
```

## Activity Commands

```sh
pnpm jasminiaai activity list [--agent-id <id>] [--entity-type issue] [--entity-id <id>]
```

## Dashboard

```sh
pnpm jasminiaai dashboard get
```

## Heartbeat

```sh
pnpm jasminiaai heartbeat run --agent-id <agent-id> [--api-base http://localhost:3100]
```
