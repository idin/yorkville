import type { DataTable } from "./data_table";

/**
 * Check that a field names a column of the table, and that the column holds
 * only numbers when the field needs them.
 *
 * @param table - The table the plot draws from.
 * @param options - The column named, the field naming it and where, for errors, and whether it must be numeric.
 */
export function checkColumn(table: DataTable, options: { column: string; field: string; where: string; isNumeric: boolean }): void {
  const values = table[options.column];
  if (values === undefined) {
    throw new Error(
      `${options.where}.${options.field}: names column "${options.column}", which is not in the table. ` +
      `Columns: ${Object.keys(table).join(", ")}.`,
    );
  }
  if (options.isNumeric && values.some((value) => value !== null && typeof value !== "number")) {
    throw new Error(`${options.where}.${options.field}: column "${options.column}" must be numeric.`);
  }
}

/**
 * Whether a column holds numbers (nulls aside), so colour by it is continuous.
 *
 * @param table - The table.
 * @param options - The column.
 * @returns True when every non-null value is a number.
 */
export function checkColumnIsNumeric(table: DataTable, options: { column: string }): boolean {
  const values = table[options.column];
  if (values === undefined) throw new Error(`Column "${options.column}" is not in the table.`);
  return values.every((value) => value === null || typeof value === "number");
}
