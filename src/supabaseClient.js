
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://twwhcyvsqqzxvfeocmqi.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR3d2hjeXZzcXF6eHZmZW9jbXFpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUyODgzODksImV4cCI6MjA4MDg2NDM4OX0.p-GK-z6TsdToJEU07nxB4k0YeY5jHqTn0p0MoXndHHo'

export const supabase = createClient(supabaseUrl, supabaseKey)
