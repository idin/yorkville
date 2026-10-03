/**
 * The fields of plots coloured by a column. A plot that can colour by a
 * number also takes COLOUR_SCALE_FIELDS; one without them colours by
 * category only, and validation refuses a numeric colour there.
 */

import { z } from "zod";
import { defineColumnField } from "./column_fields";

export const COLOUR_TYPES = ["categorical", "continuous"] as const;
export const COLOUR_SCALES = ["linear", "log", "quantile"] as const;
export type ColourScale = (typeof COLOUR_SCALES)[number];
export const DEFAULT_COLOUR_SCALE: ColourScale = "linear";

export const COLOUR_FIELDS = {
  colour: defineColumnField("The column that colours the marks: text gives a colour per category, numbers a colour scale.").optional(),
  colour_type: z
    .enum(COLOUR_TYPES)
    .optional()
    .describe('Overrides what the colour column\'s values imply, e.g. "categorical" for numbered years.'),
};

export const COLOUR_SCALE_FIELDS = {
  colour_scale: z
    .enum(COLOUR_SCALES)
    .default(DEFAULT_COLOUR_SCALE)
    .describe("How numbers map to colour: evenly, by order of magnitude, or by rank so each step holds as many marks."),
};
