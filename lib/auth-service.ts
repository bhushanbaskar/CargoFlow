import { getSupabase, isSupabaseConfigured } from './supabase';
import {
  UserProfile,
  CourierCompany,
  CourierRegistrationInput,
  AuthSession,
  CompanyStatus,
} from './types';
import { INITIAL_COURIER_COMPANIES, DEMO_USER_PROFILES } from './mock-data';

const LOCAL_STORAGE_KEY_COMPANIES = 'cargoflow_local_companies_v1';
const LOCAL_STORAGE_KEY_USERS = 'cargoflow_local_users_v1';
const LOCAL_STORAGE_KEY_SESSION = 'cargoflow_current_session_v1';

// Helper to get local persistent companies
export function getLocalCompanies(): CourierCompany[] {
  if (typeof window === 'undefined') return INITIAL_COURIER_COMPANIES;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_COMPANIES);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY_COMPANIES, JSON.stringify(INITIAL_COURIER_COMPANIES));
      return INITIAL_COURIER_COMPANIES;
    }
    return JSON.parse(raw);
  } catch {
    return INITIAL_COURIER_COMPANIES;
  }
}

// Helper to set local persistent companies
export function saveLocalCompanies(companies: CourierCompany[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_COMPANIES, JSON.stringify(companies));
  } catch (err) {
    console.error('Failed to save local companies', err);
  }
}

// Helper to get local persistent users
export function getLocalUsers(): UserProfile[] {
  if (typeof window === 'undefined') return DEMO_USER_PROFILES;
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY_USERS);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_KEY_USERS, JSON.stringify(DEMO_USER_PROFILES));
      return DEMO_USER_PROFILES;
    }
    return JSON.parse(raw);
  } catch {
    return DEMO_USER_PROFILES;
  }
}

// Helper to save local persistent users
export function saveLocalUsers(users: UserProfile[]) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY_USERS, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save local users', err);
  }
}

export async function getCurrentAuthSession(): Promise<AuthSession | null> {
  const supabase = getSupabase();

  if (supabase) {
    try {
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
    } catch (err) {
      console.warn('Supabase session fetch fallback to local:', err);
    }
  }

  // Fallback to local session storage
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_SESSION);
      if (saved) {
        const parsedSession: AuthSession = JSON.parse(saved);
        // Refresh company status if updated
        if (parsedSession.user.companyId) {
          const companies = getLocalCompanies();
          const latestComp = companies.find((c) => c.id === parsedSession.user.companyId);
          if (latestComp) {
            parsedSession.company = latestComp;
            parsedSession.user.companyStatus = latestComp.status;
          }
        }
        return parsedSession;
      }
    } catch {
      return null;
    }
  }

  return null;
}

export async function loginWithEmailPassword(
  email: string,
  pass: string
): Promise<{ session: AuthSession | null; error?: string }> {
  const supabase = getSupabase();

  if (supabase) {
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
  }

  // Local fallback mode
  const users = getLocalUsers();
  const companies = getLocalCompanies();

  const matchedUser = users.find(
    (u) => u.email.toLowerCase() === email.trim().toLowerCase()
  );

  if (!matchedUser) {
    return { session: null, error: 'Invalid email or password.' };
  }

  let matchedCompany: CourierCompany | undefined = undefined;
  if (matchedUser.companyId) {
    matchedCompany = companies.find((c) => c.id === matchedUser.companyId);
    if (matchedCompany) {
      matchedUser.companyStatus = matchedCompany.status;
      matchedUser.companyName = matchedCompany.name;
    }
  }

  const sessionObj: AuthSession = {
    user: matchedUser,
    company: matchedCompany,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY_SESSION, JSON.stringify(sessionObj));
  }

  return { session: sessionObj };
}

export async function registerCourierPartner(
  input: CourierRegistrationInput
): Promise<{ session: AuthSession | null; error?: string }> {
  const supabase = getSupabase();

  if (supabase) {
    try {
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
      console.warn('Supabase register fallback to local mode:', err);
    }
  }

  // Local fallback mode
  const users = getLocalUsers();
  const companies = getLocalCompanies();

  if (users.some((u) => u.email.toLowerCase() === input.workEmail.toLowerCase())) {
    return { session: null, error: 'A user with this work email already exists.' };
  }

  const newCompanyId = `c${Date.now()}`;
  const companyCode = input.legalName
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 10) || 'COURIER';

  const newCompany: CourierCompany = {
    id: newCompanyId,
    name: input.legalName,
    legalName: input.legalName,
    code: companyCode,
    contactEmail: input.contactEmail,
    contactPhone: input.contactPhone,
    address: input.address,
    city: input.city,
    state: input.state,
    gstin: input.gstin || '',
    status: 'PENDING',
    creditLimit: 100000,
    usedCredit: 0,
    createdAt: new Date().toISOString(),
  };

  const newUser: UserProfile = {
    id: `usr-${Date.now()}`,
    email: input.workEmail.trim(),
    fullName: input.fullName,
    phone: input.contactPhone,
    role: 'COURIER_PARTNER',
    companyId: newCompanyId,
    companyName: input.legalName,
    companyStatus: 'PENDING',
  };

  const updatedCompanies = [newCompany, ...companies];
  const updatedUsers = [newUser, ...users];

  saveLocalCompanies(updatedCompanies);
  saveLocalUsers(updatedUsers);

  const sessionObj: AuthSession = {
    user: newUser,
    company: newCompany,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCAL_STORAGE_KEY_SESSION, JSON.stringify(sessionObj));
  }

  return { session: sessionObj };
}

export async function signOutAuth(): Promise<void> {
  const supabase = getSupabase();
  if (supabase) {
    await supabase.auth.signOut().catch(() => {});
  }
  if (typeof window !== 'undefined') {
    localStorage.removeItem(LOCAL_STORAGE_KEY_SESSION);
  }
}

export async function fetchAllCourierCompanies(): Promise<CourierCompany[]> {
  const supabase = getSupabase();
  if (supabase) {
    try {
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
    } catch (err) {
      console.warn('Supabase fetchAllCourierCompanies fallback:', err);
    }
  }

  return getLocalCompanies();
}

export async function updateCourierCompanyStatus(
  companyId: string,
  newStatus: 'ACTIVE' | 'REJECTED',
  rejectionReason?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabase();

  if (supabase) {
    try {
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
    } catch (err: any) {
      console.warn('Supabase update status fallback:', err);
    }
  }

  // Also update local storage state for immediate UI mirror
  const companies = getLocalCompanies();
  const idx = companies.findIndex((c) => c.id === companyId);
  if (idx !== -1) {
    companies[idx].status = newStatus;
    if (rejectionReason) {
      companies[idx].rejectionReason = rejectionReason;
    }
    companies[idx].updatedAt = new Date().toISOString();
    saveLocalCompanies(companies);
  }

  // Update users if in local state
  const users = getLocalUsers();
  let userUpdated = false;
  users.forEach((u) => {
    if (u.companyId === companyId) {
      u.companyStatus = newStatus;
      userUpdated = true;
    }
  });
  if (userUpdated) {
    saveLocalUsers(users);
  }

  return { success: true };
}
