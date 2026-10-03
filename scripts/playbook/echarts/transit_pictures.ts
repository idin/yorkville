/**
 * ECharts pictures for the catalogue's transit maps: geographic and schematic.
 * Each mirrors the function of the same name in scripts/playbook/plotly/transit_pictures.py,
 * and both read the same ../toronto_subway.json.
 */

import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import type { EChartsOption } from "echarts";
import { CATEGORICAL, LEGEND, SURFACE, TEXT_PRIMARY, WATER, type PictureList } from "./picture_theme";

type Position = "geographic" | "schematic";
type Station = { label_side?: "left"; geographic: [number, number]; schematic: [number, number] };
type Subway = {
  lines: { name: string; colour_slot: number; stations: string[] }[];
  stations: Record<string, Station>;
  shoreline: [number, number][];
  geographic_view: { longitude: [number, number]; latitude: [number, number] };
};

const SUBWAY = JSON.parse(readFileSync(join(dirname(fileURLToPath(import.meta.url)), "..", "toronto_subway.json"), "utf8")) as Subway;
const LINE_WIDTH = 5;
const STATION_SIZE = 7;
const INTERCHANGE_SIZE = 12;

/** The picture's size and the space above the plot for the title, matching picture_theme. */
const PICTURE = { width: 560, height: 340, top: 48, bottom: 16 };

/** How much shorter a degree of longitude is than a degree of latitude at Toronto (cos 43.7°). */
const LONGITUDE_SHRINK = 0.723;

const SCHEMATIC_VIEW = { x: [-4, 13.5] as [number, number], y: [0, 11] as [number, number] };

/**
 * Find the stations worth a label: interchanges and the ends of each line.
 *
 * @returns Their names, each with whether it is an interchange.
 */
function findLabelledStations(): Map<string, boolean> {
  const counts = new Map<string, number>();
  for (const line of SUBWAY.lines) for (const station of line.stations) counts.set(station, (counts.get(station) ?? 0) + 1);
  const labelled = new Map<string, boolean>();
  for (const [name, count] of counts) if (count > 1) labelled.set(name, true);
  for (const line of SUBWAY.lines) {
    for (const name of [line.stations[0], line.stations[line.stations.length - 1]] as string[]) if (!labelled.has(name)) labelled.set(name, false);
  }
  return labelled;
}

/**
 * Size the plot box so one unit across is as long on screen as one unit up,
 * centred below the title, as Plotly's scaleanchor does.
 *
 * @param view - The x and y ranges.
 * @param options - How much longer a y unit is than an x unit on screen.
 * @returns The grid's position and size, in pixels.
 */
function fitGrid(view: { x: [number, number]; y: [number, number] }, options: { yUnitRatio: number }): { left: number; top: number; width: number; height: number } {
  const spanRatio = (view.x[1] - view.x[0]) / ((view.y[1] - view.y[0]) * options.yUnitRatio);
  const height = PICTURE.height - PICTURE.top - PICTURE.bottom;
  const width = Math.min(PICTURE.width - 32, height * spanRatio);
  return { left: (PICTURE.width - width) / 2, top: PICTURE.top, width, height: width / spanRatio };
}

/**
 * Draw every line, its stations, and labels for interchanges and termini.
 *
 * @param position - Which position to draw stations at.
 * @param options - The ranges shown and the ratio of a y unit to an x unit on screen.
 * @returns The chart.
 */
function drawNetwork(position: Position, options: { view: { x: [number, number]; y: [number, number] }; yUnitRatio: number }): EChartsOption {
  const grid = fitGrid(options.view, { yUnitRatio: options.yUnitRatio });
  const labelled = findLabelledStations();
  return {
    grid,
    legend: { ...LEGEND, right: undefined, left: grid.left + 8, top: grid.top + 4, data: SUBWAY.lines.map(({ name }) => name) },
    xAxis: { type: "value", min: options.view.x[0], max: options.view.x[1], show: false },
    yAxis: { type: "value", min: options.view.y[0], max: options.view.y[1], show: false },
    series: [
      ...SUBWAY.lines.map((line) => {
        const colour = CATEGORICAL[line.colour_slot] as string;
        return { type: "line" as const, name: line.name, symbol: "circle", symbolSize: STATION_SIZE, lineStyle: { color: colour, width: LINE_WIDTH },
          itemStyle: { color: SURFACE, borderColor: colour, borderWidth: 2 }, data: line.stations.map((name) => SUBWAY.stations[name]?.[position]) };
      }),
      {
        type: "scatter", z: 10, symbolSize: (_value: unknown, parameters: { dataIndex: number }) => ([...labelled.values()][parameters.dataIndex] ? INTERCHANGE_SIZE : 0),
        itemStyle: { color: SURFACE, borderColor: TEXT_PRIMARY, borderWidth: 2 },
        data: [...labelled.keys()].map((name) => {
          const isLeft = SUBWAY.stations[name]?.label_side === "left";
          return { name, value: SUBWAY.stations[name]?.[position],
            label: { show: true, formatter: name, position: isLeft ? "left" : "right", offset: [isLeft ? -2 : 2, -8], fontSize: 10, color: TEXT_PRIMARY } };
        }),
      },
    ],
  };
}

/**
 * Draw the subway at true positions, with the lake for reference.
 *
 * @returns The chart.
 */
export function drawGeographic(): EChartsOption {
  const view = { x: SUBWAY.geographic_view.longitude, y: SUBWAY.geographic_view.latitude };
  const option = drawNetwork("geographic", { view, yUnitRatio: 1 / LONGITUDE_SHRINK });
  const lake = { type: "line" as const, z: 0, symbol: "none", silent: true, lineStyle: { width: 0 }, areaStyle: { color: WATER, opacity: 1, origin: "start" as const }, data: SUBWAY.shoreline };
  return { ...option, series: [lake, ...(option.series as object[])] } as EChartsOption;
}

/**
 * Draw the subway at schematic positions: straight runs, 45-degree turns, even spacing.
 *
 * @returns The chart.
 */
export function drawSchematic(): EChartsOption {
  return drawNetwork("schematic", { view: SCHEMATIC_VIEW, yUnitRatio: 1 });
}

export const TRANSIT_PICTURES: PictureList = {
  "transit/geographic.png": { title: "Transit map, true to geography", draw: drawGeographic },
  "transit/schematic.png": { title: "Transit map, schematic", draw: drawSchematic },
};
