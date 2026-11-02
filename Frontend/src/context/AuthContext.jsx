import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { AuthContext } from "./AuthContext.js";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [logoutInProgress, setLogoutInProgress] = useState(false);

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) {
        console.error("Session error:", error.message);
      }

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    setLogoutInProgress(true);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }

      setSession(null);
      setUser(null);
    } catch (error) {
      setLogoutInProgress(false);
      throw error;
    }
  };

  const finishSignOut = () => {
    setLogoutInProgress(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        logoutInProgress,
        signOut,
        finishSignOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}