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

    const user = session.user;

    // Fetch profile from database
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    let company: CourierCompany | undefined = undefined;
    const companyId = profile?.company_id || user.user_metadata?.company_id;

    if (companyId) {
      const { data: companyData } = await supabase
        .from('courier_companies')
        .select('*')
        .eq('id', companyId)
        .maybeSingle();

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
          status: (companyData.status as CompanyStatus) || 'PENDING',
          rejectionReason: companyData.rejection_reason,
          createdAt: companyData.created_at,
          updatedAt: companyData.updated_at,
        };
      }
    }

    const role = profile?.role || user.user_metadata?.role || 'COURIER_PARTNER';
    const fullName = profile?.full_name || user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';

    const userObj: UserProfile = {
      id: user.id,
      email: user.email || profile?.email || '',
      fullName,
      role,
      companyId: company?.id || profile?.company_id,
      companyName: company?.name,
      companyStatus: company?.status,
      depotId: profile?.depot_id,
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
    const cleanEmail = email.trim().toLowerCase();
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password: pass,
    });

    if (error) {
      if (error.message.toLowerCase().includes('invalid login credentials')) {
        return { session: null, error: 'Invalid email or password. Please check your credentials.' };
      }
      if (error.message.toLowerCase().includes('email not confirmed')) {
        return { session: null, error: 'Please confirm your email address or re-register.' };
      }
      return { session: null, error: error.message };
    }

    if (data.session) {
      const session = await getCurrentAuthSession();
      if (session) return { session };
      
      // Fallback construct if profile fetch takes a moment
      const userMeta = data.session.user.user_metadata || {};
      const fallbackUser: UserProfile = {
        id: data.session.user.id,
        email: cleanEmail,
        fullName: userMeta.full_name || cleanEmail.split('@')[0],
        role: userMeta.role || 'COURIER_PARTNER',
      };
      return { session: { user: fallbackUser } };
    }
    
    return { session: null, error: 'Sign in failed. No active session returned.' };
  } catch (err: any) {
    return { session: null, error: err.message || 'An unexpected error occurred.' };
  }
}

export async function registerCourierPartner(
  input: CourierRegistrationInput
): Promise<{ session: AuthSession | null; error?: string }> {
  try {
    // 1. Send registration payload to server-side API endpoint with admin privileges
    // This auto-confirms user and creates company + profile without email SMTP rate limits
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    const result = await response.json();

    if (!response.ok || result.error) {
      return { session: null, error: result.error || 'Registration failed.' };
    }

    // 2. Sign in the client directly to establish local Supabase session & cookies
    const supabase = getSupabase();
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: input.workEmail.trim().toLowerCase(),
      password: input.password,
    });

    if (signInError) {
      console.warn('Auto sign-in after registration notice:', signInError);
    }

    const currentSession = await getCurrentAuthSession();
    if (currentSession) {
      return { session: currentSession };
    }

    const createdCompany: CourierCompany = result.company;
    const createdProfile: UserProfile = {
      id: result.userId || result.profile?.id,
      email: input.workEmail.trim().toLowerCase(),
      fullName: input.fullName,
      phone: input.contactPhone,
      role: 'COURIER_PARTNER',
      companyId: createdCompany?.id,
      companyName: createdCompany?.name,
      companyStatus: 'PENDING',
    };

    return {
      session: {
        user: createdProfile,
        company: createdCompany,
      },
    };
  } catch (err: any) {
    console.error('Registration error:', err);
    return {
      session: null,
      error: err.message || 'An unexpected network error occurred during registration.',
    };
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
        status: (c.status as CompanyStatus) || 'PENDING',
        rejectionReason: c.rejection_reason,
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      }));
    }
    return [];
  } catch (err: any) {
    console.error('Fetch companies error:', err);
    return [];
  }
}

export async function updateCourierCompanyStatus(
  companyId: string,
  newStatus: 'ACTIVE' | 'REJECTED' | 'PENDING',
  rejectionReason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Call server API endpoint with elevated service permissions
    const res = await fetch('/api/admin/company-status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        companyId,
        status: newStatus,
        rejectionReason: rejectionReason || null,
      }),
    });

    const data = await res.json();
    if (res.ok && data.success) {
      return { success: true };
    }

    // 2. Direct client fallback if API route returns error
    const supabase = getSupabase();
    const updateData: any = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    };
    if (rejectionReason !== undefined) {
      updateData.rejection_reason = rejectionReason;
    } else if (newStatus === 'ACTIVE') {
      updateData.rejection_reason = null;
    }

    const { error } = await supabase
      .from('courier_companies')
      .update(updateData)
      .eq('id', companyId);

    if (error) {
      console.error('Update company status error:', error);
      return { success: false, error: data.error || error.message };
    }
    return { success: true };
  } catch (err: any) {
    console.error('Update company status network error:', err);
    return { success: false, error: err.message || 'Failed to update status' };
  }
}


