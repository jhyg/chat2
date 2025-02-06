// src/supabase.js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nhyksjvhlprdvtprcwls.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5oeWtzanZobHByZHZ0cHJjd2xzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg4MjU2MzIsImV4cCI6MjA1NDQwMTYzMn0.ttbs77TzhICmdcxmPnyj4ziBHvpnV49LDPNTIFCfMjE'
export const supabase = createClient(supabaseUrl, supabaseKey)