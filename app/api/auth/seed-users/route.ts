import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

const DEMO_ACCOUNTS = [
  {
    email: 'admin@msrtc.gov.in',
    password: 'password123',
    fullName: 'Rajesh Patil (Super Admin)',
    role: 'SUPER_ADMIN' as const,
    phone: '+91 98220 12345',
    companyCode: null,
    companyName: null,
    companyStatus: null,
    depotId: 'DEP001',
  },
  {
    email: 'dispatch@bluedart.com',
    password: 'password123',
    fullName: 'Anand Verma (BlueDart Hub Ops)',
    role: 'COURIER_PARTNER' as const,
    phone: '+91 98230 11223',
    companyId: 'c0000000-0000-0000-0000-000000000001',
    companyName: 'BlueDart Express',
    companyStatus: 'ACTIVE' as const,
    depotId: null,
  },
  {
    email: 'contact@swiftlog.in',
    password: 'password123',
    fullName: 'Priya Sharma (SwiftLog Operations Manager)',
    role: 'COURIER_PARTNER' as const,
    phone: '+91 98220 99881',
    companyCode: 'SWIFTLOG',
    companyName: 'SwiftLog Logistics',
    companyStatus: 'PENDING' as const,
    depotId: null,
  },
  {
    email: 'conductor.nashik@msrtc.gov.in',
    password: 'password123',
    fullName: 'Suresh Pawar (Bus #MH-15-BD-1021 Conductor)',
    role: 'CONDUCTOR' as const,
    phone: '+91 98233 44556',
    companyCode: null,
    companyName: null,
    companyStatus: null,
    depotId: 'DEP001',
  },
];

export async function GET(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    const results = [];

    // Ensure SwiftLog pending company exists
    const { data: existingSwiftlog } = await supabaseAdmin
      .from('courier_companies')
      .select('id')
      .eq('name', 'SwiftLog Logistics')
      .maybeSingle();

    let swiftlogCompanyId = existingSwiftlog?.id;
    if (!swiftlogCompanyId) {
      const { data: createdSwiftlog } = await supabaseAdmin
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
      swiftlogCompanyId = createdSwiftlog?.id;
    }

    const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
    const existingUsers = userList?.users || [];

    for (const acc of DEMO_ACCOUNTS) {
      const normalizedEmail = acc.email.toLowerCase();
      let userId: string | null = null;
      const found = existingUsers.find((u) => u.email?.toLowerCase() === normalizedEmail);

      if (found) {
        userId = found.id;
        await supabaseAdmin.auth.admin.updateUserById(userId, {
          password: acc.password,
          email_confirm: true,
          user_metadata: {
            full_name: acc.fullName,
            role: acc.role,
          },
        });
      } else {
        const { data: created, error } = await supabaseAdmin.auth.admin.createUser({
          email: normalizedEmail,
          password: acc.password,
          email_confirm: true,
          user_metadata: {
            full_name: acc.fullName,
            role: acc.role,
          },
        });
        if (created?.user) {
          userId = created.user.id;
        } else {
          console.error(`Failed to create ${acc.email}:`, error);
        }
      }

      if (userId) {
        let assignedCompanyId: string | null = null;
        if (acc.companyId) {
          assignedCompanyId = acc.companyId;
        } else if (acc.companyCode === 'SWIFTLOG') {
          assignedCompanyId = swiftlogCompanyId || null;
        }

        const { error: profileErr } = await supabaseAdmin.from('profiles').upsert({
          id: userId,
          email: normalizedEmail,
          full_name: acc.fullName,
          role: acc.role,
          phone: acc.phone,
          company_id: assignedCompanyId,
          depot_id: acc.depotId,
        });

        if (acc.role === 'CONDUCTOR' && acc.depotId) {
          await supabaseAdmin.from('conductors').upsert(
            {
              profile_id: userId,
              employee_id: 'EMP-MSRTC-1021',
              assigned_depot_id: acc.depotId,
            },
            { onConflict: 'employee_id' }
          );
        }

        results.push({ email: acc.email, status: profileErr ? 'error' : 'ok', userId });
      }
    }

    // Also sync any other existing users in auth.users to profiles if they don't have one
    for (const u of existingUsers) {
      const email = u.email;
      if (!email) continue;
      const { data: prof } = await supabaseAdmin
        .from('profiles')
        .select('id')
        .eq('id', u.id)
        .maybeSingle();

      if (!prof) {
        const metadata = u.user_metadata || {};
        await supabaseAdmin.from('profiles').insert({
          id: u.id,
          email: email,
          full_name: metadata.full_name || email.split('@')[0],
          role: metadata.role || 'COURIER_PARTNER',
        });
      }
    }

    return NextResponse.json({ success: true, seeded: results });
  } catch (err: any) {
    console.error('Seed users error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
