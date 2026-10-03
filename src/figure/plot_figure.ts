/**
 * The figure: one shared table and one or more plots in a grid. This is
 * the whole shape a caller sends, and the one list of plot types.
 */

import { z } from "zod";
import { BAR_NUMERIC_COLUMNS, BAR_PLOT_SCHEMA } from "../plots/bar_plot";
import { BOX_NUMERIC_COLUMNS, BOX_PLOT_SCHEMA } from "../plots/box_plot";
import { DENSITY_NUMERIC_COLUMNS, DENSITY_PLOT_SCHEMA } from "../plots/density_plot";
import { HEATMAP_NUMERIC_COLUMNS, HEATMAP_PLOT_SCHEMA } from "../plots/heatmap_plot";
import { HISTOGRAM_NUMERIC_COLUMNS, HISTOGRAM_PLOT_SCHEMA } from "../plots/histogram_plot";
import { LINE_NUMERIC_COLUMNS, LINE_PLOT_SCHEMA } from "../plots/line_plot";
import { PIE_NUMERIC_COLUMNS, PIE_PLOT_SCHEMA } from "../plots/pie_plot";
import { SCATTER_NUMERIC_COLUMNS, SCATTER_PLOT_SCHEMA } from "../plots/scatter_plot";
import { DATA_TABLE_SCHEMA } from "../table/data_table";

/** Every plot type's schema, in the order the catalogue lists them. */
export const PLOT_SCHEMAS = [
  LINE_PLOT_SCHEMA, SCATTER_PLOT_SCHEMA, BAR_PLOT_SCHEMA, BOX_PLOT_SCHEMA,
  HISTOGRAM_PLOT_SCHEMA, DENSITY_PLOT_SCHEMA, HEATMAP_PLOT_SCHEMA, PIE_PLOT_SCHEMA,
] as const;

export const PLOT_SCHEMA = z.discriminatedUnion("type", PLOT_SCHEMAS);

export type Plot = z.infer<typeof PLOT_SCHEMA>;
export type PlotType = Plot["type"];

/** Each plot type's column fields that must hold numbers. */
export const NUMERIC_COLUMNS: Readonly<Record<PlotType, readonly string[]>> = {
  line: LINE_NUMERIC_COLUMNS, scatter: SCATTER_NUMERIC_COLUMNS, bar: BAR_NUMERIC_COLUMNS, box: BOX_NUMERIC_COLUMNS,
  histogram: HISTOGRAM_NUMERIC_COLUMNS, density: DENSITY_NUMERIC_COLUMNS, heatmap: HEATMAP_NUMERIC_COLUMNS, pie: PIE_NUMERIC_COLUMNS,
};

export const RENDERERS = ["plotly", "echarts"] as const;

export const DEFAULT_IS_AXIS_SHARED = false;

export const PLOT_FIGURE_SCHEMA = z.strictObject({
  data: DATA_TABLE_SCHEMA.describe("The table the plots draw from, unless a plot brings its own."),
  plots: z.array(PLOT_SCHEMA).min(1).describe("The plots, filling the grid row by row."),
  grid: z
    .strictObject({ rows: z.number().int().min(1), columns: z.number().int().min(1) })
    .optional()
    .describe("Rows and columns of plots. Default: one column, a row per plot."),
  title: z.string().min(1).optional().describe("A title over the whole figure."),
  renderer: z.enum(RENDERERS).optional().describe("The library that draws the figure. Default: the caller's."),
  is_x_axis_shared: z.boolean().default(DEFAULT_IS_AXIS_SHARED).describe("Link every plot's x axis, so zooming one zooms all."),
  is_y_axis_shared: z.boolean().default(DEFAULT_IS_AXIS_SHARED).describe("Link every plot's y axis, so zooming one zooms all."),
});

export type PlotFigure = z.infer<typeof PLOT_FIGURE_SCHEMA>;
