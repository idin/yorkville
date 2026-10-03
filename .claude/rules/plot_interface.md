# Plot interface

Every plot has the same interface, except for what only that plot has.
A caller who knows one plot knows them all.

## One shared interface

- **The fields every plot shares are defined once**, in one shared type,
  and every plot type extends it. A plot type never redeclares a shared
  field, so it cannot drift from the others.
- **Same concept, same everything.** A concept that appears on more than
  one plot has one name, one type, one unit, one default, one validation
  and one error message on all of them. If bars are turned with
  `orientation`, so are boxes: never `horizontal: true` on one and
  `orientation` on the other.
- **A plot-specific field is only for a concept no other plot has**
  (`bins` on a histogram, `hole` on a pie). Once a second plot needs it,
  it moves into the shared interface, under the name the first one used.
- **A field that does not apply is refused, never ignored.** Sending
  `bins` to a line plot is an error naming the field, so a caller learns
  the interface instead of guessing at it.

## The same across renderers

- The interface is renderer-neutral. Switching between Plotly and ECharts
  never changes a field's name, meaning or default.

## Enforced by tests

- A test checks every plot type against the shared interface: shared
  fields present, unchanged, and not redeclared. Consistency kept only by
  care stops being kept (see `generic/meta.md`).
