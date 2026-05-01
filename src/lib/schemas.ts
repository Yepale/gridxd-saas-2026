import { z } from "zod";

export const BackendImageSchema = z.object({
  url: z.string().url(),
  name: z.string(),
});

export const ProcessImageResponseSchema = z.object({
  zipUrl: z.string(),
  images: z.array(BackendImageSchema),
  visualStyle: z.record(z.any()).optional(),
});

export type BackendImage = z.infer<typeof BackendImageSchema>;
export type ProcessImageResponse = z.infer<typeof ProcessImageResponseSchema>;
