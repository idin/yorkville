/**
 * ECharts pictures for section 6 of the catalogue: distribution and
 * change-over-time candidates. Each mirrors the function of the same name in
 * scripts/playbook/plotly/distribution_and_time_pictures.py.
 *
 * Contour comes from the official ECharts custom series @echarts-x/custom-contour.
 * Violins are drawn here: @echarts-x/custom-violin (1.1.1) evaluates density only
 * on 0–10 with a fixed bandwidth of 1, so it cannot show real data.
 */

import contourInstaller from "@echarts-x/custom-contour";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";
import { CATEGORICAL, GRID, GRID_WITH_LEGEND, LEGEND, SEQUENTIAL, TEXT_SECONDARY, nameAxis, type PictureList } from "./picture_theme";
import { binValues, estimateDensity, makeEvenSpacing } from "./picture_statistics";
import { createSeededRandom, drawGamma, drawNormal, drawUniform } from "./seeded_random";

echarts.use(contourInstaller);

const RANDOM_SEED = 7;
const CITIES = ["Toronto", "Montréal", "Vancouver"];
const DAY_MILLISECONDS = 86_400_000;

/**
 * Make commute times per city, shared by the distribution pictures.
 *
 * @returns Minutes, one list per city in CITIES order.
 */
function makeCommutes(): number[][] {
  const random = createSeededRandom(RANDOM_SEED);
  return [34, 29, 31].map((mean) => drawGamma(random, { shape: 6, scale: mean / 6, count: 150 }));
}

/**
 * Make house sizes and prices, shared by the 2D distribution pictures.
 *
 * @returns [size, price] pairs.
 */
function makeHouses(): [number, number][] {
  const random = createSeededRandom(RANDOM_SEED);
  const sizes = drawUniform(random, { low: 900, high: 3200, count: 2000 });
  const noise = drawNormal(random, { mean: 0, deviation: 180_000, count: 2000 });
  return sizes.map((size, index) => [size, 420 * size + (noise[index] as number)]);
}

/**
 * Make the month starts shared by the change-over-time pictures.
 *
 * @returns Two years of month starts, as ISO dates.
 */
function makeMonths(): string[] {
  return Array.from({ length: 24 }, (_, index) => `${2024 + Math.floor(index / 12)}-${String((index % 12) + 1).padStart(2, "0")}-01`);
}

/**
 * Draw commute times as violins: a mirrored density per city, with its median.
 *
 * @returns The chart.
 */
export function drawViolin(): EChartsOption {
  const grid = makeEvenSpacing({ low: 0, high: 85, count: 120 });
  const commutes = makeCommutes();
  const curves = commutes.map((values) => estimateDensity(values, { grid }).filter(([, density]) => density > 1e-4));
  const peak = Math.max(...curves.flat().map(([, density]) => density));
  return {
    grid: GRID,
    // Violins need fractional widths, so they sit on a hidden value axis lined up with the categories.
    xAxis: [{ type: "category", data: CITIES }, { type: "value", min: -0.5, max: CITIES.length - 0.5, show: false }],
    // The series' own data holds no minutes, so the axis is given the curves' range.
    yAxis: { type: "value", min: 0, max: 85, ...nameAxis("Minutes", { gap: 36 }) },
    series: [{
      type: "custom", xAxisIndex: 1,
      renderItem: (parameters, api) => {
        const index = parameters.dataIndex;
        const curve = curves[index] as [number, number][];
        const halfWidth = (density: number): number => (0.4 * density) / peak;
        const right = curve.map(([minutes, density]) => api.coord([index + halfWidth(density), minutes]));
        const left = curve.map(([minutes, density]) => api.coord([index - halfWidth(density), minutes])).reverse();
        const sorted = [...(commutes[index] as number[])].sort((first, second) => first - second);
        const median = sorted[Math.floor(sorted.length / 2)] as number;
        const colour = CATEGORICAL[index] as string;
        return { type: "group", children: [
          { type: "polygon", shape: { points: [...right, ...left] }, style: { fill: colour, opacity: 0.45, stroke: colour, lineWidth: 1.5 } },
          { type: "line", shape: { x1: api.coord([index - 0.12, median])[0], y1: api.coord([index, median])[1], x2: api.coord([index + 0.12, median])[0], y2: api.coord([index, median])[1] },
            style: { stroke: colour, lineWidth: 2 } },
        ] };
      },
      data: CITIES.map((_, index) => [index, 0]),
    }],
  };
}

/**
 * Draw commute times as density curves, each lifted onto its own baseline.
 *
 * @returns The chart.
 */
export function drawRidgeline(): EChartsOption {
  const grid = makeEvenSpacing({ low: 0, high: 85, count: 200 });
  const curves = makeCommutes().map((values) => estimateDensity(values, { grid }));
  const peak = Math.max(...curves.flat().map(([, density]) => density));
  return {
    grid: GRID,
    xAxis: { type: "value", min: 0, max: 85, ...nameAxis("Minutes", { gap: 28 }) },
    yAxis: { type: "value", min: 0, max: CITIES.length + 0.6, interval: 1, axisLabel: { formatter: (value: number) => CITIES[value] ?? "" } },
    series: curves.map((curve, index) => ({
      type: "line" as const, symbol: "none", lineStyle: { width: 2 },
      // Stacked on an invisible base so the area fills down to the city's baseline, not to zero.
      stack: `ridge_${index}`, areaStyle: { opacity: 0.5 },
      data: curve.map(([x, density]) => [x, (1.8 * density) / peak]),
    })).flatMap((series, index) => [
      { type: "line" as const, symbol: "none", lineStyle: { opacity: 0 }, stack: `ridge_${index}`, data: grid.map((x) => [x, index]), silent: true },
      { ...series, itemStyle: { color: CATEGORICAL[index] } },
    ]),
  };
}

/**
 * Draw every commute as a jittered point.
 *
 * @returns The chart.
 */
export function drawStrip(): EChartsOption {
  const random = createSeededRandom(RANDOM_SEED + 1);
  return {
    grid: GRID,
    // Jitter needs fractional positions, so points sit on a hidden value axis lined up with the categories.
    xAxis: [{ type: "category", data: CITIES }, { type: "value", min: -0.5, max: CITIES.length - 0.5, show: false }],
    yAxis: { type: "value", ...nameAxis("Minutes", { gap: 36 }) },
    series: makeCommutes().map((values, index) => ({
      type: "scatter" as const, xAxisIndex: 1, symbolSize: 4, data: values.map((value) => [index + 0.4 * (random() - 0.5), value]),
    })),
  };
}

/**
 * Draw the cumulative share of commutes under each time.
 *
 * @returns The chart.
 */
export function drawCumulativeDistribution(): EChartsOption {
  return {
    grid: GRID_WITH_LEGEND, legend: LEGEND,
    xAxis: { type: "value", ...nameAxis("Minutes", { gap: 28 }) },
    yAxis: { type: "value", max: 1, axisLabel: { formatter: (value: number) => `${Math.round(value * 100)}%` }, ...nameAxis("Share at or under", { gap: 44 }) },
    series: makeCommutes().map((values, index) => {
      const ordered = [...values].sort((first, second) => first - second);
      return { type: "line" as const, name: CITIES[index], step: "end" as const, symbol: "none", lineStyle: { width: 2 }, data: ordered.map((value, rank) => [value, (rank + 1) / ordered.length]) };
    }),
  };
}

/**
 * Draw a 2D histogram of house size against price.
 *
 * @returns The chart.
 */
export function drawTwoDimensionalHistogram(): EChartsOption {
  const houses = makeHouses();
  const binCount = 25;
  const [minimumSize, maximumSize] = [900, 3200];
  const prices = houses.map(([, price]) => price);
  const [minimumPrice, maximumPrice] = [Math.min(...prices), Math.max(...prices)];
  const counts = new Map<string, number>();
  for (const [size, price] of houses) {
    const column = Math.min(binCount - 1, Math.floor(((size - minimumSize) / (maximumSize - minimumSize)) * binCount));
    const row = Math.min(binCount - 1, Math.floor(((price - minimumPrice) / (maximumPrice - minimumPrice)) * binCount));
    counts.set(`${column},${row}`, (counts.get(`${column},${row}`) ?? 0) + 1);
  }
  const sizeLabels = makeEvenSpacing({ low: minimumSize, high: maximumSize, count: binCount }).map((value) => String(Math.round(value)));
  const priceLabels = makeEvenSpacing({ low: minimumPrice, high: maximumPrice, count: binCount }).map((value) => `${(value / 1e6).toFixed(1)}M`);
  return {
    grid: { ...GRID, right: 72 },
    xAxis: { type: "category", data: sizeLabels, splitLine: { show: false }, axisLabel: { interval: 5 }, ...nameAxis("Size (sq ft)", { gap: 28 }) },
    yAxis: { type: "category", data: priceLabels, splitLine: { show: false }, axisLabel: { interval: 5 }, ...nameAxis("Price ($)", { gap: 40 }) },
    visualMap: { min: 0, max: Math.max(...counts.values()), right: 8, top: "middle", itemHeight: 180, calculable: false, inRange: { color: SEQUENTIAL } },
    series: [{ type: "heatmap", data: [...counts].map(([key, count]) => [...key.split(",").map(Number), count]) }],
  };
}

/**
 * Draw a contour of the same 2D density.
 *
 * @returns The chart.
 */
export function drawContour(): EChartsOption {
  return {
    grid: GRID,
    xAxis: { type: "value", scale: true, ...nameAxis("Size (sq ft)", { gap: 28 }) },
    yAxis: { type: "value", ...nameAxis("Price ($)", { gap: 52 }) },
    series: [{
      type: "custom", renderItem: "contour" as never, coordinateSystem: "cartesian2d",
      itemPayload: { thresholds: 10, bandwidth: 14, itemStyle: { color: SEQUENTIAL, opacity: [0.4, 1] }, lineStyle: { color: TEXT_SECONDARY, width: 0.5 } },
      data: makeHouses().map(([size, price]) => [size, price, 1]),
      encode: { x: 0, y: 1, tooltip: 2 },
    }],
  };
}

/**
 * Draw energy use by source as stacked areas.
 *
 * @returns The chart.
 */
export function drawStackedArea(): EChartsOption {
  const months = makeMonths();
  return {
    grid: GRID_WITH_LEGEND, legend: LEGEND,
    xAxis: { type: "time" },
    yAxis: { type: "value", ...nameAxis("kWh / day", { gap: 36 }) },
    series: [["Gas", 60, 35], ["Electric", 40, 8], ["Solar", 12, -8]].map(([name, base, swing]) => ({
      type: "line" as const, name: name as string, stack: "energy", symbol: "none", lineStyle: { width: 1 }, areaStyle: { opacity: 0.55 },
      data: months.map((month, index) => [month, (base as number) + (swing as number) * Math.cos((index / 12) * 2 * Math.PI)]),
    })),
  };
}

/**
 * Draw the Bank of Canada policy rate as a step line.
 *
 * @returns The chart.
 */
export function drawStep(): EChartsOption {
  const changes: [string, number][] = [["2024-01-01", 5.0], ["2024-06-05", 4.75], ["2024-07-24", 4.5], ["2024-09-04", 4.25], ["2024-10-23", 3.75],
    ["2024-12-11", 3.25], ["2025-01-29", 3.0], ["2025-03-12", 2.75], ["2025-12-31", 2.75]];
  return {
    grid: GRID,
    xAxis: { type: "time" },
    yAxis: { type: "value", scale: true, ...nameAxis("Rate (%)", { gap: 36 }) },
    series: [{ type: "line", step: "end", symbol: "none", lineStyle: { width: 2 }, data: changes }],
  };
}

/**
 * Draw a made-up daily share price as candles.
 *
 * @returns The chart.
 */
export function drawCandlestick(): EChartsOption {
  const random = createSeededRandom(RANDOM_SEED);
  const start = Date.parse("2025-03-01");
  const returns = drawNormal(random, { mean: 0.002, deviation: 0.015, count: 45 });
  let close = 100;
  const days: string[] = [];
  const candles: number[][] = returns.map((change, index) => {
    const opening = close;
    close *= 1 + change;
    days.push(new Date(start + index * DAY_MILLISECONDS).toISOString().slice(5, 10));
    return [opening, close, Math.min(opening, close) * (1 - 0.01 * random()), Math.max(opening, close) * (1 + 0.01 * random())];
  });
  return {
    grid: GRID,
    xAxis: { type: "category", data: days, splitLine: { show: false } },
    yAxis: { type: "value", scale: true },
    series: [{ type: "candlestick", data: candles, itemStyle: { color: CATEGORICAL[2], borderColor: CATEGORICAL[2], color0: CATEGORICAL[7], borderColor0: CATEGORICAL[7] } }],
  };
}

/**
 * Draw a forecast with a confidence band and measured points with error bars.
 *
 * @returns The chart.
 */
export function drawErrorBands(): EChartsOption {
  const random = createSeededRandom(RANDOM_SEED);
  const months = makeMonths();
  const trend = months.map((_, index) => 20 + 0.6 * index);
  const spread = months.map((_, index) => 1 + 0.2 * index);
  const measured = months.map((month, index) => [month, (trend[index] as number) + (drawNormal(random, { mean: 0, deviation: 1.5, count: 1 })[0] as number)]).filter((_, index) => index % 3 === 0);
  return {
    grid: GRID_WITH_LEGEND, legend: { ...LEGEND, data: ["95% band", "Forecast", "Measured"] },
    xAxis: { type: "time" },
    yAxis: { type: "value", scale: true },
    series: [
      // The band is an invisible lower line with the band's width stacked on top of it.
      { type: "line", stack: "band", symbol: "none", lineStyle: { opacity: 0 }, data: months.map((month, index) => [month, (trend[index] as number) - (spread[index] as number)]) },
      { type: "line", name: "95% band", stack: "band", symbol: "none", lineStyle: { opacity: 0 }, itemStyle: { color: "rgba(42,120,214,0.18)" }, areaStyle: { color: "rgba(42,120,214,0.18)" },
        data: months.map((month, index) => [month, 2 * (spread[index] as number)]) },
      { type: "line", name: "Forecast", symbol: "none", lineStyle: { width: 2, color: CATEGORICAL[0] }, itemStyle: { color: CATEGORICAL[0] }, data: months.map((month, index) => [month, trend[index]]) },
      { type: "scatter", name: "Measured", symbolSize: 8, itemStyle: { color: CATEGORICAL[1] }, data: measured },
      { type: "custom", renderItem: (_parameters, api) => {
        const top = api.coord([api.value(0), (api.value(1) as number) + 2]);
        const bottom = api.coord([api.value(0), (api.value(1) as number) - 2]);
        const style = { stroke: CATEGORICAL[1], lineWidth: 1.5 };
        return { type: "group", children: [
          { type: "line", shape: { x1: top[0], y1: top[1], x2: bottom[0], y2: bottom[1] }, style },
          { type: "line", shape: { x1: (top[0] as number) - 4, y1: top[1], x2: (top[0] as number) + 4, y2: top[1] }, style },
          { type: "line", shape: { x1: (bottom[0] as number) - 4, y1: bottom[1], x2: (bottom[0] as number) + 4, y2: bottom[1] }, style },
        ] };
      }, data: measured, z: 1 },
    ],
  };
}

/**
 * Draw a renovation plan as a Gantt chart.
 *
 * @returns The chart.
 */
export function drawTimeline(): EChartsOption {
  const tasks: [string, string, string][] = [["Permits", "2026-01-05", "2026-02-15"], ["Demolition", "2026-02-16", "2026-03-01"], ["Framing", "2026-03-02", "2026-04-10"],
    ["Electrical", "2026-03-20", "2026-04-30"], ["Drywall", "2026-05-01", "2026-05-25"], ["Painting", "2026-05-26", "2026-06-10"]];
  return {
    grid: GRID,
    xAxis: { type: "time" },
    yAxis: { type: "category", data: tasks.map(([task]) => task), inverse: true },
    series: [{
      type: "custom",
      renderItem: (_parameters, api) => {
        const start = api.coord([api.value(1), api.value(0)]);
        const end = api.coord([api.value(2), api.value(0)]);
        const height = (api.size?.([0, 1]) as number[])[1] as number * 0.7;
        return { type: "rect", shape: { x: start[0], y: (start[1] as number) - height / 2, width: (end[0] as number) - (start[0] as number), height },
          style: { fill: CATEGORICAL[(api.value(0) as number) % 3] } };
      },
      encode: { x: [1, 2], y: 0 },
      data: tasks.map(([, start, end], index) => [index, start, end]),
    }],
  };
}

/**
 * Draw a year of daily runs on ECharts' calendar.
 *
 * @returns The chart.
 */
export function drawCalendarHeatmap(): EChartsOption {
  const random = createSeededRandom(RANDOM_SEED);
  const start = Date.parse("2025-01-01");
  const days = Array.from({ length: 365 }, (_, index) => [new Date(start + index * DAY_MILLISECONDS).toISOString().slice(0, 10), random() < 0.45 ? 3 + 12 * random() : 0]);
  return {
    visualMap: { show: false, min: 0, max: 15, inRange: { color: ["#f1f0ec", ...SEQUENTIAL.slice(1)] } },
    calendar: { range: "2025", top: 70, left: 44, right: 16, cellSize: ["auto", 26], itemStyle: { borderWidth: 2, borderColor: "#fcfcfb" },
      splitLine: { show: false }, yearLabel: { show: false }, dayLabel: { color: TEXT_SECONDARY }, monthLabel: { color: TEXT_SECONDARY } },
    series: [{ type: "heatmap", coordinateSystem: "calendar", data: days }],
  };
}

/**
 * Draw three small axis-free trend lines, one per city.
 *
 * @returns The chart.
 */
export function drawSparklines(): EChartsOption {
  const random = createSeededRandom(RANDOM_SEED);
  const rows = [...CITIES].reverse();
  return {
    grid: rows.map((_, index) => ({ left: 110, right: 24, top: 60 + index * 90, height: 60 })),
    xAxis: rows.map((_, index) => ({ type: "value" as const, gridIndex: index, show: false, min: 0, max: 39 })),
    yAxis: rows.map((city, index) => ({ type: "value" as const, gridIndex: index, scale: true, splitLine: { show: false }, axisLabel: { show: false },
      name: city, nameLocation: "middle" as const, nameRotate: 0, nameGap: 50, nameTextStyle: { align: "right" as const, padding: [0, 0, 0, 0] } })),
    series: rows.map((_, index) => {
      let level = 0;
      return { type: "line" as const, xAxisIndex: index, yAxisIndex: index, symbol: "none", lineStyle: { width: 2, color: CATEGORICAL[0] },
        data: drawNormal(random, { mean: 0, deviation: 1, count: 40 }).map((step, position) => [position, (level += step)]) };
    }),
  };
}

export const DISTRIBUTION_AND_TIME_PICTURES: PictureList = {
  "candidates/distribution/violin.png": { title: "Violin", draw: drawViolin },
  "candidates/distribution/ridgeline.png": { title: "Ridgeline", draw: drawRidgeline },
  "candidates/distribution/strip.png": { title: "Strip", draw: drawStrip },
  "candidates/distribution/cumulative_distribution.png": { title: "Cumulative distribution", draw: drawCumulativeDistribution },
  "candidates/distribution/two_dimensional_histogram.png": { title: "2D histogram", draw: drawTwoDimensionalHistogram },
  "candidates/distribution/contour.png": { title: "Density contour", draw: drawContour },
  "candidates/time/stacked_area.png": { title: "Stacked area", draw: drawStackedArea },
  "candidates/time/step.png": { title: "Step line", draw: drawStep },
  "candidates/time/candlestick.png": { title: "Candlestick", draw: drawCandlestick },
  "candidates/time/error_bands.png": { title: "Error bars and band", draw: drawErrorBands },
  "candidates/time/timeline.png": { title: "Timeline", draw: drawTimeline },
  "candidates/time/calendar_heatmap.png": { title: "Calendar heatmap", draw: drawCalendarHeatmap },
  "candidates/time/sparklines.png": { title: "Sparklines", draw: drawSparklines },
};
