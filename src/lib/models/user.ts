import { z } from "zod";

export const farcasterUserSchema = z.object({
  fid: z.number().min(1),
  username: z.string().min(1),
  displayName: z.string().min(1),
  pfpUrl: z.string().url().or(z.string().min(1)),
});

export type FarcasterUser = z.infer<typeof farcasterUserSchema>;
