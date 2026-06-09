import { createClient } from '@supabase/supabase-js'
import type { Database } from './types'

const supabaseUrl  = process.env.SUPABASE_URL!
const supabaseKey  = process.env.SUPABASE_PUBLISHABLE_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)
