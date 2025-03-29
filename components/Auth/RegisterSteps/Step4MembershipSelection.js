import { useState } from 'react';
import { motion } from 'framer-motion';

// Medlemskapsalternativer basert på hovedsiden
const MEMBERSHIP_TIERS = [
  {
    id: 'basis',
    name: 'Basis',
    price: '99 kr/måned',
    description: 'Måltidsgenerering: 50 AI-måltidsplaner/mnd.',
    features: [
      'Sett vektmål (opp/ned/vedlikehold) for tilpassede kalorimål',
      'Enkle oppskrifter med ingrediensliste, matvarebilder og basis ernæringsinfo',
      'Personlige matvarepreferanser («Jeg hater løk!»)',
      'Opptil 2 brukere på samme konto',
      'Enkle ernæringstips (f.eks. «Slik øker du proteininntaket»)'
    ],
    color: 'purple',
    buttonText: 'Velg Basis'
  },
  {
    id: 'premium',
    name: 'Pro Chef',
    price: '229 kr/måned',
    description: 'Måltidsgenerering: 150 AI-måltidsplaner/mnd.',
    features: [
      'Alt i Basis, pluss:',
      'Smart handleliste sortert etter butikkavdeling + automatisk kalorijustering',
      'Vektprogressjonssporing med graf og ukentlige oppsummeringer',
      'AI-måltidvurdering («Gjør denne oppskriften sunnere eller kaloririkere»)',
      'Måltidplanlegger med balansert ernæring for ditt mål',
      'Opptil 5 brukere + delt familiekalender',
      'Lagre opptil 200 oppskrifter'
    ],
    popular: true,
    color: 'orange',
    buttonText: 'Velg Pro Chef'
  },
  {
    id: 'familie',
    name: 'Ultimate Gourmet',
    price: '399 kr/måned',
    description: 'Måltidsgenerering: Ubegrenset',
    features: [
      'Alt i Pro Chef, pluss:',
      '«Restemat-Magi»: Lag oppskrifter basert på rester i kjøleskapet',
      '1:1 AI-ernæringscoach som gir ukentlige mål og motivasjonstips',
      'Automatisk justering av makronæring hver 4. uke for å unngå platåer',
      'Opptil 10 brukere + grupper med sanntidsoppdateringer',
      'Integrasjon med treningsapper (MyFitnessPal, Strava) for helhetlig oversikt'
    ],
    color: 'blue',
    buttonText: 'Velg Ultimate'
  }
];

export default function Step4MembershipSelection({ userData, updateUserData, goToNextStep, goToPreviousStep }) {
  const [errors, setErrors] = useState({});
  
  const validateForm = () => {
    const newErrors = {};
    
    if (!userData.membershipTier) {
      newErrors.membershipTier = 'Vennligst velg et medlemskap';
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

  const cardVariants = {
    hidden: { y: 20, opacity: 0, scale: 0.95 },
    visible: { 
      y: 0, 
      opacity: 1,
      scale: 1,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    },
    hover: { 
      y: -10, 
      scale: 1.03,
      boxShadow: "0px 10px 30px rgba(0, 0, 0, 0.15)",
      transition: { type: "spring", stiffness: 500, damping: 15 }
    },
    tap: { 
      scale: 0.98,
      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)",
      transition: { type: "spring", stiffness: 500, damping: 15 }
    }
  };

  // Bakgrunnsfargene for hvert medlemskap
  const tierBackgrounds = {
    'basis': 'bg-gradient-to-b from-purple-950/80 to-purple-900/60',
    'premium': 'bg-gradient-to-b from-orange-950/80 to-orange-800/60',
    'familie': 'bg-gradient-to-b from-blue-950/80 to-blue-900/60'
  };

  // Tekstfargene for hvert medlemskap
  const tierTextColors = {
    'basis': 'text-purple-300',
    'premium': 'text-orange-300',
    'familie': 'text-blue-300'
  };

  // Knappfargene for hvert medlemskap
  const tierButtonColors = {
    'basis': 'bg-purple-700 hover:bg-purple-600',
    'premium': 'bg-orange-600 hover:bg-orange-500',
    'familie': 'bg-blue-700 hover:bg-blue-600'
  };

  // Skyggeeffekter for hvert medlemskap
  const tierShadows = {
    'basis': '0 0 20px rgba(147, 51, 234, 0.3)',
    'premium': '0 0 30px rgba(249, 115, 22, 0.4)',
    'familie': '0 0 20px rgba(37, 99, 235, 0.3)'
  };

  // Kantfarger for hvert medlemskap
  const tierBorders = {
    'basis': 'border-purple-600/30',
    'premium': 'border-orange-500/40',
    'familie': 'border-blue-600/30'
  };

  // Knappskygger for hvert medlemskap
  const buttonShadows = {
    'basis': '0 0 10px rgba(147, 51, 234, 0.5)',
    'premium': '0 0 15px rgba(249, 115, 22, 0.6)',
    'familie': '0 0 10px rgba(37, 99, 235, 0.5)'
  };

  return (
    <motion.form 
      onSubmit={handleSubmit}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="max-w-4xl mx-auto"
    >
      <motion.div 
        className="flex justify-between mb-8"
        variants={itemVariants}
      >
        <motion.button
          type="button"
          onClick={goToPreviousStep}
          className="bg-white/20 hover:bg-white/30 text-black font-bold py-3 px-6 rounded-lg shadow-lg"
          whileHover={{ scale: 1.05, boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.1)" }}
          whileTap={{ scale: 0.95 }}
        >
          Tilbake
        </motion.button>
        
        <motion.button
          type="submit"
          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white font-bold py-3 px-6 rounded-lg shadow-lg"
          whileHover={{ scale: 1.05, boxShadow: "0px 0px 15px rgba(249, 115, 22, 0.5)" }}
          whileTap={{ scale: 0.95 }}
        >
          Neste steg
        </motion.button>
      </motion.div>
      
      <motion.h2 
        className="text-2xl font-bold text-black mb-2 text-center"
        variants={itemVariants}
      >
        Velg medlemskap
      </motion.h2>
      
      <motion.p 
        className="text-gray-600 mb-8 text-center"
        variants={itemVariants}
      >
        Velg det medlemskapet som passer best for dine behov
      </motion.p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
        {MEMBERSHIP_TIERS.map((tier, index) => (
          <motion.div
            key={tier.id}
            className={`
              ${tierBackgrounds[tier.id]} backdrop-blur-sm p-8 rounded-2xl border ${tierBorders[tier.id]} 
              relative flex flex-col h-full transform transition-all duration-500 hover:scale-105 hover:-translate-y-2
              ${userData.membershipTier === tier.id ? 'ring-4 ring-white/50' : ''}
              ${tier.id === 'premium' ? 'z-10' : ''}
            `}
            variants={cardVariants}
            whileHover="hover"
            whileTap="tap"
            custom={index}
            transition={{ delay: index * 0.1 }}
            style={{
              boxShadow: tierShadows[tier.id],
              animation: 'pulse 3s infinite alternate'
            }}
          >
            {tier.popular && (
              <div 
                className="absolute -top-6 -right-6 bg-gradient-to-br from-pink-500 to-blue-500 rounded-full p-3 text-xs font-bold text-center animate-spin-slow" 
                style={{ 
                  width: '80px', 
                  height: '80px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flexDirection: 'column',
                  boxShadow: '0 0 15px rgba(236, 72, 153, 0.6)'
                }}
              >
                <div>Mest</div>
                <div>Populær</div>
              </div>
            )}
            
            <h3 className={`${tierTextColors[tier.id]} text-2xl font-bold mb-2`}>{tier.name}</h3>
            <div className="flex items-end mb-6">
              <span className={`${tierTextColors[tier.id]} text-5xl font-bold`}>
                {tier.price.split(' ')[0]}
              </span>
              <span className={`${tierTextColors[tier.id]} text-xl ml-1 mb-1`}>
                {tier.price.split(' ')[1]}
              </span>
            </div>
            <p className="text-white/80 mb-4">
              <span className="font-semibold">{tier.description.split(':')[0]}:</span> {tier.description.split(':')[1]}
            </p>
            
            <button 
              type="button"
              onClick={() => updateUserData({ membershipTier: tier.id })}
              className={`
                ${tierButtonColors[tier.id]} text-white font-bold py-3 px-6 rounded-full 
                transition-all duration-300 mb-6 transform hover:scale-105
              `}
              style={{ boxShadow: buttonShadows[tier.id] }}
            >
              {userData.membershipTier === tier.id ? 'Valgt' : tier.buttonText}
            </button>
            
            <h4 className={`${tierTextColors[tier.id]} text-lg font-semibold mb-3`}>Funksjoner:</h4>
            <ul className="space-y-3 text-white/90 flex-grow">
              {tier.features.map((feature, i) => (
                <li key={i} className="flex items-start">
                  <span className={`${tierTextColors[tier.id]} mr-2`}>✦</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
      
      {errors.membershipTier && (
        <motion.p 
          className="text-red-500 text-center mb-4"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {errors.membershipTier}
        </motion.p>
      )}
    </motion.form>
  );
}
