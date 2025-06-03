import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://iodmbagkouihqpmtqhgs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlvZG1iYWdrb3VpaHFwbXRxaGdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg4NzQ3MDMsImV4cCI6MjA2NDQ1MDcwM30.6nRDfUe50YSHernpLnk8UQ-ar6_cnct1k_020MvuCOs';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);