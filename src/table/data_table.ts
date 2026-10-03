/**
 * The table every plot draws from: named columns of equal length. Columnar
 * rather than a list of rows because it is about half the tokens for an
 * agent to send.
 */

import { z } from "zod";

/** One cell: a number, a string, or null for a missing value. */
export const CELL_SCHEMA = z.union([z.number(), z.string(), z.null()]);

export const DATA_TABLE_SCHEMA = z
  .record(z.string().min(1), z.array(CELL_SCHEMA))
  .describe("A table: { column_name: [values] }, every column the same length.");

export type DataTable = z.infer<typeof DATA_TABLE_SCHEMA>;

/**
 * Count a table's rows, checking it has columns, they are all the same
 * length, and there are not too many rows to draw.
 *
 * @param table - The table.
 * @param options - Where the table is in the figure, for errors, and the most rows allowed.
 * @returns The row count.
 */
export function countTableRows(table: DataTable, options: { where: string; maximumRows: number }): number {
  const columns = Object.entries(table);
  const first = columns[0];
  if (first === undefined) throw new Error(`${options.where}: the table has no columns.`);
  const [firstName, firstValues] = first;
  for (const [name, values] of columns) {
    if (values.length !== firstValues.length) {
      throw new Error(`${options.where}: every column must have the same length; "${firstName}" has ${firstValues.length}, "${name}" has ${values.length}.`);
    }
  }
  if (firstValues.length > options.maximumRows) {
    throw new Error(`${options.where}: at most ${options.maximumRows} rows; got ${firstValues.length}. Summarise the data first.`);
  }
  return firstValues.length;
}
