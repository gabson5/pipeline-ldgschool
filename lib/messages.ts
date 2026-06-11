import { readFileSync } from 'fs'
import { join } from 'path'
import type { LeadCible } from '@/supabase/types'

const MESSAGES_DIR = join(process.cwd(), 'messages')

const TEMPLATE_FILES: Record<LeadCible, string> = {
  DRH:      'drh.md',
  Dirigeant: 'dirigeants.md',
  CIP:       'cip.md',
}

export function getFirstContactMessage(cible: LeadCible, prenom: string): string {
  const file = join(MESSAGES_DIR, TEMPLATE_FILES[cible])
  const template = readFileSync(file, 'utf-8')
  return template.replace(/\[Prénom\]/g, prenom).trim()
}
