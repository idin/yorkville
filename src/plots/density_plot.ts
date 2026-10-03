/** The density plot: a smooth curve of how x is spread (kernel density), one per colour category. */

import { z } from "zod";
import { AXIS_FIELDS } from "../fields/axis_fields";
import { COLOUR_FIELDS } from "../fields/colour_fields";
import { X_FIELD } from "../fields/column_fields";
import { COMMON_FIELDS } from "../fields/common_fields";

export const DEFAULT_SHOW_AREA = false;

export const DENSITY_PLOT_SCHEMA = z.strictObject({
  type: z.literal("density"),
  ...COMMON_FIELDS,
  ...AXIS_FIELDS,
  ...COLOUR_FIELDS,
  x: X_FIELD,
  bandwidth: z.number().positive().optional().describe("How smooth the curve is, in x's units. Default: Silverman's rule, from the data."),
  show_area: z.boolean().default(DEFAULT_SHOW_AREA).describe("Fill the area under each curve."),
});

export type DensityPlot = z.infer<typeof DENSITY_PLOT_SCHEMA>;

/** The column fields that must hold numbers. */
export const DENSITY_NUMERIC_COLUMNS: readonly (keyof DensityPlot)[] = ["x"];
