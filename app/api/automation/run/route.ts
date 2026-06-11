import { NextResponse } from 'next/server'
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

async function getTodayCount(supabase: ReturnType<typeof db>, today: string) {
  const { data } = await supabase
    .from('daily_invites_log')
    .select('count')
    .eq('invite_date', today)
    .maybeSingle()
  return data?.count ?? 0
}

async function sendUnipileMessage(chatId: string, text: string) {
  const BASE_URL = `https://${process.env.UNIPILE_DSN}`
  const form = new FormData()
  form.append('text', text)
  const res = await fetch(`${BASE_URL}/api/v1/chats/${chatId}/messages`, {
    method:  'POST',
    headers: { 'X-API-KEY': process.env.UNIPILE_API_KEY! },
    body:    form,
  })
  return res.ok ? await res.json() : null
}

export async function POST() {
  const supabase  = db()
  const today     = new Date().toISOString().split('T')[0]
  const todayDate = new Date(today)

  const results = {
    invitesSent:     0,
    autoRepliesSent: 0,
    relance1Sent:    0,
    relance2Sent:    0,
    errors:          [] as string[],
  }

  // ── 1. Invitations en attente ───────────────────────────────────────────────
  let todayCount = await getTodayCount(supabase, today)
  const remaining = DAILY_LIMIT - todayCount

  if (remaining > 0) {
    const { data: pending } = await supabase
      .from('leads')
      .select('*')
      .eq('source', 'linkedin')
      .is('invite_sent_at', null)
      .not('unipile_provider_id', 'is', null)
      .not('cible', 'is', null)
      .limit(remaining)

    for (const lead of pending ?? []) {
      const message = getFirstContactMessage(lead.cible as LeadCible, lead.prenom ?? 'vous')
      const BASE_URL = `https://${process.env.UNIPILE_DSN}`
      const form = new FormData()
      form.append('account_id',      process.env.UNIPILE_ACCOUNT_ID!)
      form.append('attendees_ids[]', lead.unipile_provider_id!)
      form.append('text',            message)

      const res = await fetch(`${BASE_URL}/api/v1/chats`, {
        method:  'POST',
        headers: { 'X-API-KEY': process.env.UNIPILE_API_KEY! },
        body:    form,
      })

      if (res.ok) {
        const data = await res.json()
        await supabase.from('leads').update({
          invite_sent_at:  new Date().toISOString(),
          unipile_chat_id: data.chat_id ?? null,
          date_contact:    today,
        }).eq('id', lead.id)
        todayCount++
        results.invitesSent++
      } else {
        results.errors.push(`invite ${lead.id}: ${res.status}`)
      }
    }

    await supabase.from('daily_invites_log').upsert(
      { invite_date: today, count: todayCount },
      { onConflict: 'invite_date' },
    )
  }

  // ── 2. Récupérer les settings ───────────────────────────────────────────────
  const { data: settings } = await supabase.from('prospection_settings').select('*')
  const settingsMap = Object.fromEntries((settings ?? []).map(s => [s.cible, s]))

  // ── 3. Réponse automatique après acceptation ────────────────────────────────
  const { data: accepted } = await supabase
    .from('leads')
    .select('*')
    .not('accepted_at', 'is', null)
    .is('auto_reply_sent_at', null)
    .not('unipile_chat_id', 'is', null)

  for (const lead of accepted ?? []) {
    const cfg = settingsMap[lead.cible!]
    if (!cfg?.auto_reply_message) continue

    const text = cfg.auto_reply_message.replace(/\[Prénom\]/g, lead.prenom ?? 'vous')
    const sent = await sendUnipileMessage(lead.unipile_chat_id!, text)
    if (sent) {
      await supabase.from('leads').update({ auto_reply_sent_at: new Date().toISOString() }).eq('id', lead.id)
      results.autoRepliesSent++
    }
  }

  // ── 4. Relance 1 ────────────────────────────────────────────────────────────
  const { data: toRelance1 } = await supabase
    .from('leads')
    .select('*')
    .not('accepted_at', 'is', null)
    .is('first_reply_at', null)
    .is('relance_1_sent_at', null)
    .not('unipile_chat_id', 'is', null)

  for (const lead of toRelance1 ?? []) {
    const cfg = settingsMap[lead.cible!]
    if (!cfg?.relance_1_message) continue

    const acceptedDate = new Date(lead.accepted_at!)
    const daysSince = Math.floor((todayDate.getTime() - acceptedDate.getTime()) / 86400000)
    if (daysSince < cfg.relance_1_delay_days) continue

    const text = cfg.relance_1_message.replace(/\[Prénom\]/g, lead.prenom ?? 'vous')
    const sent = await sendUnipileMessage(lead.unipile_chat_id!, text)
    if (sent) {
      await supabase.from('leads').update({ relance_1_sent_at: new Date().toISOString() }).eq('id', lead.id)
      results.relance1Sent++
    }
  }

  // ── 5. Relance 2 ────────────────────────────────────────────────────────────
  const { data: toRelance2 } = await supabase
    .from('leads')
    .select('*')
    .not('relance_1_sent_at', 'is', null)
    .is('first_reply_at', null)
    .is('relance_2_sent_at', null)
    .not('unipile_chat_id', 'is', null)

  for (const lead of toRelance2 ?? []) {
    const cfg = settingsMap[lead.cible!]
    if (!cfg?.relance_2_message) continue

    const relance1Date = new Date(lead.relance_1_sent_at!)
    const daysSince = Math.floor((todayDate.getTime() - relance1Date.getTime()) / 86400000)
    if (daysSince < cfg.relance_2_delay_days) continue

    const text = cfg.relance_2_message.replace(/\[Prénom\]/g, lead.prenom ?? 'vous')
    const sent = await sendUnipileMessage(lead.unipile_chat_id!, text)
    if (sent) {
      await supabase.from('leads').update({ relance_2_sent_at: new Date().toISOString() }).eq('id', lead.id)
      results.relance2Sent++
    }
  }

  return NextResponse.json(results)
}
