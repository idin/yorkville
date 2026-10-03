/** The pie plot: slices of a whole, one per row; a donut when it has a hole. */

import { z } from "zod";
import { VALUE_FIELD, defineColumnField } from "../fields/column_fields";
import { COMMON_FIELDS } from "../fields/common_fields";

export const DEFAULT_HOLE = 0;

export const PIE_PLOT_SCHEMA = z.strictObject({
  type: z.literal("pie"),
  ...COMMON_FIELDS,
  label: defineColumnField("The column that names each slice."),
  value: VALUE_FIELD,
  hole: z.number().min(0).lt(1).default(DEFAULT_HOLE).describe("The hole's share of the radius: 0 for a pie, up to 1 for a donut."),
});

export type PiePlot = z.infer<typeof PIE_PLOT_SCHEMA>;

/** The column fields that must hold numbers. */
export const PIE_NUMERIC_COLUMNS: readonly (keyof PiePlot)[] = ["value"];
