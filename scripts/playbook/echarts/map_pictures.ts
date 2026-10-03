/**
 * ECharts pictures for section 2 of the catalogue: map layers and views. Each
 * mirrors the function of the same name in scripts/playbook/plotly/map_pictures.py.
 *
 * Outlines are Natural Earth via world-atlas, as scribble.tube's ECharts maps
 * use. ECharts has no globe, so the globe picture is drawn flat with a notice,
 * which is what scribble.tube does too.
 */

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import contourInstaller from "@echarts-x/custom-contour";
import * as echarts from "echarts";
import type { EChartsOption } from "echarts";
import type { FeatureCollection } from "geojson";
import { feature } from "topojson-client";
import type { GeometryCollection, Topology } from "topojson-specification";
import { BORDER, CATEGORICAL, GRID, LAND, SEQUENTIAL, SURFACE, TEXT_SECONDARY, nameAxis, type PictureList } from "./picture_theme";
import { createSeededRandom, drawNormal, drawUniform } from "./seeded_random";

const RANDOM_SEED = 7;
const WORLD_MAP_NAME = "world";

const topology = JSON.parse(readFileSync(createRequire(import.meta.url).resolve("world-atlas/countries-110m.json"), "utf8")) as Topology<{ countries: GeometryCollection }>;
/** A ring spanning more than this many degrees of longitude wraps across the 180° line. */
const WRAPPING_RING_SPAN = 180;

/**
 * Drop the outline rings that wrap across the 180° line (Russia's far east,
 * Fiji, Antarctica): ECharts draws each as a streak across the whole map.
 *
 * @param collection - The countries.
 * @returns The same countries without wrapping rings.
 */
function dropWrappingRings(collection: FeatureCollection): FeatureCollection {
  const keepsRing = (ring: number[][]): boolean => {
    const longitudes = ring.map(([longitude]) => longitude as number);
    return Math.max(...longitudes) - Math.min(...longitudes) <= WRAPPING_RING_SPAN;
  };
  return { ...collection, features: collection.features.map((country) => {
    const geometry = country.geometry;
    if (geometry.type === "Polygon") return { ...country, geometry: { ...geometry, coordinates: geometry.coordinates.filter(keepsRing) } };
    if (geometry.type === "MultiPolygon") {
      return { ...country, geometry: { ...geometry, coordinates: geometry.coordinates.filter((polygon) => polygon.every(keepsRing)) } };
    }
    return country;
  }) };
}

echarts.registerMap(WORLD_MAP_NAME, dropWrappingRings(feature(topology, topology.objects.countries) as FeatureCollection) as Parameters<typeof echarts.registerMap>[1]);
echarts.use(contourInstaller);

/** Land and borders matching the Plotly maps, kept below the title. */
const GEO_STYLE = { top: 44, bottom: 8, left: 8, right: 8, itemStyle: { areaColor: LAND, borderColor: BORDER, borderWidth: 0.5 }, emphasis: { disabled: true }, silent: true };

/** The height of the band behind the title, which maps would otherwise run under (ECharts does not clip a map to its box). */
const TITLE_BAND_HEIGHT = 40;

/** A surface-coloured band across the top, under the title and over the map. */
const TITLE_BAND = { type: "rect" as const, left: 0, top: 0, z: 100, shape: { width: 10_000, height: TITLE_BAND_HEIGHT }, style: { fill: SURFACE } };

/**
 * Pick a colour along the sequential ramp.
 *
 * @param fraction - 0 (lightest) to 1 (darkest).
 * @returns The nearest ramp step.
 */
function pickSequentialColour(fraction: number): string {
  return SEQUENTIAL[Math.round(Math.min(1, Math.max(0, fraction)) * (SEQUENTIAL.length - 1))] as string;
}

/**
 * Draw city bubbles across Canada, sized and coloured by population.
 *
 * @returns The chart.
 */
export function drawPoints(): EChartsOption {
  const cities: [string, number, number, number][] = [["Toronto", -79.4, 43.7, 6.2], ["Montréal", -73.6, 45.5, 4.3], ["Vancouver", -123.1, 49.3, 2.6],
    ["Calgary", -114.1, 51.0, 1.5], ["Edmonton", -113.5, 53.5, 1.4], ["Ottawa", -75.7, 45.4, 1.5], ["Winnipeg", -97.1, 49.9, 0.8], ["Halifax", -63.6, 44.6, 0.5]];
  return {
    graphic: [TITLE_BAND],
    geo: { map: WORLD_MAP_NAME, boundingCoords: [[-140, 72], [-50, 40]], roam: false, ...GEO_STYLE },
    series: [{
      type: "scatter", coordinateSystem: "geo",
      data: cities.map(([name, longitude, latitude, people]) => ({ name, value: [longitude, latitude], symbolSize: 8 + 4 * people, itemStyle: { color: pickSequentialColour(people / 6.2) } })),
    }],
  };
}

/**
 * Draw where made-up collisions cluster in Toronto, as density contours.
 *
 * @returns The chart.
 */
export function drawDensity(): EChartsOption {
  const random = createSeededRandom(RANDOM_SEED);
  const longitudes = [...drawNormal(random, { mean: -79.39, deviation: 0.03, count: 600 }), ...drawNormal(random, { mean: -79.30, deviation: 0.05, count: 300 })];
  const latitudes = [...drawNormal(random, { mean: 43.66, deviation: 0.02, count: 600 }), ...drawNormal(random, { mean: 43.72, deviation: 0.04, count: 300 })];
  return {
    grid: GRID,
    xAxis: { type: "value", scale: true, ...nameAxis("Longitude", { gap: 28 }) },
    yAxis: { type: "value", scale: true, ...nameAxis("Latitude", { gap: 48 }) },
    series: [{
      type: "custom", renderItem: "contour" as never, coordinateSystem: "cartesian2d",
      itemPayload: { thresholds: 10, bandwidth: 18, itemStyle: { color: SEQUENTIAL, opacity: [0.4, 1] }, lineStyle: { color: TEXT_SECONDARY, width: 0.5 } },
      data: longitudes.map((longitude, index) => [longitude, latitudes[index], 1]),
      encode: { x: 0, y: 1, tooltip: 2 },
    }],
  };
}

/**
 * Draw a made-up value per country across the Americas as a choropleth.
 *
 * @returns The chart.
 */
export function drawRegions(): EChartsOption {
  const countries = ["Canada", "United States of America", "Mexico", "Brazil", "Argentina", "Colombia", "Peru", "Chile", "Venezuela", "Bolivia",
    "Ecuador", "Paraguay", "Uruguay", "Guatemala", "Cuba"];
  const values = drawUniform(createSeededRandom(RANDOM_SEED), { low: 20, high: 90, count: countries.length });
  return {
    graphic: [TITLE_BAND],
    visualMap: { min: 20, max: 90, right: 8, top: "middle", itemHeight: 180, calculable: false, inRange: { color: SEQUENTIAL } },
    series: [{
      type: "map", map: WORLD_MAP_NAME, boundingCoords: [[-170, 75], [-30, -58]], ...GEO_STYLE, right: 72,
      data: countries.map((name, index) => ({ name, value: values[index] })),
    }],
  };
}

/**
 * Draw flights out of Toronto as curved lines, width by passengers.
 *
 * @returns The chart.
 */
export function drawLines(): EChartsOption {
  const toronto = [-79.6, 43.7];
  const places: [string, number, number, number][] = [["Vancouver", -123.2, 49.2, 3], ["London", -0.5, 51.5, 4], ["Paris", 2.5, 49.0, 3],
    ["Mexico City", -99.1, 19.4, 2], ["São Paulo", -46.5, -23.4, 1.5], ["Reykjavík", -22.6, 64.0, 1]];
  return {
    graphic: [TITLE_BAND],
    geo: { map: WORLD_MAP_NAME, boundingCoords: [[-135, 70], [20, -35]], roam: false, ...GEO_STYLE },
    series: [{
      type: "lines", coordinateSystem: "geo",
      data: places.map(([name, longitude, latitude, passengers], index) => ({
        name, coords: [toronto, [longitude, latitude]], lineStyle: { width: 1.5 * passengers, color: CATEGORICAL[index], curveness: 0.25 },
      })),
    }],
  };
}

/**
 * Draw the globe picture's points on a flat world, saying ECharts has no globe.
 *
 * @returns The chart.
 */
export function drawGlobe(): EChartsOption {
  return {
    geo: { map: WORLD_MAP_NAME, roam: false, ...GEO_STYLE, bottom: 32 },
    graphic: [TITLE_BAND, { type: "text", right: 12, bottom: 10, style: { text: "No globe in ECharts: drawn flat", fill: TEXT_SECONDARY, fontSize: 12 } }],
    series: [{
      type: "scatter", coordinateSystem: "geo", symbolSize: 10, itemStyle: { color: CATEGORICAL[0] },
      data: [[-79.4, 43.7], [-0.1, 51.5], [139.7, 35.7], [151.2, -33.9], [-46.6, -23.5]],
    }],
  };
}

export const MAP_PICTURES: PictureList = {
  "maps/points.png": { title: "City populations", draw: drawPoints },
  "maps/density.png": { title: "Collision density", draw: drawDensity },
  "maps/regions.png": { title: "Value by country", draw: drawRegions },
  "maps/lines.png": { title: "Flights from Toronto", draw: drawLines },
  "maps/globe.png": { title: "Globe view", draw: drawGlobe },
};
