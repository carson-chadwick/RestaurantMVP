import { z } from "zod";

const supabaseConfigSchema = z.object({
  url: z.url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL."),
  publishableKey: z
    .string()
    .trim()
    .min(1, "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY is required."),
});

export type SupabaseConfig = z.infer<typeof supabaseConfigSchema>;

export function getSupabaseConfig(): SupabaseConfig {
  return supabaseConfigSchema.parse({
    url: process.env.NEXT_PUBLIC_SUPABASE_URL,
    publishableKey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
  });
}
