import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/services/supabase';

const AuthContext = createContext({
  session: null,
  user: null,
  username: null,
  loading: true,
  isRecovery: false,
  clearRecovery: () => {},
});

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isRecovery, setIsRecovery] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === "PASSWORD_RECOVERY") setIsRecovery(true);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const user = session?.user ?? null;

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        username: user?.user_metadata?.username ?? null,
        loading,
        isRecovery,
        clearRecovery: () => setIsRecovery(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);