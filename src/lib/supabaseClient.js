import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://uyxevgpwurrchgipmvjc.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV5eGV2Z3B3dXJyY2hnaXBtdmpjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDkyMzg1NzAsImV4cCI6MjA2NDgxNDU3MH0.DPHK5iT0M6xkOMfZDfBq5oNjPUQ-dBY-EDx21BL_vn4';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);