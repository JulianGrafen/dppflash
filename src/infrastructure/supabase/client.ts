// src/infrastructure/supabase/client.ts
// Browser-seitiger Supabase-Client (Singleton).
// Wird in Client Components und Browser-Hooks verwendet.

import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './database.types';

export function createSupabaseBrowserClient() {
  return createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
