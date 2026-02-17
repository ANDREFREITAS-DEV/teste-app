import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// SUBSTITUA PELAS SUAS CHAVES DO SUPABASE (Pegue em Project Settings > API)
const SUPABASE_URL = 'https://mhgstfuguvcpovuycwwj.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1oZ3N0ZnVndXZjcG92dXljd3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg2NzgxNTcsImV4cCI6MjA4NDI1NDE1N30.qRgaaoCaU41nnKBd8DsX0loB3CFmkj3mLjvUqsiuzzU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);