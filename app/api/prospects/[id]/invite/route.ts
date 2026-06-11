import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getFirstContactMessage } from '@/lib/messages'
import type { Database, LeadCible } from '@/supabase/types'

const DAILY_LIMIT = 15

function db() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
  )
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const supabase = db()

  // Vérifier la limite quotidienne
  const today = new Date().toISOString().split('T')[0]
  const { data: logRow } = await supabase
    .from('daily_invites_log')
    .select('count')
    .eq('invite_date', today)
    .maybeSingle()

  const todayCount = logRow?.count ?? 0
  if (todayCount >= DAILY_LIMIT) {
    return NextResponse.json(
      { error: `Limite quotidienne LinkedIn atteinte (${DAILY_LIMIT}/jour)` },
      { status: 429 },
    )
  }

  // Récupérer le prospect
  const { data: lead, error: fetchErr } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single()

  if (fetchErr || !lead) return NextResponse.json({ error: 'Prospect introuvable' }, { status: 404 })
  if (lead.invite_sent_at) return NextResponse.json({ error: 'Invitation déjà envoyée' }, { status: 409 })
  if (!lead.unipile_provider_id) return NextResponse.json({ error: 'unipile_provider_id manquant' }, { status: 422 })
  if (!lead.cible) return NextResponse.json({ error: 'Cible manquante' }, { status: 422 })

  const message = getFirstContactMessage(lead.cible as LeadCible, lead.prenom ?? 'vous')

  // Appel Unipile
  const BASE_URL = `https://${process.env.UNIPILE_DSN}`
  const form = new FormData()
  form.append('account_id',      process.env.UNIPILE_ACCOUNT_ID!)
  form.append('attendees_ids[]', lead.unipile_provider_id)
  form.append('text',            message)

  const uniRes = await fetch(`${BASE_URL}/api/v1/chats`, {
    method:  'POST',
    headers: { 'X-API-KEY': process.env.UNIPILE_API_KEY! },
    body:    form,
  })

  if (!uniRes.ok) {
    const err = await uniRes.json().catch(() => ({}))
    return NextResponse.json(
      { error: `Unipile ${uniRes.status}: ${err?.detail ?? uniRes.statusText}` },
      { status: 502 },
    )
  }

  const uniData = await uniRes.json()
  const now = new Date().toISOString()

  // Mise à jour en parallèle : lead + compteur journalier
  await Promise.all([
    supabase.from('leads').update({
      invite_sent_at:      now,
      unipile_chat_id:     uniData.chat_id   ?? null,
      date_contact:        today,
    }).eq('id', id),

    supabase.from('daily_invites_log').upsert(
      { invite_date: today, count: todayCount + 1 },
      { onConflict: 'invite_date' },
    ),
  ])

  return NextResponse.json({ ok: true, chat_id: uniData.chat_id, message_id: uniData.message_id })
}
