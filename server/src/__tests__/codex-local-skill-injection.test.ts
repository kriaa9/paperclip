import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { ensureCodexSkillsInjected } from "@jasminiaai/adapter-codex-local/server";

async function makeTempDir(prefix: string): Promise<string> {
  return fs.mkdtemp(path.join(os.tmpdir(), prefix));
}

async function createJasmin.iaRepoSkill(root: string, skillName: string) {
  await fs.mkdir(path.join(root, "server"), { recursive: true });
  await fs.mkdir(path.join(root, "packages", "adapter-utils"), { recursive: true });
  await fs.mkdir(path.join(root, "skills", skillName), { recursive: true });
  await fs.writeFile(path.join(root, "pnpm-workspace.yaml"), "packages:\n  - packages/*\n", "utf8");
  await fs.writeFile(path.join(root, "package.json"), '{"name":"jasminia"}\n', "utf8");
  await fs.writeFile(
    path.join(root, "skills", skillName, "SKILL.md"),
    `---\nname: ${skillName}\n---\n`,
    "utf8",
  );
}

async function createCustomSkill(root: string, skillName: string) {
  await fs.mkdir(path.join(root, "custom", skillName), { recursive: true });
  await fs.writeFile(
    path.join(root, "custom", skillName, "SKILL.md"),
    `---\nname: ${skillName}\n---\n`,
    "utf8",
  );
}

describe("codex local adapter skill injection", () => {
  const jasminiaKey = "jasminiaai/jasminia/jasminia";
  const createAgentKey = "jasminiaai/jasminia/jasminia-create-agent";
  const cleanupDirs = new Set<string>();

  afterEach(async () => {
    await Promise.all(Array.from(cleanupDirs).map((dir) => fs.rm(dir, { recursive: true, force: true })));
    cleanupDirs.clear();
  });

  it("repairs a Codex Jasmin.ia skill symlink that still points at another live checkout", async () => {
    const currentRepo = await makeTempDir("jasminia-codex-current-");
    const oldRepo = await makeTempDir("jasminia-codex-old-");
    const skillsHome = await makeTempDir("jasminia-codex-home-");
    cleanupDirs.add(currentRepo);
    cleanupDirs.add(oldRepo);
    cleanupDirs.add(skillsHome);

    await createJasmin.iaRepoSkill(currentRepo, "jasminia");
    await createJasmin.iaRepoSkill(currentRepo, "jasminia-create-agent");
    await createJasmin.iaRepoSkill(oldRepo, "jasminia");
    await fs.symlink(path.join(oldRepo, "skills", "jasminia"), path.join(skillsHome, "jasminia"));

    const logs: Array<{ stream: "stdout" | "stderr"; chunk: string }> = [];
    await ensureCodexSkillsInjected(
      async (stream, chunk) => {
        logs.push({ stream, chunk });
      },
      {
        skillsHome,
        skillsEntries: [
          {
            key: jasminiaKey,
            runtimeName: "jasminia",
            source: path.join(currentRepo, "skills", "jasminia"),
          },
          {
            key: createAgentKey,
            runtimeName: "jasminia-create-agent",
            source: path.join(currentRepo, "skills", "jasminia-create-agent"),
          },
        ],
      },
    );

    expect(await fs.realpath(path.join(skillsHome, "jasminia"))).toBe(
      await fs.realpath(path.join(currentRepo, "skills", "jasminia")),
    );
    expect(await fs.realpath(path.join(skillsHome, "jasminia-create-agent"))).toBe(
      await fs.realpath(path.join(currentRepo, "skills", "jasminia-create-agent")),
    );
    expect(logs).toContainEqual(
      expect.objectContaining({
        stream: "stdout",
        chunk: expect.stringContaining('Repaired Codex skill "jasminia"'),
      }),
    );
    expect(logs).toContainEqual(
      expect.objectContaining({
        stream: "stdout",
        chunk: expect.stringContaining('Injected Codex skill "jasminia-create-agent"'),
      }),
    );
  });

  it("preserves a custom Codex skill symlink outside Jasmin.ia repo checkouts", async () => {
    const currentRepo = await makeTempDir("jasminia-codex-current-");
    const customRoot = await makeTempDir("jasminia-codex-custom-");
    const skillsHome = await makeTempDir("jasminia-codex-home-");
    cleanupDirs.add(currentRepo);
    cleanupDirs.add(customRoot);
    cleanupDirs.add(skillsHome);

    await createJasmin.iaRepoSkill(currentRepo, "jasminia");
    await createCustomSkill(customRoot, "jasminia");
    await fs.symlink(path.join(customRoot, "custom", "jasminia"), path.join(skillsHome, "jasminia"));

    await ensureCodexSkillsInjected(async () => {}, {
      skillsHome,
      skillsEntries: [{
        key: jasminiaKey,
        runtimeName: "jasminia",
        source: path.join(currentRepo, "skills", "jasminia"),
      }],
    });

    expect(await fs.realpath(path.join(skillsHome, "jasminia"))).toBe(
      await fs.realpath(path.join(customRoot, "custom", "jasminia")),
    );
  });

  it("prunes broken symlinks for unavailable Jasmin.ia repo skills before Codex starts", async () => {
    const currentRepo = await makeTempDir("jasminia-codex-current-");
    const oldRepo = await makeTempDir("jasminia-codex-old-");
    const skillsHome = await makeTempDir("jasminia-codex-home-");
    cleanupDirs.add(currentRepo);
    cleanupDirs.add(oldRepo);
    cleanupDirs.add(skillsHome);

    await createJasmin.iaRepoSkill(currentRepo, "jasminia");
    await createJasmin.iaRepoSkill(oldRepo, "agent-browser");
    const staleTarget = path.join(oldRepo, "skills", "agent-browser");
    await fs.symlink(staleTarget, path.join(skillsHome, "agent-browser"));
    await fs.rm(staleTarget, { recursive: true, force: true });

    const logs: Array<{ stream: "stdout" | "stderr"; chunk: string }> = [];
    await ensureCodexSkillsInjected(
      async (stream, chunk) => {
        logs.push({ stream, chunk });
      },
      {
        skillsHome,
        skillsEntries: [{
          key: jasminiaKey,
          runtimeName: "jasminia",
          source: path.join(currentRepo, "skills", "jasminia"),
        }],
      },
    );

    await expect(fs.lstat(path.join(skillsHome, "agent-browser"))).rejects.toMatchObject({
      code: "ENOENT",
    });
    expect(logs).toContainEqual(
      expect.objectContaining({
        stream: "stdout",
        chunk: expect.stringContaining('Removed stale Codex skill "agent-browser"'),
      }),
    );
  });

  it("preserves other live Jasmin.ia skill symlinks in the shared workspace skill directory", async () => {
    const currentRepo = await makeTempDir("jasminia-codex-current-");
    const skillsHome = await makeTempDir("jasminia-codex-home-");
    cleanupDirs.add(currentRepo);
    cleanupDirs.add(skillsHome);

    await createJasmin.iaRepoSkill(currentRepo, "jasminia");
    await createJasmin.iaRepoSkill(currentRepo, "agent-browser");
    await fs.symlink(
      path.join(currentRepo, "skills", "agent-browser"),
      path.join(skillsHome, "agent-browser"),
    );

    await ensureCodexSkillsInjected(async () => {}, {
      skillsHome,
      skillsEntries: [{
        key: jasminiaKey,
        runtimeName: "jasminia",
        source: path.join(currentRepo, "skills", "jasminia"),
      }],
    });

    expect((await fs.lstat(path.join(skillsHome, "jasminia"))).isSymbolicLink()).toBe(true);
    expect((await fs.lstat(path.join(skillsHome, "agent-browser"))).isSymbolicLink()).toBe(true);
    expect(await fs.realpath(path.join(skillsHome, "agent-browser"))).toBe(
      await fs.realpath(path.join(currentRepo, "skills", "agent-browser")),
    );
  });
});
