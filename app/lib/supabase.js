import { createBrowserClient, createServerClient } from '@supabase/ssr'


export const createClient = () => {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        autoRefreshToken: true,
        persistSession: true
      }
    }
  )
} 


export const createSvrClient = () => {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY,
    {
      cookies: {
        get: () => undefined,
        set: () => {},
        remove: () => {},
        getAll: () => [],
        setAll: () => {}
      }
    }
  )
}