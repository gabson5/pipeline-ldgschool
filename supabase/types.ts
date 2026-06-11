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
          id:                    string
          prenom:                string | null
          nom:                   string | null
          email:                 string | null
          poste:                 string | null
          entreprise:            string | null
          statut:                'froid' | 'tiede' | 'chaud' | null
          cible:                 'DRH' | 'Dirigeant' | 'CIP' | null
          source:                'linkedin' | 'landing_page' | null
          date_contact:          string | null
          notes:                 string | null
          linkedin_url:          string | null
          unipile_chat_id:       string | null
          unipile_provider_id:   string | null
          invite_sent_at:        string | null
          accepted_at:           string | null
          first_reply_at:        string | null
          auto_reply_sent_at:    string | null
          relance_1_sent_at:     string | null
          relance_2_sent_at:     string | null
          created_at:            string
        }
        Insert: {
          id?:                   string
          prenom?:               string | null
          nom?:                  string | null
          email?:                string | null
          poste?:                string | null
          entreprise?:           string | null
          statut?:               'froid' | 'tiede' | 'chaud' | null
          cible?:                'DRH' | 'Dirigeant' | 'CIP' | null
          source?:               'linkedin' | 'landing_page' | null
          date_contact?:         string | null
          notes?:                string | null
          linkedin_url?:         string | null
          unipile_chat_id?:      string | null
          unipile_provider_id?:  string | null
          invite_sent_at?:       string | null
          accepted_at?:          string | null
          first_reply_at?:       string | null
          auto_reply_sent_at?:   string | null
          relance_1_sent_at?:    string | null
          relance_2_sent_at?:    string | null
          created_at?:           string
        }
        Update: {
          id?:                   string
          prenom?:               string | null
          nom?:                  string | null
          email?:                string | null
          poste?:                string | null
          entreprise?:           string | null
          statut?:               'froid' | 'tiede' | 'chaud' | null
          cible?:                'DRH' | 'Dirigeant' | 'CIP' | null
          source?:               'linkedin' | 'landing_page' | null
          date_contact?:         string | null
          notes?:                string | null
          linkedin_url?:         string | null
          unipile_chat_id?:      string | null
          unipile_provider_id?:  string | null
          invite_sent_at?:       string | null
          accepted_at?:          string | null
          first_reply_at?:       string | null
          auto_reply_sent_at?:   string | null
          relance_1_sent_at?:    string | null
          relance_2_sent_at?:    string | null
          created_at?:           string
        }
        Relationships: []
      }
      prospection_settings: {
        Row: {
          id:                   string
          cible:                'DRH' | 'Dirigeant' | 'CIP'
          auto_reply_message:   string | null
          relance_1_message:    string | null
          relance_1_delay_days: number
          relance_2_message:    string | null
          relance_2_delay_days: number
          created_at:           string
          updated_at:           string
        }
        Insert: {
          id?:                  string
          cible:                'DRH' | 'Dirigeant' | 'CIP'
          auto_reply_message?:  string | null
          relance_1_message?:   string | null
          relance_1_delay_days?: number
          relance_2_message?:   string | null
          relance_2_delay_days?: number
          created_at?:          string
          updated_at?:          string
        }
        Update: {
          auto_reply_message?:  string | null
          relance_1_message?:   string | null
          relance_1_delay_days?: number
          relance_2_message?:   string | null
          relance_2_delay_days?: number
          updated_at?:          string
        }
        Relationships: []
      }
      daily_invites_log: {
        Row: {
          invite_date: string
          count:       number
        }
        Insert: {
          invite_date?: string
          count?:       number
        }
        Update: {
          count?: number
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

export type Lead                 = Database['public']['Tables']['leads']['Row']
export type LeadInsert           = Database['public']['Tables']['leads']['Insert']
export type LeadUpdate           = Database['public']['Tables']['leads']['Update']
export type ProspectionSettings  = Database['public']['Tables']['prospection_settings']['Row']
export type DailyInvitesLog      = Database['public']['Tables']['daily_invites_log']['Row']

export type LeadStatut = NonNullable<Lead['statut']>
export type LeadCible  = NonNullable<Lead['cible']>
export type LeadSource = NonNullable<Lead['source']>
