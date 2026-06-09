import { supabase } from './client'
import type { LeadInsert, Lead, LeadStatut, LeadCible } from './types'

export async function insertLead(lead: LeadInsert): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .insert(lead)
    .select()
    .single()

  if (error) throw new Error(`Erreur insertion lead : ${error.message}`)
  return data
}

export async function getLeads(filters?: {
  statut?: LeadStatut
  cible?: LeadCible
}): Promise<Lead[]> {
  let query = supabase.from('leads').select('*').order('created_at', { ascending: false })

  if (filters?.statut) query = query.eq('statut', filters.statut)
  if (filters?.cible)  query = query.eq('cible',  filters.cible)

  const { data, error } = await query

  if (error) throw new Error(`Erreur récupération leads : ${error.message}`)
  return data
}

export async function updateLeadStatut(id: string, statut: LeadStatut): Promise<Lead> {
  const { data, error } = await supabase
    .from('leads')
    .update({ statut })
    .eq('id', id)
    .select()
    .single()

  if (error) throw new Error(`Erreur mise à jour statut : ${error.message}`)
  return data
}
