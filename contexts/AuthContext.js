import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'next/router';

const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  isEmailConfirmed: false,
  signUp: async () => {},
  signIn: async () => {},
  signOut: async () => {},
  resendConfirmationEmail: async () => {},
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(false);
  const router = useRouter();

  // Funksjon for å sjekke om e-posten er bekreftet
  const checkEmailConfirmation = (user) => {
    if (!user) return false;
    
    // Supabase bruker email_confirmed_at for å indikere om e-posten er bekreftet
    return !!user.email_confirmed_at;
  };

  useEffect(() => {
    const initAuth = async () => {
      try {
        // Check active sessions and sets the user
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;
        
        const currentUser = session?.user ?? null;
        setUser(currentUser);
        
        // Sjekk om e-posten er bekreftet
        if (currentUser) {
          setIsEmailConfirmed(checkEmailConfirmation(currentUser));
        }

        // Listen for changes on auth state
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          const updatedUser = session?.user ?? null;
          setUser(updatedUser);
          
          // Oppdater e-postbekreftelsesstatusen når auth-tilstanden endres
          if (updatedUser) {
            setIsEmailConfirmed(checkEmailConfirmation(updatedUser));
          }
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
      
      if (error) {
        // Håndter spesifikke feilkoder
        if (error.code === 'over_email_send_rate_limit') {
          console.error('Rate limit error:', error);
          throw {
            __isAuthError: true,
            name: "AuthApiError",
            message: "Du har sendt for mange e-poster på kort tid. Vennligst vent noen minutter før du prøver igjen.",
            code: "over_email_send_rate_limit",
            status: 429
          };
        }
        throw error;
      }
      
      // Logg data for debugging
      console.log("Supabase signUp response:", data);
      
      // Returner brukerobjektet for videre bruk
      return { 
        user: data.user,
        session: data.session 
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
      
      // Sjekk om e-posten er bekreftet etter innlogging
      if (data.user) {
        setIsEmailConfirmed(checkEmailConfirmation(data.user));
      }
      
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
        setIsEmailConfirmed(false);
        return;
      }
      
      const { error } = await supabase.auth.signOut();
      
      // Uansett om det er en feil eller ikke, sett brukeren til null
      setUser(null);
      setIsEmailConfirmed(false);
      
      if (error && error.message !== 'Auth session missing!') {
        console.error('Utloggingsfeil:', error.message);
      }
      router.push('/');
    } catch (error) {
      console.error('Utloggingsfeil:', error.message);
      // Sett brukeren til null uansett for å sikre lokal utlogging
      setUser(null);
      setIsEmailConfirmed(false);
      router.push('/');
    }
  };

  // Resend confirmation email
  const resendConfirmationEmail = async (email) => {
    try {
      if (!email) {
        throw new Error('E-postadresse mangler');
      }
      
      // Fjern eventuelle mellomrom i e-postadressen
      const cleanEmail = email.trim();
      
      // Definer redirect URL, sjekk om window er tilgjengelig (kun på klientsiden)
      const options = {
        emailRedirectTo: typeof window !== 'undefined' 
          ? `${window.location.origin}/profil` 
          : undefined
      };
      
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
        options
      });
      
      if (error) {
        console.error('Feil ved sending av bekreftelsesmail:', error);
        throw error;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Feil ved sending av bekreftelsesmail:', error);
      throw error;
    }
  };

  const value = {
    user,
    signUp,
    signIn,
    signOut,
    loading,
    error,
    isEmailConfirmed,
    checkEmailConfirmation,
    resendConfirmationEmail
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
