import { z } from 'zod';

export const ShareBusinessCardDtoSchema = z.object({
  includePrivate: z.boolean().optional().default(false),
});
export type ShareBusinessCardDto = z.infer<typeof ShareBusinessCardDtoSchema>;

export const ImportFromQrDtoSchema = z.object({
  token: z.string().min(10).max(500),
});
export type ImportFromQrDto = z.infer<typeof ImportFromQrDtoSchema>;
