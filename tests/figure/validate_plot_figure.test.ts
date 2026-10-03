import { describe, expect, test } from "vitest";
import { validatePlotFigure } from "../../src/figure/validate_plot_figure";
import { TEST_LIMITS } from "../helpers/test_limits";

/** Monthly temperatures in two cities: the table most tests plot. */
const TEMPERATURES = {
  date: ["2025-01-01", "2025-01-01", "2025-02-01", "2025-02-01"],
  city: ["Toronto", "Vancouver", "Toronto", "Vancouver"],
  temperature: [-5.8, 4.1, -4.9, 5.3],
  year: [2025, 2025, 2025, 2025],
};

/**
 * Validate a figure over the temperature table, with the test limits.
 *
 * @param plots - The plots to check.
 * @returns The validated figure.
 */
function validatePlots(plots: unknown[]): ReturnType<typeof validatePlotFigure> {
  return validatePlotFigure({ data: TEMPERATURES, plots }, { limits: TEST_LIMITS });
}

describe("a valid figure", () => {
  test("passes, with every default filled in", () => {
    const figure = validatePlots([
      { type: "line", x: "date", y: "temperature", colour: "city" },
      { type: "density", x: "temperature", colour: "city" },
    ]);
    expect(figure.plots[0]).toEqual({
      type: "line", x: "date", y: "temperature", colour: "city",
      x_scale: "linear", y_scale: "linear", colour_scale: "linear", show_markers: false,
    });
    expect(figure.plots[1]).toEqual({ type: "density", x: "temperature", colour: "city", x_scale: "linear", y_scale: "linear", show_area: false });
  });

  test("passes for every plot type", () => {
    const figure = validatePlots([
      { type: "line", x: "date", y: "temperature" },
      { type: "scatter", x: "year", y: "temperature", size: "temperature", marker_shape: "city", show_trend_line: true },
      { type: "bar", x: "city", y: "temperature", mode: "stacked", orientation: "horizontal" },
      { type: "box", y: "temperature", x: "city", show_markers: true },
      { type: "histogram", x: "temperature", bins: 10, is_normalised: true },
      { type: "density", x: "temperature", bandwidth: 1.5, show_area: true },
      { type: "heatmap", x: "date", y: "city", value: "temperature", colour_scale: "quantile" },
      { type: "pie", label: "city", value: "temperature", hole: 0.5 },
    ]);
    expect(figure.plots.map((plot) => plot.type)).toEqual(["line", "scatter", "bar", "box", "histogram", "density", "heatmap", "pie"]);
  });

  test("shared axes default to unshared, and can be linked", () => {
    expect(validatePlots([{ type: "line", x: "date", y: "temperature" }])).toMatchObject({ is_x_axis_shared: false, is_y_axis_shared: false });
    const figure = validatePlotFigure(
      { data: TEMPERATURES, is_x_axis_shared: true, plots: [{ type: "line", x: "date", y: "temperature" }, { type: "bar", x: "date", y: "temperature" }] },
      { limits: TEST_LIMITS },
    );
    expect(figure.is_x_axis_shared).toBe(true);
  });

  test("a numeric column coloured as categories passes on a plot that cannot colour by a number", () => {
    expect(() => validatePlots([{ type: "box", y: "temperature", colour: "year", colour_type: "categorical" }])).not.toThrow();
  });
});

describe("a field that does not apply is refused, naming it", () => {
  test("axis scale on a pie", () => {
    expect(() => validatePlots([{ type: "pie", label: "city", value: "temperature", x_scale: "log" }])).toThrow(/plots\[0\]\.x_scale/);
  });

  test("bins on a line", () => {
    expect(() => validatePlots([{ type: "line", x: "date", y: "temperature", bins: 10 }])).toThrow(/plots\[0\]\.bins/);
  });

  test("a misspelt field", () => {
    expect(() => validatePlots([{ type: "line", x: "date", y: "temperature", show_marker: true }])).toThrow(/plots\[0\]\.show_marker/);
  });
});

describe("columns are checked against the table", () => {
  test("an unknown column is refused, listing the columns there are", () => {
    expect(() => validatePlots([{ type: "line", x: "date", y: "rainfall" }])).toThrow(/plots\[0\]\.y.*"rainfall".*date, city, temperature, year/);
  });

  test("a text column where numbers are needed is refused", () => {
    expect(() => validatePlots([{ type: "line", x: "date", y: "city" }])).toThrow(/plots\[0\]\.y.*must be numeric/);
  });

  test("a text column is fine where numbers are not needed", () => {
    expect(() => validatePlots([{ type: "bar", x: "city", y: "temperature" }])).not.toThrow();
  });

  test("a plot's own table replaces the figure's", () => {
    expect(() => validatePlots([{ type: "pie", label: "fruit", value: "count", data: { fruit: ["apple", "pear"], count: [3, 5] } }])).not.toThrow();
  });
});

describe("colour", () => {
  test("a plot without colour_scale cannot colour by a number", () => {
    expect(() => validatePlots([{ type: "box", y: "temperature", colour: "year" }])).toThrow(/plots\[0\]\.colour.*cannot colour by a number/);
  });

  test("a plot with colour_scale can", () => {
    expect(() => validatePlots([{ type: "scatter", x: "year", y: "temperature", colour: "temperature" }])).not.toThrow();
  });

  test("colour_type without colour is refused", () => {
    expect(() => validatePlots([{ type: "line", x: "date", y: "temperature", colour_type: "categorical" }])).toThrow(/plots\[0\]\.colour_type/);
  });
});

describe("the table and the figure's limits", () => {
  test("columns of different lengths are refused", () => {
    expect(() => validatePlotFigure({ data: { a: [1, 2], b: [1] }, plots: [{ type: "line", x: "a", y: "b" }] }, { limits: TEST_LIMITS }))
      .toThrow(/data.*"a" has 2.*"b" has 1/);
  });

  test("more plots than the limit are refused", () => {
    const plots = Array.from({ length: TEST_LIMITS.maximumPlots + 1 }, () => ({ type: "line", x: "date", y: "temperature" }));
    expect(() => validatePlots(plots)).toThrow(/plots: at most 12/);
  });

  test("more bins than the limit are refused", () => {
    expect(() => validatePlots([{ type: "histogram", x: "temperature", bins: TEST_LIMITS.maximumHistogramBins + 1 }])).toThrow(/plots\[0\]\.bins/);
  });

  test("a grid too small for the plots is refused", () => {
    expect(() => validatePlotFigure({ data: TEMPERATURES, grid: { rows: 1, columns: 1 }, plots: [
      { type: "line", x: "date", y: "temperature" }, { type: "density", x: "temperature" },
    ] }, { limits: TEST_LIMITS })).toThrow(/grid: 1 x 1 has room for 1 plot; got 2/);
  });
});
