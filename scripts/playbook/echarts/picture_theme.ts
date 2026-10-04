/**
 * The look every ECharts catalogue picture shares: the same palette, fonts,
 * size and margins as the Plotly pictures (scripts/playbook/plotly/picture_theme.py),
 * so a pair differs only in what each renderer draws.
 */

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname } from "node:path";
import { Resvg } from "@resvg/resvg-js";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";

/** Pictures by their path under the picture folder: the title and how to draw it. */
export type PictureList = Record<string, { title: string; draw: () => EChartsOption }>;

export const SURFACE = "#fcfcfb";
export const TEXT_PRIMARY = "#0b0b0b";
export const TEXT_SECONDARY = "#52514e";
export const GRID_LINE = "#e4e3df";
export const LAND = "#f1f0ec";
export const WATER = "#e9edf1";
export const BORDER = "#c9c8c2";

/** Categorical slots in their validated order: never cycled, never reordered. */
export const CATEGORICAL = ["#2a78d6", "#eb6834", "#1baf7a", "#eda100", "#e87ba4", "#008300", "#4a3aa7", "#e34948"];

/** One hue, light to dark, for continuous colour. */
export const SEQUENTIAL = ["#cde2fb", "#9ec5f4", "#6da7ec", "#3987e5", "#256abf", "#184f95", "#0d366b"];

const FONT_FAMILY = "Helvetica";
const FONT_SIZE = 13;
const TITLE_SIZE = 15;

/** Thumbnails in a Markdown table, drawn at twice the size for sharp screens. */
const PICTURE_WIDTH = 560;
const PICTURE_HEIGHT = 340;
const PICTURE_SCALE = 2;

/** The plot area's margins, with room beyond the tick labels for axis titles. */
export const GRID = { left: 40, right: 24, top: 48, bottom: 36, containLabel: true };

/** The same, with the right side kept clear for the legend, as Plotly keeps it. */
export const GRID_WITH_LEGEND = { ...GRID, right: 112 };

/** A legend at the top right, as Plotly places it. */
export const LEGEND = { right: 8, top: 36, orient: "vertical" as const, textStyle: { color: TEXT_SECONDARY } };

const THEME_NAME = "plot_twist_catalogue";
const AXIS_STYLE = {
  axisLine: { show: false },
  axisTick: { show: false },
  axisLabel: { color: TEXT_SECONDARY },
  splitLine: { show: true, lineStyle: { color: GRID_LINE } },
  nameTextStyle: { color: TEXT_SECONDARY, fontSize: FONT_SIZE },
};

echarts.registerTheme(THEME_NAME, {
  color: CATEGORICAL,
  backgroundColor: SURFACE,
  textStyle: { fontFamily: FONT_FAMILY, fontSize: FONT_SIZE, color: TEXT_SECONDARY },
  categoryAxis: AXIS_STYLE,
  valueAxis: AXIS_STYLE,
  logAxis: AXIS_STYLE,
  timeAxis: AXIS_STYLE,
});

/**
 * Make an axis title that sits beside its axis, as Plotly's do.
 *
 * @param name - The title.
 * @param options - How far it sits from the axis line.
 * @returns The axis fields to spread into an axis option.
 */
export function nameAxis(name: string, options: { gap: number }): { name: string; nameLocation: "middle"; nameGap: number } {
  return { name, nameLocation: "middle", nameGap: options.gap };
}

/**
 * Render an option with the shared theme and write it as a PNG, refusing to overwrite.
 *
 * @param option - The chart.
 * @param options - The title shown above it and where the PNG goes.
 */
export function savePicture(option: EChartsOption, options: { title: string; path: string }): void {
  if (existsSync(options.path)) throw new Error(`${options.path} exists; move it to the trash first to redraw it.`);
  mkdirSync(dirname(options.path), { recursive: true });
  const chart = echarts.init(null, THEME_NAME, { renderer: "svg", ssr: true, width: PICTURE_WIDTH, height: PICTURE_HEIGHT });
  chart.setOption({
    animation: false,
    // z above the band map pictures lay behind the title.
    title: { text: options.title, left: 10, top: 10, z: 200, textStyle: { fontSize: TITLE_SIZE, fontWeight: "normal", color: TEXT_PRIMARY } },
    ...option,
  });
  const svg = chart.renderToSVGString();
  // Disposed so ECharts' render loop does not keep Node running.
  chart.dispose();
  const png = new Resvg(svg, { fitTo: { mode: "width", value: PICTURE_WIDTH * PICTURE_SCALE }, font: { loadSystemFonts: true, defaultFontFamily: FONT_FAMILY } })
    .render()
    .asPng();
  writeFileSync(options.path, png);
}
