import os from "node:os";
import path from "node:path";

export const DEFAULT_JASMINIA_INSTANCE_ID = "default";
export const JASMINIA_CONFIG_BASENAME = "config.json";
export const JASMINIA_ENV_FILENAME = ".env";

const PATH_SEGMENT_RE = /^[a-zA-Z0-9_-]+$/;

export function expandHomePrefix(value: string): string {
  if (value === "~") return os.homedir();
  if (value.startsWith("~/")) return path.resolve(os.homedir(), value.slice(2));
  return value;
}

export function resolveJasminiaHomeDir(homeOverride?: string): string {
  const raw = homeOverride?.trim() || process.env.JASMINIA_HOME?.trim();
  if (raw) return path.resolve(expandHomePrefix(raw));
  return path.resolve(os.homedir(), ".jasminia");
}

export function resolveJasminiaInstanceId(instanceIdOverride?: string): string {
  const raw = instanceIdOverride?.trim() || process.env.JASMINIA_INSTANCE_ID?.trim() || DEFAULT_JASMINIA_INSTANCE_ID;
  if (!PATH_SEGMENT_RE.test(raw)) {
    throw new Error(`Invalid JASMINIA_INSTANCE_ID '${raw}'.`);
  }
  return raw;
}

export function resolveJasminiaInstanceRoot(input: {
  homeDir?: string;
  instanceId?: string;
} = {}): string {
  return path.resolve(resolveJasminiaHomeDir(input.homeDir), "instances", resolveJasminiaInstanceId(input.instanceId));
}

export function resolveJasminiaInstanceConfigPath(input: {
  homeDir?: string;
  instanceId?: string;
} = {}): string {
  return path.resolve(resolveJasminiaInstanceRoot(input), JASMINIA_CONFIG_BASENAME);
}

export function resolveJasminiaConfigPathForInstance(input: {
  homeDir?: string;
  instanceId?: string;
} = {}): string {
  return resolveJasminiaInstanceConfigPath(input);
}

export function resolveJasminiaEnvPathForConfig(configPath: string): string {
  return path.resolve(path.dirname(configPath), JASMINIA_ENV_FILENAME);
}

export function resolveDefaultEmbeddedPostgresDir(input: {
  homeDir?: string;
  instanceId?: string;
} = {}): string {
  return path.resolve(resolveJasminiaInstanceRoot(input), "db");
}

export function resolveDefaultLogsDir(input: {
  homeDir?: string;
  instanceId?: string;
} = {}): string {
  return path.resolve(resolveJasminiaInstanceRoot(input), "logs");
}

export function resolveDefaultSecretsKeyFilePath(input: {
  homeDir?: string;
  instanceId?: string;
} = {}): string {
  return path.resolve(resolveJasminiaInstanceRoot(input), "secrets", "master.key");
}

export function resolveDefaultStorageDir(input: {
  homeDir?: string;
  instanceId?: string;
} = {}): string {
  return path.resolve(resolveJasminiaInstanceRoot(input), "data", "storage");
}

export function resolveDefaultBackupDir(input: {
  homeDir?: string;
  instanceId?: string;
} = {}): string {
  return path.resolve(resolveJasminiaInstanceRoot(input), "data", "backups");
}

export function resolveHomeAwarePath(value: string): string {
  return path.resolve(expandHomePrefix(value));
}
