/**
 * Check a figure before anything is drawn. The schema checks each field on
 * its own; this adds what needs the table or the caller's limits. Every
 * error names the field at fault, so a caller can fix the spec in one go.
 */

import { z } from "zod";
import { COLUMN_FIELD_SCHEMAS } from "../fields/column_fields";
import { checkColumn, checkColumnIsNumeric } from "../table/check_column";
import { countTableRows, type DataTable } from "../table/data_table";
import { NUMERIC_COLUMNS, PLOT_FIGURE_SCHEMA, PLOT_SCHEMAS, type Plot, type PlotFigure } from "./plot_figure";

/** What the caller allows, from its own configuration. */
export type PlotFigureLimits = { maximumPlots: number; maximumRows: number; maximumHistogramBins: number };

/**
 * Validate a figure, filling in every default.
 *
 * @param input - The figure as the caller sent it.
 * @param options - The caller's limits.
 * @returns The figure, valid, with defaults filled in.
 */
export function validatePlotFigure(input: unknown, options: { limits: PlotFigureLimits }): PlotFigure {
  const parsed = PLOT_FIGURE_SCHEMA.safeParse(input);
  if (!parsed.success) throw new Error(formatIssues(parsed.error.issues));
  const figure = parsed.data;
  const { limits } = options;
  countTableRows(figure.data, { where: "data", maximumRows: limits.maximumRows });
  if (figure.plots.length > limits.maximumPlots) throw new Error(`plots: at most ${limits.maximumPlots}; got ${figure.plots.length}.`);
  if (figure.grid !== undefined) {
    const room = figure.grid.rows * figure.grid.columns;
    if (room < figure.plots.length) {
      throw new Error(`grid: ${figure.grid.rows} x ${figure.grid.columns} has room for ${room} plot${room === 1 ? "" : "s"}; got ${figure.plots.length}.`);
    }
  }
  figure.plots.forEach((plot, index) => {
    const where = `plots[${index}]`;
    if (plot.data !== undefined) countTableRows(plot.data, { where: `${where}.data`, maximumRows: limits.maximumRows });
    checkPlot(plot, { table: plot.data ?? figure.data, where, limits });
  });
  return figure;
}

/**
 * Check one plot's columns, colour and limits against its table.
 *
 * @param plot - The plot, already through the schema.
 * @param options - Its table, where it is in the figure, and the caller's limits.
 */
function checkPlot(plot: Plot, options: { table: DataTable; where: string; limits: PlotFigureLimits }): void {
  const shape: Record<string, z.ZodType> = findPlotSchema(plot.type).shape;
  const record = plot as Record<string, unknown>;
  for (const [field, schema] of Object.entries(shape)) {
    const column = record[field];
    if (!COLUMN_FIELD_SCHEMAS.has(unwrapField(schema)) || typeof column !== "string") continue;
    checkColumn(options.table, { column, field, where: options.where, isNumeric: NUMERIC_COLUMNS[plot.type].includes(field) });
  }
  if ("colour_type" in plot && plot.colour_type !== undefined && plot.colour === undefined) {
    throw new Error(`${options.where}.colour_type: only meaningful with \`colour\`.`);
  }
  if ("colour" in plot && plot.colour !== undefined && !("colour_scale" in shape)) {
    const isContinuous = plot.colour_type === "continuous"
      || (plot.colour_type === undefined && checkColumnIsNumeric(options.table, { column: plot.colour }));
    if (isContinuous) {
      throw new Error(
        `${options.where}.colour: a ${plot.type} plot cannot colour by a number, having no single value per mark. ` +
        'Use a column of categories, or colour_type "categorical".',
      );
    }
  }
  if (plot.type === "histogram" && plot.bins !== undefined && plot.bins > options.limits.maximumHistogramBins) {
    throw new Error(`${options.where}.bins: at most ${options.limits.maximumHistogramBins}; got ${plot.bins}.`);
  }
}

/**
 * Find a plot type's schema.
 *
 * @param type - The plot type.
 * @returns Its schema.
 */
function findPlotSchema(type: Plot["type"]): (typeof PLOT_SCHEMAS)[number] {
  const schema = PLOT_SCHEMAS.find((candidate) => candidate.shape.type.value === type);
  if (schema === undefined) throw new Error(`No schema for plot type "${type}".`);
  return schema;
}

/**
 * Strip a field's optional and default wrappers, down to the schema it was defined with.
 *
 * @param schema - The field's schema as a plot holds it.
 * @returns The schema inside.
 */
export function unwrapField(schema: z.ZodType): z.ZodType {
  let inner = schema;
  while (inner instanceof z.ZodOptional || inner instanceof z.ZodDefault) inner = inner.unwrap() as z.ZodType;
  return inner;
}

/**
 * Turn the schema's complaints into one message, each line naming its field.
 *
 * @param issues - The schema's issues.
 * @returns The message.
 */
function formatIssues(issues: readonly z.core.$ZodIssue[]): string {
  return issues
    .flatMap((issue) => {
      const where = formatPath(issue.path);
      if (issue.code === "unrecognized_keys") {
        return issue.keys.map((key) => `${where === "" ? key : `${where}.${key}`}: not a field of this plot or figure.`);
      }
      return [`${where === "" ? "figure" : where}: ${issue.message}`];
    })
    .join("\n");
}

/**
 * Write a path the way a caller would point at the field: plots[0].bins.
 *
 * @param path - The path, as the schema reports it.
 * @returns The written path.
 */
function formatPath(path: readonly PropertyKey[]): string {
  return path.map((part, index) => (typeof part === "number" ? `[${part}]` : `${index === 0 ? "" : "."}${String(part)}`)).join("");
}
