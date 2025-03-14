import { useState } from 'react';
import { motion } from 'framer-motion';

// Predefinerte alternativer
const DIETARY_RESTRICTIONS = [
  'Vegetarianer',
  'Veganer',
  'Pescetarianer',
  'Glutenfri',
  'Laktosefri',
  'Ketogen',
  'Lavkarbo',
  'Paleo'
];

const COMMON_ALLERGIES = [
  'Melk',
  'Egg',
  'Nøtter',
  'Peanøtter',
  'Skalldyr',
  'Fisk',
  'Hvete',
  'Soya'
];

export default function Step2DietaryPreferences({ userData, updateUserData, goToNextStep, goToPreviousStep }) {
  const [newAllergy, setNewAllergy] = useState('');
  const [newDislikedIngredient, setNewDislikedIngredient] = useState('');
  
  const handleDietaryRestrictionToggle = (restriction) => {
    const updatedRestrictions = userData.dietaryRestrictions.includes(restriction)
      ? userData.dietaryRestrictions.filter(item => item !== restriction)
      : [...userData.dietaryRestrictions, restriction];
    
    updateUserData({ dietaryRestrictions: updatedRestrictions });
  };
  
  const handleAllergyToggle = (allergy) => {
    const updatedAllergies = userData.allergies.includes(allergy)
      ? userData.allergies.filter(item => item !== allergy)
      : [...userData.allergies, allergy];
    
    updateUserData({ allergies: updatedAllergies });
  };
  
  const handleAddCustomAllergy = () => {
    if (newAllergy.trim() && !userData.allergies.includes(newAllergy.trim())) {
      updateUserData({ allergies: [...userData.allergies, newAllergy.trim()] });
      setNewAllergy('');
    }
  };
  
  const handleAddDislikedIngredient = () => {
    if (newDislikedIngredient.trim() && !userData.dislikedIngredients.includes(newDislikedIngredient.trim())) {
      updateUserData({ dislikedIngredients: [...userData.dislikedIngredients, newDislikedIngredient.trim()] });
      setNewDislikedIngredient('');
    }
  };
  
  const handleRemoveAllergy = (allergy) => {
    updateUserData({ allergies: userData.allergies.filter(item => item !== allergy) });
  };
  
  const handleRemoveDislikedIngredient = (ingredient) => {
    updateUserData({ dislikedIngredients: userData.dislikedIngredients.filter(item => item !== ingredient) });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    goToNextStep();
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

  const chipVariants = {
    initial: { scale: 0.8, opacity: 0 },
    animate: { scale: 1, opacity: 1 },
    exit: { scale: 0.8, opacity: 0, transition: { duration: 0.2 } },
    hover: { scale: 1.05, boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.1)" }
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.h2 
        className="text-2xl font-bold text-black mb-6"
        variants={itemVariants}
      >
        Kostpreferanser
      </motion.h2>
      
      {/* Kostholdsrestriksjoner */}
      <motion.div className="mb-8" variants={itemVariants}>
        <label className="block text-black text-sm font-bold mb-3">
          Følger du et spesifikt kosthold?
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {DIETARY_RESTRICTIONS.map((restriction) => (
            <motion.div 
              key={restriction}
              onClick={() => handleDietaryRestrictionToggle(restriction)}
              className={`
                cursor-pointer rounded-lg p-3 text-center text-sm transition-all
                ${userData.dietaryRestrictions.includes(restriction) 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg' 
                  : 'bg-white/10 text-black hover:bg-white/20'}
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={userData.dietaryRestrictions.includes(restriction) ? 
                { boxShadow: "0px 0px 15px rgba(249, 115, 22, 0.3)" } : 
                { boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)" }
              }
              transition={{ type: "spring", stiffness: 500, damping: 17 }}
            >
              {restriction}
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      {/* Allergier */}
      <motion.div className="mb-8" variants={itemVariants}>
        <label className="block text-black text-sm font-bold mb-3">
          Har du noen allergier eller intoleranser?
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
          {COMMON_ALLERGIES.map((allergy) => (
            <motion.div 
              key={allergy}
              onClick={() => handleAllergyToggle(allergy)}
              className={`
                cursor-pointer rounded-lg p-3 text-center text-sm transition-all
                ${userData.allergies.includes(allergy) 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg' 
                  : 'bg-white/10 text-black hover:bg-white/20'}
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={userData.allergies.includes(allergy) ? 
                { boxShadow: "0px 0px 15px rgba(249, 115, 22, 0.3)" } : 
                { boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)" }
              }
              transition={{ type: "spring", stiffness: 500, damping: 17 }}
            >
              {allergy}
            </motion.div>
          ))}
        </div>
        
        {/* Legg til egendefinert allergi */}
        <div className="flex space-x-2 mb-4">
          <motion.input
            type="text"
            placeholder="Annen allergi..."
            value={newAllergy}
            onChange={(e) => setNewAllergy(e.target.value)}
            className="flex-grow shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500"
            whileFocus={{ scale: 1.02, boxShadow: "0px 0px 8px rgba(249, 115, 22, 0.5)" }}
            transition={{ type: "spring", stiffness: 500, damping: 17 }}
          />
          <motion.button
            type="button"
            onClick={handleAddCustomAllergy}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-2 px-4 rounded"
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 10px rgba(249, 115, 22, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 17 }}
          >
            Legg til
          </motion.button>
        </div>
        
        {/* Vise valgte allergier */}
        {userData.allergies.length > 0 && (
          <div className="mb-2">
            <p className="text-black text-sm mb-2">Dine allergier/intoleranser:</p>
            <div className="flex flex-wrap gap-2">
              {userData.allergies.map((allergy) => (
                <motion.span 
                  key={allergy} 
                  className="inline-flex items-center bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-1 rounded-full"
                  variants={chipVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  whileHover="hover"
                  layout
                >
                  {allergy}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveAllergy(allergy)}
                    className="ml-1.5 text-orange-600 hover:text-orange-900 focus:outline-none"
                  >
                    ×
                  </button>
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
      
      {/* Ingredienser du ikke liker */}
      <motion.div className="mb-8" variants={itemVariants}>
        <label className="block text-black text-sm font-bold mb-3">
          Er det noen ingredienser du ikke liker?
        </label>
        
        {/* Legg til ingredienser du ikke liker */}
        <div className="flex space-x-2 mb-4">
          <motion.input
            type="text"
            placeholder="F.eks. løk, oliven, koriander..."
            value={newDislikedIngredient}
            onChange={(e) => setNewDislikedIngredient(e.target.value)}
            className="flex-grow shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500"
            whileFocus={{ scale: 1.02, boxShadow: "0px 0px 8px rgba(249, 115, 22, 0.5)" }}
            transition={{ type: "spring", stiffness: 500, damping: 17 }}
          />
          <motion.button
            type="button"
            onClick={handleAddDislikedIngredient}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-2 px-4 rounded"
            whileHover={{ scale: 1.05, boxShadow: "0px 0px 10px rgba(249, 115, 22, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 500, damping: 17 }}
          >
            Legg til
          </motion.button>
        </div>
        
        {/* Vise ingredienser du ikke liker */}
        {userData.dislikedIngredients.length > 0 && (
          <div>
            <p className="text-black text-sm mb-2">Ingredienser du ikke liker:</p>
            <div className="flex flex-wrap gap-2">
              {userData.dislikedIngredients.map((ingredient) => (
                <motion.span 
                  key={ingredient} 
                  className="inline-flex items-center bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-1 rounded-full"
                  variants={chipVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  whileHover="hover"
                  layout
                >
                  {ingredient}
                  <button 
                    type="button" 
                    onClick={() => handleRemoveDislikedIngredient(ingredient)}
                    className="ml-1.5 text-orange-600 hover:text-orange-900 focus:outline-none"
                  >
                    ×
                  </button>
                </motion.span>
              ))}
            </div>
          </div>
        )}
      </motion.div>
      
      <motion.div 
        className="flex justify-between"
        variants={itemVariants}
      >
        <motion.button
          type="button"
          onClick={goToPreviousStep}
          className="bg-white/20 hover:bg-white/30 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
          whileHover={{ scale: 1.05, boxShadow: "0px 0px 10px rgba(255, 255, 255, 0.3)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 17 }}
        >
          Tilbake
        </motion.button>
        
        <motion.button
          type="submit"
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
          whileHover={{ scale: 1.05, boxShadow: "0px 0px 15px rgba(249, 115, 22, 0.5)" }}
          whileTap={{ scale: 0.95 }}
          transition={{ type: "spring", stiffness: 500, damping: 17 }}
        >
          Neste steg
        </motion.button>
      </motion.div>
    </motion.form>
  );
}
