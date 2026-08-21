import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase admin client using the service role key.
 * NEVER expose this client to the browser — server-side only.
 * Used for candidate_ratings reads/writes where RLS is off
 * and we need the API route to be the security boundary.
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set in environment variables')
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
