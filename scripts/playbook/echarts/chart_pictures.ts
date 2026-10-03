/**
 * ECharts pictures for section 1 of the catalogue: the chart types scribble.tube
 * draws today. Each mirrors the function of the same name in
 * scripts/playbook/plotly/chart_pictures.py.
 */

import type { EChartsOption } from "echarts";
import { CATEGORICAL, GRID, GRID_WITH_LEGEND, LEGEND, SEQUENTIAL, nameAxis, type PictureList } from "./picture_theme";
import { binValues, estimateDensity, fitLine, makeEvenSpacing, summariseBox } from "./picture_statistics";
import { createSeededRandom, drawGamma, drawNormal, drawUniform } from "./seeded_random";

const RANDOM_SEED = 7;
const CITIES = ["Toronto", "Montréal", "Vancouver"];

/**
 * Draw monthly rent in three cities, one line and one dash each.
 *
 * @returns The chart.
 */
export function drawLine(): EChartsOption {
  const random = createSeededRandom(RANDOM_SEED);
  const years = Array.from({ length: 11 }, (_, index) => 2015 + index);
  const dashes = ["solid", "dashed", "dotted"] as const;
  return {
    grid: GRID_WITH_LEGEND, legend: LEGEND,
    xAxis: { type: "value", min: 2015, max: 2025, axisLabel: { formatter: (value: number) => String(value) } },
    yAxis: { type: "value", scale: true, ...nameAxis("Rent ($)", { gap: 44 }) },
    series: CITIES.map((city, index) => {
      let rent = [1500, 1000, 1700][index] as number;
      const growth = drawNormal(random, { mean: 0.05, deviation: 0.02, count: years.length });
      return {
        type: "line", name: city, symbolSize: 6, lineStyle: { width: 2, type: dashes[index] },
        data: years.map((year, step) => [year, (rent *= 1 + (growth[step] as number))]),
      };
    }),
  };
}

/**
 * Draw house size against price, coloured by area, sized by lot, with a trend line.
 *
 * @returns The chart.
 */
export function drawScatter(): EChartsOption {
  const random = createSeededRandom(RANDOM_SEED);
  const shapes = ["circle", "rect", "triangle"];
  const allSizes: number[] = [];
  const allPrices: number[] = [];
  const series = ["Annex", "Leslieville", "Junction"].map((area, index) => {
    const sizes = drawUniform(random, { low: 900, high: 3200, count: 25 });
    const noise = drawNormal(random, { mean: 0, deviation: 150_000, count: 25 });
    const lots = drawUniform(random, { low: 8, high: 22, count: 25 });
    const prices = sizes.map((size, row) => 400 * size * (1 + 0.15 * index) + (noise[row] as number));
    allSizes.push(...sizes);
    allPrices.push(...prices);
    return {
      type: "scatter" as const, name: area, symbol: shapes[index], itemStyle: { opacity: 0.8 },
      data: sizes.map((size, row) => ({ value: [size, prices[row]], symbolSize: lots[row] })),
    };
  });
  const { slope, intercept } = fitLine(allSizes, { ys: allPrices });
  return {
    grid: GRID_WITH_LEGEND, legend: LEGEND,
    xAxis: { type: "value", scale: true, ...nameAxis("Size (sq ft)", { gap: 28 }) },
    yAxis: { type: "value", ...nameAxis("Price ($)", { gap: 52 }) },
    series: [
      ...series,
      { type: "line", name: "Trend", symbol: "none", lineStyle: { color: "#52514e", width: 2 }, itemStyle: { color: "#52514e" },
        data: [[900, slope * 900 + intercept], [3200, slope * 3200 + intercept]] },
    ],
  };
}

/**
 * Draw population by province, stacked by age group.
 *
 * @returns The chart.
 */
export function drawBar(): EChartsOption {
  const groups: Record<string, number[]> = { "0–19": [3.2, 1.8, 1.1, 1.0, 0.3], "20–64": [9.4, 5.1, 3.2, 2.8, 0.8], "65+": [2.9, 1.9, 1.1, 0.7, 0.2] };
  return {
    grid: GRID_WITH_LEGEND, legend: LEGEND,
    xAxis: { type: "category", data: ["ON", "QC", "BC", "AB", "MB"] },
    yAxis: { type: "value", ...nameAxis("People (millions)", { gap: 32 }) },
    series: Object.entries(groups).map(([name, values]) => ({ type: "bar", name, stack: "people", data: values })),
  };
}

/**
 * Draw commute times by city, with every point beside its box.
 *
 * @returns The chart.
 */
export function drawBox(): EChartsOption {
  const random = createSeededRandom(RANDOM_SEED);
  const commutes = [34, 29, 31].map((mean) => drawGamma(random, { shape: 6, scale: mean / 6, count: 80 }));
  return {
    grid: GRID,
    // The points need fractional positions, so they sit on a hidden value axis lined up with the categories.
    xAxis: [{ type: "category", data: CITIES }, { type: "value", min: -0.5, max: CITIES.length - 0.5, show: false }],
    yAxis: { type: "value", scale: true, ...nameAxis("Minutes", { gap: 36 }) },
    series: [
      { type: "boxplot", data: commutes.map((values, index) => ({ value: summariseBox(values).box, itemStyle: { color: `${CATEGORICAL[index]}33`, borderColor: CATEGORICAL[index] } })) },
      // Points jittered to the left of each box, as Plotly's `pointpos` places them.
      ...commutes.map((values, index) => ({
        type: "scatter" as const, xAxisIndex: 1, symbolSize: 4, itemStyle: { color: CATEGORICAL[index] },
        data: values.map((value) => [index - 0.35 + 0.15 * (random() - 0.5), value]),
      })),
    ],
  };
}

/**
 * Draw daily step counts, weekday against weekend, on one bin range.
 *
 * @returns The chart.
 */
export function drawHistogram(): EChartsOption {
  const random = createSeededRandom(RANDOM_SEED);
  return {
    grid: GRID_WITH_LEGEND, legend: LEGEND,
    xAxis: { type: "value", min: 0, max: 18000, ...nameAxis("Steps", { gap: 28 }) },
    yAxis: { type: "value", ...nameAxis("Days", { gap: 36 }) },
    series: [["Weekday", 7500], ["Weekend", 10500]].map(([name, mean]) => ({
      type: "bar", name: name as string, barGap: "-100%", barCategoryGap: 0, itemStyle: { opacity: 0.7 },
      data: binValues(drawNormal(random, { mean: mean as number, deviation: 2200, count: 400 }), { start: 0, end: 18000, width: 1000 }),
    })),
  };
}

/**
 * Draw kernel density curves of age at first home purchase, by decade.
 *
 * @returns The chart.
 */
export function drawDensity(): EChartsOption {
  const random = createSeededRandom(RANDOM_SEED);
  const grid = makeEvenSpacing({ low: 18, high: 60, count: 200 });
  return {
    grid: GRID_WITH_LEGEND, legend: LEGEND,
    xAxis: { type: "value", min: 18, max: 60, ...nameAxis("Age", { gap: 28 }) },
    yAxis: { type: "value", ...nameAxis("Density", { gap: 44 }) },
    series: [["1990s", 28], ["2000s", 31], ["2010s", 34]].map(([decade, mean]) => ({
      type: "line", name: decade as string, symbol: "none", lineStyle: { width: 2 }, areaStyle: { opacity: 0.35 },
      data: estimateDensity(drawNormal(random, { mean: mean as number, deviation: 5, count: 300 }), { grid }),
    })),
  };
}

/**
 * Draw café visits by hour and weekday.
 *
 * @returns The chart.
 */
export function drawHeatmap(): EChartsOption {
  const hours = Array.from({ length: 15 }, (_, index) => 7 + index);
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const cells = days.flatMap((day, dayIndex) => hours.map((hour, hourIndex) => {
    const weekend = day === "Sat" || day === "Sun";
    const morning = Math.exp(-0.5 * ((hour - 9) / 1.5) ** 2);
    const afternoon = Math.exp(-0.5 * ((hour - 15) / 2.5) ** 2);
    return [hourIndex, dayIndex, 80 * morning * (weekend ? 0.6 : 1) + 50 * afternoon * (weekend ? 1.5 : 1)];
  }));
  return {
    grid: { ...GRID, right: 72 },
    xAxis: { type: "category", data: hours, ...nameAxis("Hour", { gap: 28 }) },
    yAxis: { type: "category", data: days },
    visualMap: { min: 0, max: 80, calculable: false, right: 8, top: "middle", itemHeight: 180, inRange: { color: SEQUENTIAL } },
    series: [{ type: "heatmap", data: cells }],
  };
}

/**
 * Draw household spending as a pie and as a donut, side by side.
 *
 * @returns The chart.
 */
export function drawPieAndDonut(): EChartsOption {
  const data = [["Housing", 35], ["Transport", 16], ["Food", 15], ["Health", 7], ["Other", 27]].map(([name, value]) => ({ name: name as string, value: value as number }));
  const label = { position: "inside" as const, formatter: "{d}%", color: "#ffffff" };
  return {
    legend: LEGEND,
    series: [
      { type: "pie", radius: "62%", center: ["24%", "56%"], data, label },
      { type: "pie", radius: ["32%", "62%"], center: ["62%", "56%"], data, label },
    ],
  };
}

export const CHART_PICTURES: PictureList = {
  "charts/line.png": { title: "Monthly rent", draw: drawLine },
  "charts/scatter.png": { title: "Size against price", draw: drawScatter },
  "charts/bar.png": { title: "Population by province", draw: drawBar },
  "charts/box.png": { title: "Commute times", draw: drawBox },
  "charts/histogram.png": { title: "Daily steps", draw: drawHistogram },
  "charts/density.png": { title: "Age at first home purchase", draw: drawDensity },
  "charts/heatmap.png": { title: "Café visits", draw: drawHeatmap },
  "charts/pie_and_donut.png": { title: "Household spending", draw: drawPieAndDonut },
};
