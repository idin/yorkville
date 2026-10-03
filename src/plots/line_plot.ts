/** The line plot: a line through the points in x order, one line per colour category. */

import { z } from "zod";
import { AXIS_FIELDS } from "../fields/axis_fields";
import { COLOUR_FIELDS, COLOUR_SCALE_FIELDS } from "../fields/colour_fields";
import { X_FIELD, Y_FIELD, defineColumnField } from "../fields/column_fields";
import { COMMON_FIELDS } from "../fields/common_fields";
import { MARKER_FIELDS } from "../fields/marker_fields";

export const LINE_PLOT_SCHEMA = z.strictObject({
  type: z.literal("line"),
  ...COMMON_FIELDS,
  ...AXIS_FIELDS,
  ...COLOUR_FIELDS,
  ...COLOUR_SCALE_FIELDS,
  ...MARKER_FIELDS,
  x: X_FIELD,
  y: Y_FIELD,
  line_type: defineColumnField("A column whose categories each get their own dash.").optional(),
});

export type LinePlot = z.infer<typeof LINE_PLOT_SCHEMA>;

/** The column fields that must hold numbers. */
export const LINE_NUMERIC_COLUMNS: readonly (keyof LinePlot)[] = ["y"];
