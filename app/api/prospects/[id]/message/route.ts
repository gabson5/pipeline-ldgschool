import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database, LeadUpdate } from '@/supabase/types'

function db() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
  )
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  const { text, type } = await req.json() as { text: string; type: 'auto_reply' | 'relance_1' | 'relance_2' }

  if (!text) return NextResponse.json({ error: 'text requis' }, { status: 400 })
  if (!type) return NextResponse.json({ error: 'type requis' }, { status: 400 })

  const supabase = db()
  const { data: lead, error: fetchErr } = await supabase
    .from('leads')
    .select('unipile_chat_id, unipile_provider_id, prenom')
    .eq('id', id)
    .single()

  if (fetchErr || !lead) return NextResponse.json({ error: 'Prospect introuvable' }, { status: 404 })

  const chatId     = lead.unipile_chat_id
  const providerId = lead.unipile_provider_id

  if (!chatId && !providerId) {
    return NextResponse.json({ error: 'Aucun chat_id ni provider_id disponible' }, { status: 422 })
  }

  const BASE_URL = `https://${process.env.UNIPILE_DSN}`
  const form = new FormData()
  form.append('text', text)

  let url: string
  if (chatId) {
    url = `${BASE_URL}/api/v1/chats/${chatId}/messages`
  } else {
    form.append('account_id',      process.env.UNIPILE_ACCOUNT_ID!)
    form.append('attendees_ids[]', providerId!)
    url = `${BASE_URL}/api/v1/chats`
  }

  const uniRes = await fetch(url, {
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
  const now     = new Date().toISOString()

  const patch: LeadUpdate =
    type === 'auto_reply' ? { auto_reply_sent_at: now } :
    type === 'relance_1'  ? { relance_1_sent_at:  now } :
                            { relance_2_sent_at:  now }

  if (uniData.chat_id && !chatId) patch.unipile_chat_id = uniData.chat_id

  await supabase.from('leads').update(patch).eq('id', id)

  return NextResponse.json({ ok: true, message_id: uniData.message_id })
}
