import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaCheckCircle } from 'react-icons/fa';

// Trinnkomponenter
import Step1BasicInfo from './RegisterSteps/Step1BasicInfo';
import Step2DietaryPreferences from './RegisterSteps/Step2DietaryPreferences';
import Step3HealthGoals from './RegisterSteps/Step3HealthGoals';
import Step4MembershipSelection from './RegisterSteps/Step4MembershipSelection';
import Step5Confirmation from './RegisterSteps/Step5Confirmation';

export default function MultiStepRegisterForm() {
  const router = useRouter();
  const { signUp } = useAuth();
  
  // Tilstand for alle trinn
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [direction, setDirection] = useState(1); // 1 for fremover, -1 for bakover
  const [success, setSuccess] = useState('');
  const [registrationComplete, setRegistrationComplete] = useState(false);

  // Brukerdata
  const [userData, setUserData] = useState({
    // Trinn 1: Grunnleggende informasjon
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    
    // Trinn 2: Kostpreferanser
    dietaryRestrictions: [],
    allergies: [],
    dislikedIngredients: [],
    
    // Trinn 3: Helsemål
    healthGoals: [],
    activityLevel: 'moderat',
    weight: '',
    height: '',
    currentWeight: '',
    targetWeight: '',
    
    // Trinn 4: Medlemskapsnivå
    membershipTier: 'premium',
  });

  // Oppdater brukerdata
  const updateUserData = (newData) => {
    setUserData(prev => ({ ...prev, ...newData }));
  };

  // Gå til neste trinn
  const goToNextStep = () => {
    setDirection(1);
    setCurrentStep(prev => prev + 1);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Gå til forrige trinn
  const goToPreviousStep = () => {
    setDirection(-1);
    setCurrentStep(prev => prev - 1);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Håndtere registrering
  const handleRegister = async () => {
    setLoading(true);
    setError('');
    setSuccess('');
    setRegistrationComplete(false);

    try {
      // Ekstra validering av brukerdata før registrering
      if (!userData.email || !userData.password || !userData.firstName || !userData.lastName) {
        throw { message: 'Vennligst fyll ut alle påkrevde felt' };
      }
      
      if (userData.password !== userData.confirmPassword) {
        throw { message: 'Passordene matcher ikke' };
      }
      
      if (userData.password.length < 6) {
        throw { message: 'Passordet må være minst 6 tegn' };
      }
      
      // 1. Registrer brukeren med Supabase Auth
      const { user, session, error: signUpError } = await signUp(userData.email, userData.password);
      
      if (signUpError) {
        // Håndter spesifikke feilkoder
        if (signUpError.code === 'over_email_send_rate_limit') {
          throw { message: 'Du har sendt for mange e-poster på kort tid. Vennligst vent noen minutter før du prøver igjen.' };
        } else if (signUpError.code === 'user_already_exists') {
          throw { message: 'En bruker med denne e-postadressen eksisterer allerede. Prøv å logge inn i stedet.' };
        } else {
          console.error('SignUp error:', signUpError);
          throw { message: signUpError.message || 'Det oppstod en feil ved registrering. Vennligst prøv igjen senere.' };
        }
      }
      
      if (!user) {
        throw new Error('Kunne ikke opprette brukerkonto. Vennligst prøv igjen.');
      }
      
      // Lagre brukerdata i localStorage for å kunne bruke det etter e-postbekreftelse
      try {
        // Lagre brukerdata i localStorage (unntatt passord)
        const userDataToStore = { ...userData };
        delete userDataToStore.password;
        delete userDataToStore.confirmPassword;
        
        localStorage.setItem('pendingUserData', JSON.stringify(userDataToStore));
        console.log('Brukerdata lagret i localStorage for senere bruk:', userDataToStore);
      } catch (storageError) {
        console.error('Feil ved lagring av brukerdata i localStorage:', storageError);
      }
      
      // 2. Opprett eller oppdater profil i Supabase
      try {
        // Konverter data til riktig format for Supabase
        const profileData = {
          id: user.id,
          first_name: userData.firstName,
          last_name: userData.lastName,
          email: userData.email,
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
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        console.log('Forsøker å lagre profildata:', profileData);
        
        // Lagre i Supabase
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert([profileData], { onConflict: 'id' });
        
        if (profileError) {
          console.error('Feil ved lagring av profil:', profileError);
          
          // Hvis det er en feil med kolonner som ikke finnes, prøv å lagre bare grunnleggende informasjon
          if (profileError.code === '42703') { // PostgreSQL feilkode for "kolonne finnes ikke"
            console.log('Prøver å lagre bare grunnleggende profildata...');
            
            const basicProfileData = {
              id: user.id,
              first_name: userData.firstName,
              last_name: userData.lastName,
              email: userData.email,
              updated_at: new Date().toISOString()
            };
            
            const { error: basicProfileError } = await supabase
              .from('profiles')
              .upsert([basicProfileData], { onConflict: 'id' });
              
            if (basicProfileError) {
              console.error('Feil ved lagring av grunnleggende profil:', basicProfileError);
            } else {
              console.log('Grunnleggende profildata lagret');
            }
          }
        } else {
          console.log('Profildata lagret');
        }
      } catch (profileSaveError) {
        console.error('Feil ved lagring av profil:', profileSaveError);
      }
      
      // Håndter tilfeller der e-postbekreftelse er påkrevd
      if (!user.id) {
        setSuccess('En bekreftelseslink er sendt til din e-post. Vennligst sjekk innboksen din og bekreft e-postadressen for å fullføre registreringen.');
        setLoading(false);
        
        // Omdiriger til e-postbekreftelsessiden
        try {
          router.push({
            pathname: '/email-bekreftelse',
            query: { email: userData.email }
          });
        } catch (routerError) {
          console.error("Feil ved omdirigering:", routerError);
          window.location.href = `/email-bekreftelse?email=${encodeURIComponent(userData.email)}`;
        }
        return;
      }
      
      // 3. Vis suksessmelding og omdiriger til e-postbekreftelsessiden
      setSuccess('Registrering fullført! Sjekk e-posten din for å bekrefte kontoen.');
      setLoading(false);
      
      // Omdiriger til e-postbekreftelsessiden i stedet for profilsiden
      try {
        router.push({
          pathname: '/email-bekreftelse',
          query: { email: userData.email }
        });
      } catch (routerError) {
        console.error("Feil ved omdirigering:", routerError);
        // Fallback til manuell omdirigering hvis Next.js router feiler
        window.location.href = `/email-bekreftelse?email=${encodeURIComponent(userData.email)}`;
      }
      
    } catch (err) {
      console.error('Registreringsfeil:', err);
      
      // Mer spesifikk feilhåndtering basert på feilkode
      if (err.code === 'email_address_invalid' || (err.message && err.message.includes('email'))) {
        setError('E-postadressen er ikke gyldig. Vennligst bruk et gyldig format (f.eks. navn@domene.no)');
      } else if (err.code === 'user_already_registered' || err.message === 'User already registered') {
        setError('E-posten er allerede registrert. Vennligst bruk en annen e-postadresse eller logg inn.');
      } else if (err.message && typeof err.message === 'string') {
        setError(err.message);
      } else {
        setError('Det oppstod en feil under registreringen. Vennligst prøv igjen.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initialiser userData med tomme verdier for å unngå ukontrollerte inputs
    setUserData(prevData => ({
      ...prevData,
      healthGoals: prevData.healthGoals || [],
      dietaryRestrictions: prevData.dietaryRestrictions || [],
      allergies: prevData.allergies || [],
      dislikedIngredients: prevData.dislikedIngredients || [],
      currentWeight: prevData.currentWeight || '',
      targetWeight: prevData.targetWeight || '',
      membershipTier: prevData.membershipTier || 'premium'
    }));

    // Sjekk om det er en returnert bruker fra Supabase Auth (etter e-postbekreftelse)
    const checkForReturnedUser = async () => {
      if (typeof window !== 'undefined') {
        const hash = window.location.hash;
        if (hash && hash.includes('access_token')) {
          // Bruker har bekreftet e-post og returnert til appen
          try {
            const { data, error } = await supabase.auth.getUser();
            if (error) throw error;
            if (data && data.user) {
              // Oppdater profilen til å markere e-post som bekreftet
              const { error: updateError } = await supabase
                .from('profiles')
                .update({ email_confirmed: true })
                .eq('id', data.user.id);
                
              if (updateError) {
                console.error('Feil ved oppdatering av e-postbekreftelse:', updateError);
              }
              
              // Omdiriger til profilsiden
              router.push('/profil');
            }
          } catch (err) {
            console.error('Feil ved håndtering av returnert bruker:', err);
          }
        }
      }
    };

    checkForReturnedUser();
  }, [router]);

  // Animasjonsvarianter
  const pageVariants = {
    initial: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    animate: {
      x: 0,
      opacity: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    },
    exit: (direction) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.2 }
      }
    })
  };

  // Komponent for å vise suksessmelding etter registrering
  const RegistrationSuccess = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center p-8 bg-white/10 backdrop-blur-sm rounded-xl shadow-lg"
    >
      <div className="flex justify-center mb-4">
        <FaCheckCircle className="text-green-500 text-5xl" />
      </div>
      <h2 className="text-2xl font-bold text-black mb-4">Registrering fullført!</h2>
      <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-700 p-4 mb-6 rounded-r text-left">
        <div className="flex">
          <div className="flex-shrink-0">
            <FaEnvelope className="h-5 w-5 text-orange-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium">
              En bekreftelseslink er sendt til {userData.email}
            </p>
            <p className="text-sm mt-1">
              Vennligst sjekk innboksen din (og eventuelt søppelpost-mappen) og klikk på bekreftelseslinken 
              for å aktivere kontoen din. Du vil ha begrenset tilgang til funksjoner før e-posten er bekreftet.
            </p>
          </div>
        </div>
      </div>
      <p className="text-gray-600 mb-6">
        Du blir nå omdirigert til profilsiden din. Hvis du ikke blir omdirigert automatisk, 
        kan du klikke på knappen nedenfor.
      </p>
      <button
        onClick={() => {
          try {
            router.push('/profil');
          } catch (error) {
            console.error("Feil ved omdirigering:", error);
            window.location.href = '/profil';
          }
        }}
        className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
      >
        Gå til profil
      </button>
    </motion.div>
  );

  // Vis suksessmelding hvis registreringen er fullført
  if (registrationComplete) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <RegistrationSuccess />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Fremdriftsindikator */}
      <div className="mb-8">
        <div className="flex justify-between items-center">
          {[1, 2, 3, 4, 5].map((step) => (
            <div key={step} className="flex flex-col items-center">
              <div 
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                  currentStep === step 
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg scale-110' 
                    : currentStep > step 
                      ? 'bg-green-500 text-white' 
                      : 'bg-gray-200 text-gray-500'
                }`}
              >
                {currentStep > step ? '✓' : step}
              </div>
              <div className="text-xs mt-2 text-center">
                {step === 1 && 'Grunnleggende'}
                {step === 2 && 'Kostpreferanser'}
                {step === 3 && 'Helsemål'}
                {step === 4 && 'Medlemskap'}
                {step === 5 && 'Bekreftelse'}
              </div>
            </div>
          ))}
        </div>
        <div className="relative mt-4">
          <div className="absolute top-0 left-0 h-2 bg-gray-200 w-full rounded-full"></div>
          <div 
            className="absolute top-0 left-0 h-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-500"
            style={{ width: `${(currentStep - 1) * 25}%` }}
          ></div>
        </div>
      </div>

      {/* Feilmelding */}
      {error && (
        <motion.div 
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}

      {/* Suksessmelding */}
      {success && (
        <motion.div 
          className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {success}
        </motion.div>
      )}

      {/* Skjematrinn */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={currentStep}
          custom={direction}
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {currentStep === 1 && (
            <Step1BasicInfo 
              userData={userData} 
              updateUserData={updateUserData} 
              goToNextStep={goToNextStep} 
            />
          )}
          
          {currentStep === 2 && (
            <Step2DietaryPreferences 
              userData={userData} 
              updateUserData={updateUserData} 
              goToNextStep={goToNextStep} 
              goToPreviousStep={goToPreviousStep} 
            />
          )}
          
          {currentStep === 3 && (
            <Step3HealthGoals 
              userData={userData} 
              updateUserData={updateUserData} 
              goToNextStep={goToNextStep} 
              goToPreviousStep={goToPreviousStep} 
            />
          )}
          
          {currentStep === 4 && (
            <Step4MembershipSelection 
              userData={userData} 
              updateUserData={updateUserData} 
              goToNextStep={goToNextStep} 
              goToPreviousStep={goToPreviousStep} 
            />
          )}
          
          {currentStep === 5 && (
            <Step5Confirmation 
              userData={userData} 
              updateUserData={updateUserData} 
              goToPreviousStep={goToPreviousStep} 
              handleRegister={handleRegister} 
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
