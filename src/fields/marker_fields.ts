/** The field of plots that can draw a marker for each row of data. */

import { z } from "zod";

export const DEFAULT_SHOW_MARKERS = false;

export const MARKER_FIELDS = {
  show_markers: z.boolean().default(DEFAULT_SHOW_MARKERS).describe("Draw a marker for each row of data."),
};
