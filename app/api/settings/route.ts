import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/supabase/types'

function db() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
  )
}

export async function GET() {
  const { data, error } = await db()
    .from('prospection_settings')
    .select('*')
    .order('cible')

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

export async function PUT(req: NextRequest) {
  const body = await req.json()
  const { cible, auto_reply_message, relance_1_message, relance_1_delay_days, relance_2_message, relance_2_delay_days } = body

  if (!cible) return NextResponse.json({ error: 'cible requis' }, { status: 400 })

  const { data, error } = await db()
    .from('prospection_settings')
    .update({ auto_reply_message, relance_1_message, relance_1_delay_days, relance_2_message, relance_2_delay_days, updated_at: new Date().toISOString() })
    .eq('cible', cible)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
