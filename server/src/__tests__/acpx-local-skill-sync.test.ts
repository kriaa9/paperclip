import { describe, expect, it } from "vitest";
import {
  listAcpxSkills,
  syncAcpxSkills,
} from "@jasminia/adapter-acpx-local/server";

describe("acpx local skill sync", () => {
  const jasminiaKey = "jasminia/jasminia/jasminia";
  const createAgentKey = "jasminia/jasminia/jasminia-create-agent";

  it("reports ACPX Claude skills as supported runtime-mounted state", async () => {
    const snapshot = await listAcpxSkills({
      agentId: "agent-1",
      companyId: "company-1",
      adapterType: "acpx_local",
      config: {
        agent: "claude",
        jasminiaSkillSync: {
          desiredSkills: [jasminiaKey],
        },
      },
    });

    expect(snapshot.adapterType).toBe("acpx_local");
    expect(snapshot.supported).toBe(true);
    expect(snapshot.mode).toBe("ephemeral");
    expect(snapshot.desiredSkills).toContain(jasminiaKey);
    expect(snapshot.desiredSkills).toContain(createAgentKey);
    expect(snapshot.entries.find((entry) => entry.key === jasminiaKey)?.state).toBe("configured");
    expect(snapshot.entries.find((entry) => entry.key === jasminiaKey)?.detail).toContain("ACPX Claude session");
    expect(snapshot.warnings).toEqual([]);
  });

  it("reports ACPX Codex skills with Codex home runtime detail", async () => {
    const snapshot = await syncAcpxSkills({
      agentId: "agent-2",
      companyId: "company-1",
      adapterType: "acpx_local",
      config: {
        agent: "codex",
        jasminiaSkillSync: {
          desiredSkills: ["jasminia"],
        },
      },
    }, ["jasminia"]);

    expect(snapshot.supported).toBe(true);
    expect(snapshot.mode).toBe("ephemeral");
    expect(snapshot.desiredSkills).toContain(jasminiaKey);
    expect(snapshot.desiredSkills).not.toContain("jasminia");
    expect(snapshot.entries.find((entry) => entry.key === jasminiaKey)?.state).toBe("configured");
    expect(snapshot.entries.find((entry) => entry.key === jasminiaKey)?.detail).toContain("CODEX_HOME/skills/");
    expect(snapshot.warnings).toEqual([]);
  });

  it("keeps ACPX custom skill selection tracked but unsupported", async () => {
    const snapshot = await listAcpxSkills({
      agentId: "agent-3",
      companyId: "company-1",
      adapterType: "acpx_local",
      config: {
        agent: "custom",
        jasminiaSkillSync: {
          desiredSkills: [jasminiaKey],
        },
      },
    });

    expect(snapshot.supported).toBe(false);
    expect(snapshot.mode).toBe("unsupported");
    expect(snapshot.desiredSkills).toContain(jasminiaKey);
    expect(snapshot.entries.find((entry) => entry.key === jasminiaKey)?.desired).toBe(true);
    expect(snapshot.entries.find((entry) => entry.key === jasminiaKey)?.detail).toContain("stored in Jasmin.ia only");
    expect(snapshot.warnings).toContain(
      "Custom ACP commands do not expose a Jasmin.ia skill integration contract yet; selected skills are tracked only.",
    );
  });
});
