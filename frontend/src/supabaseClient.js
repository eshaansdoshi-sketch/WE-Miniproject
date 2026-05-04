// Supabase removed — app now uses JWT auth via /api/auth endpoints
// This file is kept as a stub to avoid import errors in any remaining components
export const supabase = {
  auth: {
    getSession: async () => ({ data: { session: null } }),
    onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithPassword: async () => { throw new Error('Use AuthContext signIn instead') },
    signUp: async () => { throw new Error('Use AuthContext signUp instead') },
    signOut: async () => {},
  },
  from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: null, error: null }) }) }) }),
}
