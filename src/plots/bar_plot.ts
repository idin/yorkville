/** The bar plot: a bar per category, grouped or stacked by colour. */

import { z } from "zod";
import { AXIS_FIELDS } from "../fields/axis_fields";
import { COLOUR_FIELDS, COLOUR_SCALE_FIELDS } from "../fields/colour_fields";
import { X_FIELD, Y_FIELD } from "../fields/column_fields";
import { COMMON_FIELDS } from "../fields/common_fields";

export const BAR_MODES = ["grouped", "stacked"] as const;
export const DEFAULT_BAR_MODE: (typeof BAR_MODES)[number] = "grouped";
export const BAR_ORIENTATIONS = ["vertical", "horizontal"] as const;
export const DEFAULT_BAR_ORIENTATION: (typeof BAR_ORIENTATIONS)[number] = "vertical";

export const BAR_PLOT_SCHEMA = z.strictObject({
  type: z.literal("bar"),
  ...COMMON_FIELDS,
  ...AXIS_FIELDS,
  ...COLOUR_FIELDS,
  ...COLOUR_SCALE_FIELDS,
  x: X_FIELD,
  y: Y_FIELD,
  mode: z.enum(BAR_MODES).default(DEFAULT_BAR_MODE).describe("How bars of different colours share a category: side by side, or one on another."),
  orientation: z.enum(BAR_ORIENTATIONS).default(DEFAULT_BAR_ORIENTATION).describe("Whether bars stand up or lie along the x axis."),
});

export type BarPlot = z.infer<typeof BAR_PLOT_SCHEMA>;

/** The column fields that must hold numbers. */
export const BAR_NUMERIC_COLUMNS: readonly (keyof BarPlot)[] = ["y"];
