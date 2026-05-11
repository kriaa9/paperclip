import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { JasminiaApiClient } from "./client.js";
import { readConfigFromEnv, type JasminiaMcpConfig } from "./config.js";
import { createToolDefinitions } from "./tools.js";

export function createJasminiaMcpServer(config: JasminiaMcpConfig = readConfigFromEnv()) {
  const server = new McpServer({
    name: "jasminia",
    version: "0.1.0",
  });

  const client = new JasminiaApiClient(config);
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

export async function runServer(config: JasminiaMcpConfig = readConfigFromEnv()) {
  const { server } = createJasminiaMcpServer(config);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
