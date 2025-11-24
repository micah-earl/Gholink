import { createClient } from '@supabase/supabase-js'

// Get Supabase configuration from environment variables
// Vite automatically loads .env.local, .env.development, .env, etc.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Check if environment variables are set
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Supabase environment variables not found!')
  console.warn('Please create a .env.local file with:')
  console.warn('VITE_SUPABASE_URL=https://your-project-id.supabase.co')
  console.warn('VITE_SUPABASE_ANON_KEY=your-anon-key')
  console.warn('Then restart your dev server.')
}

// Use fallback values only for development (will show errors when trying to use)
const finalUrl = supabaseUrl || 'https://placeholder.supabase.co'
const finalKey = supabaseAnonKey || 'placeholder-key'

export const supabase = createClient(finalUrl, finalKey)

// Export a helper to check if Supabase is configured
export const isSupabaseConfigured = () => {
  return !!(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseAnonKey !== 'placeholder-key' &&
    !supabaseUrl.includes('your-project') &&
    !supabaseAnonKey.includes('your-anon-key') &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20 // Real keys are much longer
  )
}

