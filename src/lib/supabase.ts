import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://oyyeublaovgncvktirfp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im95eWV1Ymxhb3ZnbmN2a3RpcmZwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4MjQ0MDksImV4cCI6MjA3MDQwMDQwOX0.iJYMcA3GBMFTKhdWfX1_5WMTeCFiPemqaAKiC8pMcMA'

export const supabase = createClient(supabaseUrl, supabaseKey)