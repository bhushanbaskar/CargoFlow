import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      legalName,
      contactEmail,
      contactPhone,
      address,
      city,
      state = 'Maharashtra',
      gstin,
      fullName,
      workEmail,
      password,
    } = body;

    if (!legalName || !contactEmail || !contactPhone || !city || !fullName || !workEmail || !password) {
      return NextResponse.json(
        { error: 'Please fill in all required fields.' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long.' },
        { status: 400 }
      );
    }

    const supabaseAdmin = getSupabaseAdmin();
    const normalizedEmail = workEmail.trim().toLowerCase();

    // 1. Create or retrieve auth user with auto-confirmed email
    let userId: string | null = null;

    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role: 'COURIER_PARTNER',
      },
    });

    if (createError) {
      // If user already exists, update their password and confirm email
      if (createError.message?.toLowerCase().includes('already registered') || (createError as any).status === 422) {
        const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
        const existing = listData?.users.find((u) => u.email?.toLowerCase() === normalizedEmail);
        if (existing) {
          userId = existing.id;
          await supabaseAdmin.auth.admin.updateUserById(existing.id, {
            password: password,
            email_confirm: true,
            user_metadata: {
              full_name: fullName,
              role: 'COURIER_PARTNER',
            },
          });
        } else {
          return NextResponse.json(
            { error: createError.message || 'User creation failed.' },
            { status: 400 }
          );
        }
      } else {
        return NextResponse.json(
          { error: createError.message || 'User creation failed.' },
          { status: 400 }
        );
      }
    } else if (createData?.user) {
      userId = createData.user.id;
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Could not create or locate user account.' },
        { status: 500 }
      );
    }

    // 2. Generate unique company code
    const rawCode = legalName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 8) || 'COURIER';
    const randSuffix = Math.floor(100 + Math.random() * 900);
    const companyCode = `${rawCode}${randSuffix}`;

    // 3. Insert Courier Company record
    const { data: companyData, error: companyError } = await supabaseAdmin
      .from('courier_companies')
      .insert({
        name: legalName,
        legal_name: legalName,
        code: companyCode,
        contact_email: contactEmail.trim().toLowerCase(),
        contact_phone: contactPhone,
        address: address || null,
        city: city,
        state: state || 'Maharashtra',
        gstin: gstin ? gstin.trim().toUpperCase() : null,
        status: 'PENDING',
        credit_limit: 100000.00,
        used_credit: 0.00,
      })
      .select()
      .single();

    if (companyError || !companyData) {
      console.error('Company creation error:', companyError);
      return NextResponse.json(
        { error: companyError?.message || 'Failed to create courier company record.' },
        { status: 500 }
      );
    }

    // 4. Create or update profile in public.profiles
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        email: normalizedEmail,
        full_name: fullName,
        phone: contactPhone,
        role: 'COURIER_PARTNER',
        company_id: companyData.id,
      })
      .select()
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }

    return NextResponse.json({
      success: true,
      userId,
      company: {
        id: companyData.id,
        name: companyData.name,
        legalName: companyData.legal_name || companyData.name,
        code: companyData.code,
        contactEmail: companyData.contact_email,
        contactPhone: companyData.contact_phone,
        address: companyData.address,
        city: companyData.city,
        state: companyData.state,
        gstin: companyData.gstin,
        status: companyData.status,
        creditLimit: Number(companyData.credit_limit || 100000),
        usedCredit: Number(companyData.used_credit || 0),
        createdAt: companyData.created_at,
      },
      profile: {
        id: userId,
        email: normalizedEmail,
        fullName: fullName,
        role: 'COURIER_PARTNER',
        companyId: companyData.id,
        companyName: companyData.name,
        companyStatus: companyData.status,
      },
    });
  } catch (err: any) {
    console.error('Registration API error:', err);
    return NextResponse.json(
      { error: err.message || 'An unexpected error occurred during registration.' },
      { status: 500 }
    );
  }
}
