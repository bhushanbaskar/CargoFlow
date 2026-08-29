import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Read .env.local
const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length > 0) {
    env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('--- Seeding Supabase Demo Users ---');

  // 1. Ensure SwiftLog company exists
  let swiftlogId = null;
  const { data: existingSwiftlog } = await supabaseAdmin
    .from('courier_companies')
    .select('id')
    .eq('name', 'SwiftLog Logistics')
    .maybeSingle();

  if (existingSwiftlog) {
    swiftlogId = existingSwiftlog.id;
  } else {
    const { data: createdSwiftlog, error: swError } = await supabaseAdmin
      .from('courier_companies')
      .insert({
        name: 'SwiftLog Logistics',
        legal_name: 'SwiftLog Logistics Private Limited',
        code: 'SWIFTLOG',
        contact_email: 'contact@swiftlog.in',
        contact_phone: '+91 98220 99881',
        address: 'Plot 42, MIDC Ambad',
        city: 'Nashik',
        state: 'Maharashtra',
        status: 'PENDING',
        credit_limit: 100000,
        used_credit: 0,
      })
      .select()
      .single();
    if (swError) console.error('Swiftlog insert error:', swError);
    swiftlogId = createdSwiftlog?.id;
  }

  const demoAccounts = [
    {
      email: 'admin@msrtc.gov.in',
      password: 'password123',
      fullName: 'Rajesh Patil (Super Admin)',
      role: 'SUPER_ADMIN',
      phone: '+91 98220 12345',
      companyId: null,
      depotId: 'DEP001',
    },
    {
      email: 'dispatch@bluedart.com',
      password: 'password123',
      fullName: 'Anand Verma (BlueDart Hub Ops)',
      role: 'COURIER_PARTNER',
      phone: '+91 98230 11223',
      companyId: 'c0000000-0000-0000-0000-000000000001',
      depotId: null,
    },
    {
      email: 'contact@swiftlog.in',
      password: 'password123',
      fullName: 'Priya Sharma (SwiftLog Operations Manager)',
      role: 'COURIER_PARTNER',
      phone: '+91 98220 99881',
      companyId: swiftlogId,
      depotId: null,
    },
    {
      email: 'conductor.nashik@msrtc.gov.in',
      password: 'password123',
      fullName: 'Suresh Pawar (Bus #MH-15-BD-1021 Conductor)',
      role: 'CONDUCTOR',
      phone: '+91 98233 44556',
      companyId: null,
      depotId: 'DEP001',
    },
  ];

  const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
  const existingUsers = userList?.users || [];

  for (const acc of demoAccounts) {
    let userId = null;
    const existing = existingUsers.find(u => u.email?.toLowerCase() === acc.email.toLowerCase());

    if (existing) {
      userId = existing.id;
      const { error: updErr } = await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: acc.password,
        email_confirm: true,
        user_metadata: {
          full_name: acc.fullName,
          role: acc.role,
        },
      });
      if (updErr) console.error(`Error updating user ${acc.email}:`, updErr);
      else console.log(`Updated user ${acc.email} (${userId})`);
    } else {
      const { data: created, error: crtErr } = await supabaseAdmin.auth.admin.createUser({
        email: acc.email,
        password: acc.password,
        email_confirm: true,
        user_metadata: {
          full_name: acc.fullName,
          role: acc.role,
        },
      });
      if (crtErr) console.error(`Error creating user ${acc.email}:`, crtErr);
      else {
        userId = created.user.id;
        console.log(`Created user ${acc.email} (${userId})`);
      }
    }

    if (userId) {
      const { error: pErr } = await supabaseAdmin.from('profiles').upsert({
        id: userId,
        email: acc.email,
        full_name: acc.fullName,
        role: acc.role,
        phone: acc.phone,
        company_id: acc.companyId,
        depot_id: acc.depotId,
      });
      if (pErr) console.error(`Error upserting profile for ${acc.email}:`, pErr);
      else console.log(`Upserted profile for ${acc.email}`);

      if (acc.role === 'CONDUCTOR' && acc.depotId) {
        const { error: condErr } = await supabaseAdmin.from('conductors').upsert({
          profile_id: userId,
          employee_id: 'EMP-MSRTC-1021',
          assigned_depot_id: acc.depotId,
        }, { onConflict: 'employee_id' });
        if (condErr) console.error('Conductor error:', condErr);
        else console.log('Upserted conductor record');
      }
    }
  }

  // Also confirm email for any other existing users
  for (const u of existingUsers) {
    if (u.email && !demoAccounts.find(a => a.email.toLowerCase() === u.email.toLowerCase())) {
      await supabaseAdmin.auth.admin.updateUserById(u.id, { email_confirm: true });
      await supabaseAdmin.from('profiles').upsert({
        id: u.id,
        email: u.email,
        full_name: u.user_metadata?.full_name || u.email.split('@')[0],
        role: u.user_metadata?.role || 'COURIER_PARTNER',
      });
      console.log(`Confirmed and synced existing user ${u.email}`);
    }
  }

  console.log('--- Seeding Complete ---');
}

main().catch(console.error);
