-- =============================================================================
-- Gefahrstoff-QR: Initial Schema
-- Migration: 001_initial_schema
-- Beschreibung: Kern-Tabellen für Multi-Tenant Gefahrstoffverzeichnis
-- =============================================================================

-- Hilfsfunktion: Liest company_id des eingeloggten Nutzers aus profiles.
-- Wird von allen RLS-Policies wiederverwendet → Single Point of Change.
CREATE OR REPLACE FUNCTION public.get_user_company_id()
RETURNS uuid
LANGUAGE sql
STABLE          -- kein VOLATILE, damit PostgreSQL ihn im Query-Plan cachen kann
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT company_id
  FROM public.profiles
  WHERE id = auth.uid()
  LIMIT 1;
$$;

-- =============================================================================
-- ENUMS
-- =============================================================================

CREATE TYPE public.plan_status AS ENUM ('free', 'pro', 'enterprise');
CREATE TYPE public.user_role    AS ENUM ('admin', 'viewer');

-- =============================================================================
-- TABELLE: companies
-- Oberste Mandanten-Ebene. Jede Row repräsentiert ein Unternehmen (Tenant).
-- =============================================================================

CREATE TABLE public.companies (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name         text        NOT NULL CHECK (char_length(name) BETWEEN 2 AND 200),
  plan_status  public.plan_status NOT NULL DEFAULT 'free',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE  public.companies IS 'Mandanten/Tenants — ein Eintrag pro Unternehmen.';
COMMENT ON COLUMN public.companies.plan_status IS 'Abrechnungs-Tier des Unternehmens.';

-- =============================================================================
-- TABELLE: profiles
-- Erweiterung von auth.users um Mandanten-Zugehörigkeit und Rolle.
-- Wird via Supabase-Trigger automatisch bei Registrierung befüllt.
-- =============================================================================

CREATE TABLE public.profiles (
  id           uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  company_id   uuid        NOT NULL REFERENCES public.companies(id) ON DELETE RESTRICT,
  role         public.user_role NOT NULL DEFAULT 'viewer',
  full_name    text        CHECK (char_length(full_name) <= 200),
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_profiles_company_id ON public.profiles(company_id);

COMMENT ON TABLE  public.profiles IS 'Erweitertes Nutzerprofil; 1:1 zu auth.users.';
COMMENT ON COLUMN public.profiles.role IS 'admin = Vollzugriff; viewer = nur lesend.';

-- =============================================================================
-- TABELLE: locations
-- Lagerorte innerhalb eines Unternehmens (Regal, Raum, Gebäude …).
-- company_id stellt die Tenant-Isolation sicher.
-- =============================================================================

CREATE TABLE public.locations (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id   uuid        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name         text        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 200),
  description  text,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_locations_company_id ON public.locations(company_id);

COMMENT ON TABLE public.locations IS 'Physische Lagerorte für Gefahrstoffe je Mandant.';

-- =============================================================================
-- TABELLE: substances
-- Kernentität: ein Gefahrstoffeintrag je Mandant.
-- qr_uuid  → wird in QR-Codes codiert; öffentlich zugänglich (kein Tenant-Leak).
-- sdb_url  → Sicherheitsdatenblatt (Safety Data Sheet)
-- ba_url   → Betriebsanweisung
-- =============================================================================

CREATE TABLE public.substances (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id     uuid        NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  location_id    uuid        REFERENCES public.locations(id) ON DELETE SET NULL,
  created_by     uuid        REFERENCES public.profiles(id) ON DELETE SET NULL,

  -- Inhaltliche Felder
  name           text        NOT NULL CHECK (char_length(name) BETWEEN 1 AND 300),
  manufacturer   text        NOT NULL CHECK (char_length(manufacturer) BETWEEN 1 AND 200),
  cas_number     text,                                        -- optional, z.B. "67-64-1"
  qr_uuid        uuid        NOT NULL UNIQUE DEFAULT gen_random_uuid(), -- für QR-Link
  sdb_url        text        CHECK (sdb_url ~ '^https?://'),
  ba_url         text        CHECK (ba_url  ~ '^https?://'),
  last_review    date,

  created_at     timestamptz NOT NULL DEFAULT now(),
  updated_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_substances_company_id  ON public.substances(company_id);
CREATE INDEX idx_substances_location_id ON public.substances(location_id);
CREATE INDEX idx_substances_qr_uuid     ON public.substances(qr_uuid);    -- QR-Lookup

COMMENT ON TABLE  public.substances IS 'Gefahrstoffeinträge eines Mandanten.';
COMMENT ON COLUMN public.substances.qr_uuid     IS 'Öffentlicher UUID in QR-Codes; enthüllt keine Tenant-ID.';
COMMENT ON COLUMN public.substances.last_review IS 'Datum der letzten Gefährdungsbeurteilung (GefStoffV §6).';

-- =============================================================================
-- TRIGGER: updated_at automatisch pflegen
-- =============================================================================

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_companies_updated_at
  BEFORE UPDATE ON public.companies
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_locations_updated_at
  BEFORE UPDATE ON public.locations
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER trg_substances_updated_at
  BEFORE UPDATE ON public.substances
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- TRIGGER: Profil automatisch bei auth.users-Registrierung anlegen
-- WICHTIG: company_id muss beim Sign-Up als user_metadata mitgegeben werden.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, company_id, full_name)
  VALUES (
    NEW.id,
    (NEW.raw_user_meta_data->>'company_id')::uuid,
    NEW.raw_user_meta_data->>'full_name'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- ROW LEVEL SECURITY (RLS)
-- Prinzip: Nutzer sehen und mutieren ausschließlich Daten ihrer company_id.
--          Admins dürfen schreiben; Viewer nur lesen.
-- =============================================================================

ALTER TABLE public.companies  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.locations  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.substances ENABLE ROW LEVEL SECURITY;

-- --- companies ---------------------------------------------------------------

-- Lesen: eigene Company
CREATE POLICY "companies_select_own"
  ON public.companies FOR SELECT
  USING (id = public.get_user_company_id());

-- Schreiben (INSERT/UPDATE/DELETE): nur Admins
CREATE POLICY "companies_insert_admin"
  ON public.companies FOR INSERT
  WITH CHECK (
    id = public.get_user_company_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "companies_update_admin"
  ON public.companies FOR UPDATE
  USING (id = public.get_user_company_id())
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- --- profiles ----------------------------------------------------------------

-- Nutzer lesen alle Profile ihrer eigenen Company (für Nutzerverwaltung)
CREATE POLICY "profiles_select_own_company"
  ON public.profiles FOR SELECT
  USING (company_id = public.get_user_company_id());

-- Jeder Nutzer darf sein eigenes Profil updaten (z.B. full_name)
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- Admins dürfen Rollen anderer Nutzer in ihrer Company ändern
CREATE POLICY "profiles_update_admin"
  ON public.profiles FOR UPDATE
  USING (
    company_id = public.get_user_company_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles AS me
      WHERE me.id = auth.uid() AND me.role = 'admin'
    )
  );

-- --- locations ---------------------------------------------------------------

CREATE POLICY "locations_select_own_company"
  ON public.locations FOR SELECT
  USING (company_id = public.get_user_company_id());

CREATE POLICY "locations_insert_admin"
  ON public.locations FOR INSERT
  WITH CHECK (
    company_id = public.get_user_company_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "locations_update_admin"
  ON public.locations FOR UPDATE
  USING (company_id = public.get_user_company_id())
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "locations_delete_admin"
  ON public.locations FOR DELETE
  USING (
    company_id = public.get_user_company_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- --- substances --------------------------------------------------------------

CREATE POLICY "substances_select_own_company"
  ON public.substances FOR SELECT
  USING (company_id = public.get_user_company_id());

CREATE POLICY "substances_insert_admin"
  ON public.substances FOR INSERT
  WITH CHECK (
    company_id = public.get_user_company_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "substances_update_admin"
  ON public.substances FOR UPDATE
  USING (company_id = public.get_user_company_id())
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "substances_delete_admin"
  ON public.substances FOR DELETE
  USING (
    company_id = public.get_user_company_id()
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- =============================================================================
-- ÖFFENTLICHER QR-LOOKUP (ohne Auth)
-- Separates View + Policy, damit der QR-Scan ohne Login funktioniert,
-- aber KEINE Tenant-Daten preisgibt.
-- =============================================================================

CREATE OR REPLACE VIEW public.substance_qr_public AS
  SELECT
    s.qr_uuid,
    s.name,
    s.manufacturer,
    s.cas_number,
    s.sdb_url,
    s.ba_url,
    s.last_review,
    l.name AS location_name
  FROM public.substances s
  LEFT JOIN public.locations l ON l.id = s.location_id;

-- anon-Rolle darf nur über qr_uuid lesen (kein company_id-Leak)
GRANT SELECT ON public.substance_qr_public TO anon;
