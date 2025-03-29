import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaEnvelope, FaInfoCircle } from 'react-icons/fa';

// Medlemskapsalternativer for visning
const MEMBERSHIP_TIERS = {
  'basis': {
    name: 'Basis',
    price: '99 kr/mnd'
  },
  'premium': {
    name: 'Premium',
    price: '149 kr/mnd'
  },
  'familie': {
    name: 'Familie',
    price: '199 kr/mnd'
  }
};

export default function Step5Confirmation({ userData, updateUserData, goToPreviousStep, handleRegister }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const onSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    
    try {
      await handleRegister();
    } catch (err) {
      setError('Det oppstod en feil under registreringen. Vennligst prøv igjen.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Animasjonsvarianter
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { 
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const sectionVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  return (
    <motion.form 
      onSubmit={onSubmit}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h2 
        className="text-2xl font-bold text-black mb-2 text-center"
        variants={itemVariants}
      >
        Bekreft informasjon
      </motion.h2>
      
      <motion.p 
        className="text-gray-600 mb-4 text-center"
        variants={itemVariants}
      >
        Vennligst kontroller at all informasjon er korrekt før du fullfører registreringen
      </motion.p>
      
      {/* E-postbekreftelsesnotis */}
      <motion.div
        className="bg-orange-50 border-l-4 border-orange-500 text-orange-700 p-4 mb-8 rounded-r"
        variants={itemVariants}
      >
        <div className="flex">
          <div className="flex-shrink-0">
            <FaEnvelope className="h-5 w-5 text-orange-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm font-medium text-orange-800">
              E-postbekreftelse kreves
            </p>
            <p className="text-sm mt-1">
              Etter registrering vil du motta en e-post med en bekreftelseslink. 
              Du må bekrefte e-postadressen din for å få full tilgang til alle funksjoner.
            </p>
          </div>
        </div>
      </motion.div>
      
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 mb-8 shadow-lg">
        {/* Personlig informasjon */}
        <motion.div 
          className="mb-6"
          variants={sectionVariants}
        >
          <h3 className="text-lg font-bold text-black mb-3 border-b pb-2">Personlig informasjon</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-600">Navn:</p>
              <p className="text-black font-medium">{userData.firstName} {userData.lastName}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">E-post:</p>
              <p className="text-black font-medium">{userData.email}</p>
            </div>
          </div>
        </motion.div>
        
        {/* Kostpreferanser */}
        <motion.div 
          className="mb-6"
          variants={sectionVariants}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-lg font-bold text-black mb-3 border-b pb-2">Kostpreferanser</h3>
          
          {userData.dietaryRestrictions.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Kostholdsrestriksjoner:</p>
              <div className="flex flex-wrap gap-2">
                {userData.dietaryRestrictions.map((restriction, index) => (
                  <motion.span 
                    key={index}
                    className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-1 rounded-full"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 + (index * 0.05) }}
                  >
                    {restriction}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
          
          {userData.allergies.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Allergier/intoleranser:</p>
              <div className="flex flex-wrap gap-2">
                {userData.allergies.map((allergy, index) => (
                  <motion.span 
                    key={index}
                    className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-1 rounded-full"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + (index * 0.05) }}
                  >
                    {allergy}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
          
          {userData.dislikedIngredients.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-1">Ingredienser du ikke liker:</p>
              <div className="flex flex-wrap gap-2">
                {userData.dislikedIngredients.map((ingredient, index) => (
                  <motion.span 
                    key={index}
                    className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-1 rounded-full"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + (index * 0.05) }}
                  >
                    {ingredient}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
        </motion.div>
        
        {/* Helsemål */}
        <motion.div 
          className="mb-6"
          variants={sectionVariants}
          transition={{ delay: 0.2 }}
        >
          <h3 className="text-lg font-bold text-black mb-3 border-b pb-2">Helsemål og aktivitetsnivå</h3>
          
          {userData.healthGoals.length > 0 && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Helsemål:</p>
              <div className="flex flex-wrap gap-2">
                {userData.healthGoals.map((goal, index) => (
                  <motion.span 
                    key={index}
                    className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-1 rounded-full"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5 + (index * 0.05) }}
                  >
                    {goal}
                  </motion.span>
                ))}
              </div>
            </div>
          )}
          
          {userData.activityLevel && (
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-1">Aktivitetsnivå:</p>
              <p className="text-black">{userData.activityLevel}</p>
            </div>
          )}
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {userData.weight && (
              <div>
                <p className="text-sm text-gray-600">Vekt:</p>
                <p className="text-black">{userData.weight} kg</p>
              </div>
            )}
            
            {userData.height && (
              <div>
                <p className="text-sm text-gray-600">Høyde:</p>
                <p className="text-black">{userData.height} cm</p>
              </div>
            )}
          </div>
        </motion.div>
        
        {/* Medlemskap */}
        <motion.div 
          variants={sectionVariants}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-lg font-bold text-black mb-3 border-b pb-2">Valgt medlemskap</h3>
          {userData.membershipTier && (
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg p-4 shadow-lg">
              <p className="font-bold text-xl">{MEMBERSHIP_TIERS[userData.membershipTier]?.name}</p>
              <p>{MEMBERSHIP_TIERS[userData.membershipTier]?.price}</p>
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Vilkår og betingelser */}
      <motion.div 
        className="bg-gray-50 p-4 rounded-lg mb-8"
        variants={itemVariants}
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-0.5">
            <FaInfoCircle className="h-5 w-5 text-gray-500" />
          </div>
          <div className="ml-3">
            <p className="text-sm text-gray-600">
              Ved å klikke på "Fullfør registrering" godtar du våre <a href="#" className="text-orange-600 hover:underline">vilkår og betingelser</a> og <a href="#" className="text-orange-600 hover:underline">personvernregler</a>. 
              Du vil motta en e-post med en bekreftelseslink som må aktiveres for å få full tilgang til tjenesten.
            </p>
          </div>
        </div>
      </motion.div>
      
      {error && (
        <motion.div 
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}
      
      <motion.div 
        className="flex justify-between"
        variants={itemVariants}
      >
        <motion.button
          type="button"
          onClick={goToPreviousStep}
          className="bg-white/20 hover:bg-white/30 text-black font-bold py-3 px-6 rounded-lg shadow-lg"
          whileHover={{ scale: 1.05, boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 17 }}
          disabled={isLoading}
        >
          Tilbake
        </motion.button>
        
        <motion.button
          type="submit"
          className={`
            bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg
            ${isLoading ? 'opacity-70 cursor-not-allowed' : 'hover:shadow-xl'}
          `}
          whileHover={!isLoading ? { scale: 1.05, boxShadow: "0px 0px 15px rgba(249, 115, 22, 0.5)" } : {}}
          whileTap={!isLoading ? { scale: 0.95 } : {}}
          transition={{ type: "spring", stiffness: 500, damping: 17 }}
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Registrerer...
            </div>
          ) : (
            'Fullfør registrering'
          )}
        </motion.button>
      </motion.div>
    </motion.form>
  );
}
