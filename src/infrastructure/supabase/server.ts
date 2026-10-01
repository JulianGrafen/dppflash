// src/infrastructure/supabase/server.ts
// Server-seitiger Supabase-Client (Next.js App Router, Server Components & Actions).
// Liest/setzt Cookies über die Next.js cookies()-API, damit Auth-Tokens
// korrekt weitergeleitet werden.

import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import type { Database } from './database.types';

export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        },
      },
    },
  );
}

// Service-Role-Client: NUR für vertrauenswürdige Server-Operationen
// (z.B. Admin-Aktionen, Migrations-Scripts). Niemals im Browser verwenden!
export function createSupabaseServiceClient() {
  const { createClient } = require('@supabase/supabase-js'); // lazy import – kein Bundle-Leak
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
