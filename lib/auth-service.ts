import { getSupabase } from './supabase';
import {
  UserProfile,
  CourierCompany,
  CourierRegistrationInput,
  AuthSession,
  CompanyStatus,
} from './types';

export async function getCurrentAuthSession(): Promise<AuthSession | null> {
  try {
    const supabase = getSupabase();
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error || !session?.user) return null;

    // Fetch profile from database
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (!profile) return null;

    let company: CourierCompany | undefined = undefined;
    if (profile.company_id) {
      const { data: companyData } = await supabase
        .from('courier_companies')
        .select('*')
        .eq('id', profile.company_id)
        .single();

      if (companyData) {
        company = {
          id: companyData.id,
          name: companyData.name,
          legalName: companyData.legal_name || companyData.name,
          code: companyData.code,
          contactEmail: companyData.contact_email,
          contactPhone: companyData.contact_phone,
          creditLimit: Number(companyData.credit_limit || 100000),
          usedCredit: Number(companyData.used_credit || 0),
          address: companyData.address,
          city: companyData.city,
          state: companyData.state,
          gstin: companyData.gstin,
          status: companyData.status as CompanyStatus,
          rejectionReason: companyData.rejection_reason,
          createdAt: companyData.created_at,
        };
      }
    }

    const userObj: UserProfile = {
      id: profile.id,
      email: session.user.email || profile.email,
      fullName: profile.full_name,
      role: profile.role,
      companyId: profile.company_id,
      companyName: company?.name || profile.company_name,
      companyStatus: company?.status,
      depotId: profile.depot_id,
    };

    return { user: userObj, company };
  } catch (err: any) {
    console.error('Failed to get current auth session:', err);
    return null;
  }
}

export async function loginWithEmailPassword(
  email: string,
  pass: string
): Promise<{ session: AuthSession | null; error?: string }> {
  try {
    const supabase = getSupabase();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: pass,
    });

    if (error) {
      return { session: null, error: error.message };
    }

    if (data.session) {
      const session = await getCurrentAuthSession();
      if (session) return { session };
    }
    
    return { session: null, error: 'Login failed.' };
  } catch (err: any) {
    return { session: null, error: err.message || 'An unexpected error occurred.' };
  }
}

export async function registerCourierPartner(
  input: CourierRegistrationInput
): Promise<{ session: AuthSession | null; error?: string }> {
  try {
    const supabase = getSupabase();

    // 1. Sign up Supabase Auth User
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: input.workEmail.trim(),
      password: input.password,
      options: {
        data: {
          full_name: input.fullName,
          role: 'COURIER_PARTNER',
        },
      },
    });

    if (authError) {
      return { session: null, error: authError.message };
    }

    const userId = authData.user?.id;
    if (!userId) {
      return { session: null, error: 'User creation failed.' };
    }

    const companyCode = input.legalName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .slice(0, 10) || 'COURIER';

    // 2. Insert Courier Company record
    const { data: companyData, error: companyError } = await supabase
      .from('courier_companies')
      .insert({
        name: input.legalName,
        legal_name: input.legalName,
        code: companyCode,
        contact_email: input.contactEmail,
        contact_phone: input.contactPhone,
        address: input.address,
        city: input.city,
        state: input.state,
        gstin: input.gstin || null,
        status: 'PENDING',
        credit_limit: 100000,
        used_credit: 0,
      })
      .select()
      .single();

    if (companyError || !companyData) {
      return { session: null, error: companyError?.message || 'Company record creation failed.' };
    }

    // 3. Create or update profile
    const { error: profileError } = await supabase.from('profiles').upsert({
      id: userId,
      email: input.workEmail.trim(),
      full_name: input.fullName,
      phone: input.contactPhone,
      role: 'COURIER_PARTNER',
      company_id: companyData.id,
    });

    if (profileError) {
      console.error('Profile creation error:', profileError);
    }

    const createdCompany: CourierCompany = {
      id: companyData.id,
      name: companyData.name,
      legalName: companyData.legal_name,
      code: companyData.code,
      contactEmail: companyData.contact_email,
      contactPhone: companyData.contact_phone,
      address: companyData.address,
      city: companyData.city,
      state: companyData.state,
      gstin: companyData.gstin,
      status: 'PENDING',
      creditLimit: 100000,
      usedCredit: 0,
      createdAt: new Date().toISOString(),
    };

    const userProfile: UserProfile = {
      id: userId,
      email: input.workEmail.trim(),
      fullName: input.fullName,
      phone: input.contactPhone,
      role: 'COURIER_PARTNER',
      companyId: companyData.id,
      companyName: companyData.name,
      companyStatus: 'PENDING',
    };

    const newSession: AuthSession = {
      user: userProfile,
      company: createdCompany,
    };

    return { session: newSession };
  } catch (err: any) {
    return { session: null, error: err.message || 'An unexpected error occurred during registration.' };
  }
}

export async function signOutAuth(): Promise<void> {
  try {
    const supabase = getSupabase();
    await supabase.auth.signOut();
  } catch (err) {
    console.error('Sign out error:', err);
  }
}

export async function fetchAllCourierCompanies(): Promise<CourierCompany[]> {
  try {
    const supabase = getSupabase();
    const { data, error } = await supabase
      .from('courier_companies')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data.map((c: any) => ({
        id: c.id,
        name: c.name,
        legalName: c.legal_name || c.name,
        code: c.code,
        contactEmail: c.contact_email,
        contactPhone: c.contact_phone,
        creditLimit: Number(c.credit_limit || 100000),
        usedCredit: Number(c.used_credit || 0),
        address: c.address,
        city: c.city,
        state: c.state,
        gstin: c.gstin,
        status: c.status as CompanyStatus,
        rejectionReason: c.rejection_reason,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));
    }
    return [];
  } catch (err: any) {
    console.error('Fetch companies error:', err);
    throw err;
  }
}

export async function updateCourierCompanyStatus(
  companyId: string,
  newStatus: 'ACTIVE' | 'REJECTED',
  rejectionReason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = getSupabase();
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };
    if (rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    }

    const { error } = await supabase
      .from('courier_companies')
      .update(updateData)
      .eq('id', companyId);

    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Failed to update status' };
  }
}
