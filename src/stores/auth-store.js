import { create } from "zustand";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export const useAuthStore = create((set, get) => ({
  user: null,
  profile: null,
  loading: true,

  /** Initialize auth state — call once in root layout */
  initialize: async () => {
    const supabase = getSupabaseBrowserClient();

    // Get current session
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      set({ user, profile, loading: false });
    } else {
      set({ user: null, profile: null, loading: false });
    }

    // Listen for auth changes
    supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        set({ user: session.user, profile });
      } else {
        set({ user: null, profile: null });
      }
    });
  },

  /** Sign in with email/password */
  signIn: async (email, password) => {
    const supabase = getSupabaseBrowserClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    return data;
  },

  /** Sign out */
  signOut: async () => {
    const supabase = getSupabaseBrowserClient();
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  },

  /** Update password */
  updatePassword: async (newPassword) => {
    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });
    if (error) throw error;

    // Mark password as changed
    const { user } = get();
    if (user) {
      await supabase
        .from("profiles")
        .update({ must_change_password: false })
        .eq("id", user.id);

      set((state) => ({
        profile: { ...state.profile, must_change_password: false },
      }));
    }
  },
}));
