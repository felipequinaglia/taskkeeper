import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_kEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('FATAL ERROR: Missing Supabase environment variables!');
  console.error('Check your Cloud Run configuration for SUPABASE_URL and SUPABASE_ANON_KEY.');
}

export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const getSupabase = (token) => {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase client not initialized - missing env variables');
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });
};
