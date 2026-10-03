import { describe, expect, test } from "vitest";
import { z } from "zod";
import { findInconsistentFields } from "./find_inconsistent_fields";

const SHARED_TITLE = { title: z.string().optional() };

describe("findInconsistentFields", () => {
  test("passes plots that spread the same field group", () => {
    const line = z.strictObject({ type: z.literal("line"), ...SHARED_TITLE });
    const pie = z.strictObject({ type: z.literal("pie"), ...SHARED_TITLE });
    expect(findInconsistentFields([line, pie])).toEqual([]);
  });

  test("flags a shared name declared twice, even identically", () => {
    const line = z.strictObject({ type: z.literal("line"), show_markers: z.boolean().default(false) });
    const box = z.strictObject({ type: z.literal("box"), show_markers: z.boolean().default(false) });
    expect(findInconsistentFields([line, box])).toEqual([{ field: "show_markers", plotTypes: ["line", "box"] }]);
  });

  test("passes one field required on one plot and optional on another", () => {
    const x = z.string();
    const line = z.strictObject({ type: z.literal("line"), x });
    const box = z.strictObject({ type: z.literal("box"), x: x.optional() });
    expect(findInconsistentFields([line, box])).toEqual([]);
  });

  test("flags one field given different defaults", () => {
    const scale = z.enum(["linear", "log"]);
    const line = z.strictObject({ type: z.literal("line"), x_scale: scale.default("linear") });
    const bar = z.strictObject({ type: z.literal("bar"), x_scale: scale.default("log") });
    expect(findInconsistentFields([line, bar])).toEqual([{ field: "x_scale", plotTypes: ["line", "bar"] }]);
  });
});
