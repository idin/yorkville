import type { PlotFigureLimits } from "../../src/figure/validate_plot_figure";

/** The limits scribble.tube runs with, so tests exercise realistic values. */
export const TEST_LIMITS: PlotFigureLimits = { maximumPlots: 12, maximumRows: 100_000, maximumHistogramBins: 200 };
