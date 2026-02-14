
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("Supabase URL or Anon Key is missing. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env.local file.");
}

export const supabase = createClient(supabaseUrl || '', supabaseAnonKey || '');


// Types for Database (Optional, but good for TS)
export type Database = {
  public: {
    Tables: {
      prompt_configurations: {
        Row: {
          id: string
          category: string
          option_id: string
          name: string
          description: string | null
          extra_data: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          category: string
          option_id: string
          name: string
          description?: string | null
          extra_data?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          category?: string
          option_id?: string
          name?: string
          description?: string | null
          extra_data?: any
          created_at?: string
          updated_at?: string
        }
      }
      generated_prompts: {
        Row: {
          id: string
          prompt_content: string
          settings: any
          created_at: string
        }
        Insert: {
          id?: string
          prompt_content: string
          settings: any
          created_at?: string
        }
        Update: {
          id?: string
          prompt_content?: string
          settings?: any
          created_at?: string
        }
      }
    }
  }
}
