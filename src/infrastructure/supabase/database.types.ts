// src/infrastructure/supabase/database.types.ts
// Manuell gepflegte DB-Typen bis `supabase gen types typescript` verfügbar ist.
// Bei jeder Schema-Änderung aktualisieren (oder durch generierten Output ersetzen).

export type Database = {
  public: {
    Tables: {
      companies: {
        Row: {
          id:          string;
          name:        string;
          plan_status: 'free' | 'pro' | 'enterprise';
          created_at:  string;
          updated_at:  string;
        };
        Insert: {
          id?:         string;
          name:        string;
          plan_status?: 'free' | 'pro' | 'enterprise';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?:        string;
          plan_status?: 'free' | 'pro' | 'enterprise';
          updated_at?:  string;
        };
      };
      profiles: {
        Row: {
          id:         string;
          company_id: string;
          role:       'admin' | 'viewer';
          full_name:  string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id:          string;
          company_id:  string;
          role?:       'admin' | 'viewer';
          full_name?:  string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          role?:       'admin' | 'viewer';
          full_name?:  string | null;
          updated_at?: string;
        };
      };
      locations: {
        Row: {
          id:          string;
          company_id:  string;
          name:        string;
          description: string | null;
          created_at:  string;
          updated_at:  string;
        };
        Insert: {
          id?:         string;
          company_id:  string;
          name:        string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?:        string;
          description?: string | null;
          updated_at?:  string;
        };
      };
      substances: {
        Row: {
          id:           string;
          company_id:   string;
          qr_uuid:      string;
          location_id:  string | null;
          created_by:   string | null;
          name:         string;
          manufacturer: string;
          cas_number:   string | null;
          sdb_url:      string | null;
          ba_url:       string | null;
          last_review:  string | null;
          created_at:   string;
          updated_at:   string;
        };
        Insert: {
          id?:          string;
          company_id:   string;
          qr_uuid?:     string;
          location_id?: string | null;
          created_by?:  string | null;
          name:         string;
          manufacturer: string;
          cas_number?:  string | null;
          sdb_url?:     string | null;
          ba_url?:      string | null;
          last_review?: string | null;
          created_at?:  string;
          updated_at?:  string;
        };
        Update: {
          location_id?:  string | null;
          name?:         string;
          manufacturer?: string;
          cas_number?:   string | null;
          sdb_url?:      string | null;
          ba_url?:       string | null;
          last_review?:  string | null;
          updated_at?:   string;
        };
      };
    };
    Views: {
      substance_qr_public: {
        Row: {
          qr_uuid:       string;
          name:          string;
          manufacturer:  string;
          cas_number:    string | null;
          sdb_url:       string | null;
          ba_url:        string | null;
          last_review:   string | null;
          location_name: string | null;
        };
      };
    };
    Enums: {
      plan_status: 'free' | 'pro' | 'enterprise';
      user_role:   'admin' | 'viewer';
    };
  };
};
