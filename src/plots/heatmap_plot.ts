/** The heatmap plot: a grid of cells, one row of the table per cell, coloured by value. */

import { z } from "zod";
import { AXIS_FIELDS } from "../fields/axis_fields";
import { COLOUR_SCALE_FIELDS } from "../fields/colour_fields";
import { VALUE_FIELD, X_FIELD, Y_FIELD } from "../fields/column_fields";
import { COMMON_FIELDS } from "../fields/common_fields";

export const HEATMAP_PLOT_SCHEMA = z.strictObject({
  type: z.literal("heatmap"),
  ...COMMON_FIELDS,
  ...AXIS_FIELDS,
  ...COLOUR_SCALE_FIELDS,
  x: X_FIELD,
  y: Y_FIELD,
  value: VALUE_FIELD,
});

export type HeatmapPlot = z.infer<typeof HEATMAP_PLOT_SCHEMA>;

/** The column fields that must hold numbers. */
export const HEATMAP_NUMERIC_COLUMNS: readonly (keyof HeatmapPlot)[] = ["value"];
