/**
 * supabase-admin.ts
 * Server-side Supabase client with elevated privileges via the service_role key.
 * Used for storage operations (uploading/deleting recipe images, avatars, etc.).
 * NEVER expose this client to the browser — service_role bypasses RLS.
 */
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env")
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
