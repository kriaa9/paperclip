import fs from "node:fs";
import { jasminiaConfigSchema, type Jasmin.iaConfig } from "@jasminiaai/shared";
import { resolveJasmin.iaConfigPath } from "./paths.js";

export function readConfigFile(): Jasmin.iaConfig | null {
  const configPath = resolveJasmin.iaConfigPath();

  if (!fs.existsSync(configPath)) return null;

  try {
    const raw = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    return jasminiaConfigSchema.parse(raw);
  } catch {
    return null;
  }
}
