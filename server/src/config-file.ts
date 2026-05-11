import fs from "node:fs";
import { jasminiaConfigSchema, type JasminiaConfig } from "@jasminia/shared";
import { resolveJasminiaConfigPath } from "./paths.js";

export function readConfigFile(): JasminiaConfig | null {
  const configPath = resolveJasminiaConfigPath();

  if (!fs.existsSync(configPath)) return null;

  try {
    const raw = JSON.parse(fs.readFileSync(configPath, "utf-8"));
    return jasminiaConfigSchema.parse(raw);
  } catch {
    return null;
  }
}
