/**
 * ECharts pictures for section 6 of the catalogue: parts, relationships,
 * comparison and single-number candidates. Each mirrors the function of the
 * same name in scripts/playbook/plotly/structure_and_comparison_pictures.py.
 *
 * No 3D pictures: ECharts draws 3D only through echarts-gl, which needs WebGL
 * and cannot render server-side. A chord diagram is here and not in Plotly,
 * which has none.
 */

import type { EChartsOption } from "echarts";
import { CATEGORICAL, GRID, GRID_WITH_LEGEND, GRID_LINE, LEGEND, SEQUENTIAL, SURFACE, TEXT_PRIMARY, TEXT_SECONDARY, nameAxis, type PictureList } from "./picture_theme";
import { computeCorrelation } from "./picture_statistics";
import { createSeededRandom, drawNormal } from "./seeded_random";

const RANDOM_SEED = 7;
const BUDGET: Record<string, Record<string, number>> = {
  Housing: { Rent: 24, Utilities: 6, Insurance: 5 }, Transport: { Transit: 6, Car: 10 },
  Food: { Groceries: 11, Restaurants: 4 }, Other: { Savings: 20, Fun: 14 },
};

/**
 * Make the budget as a nested tree, one colour per group.
 *
 * @returns The tree's top level.
 */
function makeBudgetTree(): { name: string; itemStyle: { color: string }; children: { name: string; value: number }[] }[] {
  return Object.entries(BUDGET).map(([group, items], index) => ({
    name: group, itemStyle: { color: CATEGORICAL[index] as string }, children: Object.entries(items).map(([name, value]) => ({ name, value })),
  }));
}

/**
 * Make correlated measurements for the relationship pictures.
 *
 * @returns Measure name → values.
 */
function makeMeasurements(): Record<string, number[]> {
  const random = createSeededRandom(RANDOM_SEED);
  const size = drawNormal(random, { mean: 0, deviation: 1, count: 120 });
  const noise = (deviation: number): number[] => drawNormal(random, { mean: 0, deviation, count: 120 });
  const priceNoise = noise(0.5);
  const commuteNoise = noise(0.9);
  return { Size: size, Price: size.map((value, index) => 0.8 * value + (priceNoise[index] as number)), Age: noise(1),
    Commute: size.map((value, index) => -0.4 * value + (commuteNoise[index] as number)) };
}

/**
 * Draw a household budget as nested rectangles.
 *
 * @returns The chart.
 */
export function drawTreemap(): EChartsOption {
  return { series: [{ type: "treemap", top: 44, left: 8, right: 8, bottom: 8, roam: false, nodeClick: false, breadcrumb: { show: false },
    upperLabel: { show: true, height: 20, color: "#ffffff" }, label: { color: "#ffffff" },
    levels: [{ itemStyle: { borderColor: SURFACE, borderWidth: 2, gapWidth: 2 } }, { itemStyle: { borderColor: "rgba(255,255,255,0.6)", borderWidth: 1, gapWidth: 1 } }],
    data: makeBudgetTree() }] };
}

/**
 * Draw the same budget as rings.
 *
 * @returns The chart.
 */
export function drawSunburst(): EChartsOption {
  return { series: [{ type: "sunburst", center: ["50%", "56%"], radius: [0, "82%"], label: { color: "#ffffff", fontSize: 10, minAngle: 12 },
    itemStyle: { borderColor: SURFACE, borderWidth: 1 }, levels: [{}, {}, { itemStyle: { opacity: 0.75 } }], data: makeBudgetTree() }] };
}

/**
 * Draw a month's money from income to what is left, as floating bars.
 *
 * @returns The chart.
 */
export function drawWaterfall(): EChartsOption {
  const steps: [string, number][] = [["Income", 6200], ["Rent", -2400], ["Food", -900], ["Transport", -500], ["Other", -1300]];
  let level = 0;
  const bars = steps.map(([, change]) => {
    const base = change >= 0 ? level : level + change;
    level += change;
    return { base, height: Math.abs(change), colour: change >= 0 && base === 0 ? CATEGORICAL[0] : change >= 0 ? CATEGORICAL[2] : CATEGORICAL[7] };
  });
  bars.push({ base: 0, height: level, colour: CATEGORICAL[0] });
  return {
    grid: GRID,
    xAxis: { type: "category", data: [...steps.map(([name]) => name), "Left"] },
    yAxis: { type: "value" },
    series: [
      // The waterfall is an invisible base bar with the visible change stacked on it.
      { type: "bar", stack: "money", itemStyle: { color: "transparent" }, data: bars.map(({ base }) => base) },
      { type: "bar", stack: "money", data: bars.map(({ height, colour }) => ({ value: height, itemStyle: { color: colour } })) },
    ],
  };
}

/**
 * Draw a sign-up funnel.
 *
 * @returns The chart.
 */
export function drawFunnel(): EChartsOption {
  return { series: [{ type: "funnel", top: 48, bottom: 12, left: "18%", width: "64%", sort: "descending", gap: 3, itemStyle: { color: CATEGORICAL[0], borderWidth: 0 },
    label: { position: "inside", formatter: "{c}", color: "#ffffff" }, labelLine: { show: false },
    data: [["Visited", 5000], ["Signed up", 1400], ["Connected an agent", 900], ["Showed a plot", 620], ["Came back", 410]].map(([name, value]) => ({ name: name as string, value: value as number })) },
  { type: "funnel", top: 48, bottom: 12, left: "18%", width: "64%", sort: "descending", gap: 3, silent: true, itemStyle: { color: "transparent", borderWidth: 0 },
    label: { position: "left", color: TEXT_SECONDARY }, labelLine: { show: false },
    data: [["Visited", 5000], ["Signed up", 1400], ["Connected an agent", 900], ["Showed a plot", 620], ["Came back", 410]].map(([name, value]) => ({ name: name as string, value: value as number })) }] };
}

/**
 * Draw how people commute, each city to 100%.
 *
 * @returns The chart.
 */
export function drawFullStackedBar(): EChartsOption {
  const modes: Record<string, number[]> = { Car: [52, 45, 50], Transit: [33, 38, 30], Walk: [9, 10, 11], Bike: [6, 7, 9] };
  const totals = [0, 1, 2].map((city) => Object.values(modes).reduce((sum, values) => sum + (values[city] as number), 0));
  return {
    grid: GRID_WITH_LEGEND, legend: LEGEND,
    xAxis: { type: "value", max: 100, ...nameAxis("%", { gap: 28 }) },
    yAxis: { type: "category", data: ["Toronto", "Montréal", "Vancouver"], splitLine: { show: false } },
    series: Object.entries(modes).map(([name, values]) => ({ type: "bar" as const, name, stack: "modes", data: values.map((value, city) => (100 * value) / (totals[city] as number)) })),
  };
}

/**
 * Draw income flowing into spending.
 *
 * @returns The chart.
 */
export function drawSankey(): EChartsOption {
  const colours = [CATEGORICAL[0], CATEGORICAL[0], TEXT_SECONDARY, ...CATEGORICAL.slice(1, 5)];
  const names = ["Salary", "Freelance", "Budget", "Housing", "Food", "Savings", "Other"];
  return { series: [{ type: "sankey", top: 48, bottom: 16, left: 16, right: 72, nodeGap: 14, label: { color: TEXT_PRIMARY },
    lineStyle: { color: "rgba(42,120,214,0.2)", curveness: 0.5 },
    data: names.map((name, index) => ({ name, itemStyle: { color: colours[index], borderWidth: 0 } })),
    links: [[0, 2, 5000], [1, 2, 1200], [2, 3, 2400], [2, 4, 900], [2, 5, 1500], [2, 6, 1400]].map(([source, target, value]) => ({ source: names[source as number] as string, target: names[target as number] as string, value })) }] };
}

/**
 * Draw a small friendship network in a circle.
 *
 * @returns The chart.
 */
export function drawNetwork(): EChartsOption {
  const names = ["Ana", "Ben", "Chen", "Dev", "Eli", "Fay", "Gus", "Hana"];
  const edges = [[0, 1], [0, 2], [1, 2], [2, 3], [3, 4], [4, 5], [5, 3], [6, 7], [6, 0], [7, 5]];
  return { series: [{ type: "graph", layout: "circular", top: 60, bottom: 30, symbolSize: 18, itemStyle: { color: CATEGORICAL[0] },
    label: { show: true, position: "top", color: TEXT_PRIMARY }, lineStyle: { color: TEXT_SECONDARY, width: 1 },
    data: names.map((name) => ({ name })), links: edges.map(([source, target]) => ({ source: names[source as number] as string, target: names[target as number] as string })) }] };
}

/**
 * Draw money moving between four people as a chord diagram.
 *
 * @returns The chart.
 */
export function drawChord(): EChartsOption {
  const names = ["Ana", "Ben", "Chen", "Dev"];
  const flows = [[0, 1, 40], [0, 2, 25], [1, 2, 30], [1, 3, 15], [2, 3, 35], [3, 0, 20]];
  return { series: [{ type: "chord", center: ["50%", "56%"], radius: ["68%", "76%"], padAngle: 3, label: { show: true, color: TEXT_PRIMARY },
    lineStyle: { color: "source", opacity: 0.45 },
    data: names.map((name, index) => ({ name, itemStyle: { color: CATEGORICAL[index] } })),
    links: flows.map(([source, target, value]) => ({ source: names[source as number] as string, target: names[target as number] as string, value })) }] } as EChartsOption;
}

/**
 * Draw how strongly each pair of measures moves together.
 *
 * @returns The chart.
 */
export function drawCorrelationMatrix(): EChartsOption {
  const measures = makeMeasurements();
  const names = Object.keys(measures);
  const cells = names.flatMap((first, row) => names.map((second, column) => [column, row, computeCorrelation(measures[first] as number[], { second: measures[second] as number[] })]));
  return {
    grid: { ...GRID, right: 72 },
    xAxis: { type: "category", data: names, splitLine: { show: false } },
    yAxis: { type: "category", data: names, inverse: true, splitLine: { show: false } },
    visualMap: { min: -1, max: 1, right: 8, top: "middle", itemHeight: 180, calculable: false, inRange: { color: [CATEGORICAL[1] as string, SURFACE, CATEGORICAL[0] as string] } },
    series: [{ type: "heatmap", data: cells, label: { show: true, formatter: ({ value }) => (value as number[])[2]?.toFixed(2) ?? "", color: TEXT_PRIMARY } }],
  };
}

/**
 * Draw every pair of measures as a small scatter.
 *
 * @returns The chart.
 */
export function drawScatterMatrix(): EChartsOption {
  const measures = makeMeasurements();
  const names = Object.keys(measures);
  const cell = 100 / (names.length + 0.6);
  const pairs = names.flatMap((rowName, row) => names.map((columnName, column) => ({ rowName, columnName, row, column }))).filter(({ row, column }) => row !== column);
  return {
    grid: pairs.map(({ row, column }) => ({ left: `${12 + column * cell * 0.92}%`, top: `${14 + row * cell * 0.8}%`, width: `${cell * 0.8}%`, height: `${cell * 0.65}%` })),
    xAxis: pairs.map(({ columnName, row }, index) => ({ type: "value" as const, gridIndex: index, scale: true, axisLabel: { show: row === names.length - 1, fontSize: 9 },
      ...(row === names.length - 1 ? nameAxis(columnName, { gap: 18 }) : {}) })),
    yAxis: pairs.map(({ rowName, column }, index) => ({ type: "value" as const, gridIndex: index, scale: true, axisLabel: { show: false },
      ...(column === 0 || (column === 1 && pairs[index]?.row === 0) ? nameAxis(rowName, { gap: 8 }) : {}) })),
    series: pairs.map(({ rowName, columnName }, index) => ({
      type: "scatter" as const, xAxisIndex: index, yAxisIndex: index, symbolSize: 3, itemStyle: { color: CATEGORICAL[0], opacity: 0.6 },
      data: (measures[columnName] as number[]).map((value, point) => [value, (measures[rowName] as number[])[point]]),
    })),
  };
}

/**
 * Draw each house as a line across its measures.
 *
 * @returns The chart.
 */
export function drawParallelCoordinates(): EChartsOption {
  const measures = makeMeasurements();
  const names = Object.keys(measures);
  const prices = measures["Price"] as number[];
  return {
    parallel: { top: 70, bottom: 30, left: 40, right: 40 },
    parallelAxis: names.map((name, dimension) => ({ dim: dimension, name, nameTextStyle: { color: TEXT_SECONDARY }, axisLine: { lineStyle: { color: TEXT_SECONDARY } } })),
    visualMap: { show: false, dimension: 1, min: Math.min(...prices), max: Math.max(...prices), inRange: { color: SEQUENTIAL } },
    series: [{ type: "parallel", lineStyle: { width: 1, opacity: 0.5 }, data: prices.map((_, row) => names.map((name) => (measures[name] as number[])[row] as number)) }],
  };
}

/**
 * Draw two neighbourhoods scored on five things.
 *
 * @returns The chart.
 */
export function drawRadar(): EChartsOption {
  return {
    legend: LEGEND,
    radar: { center: ["46%", "56%"], radius: "66%", indicator: ["Transit", "Parks", "Schools", "Shops", "Quiet"].map((name) => ({ name, max: 10 })),
      axisName: { color: TEXT_SECONDARY }, splitLine: { lineStyle: { color: GRID_LINE } }, splitArea: { show: false }, axisLine: { lineStyle: { color: GRID_LINE } } },
    series: [{ type: "radar", symbolSize: 5, areaStyle: { opacity: 0.35 },
      data: [{ name: "Annex", value: [9, 6, 8, 9, 4] }, { name: "Junction", value: [6, 8, 7, 7, 7] }] }],
  };
}

/**
 * Draw rent in 2015 against 2025 per city.
 *
 * @returns The chart.
 */
export function drawDumbbell(): EChartsOption {
  const cities = ["Toronto", "Montréal", "Vancouver", "Calgary", "Halifax"];
  const before = [1500, 1000, 1700, 1200, 1050];
  const after = [2600, 1700, 2900, 1800, 1900];
  return {
    grid: GRID_WITH_LEGEND, legend: { ...LEGEND, data: ["2015", "2025"] },
    xAxis: { type: "value", scale: true, ...nameAxis("Rent ($)", { gap: 28 }) },
    yAxis: { type: "category", data: cities, splitLine: { show: false } },
    series: [
      ...cities.map((city, index) => ({ type: "line" as const, symbol: "none", silent: true, lineStyle: { color: GRID_LINE, width: 4 }, data: [[before[index], city], [after[index], city]] })),
      { type: "scatter", name: "2015", symbolSize: 12, itemStyle: { color: CATEGORICAL[0] }, data: before.map((value, index) => [value, cities[index]]) },
      { type: "scatter", name: "2025", symbolSize: 12, itemStyle: { color: CATEGORICAL[1] }, data: after.map((value, index) => [value, cities[index]]) },
    ],
  };
}

/**
 * Draw library visits per branch as stems with dots.
 *
 * @returns The chart.
 */
export function drawLollipop(): EChartsOption {
  const branches = ["Central", "North York", "Scarborough", "Parkdale", "Lillian H. Smith"];
  const visits = [980, 720, 540, 410, 380];
  return {
    grid: GRID,
    xAxis: { type: "value", ...nameAxis("Visits (thousands)", { gap: 28 }) },
    yAxis: { type: "category", data: branches, inverse: true, splitLine: { show: false } },
    series: [
      { type: "bar", barWidth: 2, itemStyle: { color: CATEGORICAL[0] }, data: visits },
      { type: "scatter", symbolSize: 14, itemStyle: { color: CATEGORICAL[0] }, data: visits.map((value, index) => [value, branches[index]]) },
    ],
  };
}

/**
 * Draw progress to a savings goal against bands of poor, fair and good.
 *
 * @returns The chart.
 */
export function drawBullet(): EChartsOption {
  return {
    grid: { left: 110, right: 90, top: 120, bottom: 120 },
    xAxis: { type: "value", max: 20_000, splitLine: { show: false }, axisLabel: { formatter: (value: number) => `${value / 1000}k` } },
    yAxis: { type: "category", data: ["Savings"], splitLine: { show: false }, axisLabel: { fontSize: 18, color: TEXT_SECONDARY } },
    graphic: [{ type: "text", right: 12, top: "middle", style: { text: "$13.4k", fontSize: 22, fill: TEXT_SECONDARY } }],
    series: [
      { type: "bar", barWidth: "100%", silent: true, itemStyle: { color: "#e4e3df" }, data: [20_000], z: 1 },
      { type: "bar", barWidth: "100%", barGap: "-100%", silent: true, itemStyle: { color: "#eeedea" }, data: [14_000], z: 2 },
      { type: "bar", barWidth: "100%", barGap: "-100%", silent: true, itemStyle: { color: "#e4e3df" }, data: [8000], z: 3 },
      { type: "bar", barWidth: "35%", barGap: "-67%", itemStyle: { color: CATEGORICAL[0] }, data: [13_400], z: 4,
        markLine: { symbol: "none", silent: true, label: { show: false }, lineStyle: { color: TEXT_SECONDARY, width: 3, type: "solid" }, data: [{ xAxis: 15_000 }] } },
    ],
  };
}

/**
 * Draw three single numbers with their change.
 *
 * @returns The chart.
 */
export function drawStatTiles(): EChartsOption {
  const tiles: [string, string, number][] = [["Viewers", "1240", 0.127], ["Plots shown", "8.63k", -0.042], ["Channels", "312", 0.114]];
  return {
    graphic: tiles.flatMap(([label, value, change], index) => {
      const centre = `${(100 * (index + 0.5)) / tiles.length}%`;
      const colour = change >= 0 ? CATEGORICAL[2] : CATEGORICAL[7];
      return [
        { type: "text" as const, left: centre, top: 110, style: { text: label, fontSize: 18, fill: TEXT_SECONDARY, align: "center" as const } },
        { type: "text" as const, left: centre, top: 140, style: { text: value, fontSize: 44, fill: TEXT_SECONDARY, align: "center" as const } },
        { type: "text" as const, left: centre, top: 196, style: { text: `${change >= 0 ? "▲" : "▼"}${(100 * change).toFixed(1)}%`, fontSize: 24, fill: colour, align: "center" as const } },
      ];
    }),
  };
}

/**
 * Draw how much of a monthly allowance is used.
 *
 * @returns The chart.
 */
export function drawGauge(): EChartsOption {
  return { series: [{ type: "gauge", center: ["50%", "68%"], radius: "88%", startAngle: 180, endAngle: 0, min: 0, max: 100,
    progress: { show: true, width: 22, itemStyle: { color: CATEGORICAL[0] } }, axisLine: { lineStyle: { width: 22, color: [[1, "#eeedea"]] } },
    pointer: { show: false }, axisTick: { show: false }, splitLine: { show: false }, axisLabel: { distance: 30, color: TEXT_SECONDARY },
    title: { show: true, offsetCenter: [0, "-112%"], color: TEXT_SECONDARY, fontSize: 16 },
    detail: { offsetCenter: [0, "-12%"], fontSize: 48, color: TEXT_SECONDARY, formatter: "{value}%" },
    data: [{ value: 68, name: "Allowance used" }] }] };
}

/**
 * Draw a small folder hierarchy as a top-down tree.
 *
 * @returns The chart.
 */
export function drawTree(): EChartsOption {
  return { series: [{ type: "tree", orient: "TB", top: 70, bottom: 50, left: 40, right: 40, symbolSize: 14, initialTreeDepth: -1, expandAndCollapse: false,
    itemStyle: { color: CATEGORICAL[0], borderColor: CATEGORICAL[0] }, lineStyle: { color: TEXT_SECONDARY, width: 1, curveness: 0 },
    label: { position: "bottom", distance: 6, color: TEXT_PRIMARY }, leaves: { label: { position: "bottom" } },
    data: [{ name: "yorkville", children: [{ name: "src", children: [{ name: "charts" }, { name: "maps" }] }, { name: "tests" }, { name: "playbook", children: [{ name: "pictures" }] }] }] }] };
}

export const STRUCTURE_AND_COMPARISON_PICTURES: PictureList = {
  "candidates/parts/treemap.png": { title: "Treemap", draw: drawTreemap },
  "candidates/parts/sunburst.png": { title: "Sunburst", draw: drawSunburst },
  "candidates/parts/waterfall.png": { title: "Waterfall", draw: drawWaterfall },
  "candidates/parts/funnel.png": { title: "Funnel", draw: drawFunnel },
  "candidates/parts/full_stacked_bar.png": { title: "Stacked to 100%", draw: drawFullStackedBar },
  "candidates/relationships/sankey.png": { title: "Sankey", draw: drawSankey },
  "candidates/relationships/network.png": { title: "Network", draw: drawNetwork },
  "candidates/relationships/chord.png": { title: "Chord", draw: drawChord },
  "candidates/relationships/correlation_matrix.png": { title: "Correlation matrix", draw: drawCorrelationMatrix },
  "candidates/relationships/scatter_matrix.png": { title: "Scatter-plot matrix", draw: drawScatterMatrix },
  "candidates/relationships/parallel_coordinates.png": { title: "Parallel coordinates", draw: drawParallelCoordinates },
  "candidates/relationships/tree.png": { title: "Tree", draw: drawTree },
  "candidates/comparison/radar.png": { title: "Radar", draw: drawRadar },
  "candidates/comparison/dumbbell.png": { title: "Dumbbell", draw: drawDumbbell },
  "candidates/comparison/lollipop.png": { title: "Lollipop", draw: drawLollipop },
  "candidates/comparison/bullet.png": { title: "Bullet", draw: drawBullet },
  "candidates/glance/stat_tiles.png": { title: "Stat tiles", draw: drawStatTiles },
  "candidates/glance/gauge.png": { title: "Gauge", draw: drawGauge },
};
