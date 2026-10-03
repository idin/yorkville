/** The scatter plot: a point per row. */

import { z } from "zod";
import { AXIS_FIELDS } from "../fields/axis_fields";
import { COLOUR_FIELDS, COLOUR_SCALE_FIELDS } from "../fields/colour_fields";
import { X_FIELD, Y_FIELD, defineColumnField } from "../fields/column_fields";
import { COMMON_FIELDS } from "../fields/common_fields";

export const DEFAULT_SHOW_TREND_LINE = false;

export const SCATTER_PLOT_SCHEMA = z.strictObject({
  type: z.literal("scatter"),
  ...COMMON_FIELDS,
  ...AXIS_FIELDS,
  ...COLOUR_FIELDS,
  ...COLOUR_SCALE_FIELDS,
  x: X_FIELD,
  y: Y_FIELD,
  marker_shape: defineColumnField("A column whose categories each get their own marker shape.").optional(),
  size: defineColumnField("A column of numbers that sizes each point.").optional(),
  show_trend_line: z.boolean().default(DEFAULT_SHOW_TREND_LINE).describe("Draw a least-squares line through all the points."),
});

export type ScatterPlot = z.infer<typeof SCATTER_PLOT_SCHEMA>;

/** The column fields that must hold numbers. */
export const SCATTER_NUMERIC_COLUMNS: readonly (keyof ScatterPlot)[] = ["y", "size"];
