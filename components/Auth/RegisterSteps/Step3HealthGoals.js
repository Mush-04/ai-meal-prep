import { useState } from 'react';
import { motion } from 'framer-motion';

// Predefinerte alternativer
const HEALTH_GOALS = [
  'Gå ned i vekt',
  'Øke muskelmasse',
  'Vedlikeholde vekt',
  'Bedre energinivå',
  'Bedre fordøyelse',
  'Bedre søvnkvalitet',
  'Redusere betennelse',
  'Bedre blodsukkerbalanse'
];

const ACTIVITY_LEVELS = [
  { id: 'stillesittende', label: 'Stillesittende (lite eller ingen trening)' },
  { id: 'lett', label: 'Lett aktiv (lett trening 1-3 dager i uken)' },
  { id: 'moderat', label: 'Moderat aktiv (moderat trening 3-5 dager i uken)' },
  { id: 'veldig', label: 'Veldig aktiv (hard trening 6-7 dager i uken)' },
  { id: 'ekstremt', label: 'Ekstremt aktiv (fysisk jobb eller trening to ganger daglig)' }
];

export default function Step3HealthGoals({ userData, updateUserData, goToNextStep, goToPreviousStep }) {
  const [errors, setErrors] = useState({});
  
  const handleHealthGoalToggle = (goal) => {
    const updatedGoals = userData.healthGoals.includes(goal)
      ? userData.healthGoals.filter(item => item !== goal)
      : [...userData.healthGoals, goal];
    
    updateUserData({ healthGoals: updatedGoals });
  };
  
  const validateForm = () => {
    const newErrors = {};
    
    // Valider at minst ett helsemål er valgt
    if (userData.healthGoals.length === 0) {
      newErrors.healthGoals = 'Vennligst velg minst ett helsemål';
    }
    
    // Valider vekt hvis oppgitt (må være et tall)
    if (userData.currentWeight && isNaN(userData.currentWeight)) {
      newErrors.currentWeight = 'Vennligst oppgi et gyldig tall';
    }
    
    if (userData.targetWeight && isNaN(userData.targetWeight)) {
      newErrors.targetWeight = 'Vennligst oppgi et gyldig tall';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      goToNextStep();
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
        Helsemål
      </motion.h2>
      
      {/* Helsemål */}
      <motion.div className="mb-8" variants={itemVariants}>
        <label className="block text-black text-sm font-bold mb-3">
          Hva er dine helsemål? (Velg en eller flere)
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {HEALTH_GOALS.map((goal) => (
            <motion.div 
              key={goal}
              onClick={() => handleHealthGoalToggle(goal)}
              className={`
                cursor-pointer rounded-lg p-3 text-center text-sm transition-all
                ${userData.healthGoals.includes(goal) 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg' 
                  : 'bg-white/10 text-black hover:bg-white/20'}
              `}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={userData.healthGoals.includes(goal) ? 
                { boxShadow: "0px 0px 15px rgba(249, 115, 22, 0.3)" } : 
                { boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)" }
              }
              transition={{ type: "spring", stiffness: 500, damping: 17 }}
            >
              {goal}
            </motion.div>
          ))}
        </div>
        {errors.healthGoals && (
          <motion.p 
            className="text-red-600 text-sm mt-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            {errors.healthGoals}
          </motion.p>
        )}
      </motion.div>
      
      {/* Aktivitetsnivå */}
      <motion.div className="mb-8">
        <label className="block text-black text-sm font-bold mb-3">
          Hva er ditt aktivitetsnivå?
        </label>
        <div className="space-y-3">
          {ACTIVITY_LEVELS.map((level) => (
            <motion.div 
              key={level.id}
              onClick={() => updateUserData({ activityLevel: level.id })}
              className={`
                cursor-pointer rounded-lg p-4 transition-all
                ${userData.activityLevel === level.id 
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg' 
                  : 'bg-white/10 text-black hover:bg-white/20'}
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              animate={userData.activityLevel === level.id ? 
                { boxShadow: "0px 0px 15px rgba(249, 115, 22, 0.3)" } : 
                { boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)" }
              }
              transition={{ type: "spring", stiffness: 500, damping: 17 }}
            >
              {level.label}
            </motion.div>
          ))}
        </div>
      </motion.div>
      
      {/* Vekt */}
      <motion.div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8" variants={itemVariants}>
        <div>
          <label className="block text-black text-sm font-bold mb-2" htmlFor="currentWeight">
            Nåværende vekt (kg)
          </label>
          <motion.input
            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500"
            id="currentWeight"
            type="number"
            placeholder="75"
            value={userData.currentWeight || ''}
            onChange={(e) => updateUserData({ currentWeight: e.target.value })}
            whileFocus={{ scale: 1.02, boxShadow: "0px 0px 8px rgba(249, 115, 22, 0.5)" }}
            transition={{ type: "spring", stiffness: 500, damping: 17 }}
          />
          {errors.currentWeight && (
            <motion.p 
              className="text-red-600 text-sm mt-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              {errors.currentWeight}
            </motion.p>
          )}
        </div>
        
        <div>
          <label className="block text-black text-sm font-bold mb-2" htmlFor="targetWeight">
            Målvekt (kg)
          </label>
          <motion.input
            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500"
            id="targetWeight"
            type="number"
            placeholder="70"
            value={userData.targetWeight || ''}
            onChange={(e) => updateUserData({ targetWeight: e.target.value })}
            whileFocus={{ scale: 1.02, boxShadow: "0px 0px 8px rgba(249, 115, 22, 0.5)" }}
            transition={{ type: "spring", stiffness: 500, damping: 17 }}
          />
          {errors.targetWeight && (
            <motion.p 
              className="text-red-600 text-sm mt-2"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              {errors.targetWeight}
            </motion.p>
          )}
        </div>
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
