import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { Jasmin.iaApiClient } from "./client.js";
import { readConfigFromEnv, type Jasmin.iaMcpConfig } from "./config.js";
import { createToolDefinitions } from "./tools.js";

export function createJasmin.iaMcpServer(config: Jasmin.iaMcpConfig = readConfigFromEnv()) {
  const server = new McpServer({
    name: "jasminia",
    version: "0.1.0",
  });

  const client = new Jasmin.iaApiClient(config);
  const tools = createToolDefinitions(client);
  for (const tool of tools) {
    server.tool(tool.name, tool.description, tool.schema.shape, tool.execute);
  }

  return {
    server,
    tools,
    client,
  };
}

export async function runServer(config: Jasmin.iaMcpConfig = readConfigFromEnv()) {
  const { server } = createJasmin.iaMcpServer(config);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
