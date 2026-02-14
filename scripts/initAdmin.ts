
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import fs from 'fs';

// Check for .env or .env.local
const envPath = fs.existsSync('.env.local') ? '.env.local' : '.env';
dotenv.config({ path: envPath });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in env file.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const ADMIN_EMAIL = 'admin@filez.com';
const ADMIN_PASSWORD = 'Filez2026';

async function initAdmin() {
    console.log(`Checking admin user: ${ADMIN_EMAIL}...`);

    // 1. Try to sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
    });

    if (signInData.session) {
        console.log("✅ Admin user already exists and logins successfully.");
        return;
    }

    if (signInError && signInError.message.includes("Email not confirmed")) {
        console.error("❌ User exists but Email is NOT confirmed.");
        console.error("👉 Solution: Run the following SQL in Supabase SQL Editor to confirm manually:");
        console.error(`   UPDATE auth.users SET email_confirmed_at = now() WHERE email = '${ADMIN_EMAIL}';`);
        return;
    }

    // 2. If login failed (and not just unconfirmed), try to create via RPC
    console.log("Attempting to create admin user via RPC (Bypasses email confirmation)...");

    try {
        const { data, error } = await supabase.rpc('create_user_by_admin', {
            email: ADMIN_EMAIL,
            password: ADMIN_PASSWORD,
            user_name: 'System Admin'
        });

        if (error) {
            // If RPC fails (e.g. user already exists but password wrong), log it
            console.error("❌ Failed to create admin via RPC:", error.message);
            console.error("   (If user exists, delete it in Supabase Auth dashboard and try again, or run the SQL update)");
        } else {
            console.log("✅ Admin user created successfully (Verified & Confirmed).");
        }
    } catch (err: any) {
        console.error("Unexpected error:", err.message);
    }
}

initAdmin();
