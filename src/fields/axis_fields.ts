/** The fields of every plot drawn on x and y axes. */

import { z } from "zod";

export const AXIS_SCALES = ["linear", "log"] as const;
export type AxisScale = (typeof AXIS_SCALES)[number];
export const DEFAULT_AXIS_SCALE: AxisScale = "linear";

const AXIS_SCALE_SCHEMA = z.enum(AXIS_SCALES).default(DEFAULT_AXIS_SCALE);

export const AXIS_FIELDS = {
  x_label: z.string().min(1).optional().describe("The x axis title. Default: the x column's name."),
  y_label: z.string().min(1).optional().describe("The y axis title. Default: the y column's name."),
  x_scale: AXIS_SCALE_SCHEMA.describe("How the x axis spaces numbers: evenly, or by order of magnitude."),
  y_scale: AXIS_SCALE_SCHEMA.describe("How the y axis spaces numbers: evenly, or by order of magnitude."),
};
