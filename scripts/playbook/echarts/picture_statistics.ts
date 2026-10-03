/**
 * The statistics ECharts does not compute itself (box summaries, bins,
 * densities, fits), the same ones the Plotly pictures get from Plotly or NumPy.
 */

/**
 * Make evenly spaced numbers from low to high, both included.
 *
 * @param options - The ends and how many numbers.
 * @returns The numbers.
 */
export function makeEvenSpacing(options: { low: number; high: number; count: number }): number[] {
  const step = (options.high - options.low) / (options.count - 1);
  return Array.from({ length: options.count }, (_, index) => options.low + index * step);
}

/**
 * Compute a quantile of sorted values by linear interpolation (NumPy's default).
 *
 * @param sorted - Values in ascending order.
 * @param options - The quantile, 0 to 1.
 * @returns The quantile.
 */
export function computeQuantile(sorted: number[], options: { quantile: number }): number {
  const position = (sorted.length - 1) * options.quantile;
  const lower = Math.floor(position);
  const lowerValue = sorted[lower] as number;
  const upperValue = sorted[Math.min(lower + 1, sorted.length - 1)] as number;
  return lowerValue + (upperValue - lowerValue) * (position - lower);
}

/**
 * Summarise values for an ECharts box plot: Tukey whiskers at 1.5 IQR, and the outliers past them.
 *
 * @param values - The values.
 * @returns The five numbers ECharts expects, and the outliers.
 */
export function summariseBox(values: number[]): { box: number[]; outliers: number[] } {
  const sorted = [...values].sort((first, second) => first - second);
  const firstQuartile = computeQuantile(sorted, { quantile: 0.25 });
  const thirdQuartile = computeQuantile(sorted, { quantile: 0.75 });
  const reach = 1.5 * (thirdQuartile - firstQuartile);
  const inside = sorted.filter((value) => value >= firstQuartile - reach && value <= thirdQuartile + reach);
  return {
    box: [inside[0] as number, firstQuartile, computeQuantile(sorted, { quantile: 0.5 }), thirdQuartile, inside[inside.length - 1] as number],
    outliers: sorted.filter((value) => !inside.includes(value)),
  };
}

/**
 * Count values into equal-width bins.
 *
 * @param values - The values.
 * @param options - The range and the bin width.
 * @returns Each bin's centre and count.
 */
export function binValues(values: number[], options: { start: number; end: number; width: number }): [number, number][] {
  const binCount = Math.round((options.end - options.start) / options.width);
  const counts = new Array<number>(binCount).fill(0);
  for (const value of values) {
    const index = Math.floor((value - options.start) / options.width);
    if (index >= 0 && index < binCount) counts[index] = (counts[index] as number) + 1;
  }
  return counts.map((count, index) => [options.start + (index + 0.5) * options.width, count]);
}

/**
 * Estimate a density curve with a Gaussian kernel and Silverman's bandwidth.
 *
 * @param values - The values.
 * @param options - The points to evaluate at.
 * @returns [x, density] pairs.
 */
export function estimateDensity(values: number[], options: { grid: number[] }): [number, number][] {
  const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
  const deviation = Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / values.length);
  const bandwidth = 1.06 * deviation * values.length ** -0.2;
  const normaliser = 1 / (values.length * bandwidth * Math.sqrt(2 * Math.PI));
  return options.grid.map((x) => [x, normaliser * values.reduce((sum, value) => sum + Math.exp(-0.5 * ((x - value) / bandwidth) ** 2), 0)]);
}

/**
 * Fit a least-squares line.
 *
 * @param xs - The x values.
 * @param options - The matching y values.
 * @returns The slope and intercept.
 */
export function fitLine(xs: number[], options: { ys: number[] }): { slope: number; intercept: number } {
  const meanX = xs.reduce((sum, value) => sum + value, 0) / xs.length;
  const meanY = options.ys.reduce((sum, value) => sum + value, 0) / xs.length;
  let covariance = 0;
  let variance = 0;
  xs.forEach((x, index) => {
    covariance += (x - meanX) * ((options.ys[index] as number) - meanY);
    variance += (x - meanX) ** 2;
  });
  const slope = covariance / variance;
  return { slope, intercept: meanY - slope * meanX };
}

/**
 * Compute Pearson's correlation between two series.
 *
 * @param first - One series.
 * @param options - The other, the same length.
 * @returns The correlation, -1 to 1.
 */
export function computeCorrelation(first: number[], options: { second: number[] }): number {
  const { slope } = fitLine(first, { ys: options.second });
  const spread = (values: number[]): number => {
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    return Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0));
  };
  return (slope * spread(first)) / spread(options.second);
}
