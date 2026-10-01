// src/app/(dashboard)/layout.tsx
// Geschütztes Layout – Middleware leitet nicht eingeloggte Nutzer weiter.
// Liest Session server-seitig, um Daten ohne Waterfall zu fetchen.
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/infrastructure/supabase/server';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  return <div className="min-h-screen bg-gray-50">{children}</div>;
}
