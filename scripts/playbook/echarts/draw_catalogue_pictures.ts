/**
 * Draw every ECharts picture in playbook/visualisation_catalogue.md.
 *
 * Run with `npx tsx scripts/playbook/echarts/draw_catalogue_pictures.ts`.
 * Existing pictures are never overwritten: move one to the trash to redraw it.
 *
 * ECharts directly rather than yorkville, because yorkville cannot draw yet;
 * once it can, these pictures should be redrawn by yorkville.
 */

import { existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { CHART_PICTURES } from "./chart_pictures";
import { DISTRIBUTION_AND_TIME_PICTURES } from "./distribution_and_time_pictures";
import { MAP_PICTURES } from "./map_pictures";
import { savePicture, type PictureList } from "./picture_theme";
import { STRUCTURE_AND_COMPARISON_PICTURES } from "./structure_and_comparison_pictures";
import { TRANSIT_PICTURES } from "./transit_pictures";

const PICTURE_DIRECTORY = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..", "playbook", "pictures", "echarts");

/**
 * Draw every catalogue picture that does not exist yet.
 *
 * @param directory - The folder the pictures go in.
 */
export function drawAllPictures(directory: string): void {
  const pictures: PictureList = { ...CHART_PICTURES, ...MAP_PICTURES, ...DISTRIBUTION_AND_TIME_PICTURES, ...STRUCTURE_AND_COMPARISON_PICTURES, ...TRANSIT_PICTURES };
  for (const [relativePath, { title, draw }] of Object.entries(pictures)) {
    const path = join(directory, relativePath);
    if (existsSync(path)) {
      console.info(`kept ${relativePath}`);
      continue;
    }
    savePicture(draw(), { title, path });
    console.info(`drew ${relativePath}`);
  }
}

drawAllPictures(PICTURE_DIRECTORY);
