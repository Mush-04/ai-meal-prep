import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check active sessions and sets the user
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        setUser(session?.user ?? null);

        // Listen for changes on auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          setUser(session?.user ?? null);
        });

        return () => {
          subscription?.unsubscribe();
        };
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    initAuth();
  }, []);

  const signUp = async (email, password) => {
    try {
      // Valider e-post format før vi sender til Supabase
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(email)) {
        throw {
          name: "ValidationError",
          message: "E-postadressen er ikke gyldig",
          code: "email_address_invalid"
        };
      }

      // Fjern eventuelle mellomrom i e-postadressen
      const cleanEmail = email.trim();
      
      // Definer redirect URL, sjekk om window er tilgjengelig (kun på klientsiden)
      const options = {
        emailRedirectTo: typeof window !== 'undefined' 
          ? `${window.location.origin}/profil` 
          : undefined
      };
      
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options
      });
      
      if (error) throw error;
      
      // Logg data for debugging
      console.log("Supabase signUp response:", data);
      
      // Returner data selv om user.id ikke finnes (kan være null ved e-postbekreftelse)
      return { 
        data: {
          user: data.user,
          session: data.session
        } 
      };
    } catch (error) {
      console.error("SignUp error:", error);
      throw error;
    }
  };

  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      // Sjekk om brukeren er logget inn før vi prøver å logge ut
      if (!user) {
        setUser(null);
        return;
      }
      
      const { error } = await supabase.auth.signOut();
      
      // Uansett om det er en feil eller ikke, sett brukeren til null
      setUser(null);
      
      if (error && error.message !== 'Auth session missing!') {
        console.error('Utloggingsfeil:', error.message);
      }
      router.push('/');
    } catch (error) {
      console.error('Utloggingsfeil:', error.message);
      // Sett brukeren til null uansett for å sikre lokal utlogging
      setUser(null);
      router.push('/');
    }
  };

  const value = {
    user,
    loading,
    error,
    signUp,
    signIn,
    signOut,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
