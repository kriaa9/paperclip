import fs from "node:fs";
import path from "node:path";
import { resolveDefaultConfigPath } from "./home-paths.js";

const JASMINIA_CONFIG_BASENAME = "config.json";
const JASMINIA_ENV_FILENAME = ".env";

function findConfigFileFromAncestors(startDir: string): string | null {
  const absoluteStartDir = path.resolve(startDir);
  let currentDir = absoluteStartDir;

  while (true) {
    const candidate = path.resolve(currentDir, ".jasminia", JASMINIA_CONFIG_BASENAME);
    if (fs.existsSync(candidate)) {
      return candidate;
    }

    const nextDir = path.resolve(currentDir, "..");
    if (nextDir === currentDir) break;
    currentDir = nextDir;
  }

  return null;
}

export function resolveJasminiaConfigPath(overridePath?: string): string {
  if (overridePath) return path.resolve(overridePath);
  if (process.env.JASMINIA_CONFIG) return path.resolve(process.env.JASMINIA_CONFIG);
  return findConfigFileFromAncestors(process.cwd()) ?? resolveDefaultConfigPath();
}

export function resolveJasminiaEnvPath(overrideConfigPath?: string): string {
  return path.resolve(path.dirname(resolveJasminiaConfigPath(overrideConfigPath)), JASMINIA_ENV_FILENAME);
}
