/** The fields every plot has. */

import { z } from "zod";
import { DATA_TABLE_SCHEMA } from "../table/data_table";

export const COMMON_FIELDS = {
  title: z.string().min(1).optional().describe("The plot's own title."),
  data: DATA_TABLE_SCHEMA.optional().describe("The plot's own table, used instead of the figure's."),
};
