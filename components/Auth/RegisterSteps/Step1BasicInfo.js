import { useState } from 'react';
import { motion } from 'framer-motion';

export default function Step1BasicInfo({ userData, updateUserData, goToNextStep }) {
  const [errors, setErrors] = useState({});
  
  const validateForm = () => {
    const newErrors = {};
    
    // Valider e-post med mer robust regex
    if (!userData.email) {
      newErrors.email = 'E-post er påkrevd';
    } else if (!/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(userData.email)) {
      newErrors.email = 'Vennligst oppgi en gyldig e-postadresse (f.eks. navn@domene.no)';
    }
    
    // Valider passord
    if (!userData.password) {
      newErrors.password = 'Passord er påkrevd';
    } else if (userData.password.length < 6) {
      newErrors.password = 'Passordet må være minst 6 tegn';
    }
    
    // Valider passordbekreftelse
    if (userData.password !== userData.confirmPassword) {
      newErrors.confirmPassword = 'Passordene matcher ikke';
    }
    
    // Valider fornavn
    if (!userData.firstName) {
      newErrors.firstName = 'Fornavn er påkrevd';
    }
    
    // Valider etternavn
    if (!userData.lastName) {
      newErrors.lastName = 'Etternavn er påkrevd';
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

  const inputVariants = {
    focus: { scale: 1.02, boxShadow: "0px 0px 8px rgba(249, 115, 22, 0.5)" },
    blur: { scale: 1, boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)" }
  };

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
        Personlig informasjon
      </motion.h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <motion.div variants={itemVariants}>
          <label className="block text-black text-sm font-bold mb-2" htmlFor="firstName">
            Fornavn
          </label>
          <motion.input
            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500"
            id="firstName"
            type="text"
            placeholder="Ola"
            value={userData.firstName}
            onChange={(e) => updateUserData({ firstName: e.target.value })}
            whileFocus="focus"
            whileBlur="blur"
            variants={inputVariants}
          />
          {errors.firstName && (
            <motion.p 
              className="text-red-600 text-xs mt-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              {errors.firstName}
            </motion.p>
          )}
        </motion.div>
        
        <motion.div variants={itemVariants}>
          <label className="block text-black text-sm font-bold mb-2" htmlFor="lastName">
            Etternavn
          </label>
          <motion.input
            className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500"
            id="lastName"
            type="text"
            placeholder="Nordmann"
            value={userData.lastName}
            onChange={(e) => updateUserData({ lastName: e.target.value })}
            whileFocus="focus"
            whileBlur="blur"
            variants={inputVariants}
          />
          {errors.lastName && (
            <motion.p 
              className="text-red-600 text-xs mt-1"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 20 }}
            >
              {errors.lastName}
            </motion.p>
          )}
        </motion.div>
      </div>
      
      <motion.div className="mb-6" variants={itemVariants}>
        <label className="block text-black text-sm font-bold mb-2" htmlFor="email">
          E-post
        </label>
        <motion.input
          className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500"
          id="email"
          type="email"
          placeholder="ola.nordmann@example.com"
          value={userData.email}
          onChange={(e) => updateUserData({ email: e.target.value })}
          whileFocus="focus"
          whileBlur="blur"
          variants={inputVariants}
        />
        {errors.email && (
          <motion.p 
            className="text-red-600 text-xs mt-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            {errors.email}
          </motion.p>
        )}
      </motion.div>
      
      <motion.div className="mb-6" variants={itemVariants}>
        <label className="block text-black text-sm font-bold mb-2" htmlFor="password">
          Passord
        </label>
        <motion.input
          className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500"
          id="password"
          type="password"
          placeholder="********"
          value={userData.password}
          onChange={(e) => updateUserData({ password: e.target.value })}
          whileFocus="focus"
          whileBlur="blur"
          variants={inputVariants}
        />
        {errors.password && (
          <motion.p 
            className="text-red-600 text-xs mt-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            {errors.password}
          </motion.p>
        )}
        <p className="text-gray-600 text-xs mt-1">Passordet må være minst 6 tegn langt</p>
      </motion.div>
      
      <motion.div className="mb-8" variants={itemVariants}>
        <label className="block text-black text-sm font-bold mb-2" htmlFor="confirmPassword">
          Bekreft passord
        </label>
        <motion.input
          className="shadow appearance-none border rounded w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500"
          id="confirmPassword"
          type="password"
          placeholder="********"
          value={userData.confirmPassword}
          onChange={(e) => updateUserData({ confirmPassword: e.target.value })}
          whileFocus="focus"
          whileBlur="blur"
          variants={inputVariants}
        />
        {errors.confirmPassword && (
          <motion.p 
            className="text-red-600 text-xs mt-1"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 500, damping: 20 }}
          >
            {errors.confirmPassword}
          </motion.p>
        )}
      </motion.div>
      
      <motion.div 
        className="flex justify-end"
        variants={itemVariants}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
      >
        <motion.button
          type="submit"
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-opacity-50 transition-all duration-300"
          whileHover={{ 
            boxShadow: "0px 0px 15px rgba(249, 115, 22, 0.5)",
          }}
        >
          Neste steg
        </motion.button>
      </motion.div>
    </motion.form>
  );
}
