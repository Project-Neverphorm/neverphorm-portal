// lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL! // TypeScript wants to makse sure these env variables are never undefined using !
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // Without the '!' in there ts would throw a warning.

export const supabase = createClient(supabaseUrl, supabaseAnonKey)