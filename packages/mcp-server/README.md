# Jasmin.ia MCP Server

Model Context Protocol server for Jasmin.ia.

This package is a thin MCP wrapper over the existing Jasmin.ia REST API. It does
not talk to the database directly and it does not reimplement business logic.

## Authentication

The server reads its configuration from environment variables:

- `JASMINIA_API_URL` - Jasmin.ia base URL, for example `http://localhost:3100`
- `JASMINIA_API_KEY` - bearer token used for `/api` requests
- `JASMINIA_COMPANY_ID` - optional default company for company-scoped tools
- `JASMINIA_AGENT_ID` - optional default agent for checkout helpers
- `JASMINIA_RUN_ID` - optional run id forwarded on mutating requests

## Usage

```sh
npx -y @jasminiaai/mcp-server
```

Or locally in this repo:

```sh
pnpm --filter @jasminiaai/mcp-server build
node packages/mcp-server/dist/stdio.js
```

## Tool Surface

Read tools:

- `jasminiaMe`
- `jasminiaInboxLite`
- `jasminiaListAgents`
- `jasminiaGetAgent`
- `jasminiaListIssues`
- `jasminiaGetIssue`
- `jasminiaGetHeartbeatContext`
- `jasminiaListComments`
- `jasminiaGetComment`
- `jasminiaListIssueApprovals`
- `jasminiaListDocuments`
- `jasminiaGetDocument`
- `jasminiaListDocumentRevisions`
- `jasminiaListProjects`
- `jasminiaGetProject`
- `jasminiaGetIssueWorkspaceRuntime`
- `jasminiaWaitForIssueWorkspaceService`
- `jasminiaListGoals`
- `jasminiaGetGoal`
- `jasminiaListApprovals`
- `jasminiaGetApproval`
- `jasminiaGetApprovalIssues`
- `jasminiaListApprovalComments`

Write tools:

- `jasminiaCreateIssue`
- `jasminiaUpdateIssue`
- `jasminiaCheckoutIssue`
- `jasminiaReleaseIssue`
- `jasminiaAddComment`
- `jasminiaSuggestTasks`
- `jasminiaAskUserQuestions`
- `jasminiaRequestConfirmation`
- `jasminiaUpsertIssueDocument`
- `jasminiaRestoreIssueDocumentRevision`
- `jasminiaControlIssueWorkspaceServices`
- `jasminiaCreateApproval`
- `jasminiaLinkIssueApproval`
- `jasminiaUnlinkIssueApproval`
- `jasminiaApprovalDecision`
- `jasminiaAddApprovalComment`

Escape hatch:

- `jasminiaApiRequest`

`jasminiaApiRequest` is limited to paths under `/api` and JSON bodies. It is
meant for endpoints that do not yet have a dedicated MCP tool.
