import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import type { Database, LeadCible } from '@/supabase/types'

function db() {
  return createClient<Database>(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
  )
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const statut = searchParams.get('statut')
  const cible  = searchParams.get('cible')

  let query = db()
    .from('leads')
    .select('*')
    .eq('source', 'linkedin')
    .order('created_at', { ascending: false })

  if (statut) query = query.eq('statut', statut as 'froid' | 'tiede' | 'chaud')
  if (cible)  query = query.eq('cible',  cible  as LeadCible)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// Import CSV ou JSON de prospects
export async function POST(req: NextRequest) {
  const contentType = req.headers.get('content-type') ?? ''
  let rows: Array<{
    linkedin_url: string
    prenom: string
    nom: string
    email?: string
    entreprise?: string
    poste?: string
    cible: LeadCible
  }>

  if (contentType.includes('application/json')) {
    rows = await req.json()
  } else {
    // CSV: première ligne = headers
    const text = await req.text()
    const lines = text.trim().split('\n')
    const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''))
    rows = lines.slice(1).map(line => {
      const vals = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''))
      return Object.fromEntries(headers.map((h, i) => [h, vals[i]])) as typeof rows[number]
    })
  }

  if (!rows.length) return NextResponse.json({ error: 'Aucune ligne valide' }, { status: 400 })

  const toInsert = rows.map(r => ({
    prenom:       r.prenom  || null,
    nom:          r.nom     || null,
    email:        r.email   || null,
    entreprise:   r.entreprise || null,
    poste:        r.poste   || null,
    cible:        r.cible   || null,
    linkedin_url: r.linkedin_url || null,
    source:       'linkedin' as const,
    statut:       'froid'   as const,
  }))

  const { data, error } = await db().from('leads').insert(toInsert).select()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ imported: data.length, leads: data }, { status: 201 })
}
