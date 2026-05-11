import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  listCursorSkills,
  syncCursorSkills,
} from "@jasminiaai/adapter-cursor-local/server";

async function makeTempDir(prefix: string): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

async function createSkillDir(root: string, name: string) {
  const skillDir = path.join(root, name);
  await fs.mkdir(skillDir, { recursive: true });
  await fs.writeFile(path.join(skillDir, "SKILL.md"), `---\nname: ${name}\n---\n`, "utf8");
  return skillDir;
}

describe("cursor local skill sync", () => {
  const jasminiaKey = "jasminiaai/jasminia/jasminia";
  const cleanupDirs = new Set<string>();

  afterEach(async () => {
    await Promise.all(Array.from(cleanupDirs).map((dir) => fs.rm(dir, { recursive: true, force: true })));
    cleanupDirs.clear();
  });

  it("reports configured Jasmin.ia skills and installs them into the Cursor skills home", async () => {
    const home = await makeTempDir("jasminia-cursor-skill-sync-");
    cleanupDirs.add(home);

    const ctx = {
      agentId: "agent-1",
      companyId: "company-1",
      adapterType: "cursor",
      config: {
        env: {
          HOME: home,
        },
        jasminiaSkillSync: {
          desiredSkills: [jasminiaKey],
        },
      },
    } as const;

    const before = await listCursorSkills(ctx);
    expect(before.mode).toBe("persistent");
    expect(before.desiredSkills).toContain(jasminiaKey);
    expect(before.entries.find((entry) => entry.key === jasminiaKey)?.required).toBe(true);
    expect(before.entries.find((entry) => entry.key === jasminiaKey)?.state).toBe("missing");

    const after = await syncCursorSkills(ctx, [jasminiaKey]);
    expect(after.entries.find((entry) => entry.key === jasminiaKey)?.state).toBe("installed");
    expect((await fs.lstat(path.join(home, ".cursor", "skills", "jasminia"))).isSymbolicLink()).toBe(true);
  });

  it("recognizes company-library runtime skills supplied outside the bundled Jasmin.ia directory", async () => {
    const home = await makeTempDir("jasminia-cursor-runtime-skills-home-");
    const runtimeSkills = await makeTempDir("jasminia-cursor-runtime-skills-src-");
    cleanupDirs.add(home);
    cleanupDirs.add(runtimeSkills);

    const jasminiaDir = await createSkillDir(runtimeSkills, "jasminia");
    const asciiHeartDir = await createSkillDir(runtimeSkills, "ascii-heart");

    const ctx = {
      agentId: "agent-3",
      companyId: "company-1",
      adapterType: "cursor",
      config: {
        env: {
          HOME: home,
        },
        jasminiaRuntimeSkills: [
          {
            key: "jasminia",
            runtimeName: "jasminia",
            source: jasminiaDir,
            required: true,
            requiredReason: "Bundled Jasmin.ia skills are always available for local adapters.",
          },
          {
            key: "ascii-heart",
            runtimeName: "ascii-heart",
            source: asciiHeartDir,
          },
        ],
        jasminiaSkillSync: {
          desiredSkills: ["ascii-heart"],
        },
      },
    } as const;

    const before = await listCursorSkills(ctx);
    expect(before.warnings).toEqual([]);
    expect(before.desiredSkills).toEqual(["jasminia", "ascii-heart"]);
    expect(before.entries.find((entry) => entry.key === "ascii-heart")?.state).toBe("missing");

    const after = await syncCursorSkills(ctx, ["ascii-heart"]);
    expect(after.warnings).toEqual([]);
    expect(after.entries.find((entry) => entry.key === "ascii-heart")?.state).toBe("installed");
    expect((await fs.lstat(path.join(home, ".cursor", "skills", "ascii-heart"))).isSymbolicLink()).toBe(true);
  });

  it("keeps required bundled Jasmin.ia skills installed even when the desired set is emptied", async () => {
    const home = await makeTempDir("jasminia-cursor-skill-prune-");
    cleanupDirs.add(home);

    const configuredCtx = {
      agentId: "agent-2",
      companyId: "company-1",
      adapterType: "cursor",
      config: {
        env: {
          HOME: home,
        },
        jasminiaSkillSync: {
          desiredSkills: [jasminiaKey],
        },
      },
    } as const;

    await syncCursorSkills(configuredCtx, [jasminiaKey]);

    const clearedCtx = {
      ...configuredCtx,
      config: {
        env: {
          HOME: home,
        },
        jasminiaSkillSync: {
          desiredSkills: [],
        },
      },
    } as const;

    const after = await syncCursorSkills(clearedCtx, []);
    expect(after.desiredSkills).toContain(jasminiaKey);
    expect(after.entries.find((entry) => entry.key === jasminiaKey)?.state).toBe("installed");
    expect((await fs.lstat(path.join(home, ".cursor", "skills", "jasminia"))).isSymbolicLink()).toBe(true);
  });
});
