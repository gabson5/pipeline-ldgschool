export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      leads: {
        Row: {
          id:           string
          prenom:       string | null
          nom:          string | null
          email:        string | null
          poste:        string | null
          entreprise:   string | null
          statut:       'froid' | 'tiede' | 'chaud' | null
          cible:        'DRH' | 'Dirigeant' | 'CIP' | null
          source:       'linkedin' | 'landing_page' | null
          date_contact: string | null
          notes:        string | null
          created_at:   string
        }
        Insert: {
          id?:          string
          prenom?:      string | null
          nom?:         string | null
          email?:       string | null
          poste?:       string | null
          entreprise?:  string | null
          statut?:      'froid' | 'tiede' | 'chaud' | null
          cible?:       'DRH' | 'Dirigeant' | 'CIP' | null
          source?:      'linkedin' | 'landing_page' | null
          date_contact?: string | null
          notes?:       string | null
          created_at?:  string
        }
        Update: {
          id?:          string
          prenom?:      string | null
          nom?:         string | null
          email?:       string | null
          poste?:       string | null
          entreprise?:  string | null
          statut?:      'froid' | 'tiede' | 'chaud' | null
          cible?:       'DRH' | 'Dirigeant' | 'CIP' | null
          source?:      'linkedin' | 'landing_page' | null
          date_contact?: string | null
          notes?:       string | null
          created_at?:  string
        }
        Relationships: []
      }
    }
    Views:          { [_ in never]: never }
    Functions:      { [_ in never]: never }
    Enums:          { [_ in never]: never }
    CompositeTypes: { [_ in never]: never }
  }
}

// Raccourcis utilitaires
export type Lead       = Database['public']['Tables']['leads']['Row']
export type LeadInsert = Database['public']['Tables']['leads']['Insert']
export type LeadUpdate = Database['public']['Tables']['leads']['Update']

export type LeadStatut = NonNullable<Lead['statut']>   // 'froid' | 'tiede' | 'chaud'
export type LeadCible  = NonNullable<Lead['cible']>    // 'DRH' | 'Dirigeant' | 'CIP'
export type LeadSource = NonNullable<Lead['source']>   // 'linkedin' | 'landing_page'
