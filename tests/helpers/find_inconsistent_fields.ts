import type { z } from "zod";
import { unwrapField } from "../../src/figure/validate_plot_figure";

/** A field name that two plot types define differently. */
export type InconsistentField = { field: string; plotTypes: [string, string] };

/**
 * Find fields that share a name across plot types but not a definition. A
 * shared field must come from one definition (a shared field group), so
 * the schema inside its optional and default wrappers is the same object,
 * and any default is the same value.
 *
 * @param schemas - Each plot type's schema.
 * @returns Every mismatch, empty when the plots are consistent.
 */
export function findInconsistentFields(schemas: readonly z.ZodObject[]): InconsistentField[] {
  const firstSeen = new Map<string, { plotType: string; inner: z.ZodType; defaultValue: unknown }>();
  const mismatches: InconsistentField[] = [];
  for (const schema of schemas) {
    const plotType = String((schema.shape.type as z.ZodLiteral).value);
    for (const [field, fieldSchema] of Object.entries(schema.shape)) {
      if (field === "type") continue;
      const inner = unwrapField(fieldSchema as z.ZodType);
      const defaultValue = (fieldSchema as z.ZodType).safeParse(undefined).data;
      const earlier = firstSeen.get(field);
      if (earlier === undefined) {
        firstSeen.set(field, { plotType, inner, defaultValue });
      } else if (earlier.inner !== inner || earlier.defaultValue !== defaultValue) {
        mismatches.push({ field, plotTypes: [earlier.plotType, plotType] });
      }
    }
  }
  return mismatches;
}
