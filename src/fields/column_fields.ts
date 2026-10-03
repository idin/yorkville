/**
 * Fields that name a column of the table. Every one is made by
 * defineColumnField, which records it, so validation finds a plot's column
 * fields from its schema instead of a list kept by hand beside it.
 */

import { z } from "zod";

/** Every column field's schema, so validation can tell which fields name columns. */
export const COLUMN_FIELD_SCHEMAS: Set<z.ZodType> = new Set();

/**
 * Define a field that names a column, and record it as one.
 *
 * @param description - What the column is for, shown to agents in the tool schema.
 * @returns The field's schema.
 */
export function defineColumnField(description: string): z.ZodString {
  const field = z.string().min(1).describe(description);
  COLUMN_FIELD_SCHEMAS.add(field);
  return field;
}

export const X_FIELD = defineColumnField("The column along the x axis.");
export const Y_FIELD = defineColumnField("The column along the y axis.");
export const VALUE_FIELD = defineColumnField("The column of numbers each mark shows: a pie slice's size, a heatmap cell's colour.");
