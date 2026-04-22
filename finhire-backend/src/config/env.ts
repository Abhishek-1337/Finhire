import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(4000),
  AI_PORT: z.coerce.number().default(4001),
  DATABASE_URL: z.string().min(1),
  JWT_SECRET: z.string().min(16),
});

export const env = envSchema.parse(process.env);
