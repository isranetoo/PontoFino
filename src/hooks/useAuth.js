import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const getUser = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.auth.getUser();
    setUser(data?.user || null);
    setLoading(false);
  }, []);

  useEffect(() => {
    getUser();
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      getUser();
    });
    return () => {
      listener?.subscription.unsubscribe();
    };
  }, [getUser]);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return { user, loading, signOut };
}
