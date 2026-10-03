/** The histogram plot: counts of x in equal-width bins, one set of bars per colour category on one shared range. */

import { z } from "zod";
import { AXIS_FIELDS } from "../fields/axis_fields";
import { COLOUR_FIELDS } from "../fields/colour_fields";
import { X_FIELD } from "../fields/column_fields";
import { COMMON_FIELDS } from "../fields/common_fields";

export const DEFAULT_IS_NORMALISED = false;

export const HISTOGRAM_PLOT_SCHEMA = z.strictObject({
  type: z.literal("histogram"),
  ...COMMON_FIELDS,
  ...AXIS_FIELDS,
  ...COLOUR_FIELDS,
  x: X_FIELD,
  bins: z.number().int().min(1).optional().describe("How many bins. Default: Sturges' rule, from the row count."),
  is_normalised: z.boolean().default(DEFAULT_IS_NORMALISED).describe("Scale heights so the bars' area is 1, to compare groups of different sizes."),
});

export type HistogramPlot = z.infer<typeof HISTOGRAM_PLOT_SCHEMA>;

/** The column fields that must hold numbers. */
export const HISTOGRAM_NUMERIC_COLUMNS: readonly (keyof HistogramPlot)[] = ["x"];
