import { createClient } from '@supabase/supabase-js'

// Get Supabase configuration from environment variables
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

const finalUrl = supabaseUrl || 'https://placeholder.supabase.co'
const finalKey = supabaseAnonKey || 'placeholder-key'

export const supabase = createClient(
  finalUrl,
  finalKey,
  {
    functions: {
      url: "https://cdjuvurtttedqkisdyvz.functions.supabase.co"
    }
  }
)

// Export a helper
export const isSupabaseConfigured = () => {
  return !!(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseAnonKey !== 'placeholder-key' &&
    !supabaseUrl.includes('your-project') &&
    !supabaseAnonKey.includes('your-anon-key') &&
    supabaseUrl.startsWith('https://') &&
    supabaseAnonKey.length > 20
  )
}
