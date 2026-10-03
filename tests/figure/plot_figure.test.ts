import { describe, expect, test } from "vitest";
import { z } from "zod";
import { COLUMN_FIELD_SCHEMAS } from "../../src/fields/column_fields";
import { COMMON_FIELDS } from "../../src/fields/common_fields";
import { NUMERIC_COLUMNS, PLOT_FIGURE_SCHEMA, PLOT_SCHEMAS } from "../../src/figure/plot_figure";
import { unwrapField } from "../../src/figure/validate_plot_figure";
import { findInconsistentFields } from "../helpers/find_inconsistent_fields";

describe("every plot shares one interface", () => {
  test("no field name is defined differently on two plots", () => {
    expect(findInconsistentFields(PLOT_SCHEMAS)).toEqual([]);
  });

  test("every plot has the common fields, unchanged", () => {
    for (const schema of PLOT_SCHEMAS) {
      for (const [field, fieldSchema] of Object.entries(COMMON_FIELDS)) {
        expect(schema.shape[field as keyof typeof schema.shape], `${schema.shape.type.value}.${field}`).toBe(fieldSchema);
      }
    }
  });

  test("every numeric column is one of that plot's column fields", () => {
    for (const schema of PLOT_SCHEMAS) {
      const shape: Record<string, z.ZodType> = schema.shape;
      for (const field of NUMERIC_COLUMNS[schema.shape.type.value]) {
        expect(COLUMN_FIELD_SCHEMAS.has(unwrapField(shape[field] as z.ZodType)), `${schema.shape.type.value}.${field}`).toBe(true);
      }
    }
  });

  test("every field tells an agent what it is for", () => {
    for (const schema of PLOT_SCHEMAS) {
      for (const [field, fieldSchema] of Object.entries(schema.shape)) {
        if (field === "type") continue;
        expect((fieldSchema as z.ZodType).description, `${schema.shape.type.value}.${field}`).toBeTruthy();
      }
    }
  });
});

describe("the figure's JSON Schema, for MCP tools", () => {
  test("is produced, and lists every plot type", () => {
    const jsonSchema = JSON.stringify(z.toJSONSchema(PLOT_FIGURE_SCHEMA, { io: "input" }));
    for (const schema of PLOT_SCHEMAS) expect(jsonSchema).toContain(`"const":"${schema.shape.type.value}"`);
  });
});
