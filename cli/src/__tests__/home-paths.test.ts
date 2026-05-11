import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  describeLocalInstancePaths,
  expandHomePrefix,
  resolveJasminiaHomeDir,
  resolveJasminiaInstanceId,
} from "../config/home.js";

const ORIGINAL_ENV = { ...process.env };

describe("home path resolution", () => {
  afterEach(() => {
    process.env = { ...ORIGINAL_ENV };
  });

  it("defaults to ~/.jasminia and default instance", () => {
    const home = fs.mkdtempSync(path.join(os.tmpdir(), "jasminia-home-paths-"));
    process.env.JASMINIA_HOME = home;
    delete process.env.JASMINIA_INSTANCE_ID;

    const paths = describeLocalInstancePaths();
    expect(paths.homeDir).toBe(home);
    expect(paths.instanceId).toBe("default");
    expect(paths.configPath).toBe(path.resolve(home, "instances", "default", "config.json"));
  });

  it("supports JASMINIA_HOME and explicit instance ids", () => {
    process.env.JASMINIA_HOME = "~/jasminia-home";

    const home = resolveJasminiaHomeDir();
    expect(home).toBe(path.resolve(os.homedir(), "jasminia-home"));
    expect(resolveJasminiaInstanceId("dev_1")).toBe("dev_1");
  });

  it("rejects invalid instance ids", () => {
    expect(() => resolveJasminiaInstanceId("bad/id")).toThrow(/Invalid JASMINIA_INSTANCE_ID/);
  });

  it("expands ~ prefixes", () => {
    expect(expandHomePrefix("~")).toBe(os.homedir());
    expect(expandHomePrefix("~/x/y")).toBe(path.resolve(os.homedir(), "x/y"));
  });
});
