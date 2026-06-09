import { supabase } from './client'
import type { LeadInsert, Lead } from './types'

export async function insertLead(lead: LeadInsert): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .insert(lead)
    .select()
    .single()

  if (error) throw new Error(`Erreur insertion lead : ${error.message}`)
  return data
}
