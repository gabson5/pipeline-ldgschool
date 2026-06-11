import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/supabase/types'

function db() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
  )
}

export async function GET() {
  const supabase = db()

  const { data: leads, error } = await supabase
    .from('leads')
    .select('statut, invite_sent_at, accepted_at, first_reply_at')
    .eq('source', 'linkedin')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const total       = leads.length
  const invited     = leads.filter(l => l.invite_sent_at).length
  const accepted    = leads.filter(l => l.accepted_at).length
  const replied     = leads.filter(l => l.first_reply_at).length
  const froid       = leads.filter(l => l.statut === 'froid').length
  const tiede       = leads.filter(l => l.statut === 'tiede').length
  const chaud       = leads.filter(l => l.statut === 'chaud').length

  const { data: todayLog } = await supabase
    .from('daily_invites_log')
    .select('count')
    .eq('invite_date', new Date().toISOString().split('T')[0])
    .maybeSingle()

  return NextResponse.json({
    total,
    invited,
    accepted,
    replied,
    tauxAcceptation: invited > 0 ? Math.round((accepted / invited) * 100) : 0,
    tauxReponse:     accepted > 0 ? Math.round((replied  / accepted) * 100) : 0,
    statuts: { froid, tiede, chaud },
    invitesAujourdHui: todayLog?.count ?? 0,
  })
}
