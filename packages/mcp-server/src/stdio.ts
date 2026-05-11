#!/usr/bin/env node
import { runServer } from "./index.js";

void runServer().catch((error) => {
  console.error("Failed to start Jasmin.ia MCP server:", error);
  process.exit(1);
});
