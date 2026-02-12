
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';

const envPath = fs.existsSync('.env.local') ? '.env.local' : '.env';
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
// Use service role key if available for deeper check, but anon is safer to test RLS
// Actually, to check if table exists irrespective of RLS, we might need to rely on typical queries.

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing env vars");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking Database State...");

    // 1. Check if we can connect to profiles
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('count', { count: 'exact', head: true });

    if (profileError) {
        console.error("❌ Error accessing 'profiles' table:", profileError.message);
        if (profileError.code === '42P01') {
            console.error("   (Table does not exist. You MUST run the SQL script!)");
        }
    } else {
        console.log("✅ 'profiles' table exists.");
    }

    // 2. Check Admin User (by email) - Note: Anon key can't list users easily unless authorized
    // We'll just try to sign in again to see specific error
    const { data, error } = await supabase.auth.signInWithPassword({
        email: 'admin@filez.com',
        password: 'Filez2026'
    });

    if (error) {
        console.error("❌ Login Check Failed:", error.message);
    } else {
        console.log("✅ Login Check Successful for admin@filez.com");
        console.log("   User ID:", data.user?.id);

        // Check profile role
        const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user?.id)
            .single();

        console.log("   Profile Role:", profile?.role || 'None (Profile missing)');
    }
}

check();
