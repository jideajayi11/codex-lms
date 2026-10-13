import { beforeEach, describe, expect, it, vi } from "vitest";
const mocks = vi.hoisted(() => ({
  parse: vi.fn(),
  state: vi.fn(),
  cache: vi.fn(),
  upsert: vi.fn(),
}));
vi.mock("../src/lib/db", () => ({
  db: {
    demoState: { findUniqueOrThrow: mocks.state },
    aIResult: { findUnique: mocks.cache, upsert: mocks.upsert },
  },
}));
vi.mock("openai", () => ({
  default: class {
    responses = { parse: mocks.parse };
  },
}));
import {
  runAI,
  assistSchema,
  recommendationSchema,
  validRecommendations,
} from "../src/lib/ai";
beforeEach(() => {
  vi.resetAllMocks();
  vi.stubEnv("OPENAI_API_KEY", "unit-test-key");
  mocks.state.mockResolvedValue({ forcedFallback: false });
  mocks.cache.mockResolvedValue(null);
  mocks.upsert.mockResolvedValue({});
});
describe("AI service reliability", () => {
  it("uses a prepared exact response after provider failure", async () => {
    mocks.parse.mockRejectedValue(new Error("timeout"));
    const result = await runAI("explain", { selected: "known" }, assistSchema, {
      answer: "Known answer",
    });
    expect(result).toEqual({ answer: "Known answer", provenance: "prepared" });
    expect(mocks.upsert).not.toHaveBeenCalled();
  });
  it("does not replace arbitrary inputs with unrelated fixtures", async () => {
    mocks.parse.mockRejectedValue(new Error("offline"));
    await expect(
      runAI("explain", { selected: "arbitrary" }, assistSchema, null),
    ).rejects.toThrow("AI is unavailable");
  });
  it("rejects invented resource identifiers even in valid JSON", async () => {
    mocks.parse.mockResolvedValue({
      output_parsed: {
        recommendations: [{ resourceId: "invented", reason: "fabricated" }],
      },
    });
    const fixture = {
      recommendations: [{ resourceId: "known", reason: "Catalog match" }],
    };
    const result = await runAI(
      "recommendations",
      {},
      recommendationSchema,
      fixture,
      (v) => validRecommendations(v, ["known"]),
    );
    expect(result.provenance).toBe("prepared");
    expect(result.recommendations[0].resourceId).toBe("known");
  });
  it("labels cached results and bypasses them in prepared mode", async () => {
    mocks.cache.mockResolvedValue({
      result: JSON.stringify({ answer: "Cached answer" }),
    });
    expect(
      await runAI("explain", {}, assistSchema, { answer: "Fixture" }),
    ).toEqual({ answer: "Cached answer", provenance: "cached" });
    mocks.state.mockResolvedValue({ forcedFallback: true });
    expect(
      await runAI("explain", {}, assistSchema, { answer: "Fixture" }),
    ).toEqual({ answer: "Fixture", provenance: "prepared" });
    expect(mocks.parse).not.toHaveBeenCalled();
  });
  it("caches a validated live answer", async () => {
    mocks.parse.mockResolvedValue({
      output_parsed: { answer: "Grounded answer" },
    });
    expect(await runAI("explain", {}, assistSchema, null)).toEqual({
      answer: "Grounded answer",
      provenance: "live",
    });
    expect(mocks.upsert).toHaveBeenCalledOnce();
  });
});
