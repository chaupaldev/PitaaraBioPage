import { z } from "zod";


export const linkSchema = z.object({
    url: z.string().url("Invalid URL format"),
    thumbnail: z.string().url("Invalid thumbnail URL format").optional(),
  });