import { createClient, Session, User as SupabaseUser, AuthChangeEvent } from '@supabase/supabase-js';
import { User } from '../types';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL  as string;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(supabaseUrl, supabaseKey);

// ── Prefs storage key (per-user, based on Supabase UID) ────────────────
const PREFS_KEY = (uid: string) => `storystream_prefs_${uid}`;

/**
 * Map a Supabase user → our app's User type.
 * Plan/tokens come from localStorage (keyed by Supabase UID).
 */
export const supabaseUserToAppUser = (sbUser: SupabaseUser): User => {
  const raw  = localStorage.getItem(PREFS_KEY(sbUser.id));
  const prefs = raw ? JSON.parse(raw) : {};
  return {
    id:     sbUser.id,
    email:  sbUser.email ?? '',
    name:   sbUser.user_metadata?.name
              || sbUser.user_metadata?.full_name
              || sbUser.email?.split('@')[0]
              || 'User',
    plan:   prefs.plan   ?? 'free',
    tokens: prefs.tokens  ?? 50,
  };
};

/**
 * Persist plan/tokens to localStorage (keyed by Supabase UID).
 * Called from App.tsx whenever plan or tokens change.
 */
export const saveUserPrefs = (user: User) => {
  localStorage.setItem(PREFS_KEY(user.id), JSON.stringify({ plan: user.plan, tokens: user.tokens }));
};

// ── Auth functions ─────────────────────────────────────────────────────

export const signUpWithEmail = async (email: string, password: string, name: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) throw error;
  return data;
};

export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
};

export const signInWithGoogle = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  if (error) throw error;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
};

export const getCurrentSession = async (): Promise<Session | null> => {
  const { data } = await supabase.auth.getSession();
  return data.session;
};

/**
 * Subscribe to auth state changes.
 * Returns an unsubscribe function — call it in useEffect cleanup.
 */
export const onAuthChange = (
  callback: (event: AuthChangeEvent, user: SupabaseUser | null) => void,
) => {
  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (event, session) => callback(event, session?.user ?? null),
  );
  return () => subscription.unsubscribe();
};
