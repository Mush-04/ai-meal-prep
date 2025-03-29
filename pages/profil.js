import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/common/LoadingScreen';
import EmailConfirmationBanner from '../components/common/EmailConfirmationBanner';
import { FaEnvelope, FaSpinner, FaCheckCircle } from 'react-icons/fa';
import { supabase } from '../lib/supabase';

export default function Profil() {
  const { user, loading, isEmailConfirmed, resendConfirmationEmail } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);
  const [showConfirmationPage, setShowConfirmationPage] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState(null);
  const [profileLoaded, setProfileLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Redirect to login if not logged in
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    // Sjekk om brukerprofilen eksisterer, og opprett den om nødvendig
    const checkAndCreateProfile = async () => {
      if (!user) return;
      
      try {
        // Sjekk om profilen eksisterer
        const { data: existingProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = Ingen resultater funnet
          console.error("Feil ved henting av profil:", fetchError);
        }
        
        // Hvis profilen ikke eksisterer, opprett den
        if (!existingProfile) {
          try {
            // Sørg for at vi bruker den autentiserte klienten for å respektere RLS
            const { data: sessionData } = await supabase.auth.getSession();
            if (!sessionData.session) {
              throw new Error('Ingen aktiv sesjon funnet');
            }
            
            // Grunnleggende profil som alltid skal opprettes
            const profileData = {
              id: user.id,
              email: user.email,
              first_name: '',
              last_name: ''
            };
            
            console.log("Oppretter profil med kun grunnleggende felt:", profileData);
            
            // Bruk den autentiserte klienten for å respektere RLS
            const { error: createError } = await supabase
              .from('profiles')
              .upsert([profileData], { onConflict: 'id' });
            
            if (createError) {
              console.error("Feil ved opprettelse av profil:", createError);
              setError("Det oppstod en feil ved opprettelse av profil. Vennligst prøv igjen senere.");
            }
          } catch (error) {
            console.error("Feil ved opprettelse av profil:", error);
            setError("Det oppstod en feil ved opprettelse av profil. Vennligst prøv igjen senere.");
          }
        }
        
        setProfileLoaded(true);
      } catch (error) {
        console.error("Feil ved sjekk/opprettelse av profil:", error);
        setProfileLoaded(true); // Sett til true uansett for å fortsette flyten
      }
    };
    
    if (!loading && user) {
      checkAndCreateProfile();
    }
  }, [user, loading]);

  useEffect(() => {
    // Vent til både bruker er lastet og profil er sjekket
    if (!loading && user && profileLoaded) {
      // Sjekk om det finnes lagret brukerdata i localStorage
      try {
        const pendingUserData = localStorage.getItem('pendingUserData');
        if (pendingUserData) {
          console.log('Fant lagret brukerdata i localStorage:', pendingUserData);
          const userData = JSON.parse(pendingUserData);
          
          // Lagre brukerdata i profilen
          saveUserDataToProfile(userData);
        }
      } catch (error) {
        console.error('Feil ved henting av brukerdata fra localStorage:', error);
      }
      
      // Hvis brukeren er innlogget, men e-posten ikke er bekreftet, 
      // vis bekreftelsessiden i 3 sekunder før omdirigering til dashboard
      if (!isEmailConfirmed) {
        setShowConfirmationPage(true);
        
        // Etter 3 sekunder, omdiriger til dashboard
        const timer = setTimeout(() => {
          setRedirecting(true);
          router.push('/dashboard?tab=profile');
        }, 3000);
        
        return () => clearTimeout(timer);
      } else {
        // Redirect to dashboard with profile tab parameter
        setRedirecting(true);
        router.push('/dashboard?tab=profile');
      }
    }
  }, [user, loading, isEmailConfirmed, router, profileLoaded]);

  // Funksjon for å lagre brukerdata i profilen
  const saveUserDataToProfile = async (userData) => {
    try {
      console.log('Lagrer brukerdata i profil:', userData);
      
      // Konverter data til riktig format for Supabase
      const profileData = {
        id: user.id,
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email || user.email,
        // Kostpreferanser
        dietary_restrictions: userData.dietaryRestrictions || [],
        allergies: userData.allergies || [],
        disliked_ingredients: userData.dislikedIngredients || [],
        // Helsemål
        health_goals: userData.healthGoals || [],
        activity_level: userData.activityLevel || 'moderate',
        weight: userData.weight ? parseFloat(userData.weight) : null,
        height: userData.height ? parseFloat(userData.height) : null,
        current_weight: userData.currentWeight ? parseFloat(userData.currentWeight) : null,
        target_weight: userData.targetWeight ? parseFloat(userData.targetWeight) : null,
        // Medlemskapsnivå
        membership_tier: userData.membershipTier || 'premium',
        // Metadata
        updated_at: new Date().toISOString()
      };
      
      console.log('Forsøker å lagre profildata:', profileData);
      
      // Lagre i Supabase
      const { error } = await supabase
        .from('profiles')
        .upsert([profileData], { onConflict: 'id' });
      
      if (error) {
        console.error('Feil ved lagring av brukerdata i profil:', error);
        
        // Hvis det er en feil med kolonner som ikke finnes, prøv å lagre bare grunnleggende informasjon
        if (error.code === '42703') { // PostgreSQL feilkode for "kolonne finnes ikke"
          console.log('Prøver å lagre bare grunnleggende profildata...');
          
          const basicProfileData = {
            id: user.id,
            first_name: userData.firstName,
            last_name: userData.lastName,
            email: userData.email || user.email,
            updated_at: new Date().toISOString()
          };
          
          const { error: basicError } = await supabase
            .from('profiles')
            .upsert([basicProfileData], { onConflict: 'id' });
            
          if (basicError) {
            console.error('Feil ved lagring av grunnleggende brukerdata:', basicError);
            throw basicError;
          } else {
            console.log('Grunnleggende brukerdata lagret i profil');
          }
        } else {
          throw error;
        }
      } else {
        console.log('Brukerdata lagret i profil');
      }
      
      // Fjern data fra localStorage etter vellykket lagring
      localStorage.removeItem('pendingUserData');
    } catch (error) {
      console.error('Feil ved lagring av brukerdata i profil:', error);
    }
  };

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendSuccess(false);
    setResendError(null);

    try {
      await resendConfirmationEmail();
      setResendSuccess(true);
    } catch (error) {
      console.error('Feil ved sending av bekreftelsesmail:', error);
      setResendError('Det oppstod en feil ved sending av bekreftelsesmail. Vennligst prøv igjen senere.');
    } finally {
      setIsResending(false);
    }
  };

  // Vis lasteskjerm mens vi sjekker autentisering
  if (loading || !profileLoaded) {
    return <LoadingScreen message="Laster profil..." />;
  }

  // Vis lasteskjerm ved omdirigering
  if (redirecting) {
    return <LoadingScreen message="Omdirigerer til dashboard..." />;
  }

  // Vis e-postbekreftelsesside hvis nødvendig
  if (showConfirmationPage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex flex-col justify-center items-center p-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="text-center mb-6">
              <FaEnvelope className="mx-auto text-orange-500 text-4xl mb-4" />
              <h1 className="text-2xl font-bold text-gray-800">Bekreft e-postadressen din</h1>
              <p className="text-gray-600 mt-2">
                Vi har sendt en bekreftelseslink til din e-post. Vennligst sjekk innboksen din og klikk på linken for å aktivere kontoen din.
              </p>
            </div>
            
            <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
              <p className="text-sm text-orange-700">
                Du vil bli omdirigert til dashbordet om noen sekunder. Noen funksjoner vil være begrenset inntil e-postadressen din er bekreftet.
              </p>
            </div>
            
            {resendSuccess && (
              <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <FaCheckCircle className="h-5 w-5 text-green-500" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-green-700">
                      En ny bekreftelseslink er sendt til din e-post.
                    </p>
                  </div>
                </div>
              </div>
            )}
            
            {resendError && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <p className="text-sm text-red-700">{resendError}</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}
            
            <button
              onClick={handleResendEmail}
              disabled={isResending}
              className={`w-full bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 px-4 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 ${isResending ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isResending ? (
                <span className="flex items-center justify-center">
                  <FaSpinner className="animate-spin mr-2" />
                  Sender...
                </span>
              ) : (
                'Send bekreftelseslink på nytt'
              )}
            </button>
            
            <button
              onClick={() => {
                setRedirecting(true);
                router.push('/dashboard');
              }}
              className="w-full mt-4 bg-white border border-gray-300 text-gray-700 font-medium py-3 px-4 rounded-lg shadow-sm hover:bg-gray-50 transition-all duration-300"
            >
              Gå til dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Dette burde ikke vises, men er her som en sikkerhet
  return <LoadingScreen message="Laster..." />;
}
