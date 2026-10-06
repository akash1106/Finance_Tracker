import { z } from "zod";

export const netWorthQuerySchema = z.object({ from: z.coerce.date().optional(), to: z.coerce.date().optional() });