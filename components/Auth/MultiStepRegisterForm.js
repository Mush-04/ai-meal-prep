import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';

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
  
  // Brukerdata
  const [userData, setUserData] = useState({
    // Trinn 1: Grunnleggende informasjon
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    
    // Trinn 2: Kostpreferanser
    dietaryRestrictions: [],
    allergies: [],
    dislikedIngredients: [],
    
    // Trinn 3: Helsemål
    healthGoals: [],
    activityLevel: 'moderat',
    weight: '',
    height: '',
    
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
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Gå til forrige trinn
  const goToPreviousStep = () => {
    setDirection(-1);
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Håndter registrering
  const handleRegistration = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Registrer brukeren med Supabase Auth
      const { data: authData, error: authError } = await signUp(userData.email, userData.password);
      
      if (authError) throw authError;
      
      // 2. Lagre tilleggsinformasjon i Supabase-tabellen
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            first_name: userData.firstName,
            last_name: userData.lastName,
            dietary_restrictions: userData.dietaryRestrictions,
            allergies: userData.allergies,
            disliked_ingredients: userData.dislikedIngredients,
            health_goals: userData.healthGoals,
            activity_level: userData.activityLevel,
            weight: userData.weight || null,
            height: userData.height || null,
            membership_tier: userData.membershipTier
          }
        ]);
      
      if (profileError) throw profileError;
      
      // 3. Omdiriger til hjemmesiden ved vellykket registrering
      router.push('/');
      
    } catch (err) {
      console.error('Registreringsfeil:', err);
      setError(
        err.message === 'User already registered'
          ? 'E-posten er allerede registrert'
          : 'Det oppstod en feil under registreringen. Vennligst prøv igjen.'
      );
      return Promise.reject(err);
    } finally {
      setLoading(false);
    }
  };

  // Animasjonsvarianter
  const pageVariants = {
    initial: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
    }),
    animate: {
      x: 0,
      opacity: 1,
      scale: 1,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 }
      }
    },
    exit: (direction) => ({
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0,
      scale: 0.95,
      transition: {
        x: { type: 'spring', stiffness: 300, damping: 30 },
        opacity: { duration: 0.3 },
        scale: { duration: 0.3 }
      }
    }),
  };

  // Vis riktig trinn basert på currentStep
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1BasicInfo 
            userData={userData} 
            updateUserData={updateUserData} 
            goToNextStep={goToNextStep} 
          />
        );
      case 2:
        return (
          <Step2DietaryPreferences 
            userData={userData} 
            updateUserData={updateUserData} 
            goToNextStep={goToNextStep} 
            goToPreviousStep={goToPreviousStep} 
          />
        );
      case 3:
        return (
          <Step3HealthGoals 
            userData={userData} 
            updateUserData={updateUserData} 
            goToNextStep={goToNextStep} 
            goToPreviousStep={goToPreviousStep} 
          />
        );
      case 4:
        return (
          <Step4MembershipSelection 
            userData={userData} 
            updateUserData={updateUserData} 
            goToNextStep={goToNextStep} 
            goToPreviousStep={goToPreviousStep} 
          />
        );
      case 5:
        return (
          <Step5Confirmation 
            userData={userData} 
            updateUserData={updateUserData}
            handleRegister={handleRegistration} 
            goToPreviousStep={goToPreviousStep} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      {error && (
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 shadow-lg"
        >
          {error}
        </motion.div>
      )}
      
      {/* Fremdriftsindikator */}
      <div className="mb-8">
        <div className="flex justify-between">
          {[1, 2, 3, 4, 5].map((step) => (
            <motion.div 
              key={step} 
              className="flex flex-col items-center"
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <motion.div 
                className={`w-12 h-12 flex items-center justify-center rounded-full mb-2 ${
                  step === currentStep
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white'
                    : step < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-white/30 text-black'
                }`}
                initial={false}
                animate={
                  step === currentStep
                    ? { scale: [1, 1.2, 1], backgroundColor: ['#f97316', '#ea580c'] }
                    : step < currentStep
                    ? { scale: 1, backgroundColor: '#22c55e' }
                    : { scale: 1 }
                }
                transition={{ duration: 0.5 }}
              >
                {step < currentStep ? (
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  <span className="text-lg font-bold">{step}</span>
                )}
              </motion.div>
              <motion.span 
                className={`text-sm font-medium ${step === currentStep ? 'text-white font-bold' : 'text-black'}`}
                animate={{ opacity: step === currentStep ? 1 : 0.9 }}
              >
                {step === 1 && 'Grunnleggende'}
                {step === 2 && 'Kostpreferanser'}
                {step === 3 && 'Helsemål'}
                {step === 4 && 'Medlemskap'}
                {step === 5 && 'Bekreftelse'}
              </motion.span>
            </motion.div>
          ))}
        </div>
        
        <motion.div 
          className="mt-2 h-2 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full overflow-hidden"
          data-component-name="MotionComponent"
          initial={{ opacity: 0.6 }}
          animate={{ opacity: 1 }}
        >
          <motion.div 
            className="h-full bg-white rounded-full"
            initial={{ width: `${(currentStep - 1) * 25}%` }}
            animate={{ width: `${(currentStep - 1) * 25}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </motion.div>
      </div>
      
      {/* Skjematrinn */}
      <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/10">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={currentStep}
            custom={direction}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            className="min-h-[400px]"
          >
            {renderStep()}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
