/** The box plot: a box summarising y: quartiles, whiskers at 1.5 interquartile ranges, outliers. One box per x category. */

import { z } from "zod";
import { AXIS_FIELDS } from "../fields/axis_fields";
import { COLOUR_FIELDS } from "../fields/colour_fields";
import { X_FIELD, Y_FIELD } from "../fields/column_fields";
import { COMMON_FIELDS } from "../fields/common_fields";
import { MARKER_FIELDS } from "../fields/marker_fields";

export const BOX_PLOT_SCHEMA = z.strictObject({
  type: z.literal("box"),
  ...COMMON_FIELDS,
  ...AXIS_FIELDS,
  ...COLOUR_FIELDS,
  ...MARKER_FIELDS,
  y: Y_FIELD,
  x: X_FIELD.optional(),
});

export type BoxPlot = z.infer<typeof BOX_PLOT_SCHEMA>;

/** The column fields that must hold numbers. */
export const BOX_NUMERIC_COLUMNS: readonly (keyof BoxPlot)[] = ["y"];
