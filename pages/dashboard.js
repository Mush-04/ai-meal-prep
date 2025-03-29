import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { FaUtensils, FaAppleAlt, FaShoppingCart, FaAllergies, FaUsers, FaHeadset, 
         FaTachometerAlt, FaListAlt, FaRulerCombined, FaStore, FaUser, FaVideo, 
         FaTrophy, FaBook, FaDumbbell, FaInfoCircle, FaQuestionCircle, FaCog, 
         FaPause, FaRedo, FaSignOutAlt, FaSpinner, FaLock, FaRobot, FaCalendarAlt,
         FaChartBar } from 'react-icons/fa';
import EmailConfirmationBanner from '../components/common/EmailConfirmationBanner';
import { motion } from 'framer-motion';
import { Bar } from 'react-chartjs-2';

export default function Dashboard() {
  const { user, signOut, isEmailConfirmed } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [selectedAvatar, setSelectedAvatar] = useState('');
  const [showAvatarSelector, setShowAvatarSelector] = useState(false);
  const [editMode, setEditMode] = useState({
    personal: false,
    dietary: false,
    health: false
  });
  const [editedProfileData, setEditedProfileData] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // State for AI Meal Generator
  const [mealPreferences, setMealPreferences] = useState({
    mealType: 'middag',
    dietaryPreferences: '',
    allergies: '',
    dislikedIngredients: '',
    healthGoals: '',
    calorieTarget: 500,
    ingredients: '', 
  });
  const [generatedMeal, setGeneratedMeal] = useState(null);
  const [isGeneratingMeal, setIsGeneratingMeal] = useState(false);
  const [mealError, setMealError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null); 
  const [isImageUploading, setIsImageUploading] = useState(false); 
  const [showInspirationForm, setShowInspirationForm] = useState(false); 
  const [inspirationPreferences, setInspirationPreferences] = useState({
    mood: 'Kos',
    time: 30,
    cuisine: 'Italiensk',
    servings: 2
  }); 

  // State for måltidsplan
  const [planPreferences, setPlanPreferences] = useState({
    daysToGenerate: 7,
    mealsPerDay: 3,
    dietaryPreferences: '',
    allergies: '',
    dislikedIngredients: '',
    healthGoals: '',
    dailyCalorieTarget: 2000,
  });
  const [generatedPlan, setGeneratedPlan] = useState(null);
  const [isGeneratingPlan, setIsGeneratingPlan] = useState(false);
  const [planError, setPlanError] = useState(null);

  // Funksjon for å hente ut fornavn fra e-postadressen
  const getFirstName = (email) => {
    if (!email) return '';
    const username = email.split('@')[0];
    // Fjern tall og spesialtegn og gjør første bokstav stor
    const firstName = username.replace(/[0-9_.-]/g, '');
    return firstName.charAt(0).toUpperCase() + firstName.slice(1);
  };

  // Sett aktiv fane basert på URL-parameter
  useEffect(() => {
    if (router.query.tab) {
      // Konverter 'profil' til 'profile' for å matche interne fane-navn
      const tabName = router.query.tab === 'profil' ? 'profile' : router.query.tab;
      setActiveTab(tabName);
    }
  }, [router.query.tab]);

  // Hent profildata når brukeren er innlogget og profil-fanen er aktiv
  useEffect(() => {
    if (user && (activeTab === 'profile' || router.query.tab === 'profil')) {
      console.log('Henter profildata for bruker:', user.id);
      fetchProfileData();
    }
  }, [user, activeTab, router.query.tab]);

  // Funksjon for å hente profildata fra Supabase
  const fetchProfileData = async () => {
    try {
      setProfileLoading(true);
      setProfileError(null);
      console.log('Starter henting av profildata...');
      
      // Først sjekk om profiles-tabellen eksisterer og har riktig struktur
      try {
        // Prøv først med id (som kan være standard i Supabase)
        const { data: profileWithId, error: errorWithId } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (!errorWithId && profileWithId) {
          console.log('Profildata funnet med id-kolonne:', profileWithId);
          setProfileData(profileWithId);
          setEditedProfileData(profileWithId);
          setProfileLoading(false);
          return;
        }
        
        // Prøv med auth_id som kan være et annet alternativ
        const { data: profileWithAuthId, error: errorWithAuthId } = await supabase
          .from('profiles')
          .select('*')
          .eq('auth_id', user.id)
          .single();
          
        if (!errorWithAuthId && profileWithAuthId) {
          console.log('Profildata funnet med auth_id-kolonne:', profileWithAuthId);
          setProfileData(profileWithAuthId);
          setEditedProfileData(profileWithAuthId);
          setProfileLoading(false);
          return;
        }
        
        // Hvis vi kommer hit, finnes ikke profilen eller tabellen har en annen struktur
        console.log('Ingen eksisterende profil funnet, oppretter ny profil');
        
        // Opprett en tom profil
        const emptyProfile = {
          id: user.id,  // Prøv med 'id' først
          auth_id: user.id, // Legg også til auth_id som alternativ
          email: user?.email || '',
          name: user?.email?.split('@')[0] || '',
          phone: '',
          address: '',
          dietary_preferences: '',
          allergies: '',
          disliked_ingredients: '',
          health_goals: '',
          activity_level: 'moderat',
          weight: '',
          height: '',
          membership_tier: 'basis',
          created_at: new Date().toISOString()
        };
        
        // Prøv å sette inn profilen
        const { data: insertedProfile, error: insertError } = await supabase
          .from('profiles')
          .insert([emptyProfile])
          .select();
          
        if (insertError) {
          console.error('Feil ved oppretting av profil:', insertError);
          
          // Hvis feilen er relatert til at tabellen ikke finnes, vis en spesifikk feilmelding
          if (insertError.code === '42P01') { // Relation does not exist
            setProfileError('Profiles-tabellen finnes ikke i databasen. Vennligst kontakt administrator.');
          } else {
            setProfileError(`Kunne ikke opprette profil: ${insertError.message}`);
          }
        } else if (insertedProfile && insertedProfile.length > 0) {
          console.log('Ny profil opprettet:', insertedProfile[0]);
          setProfileData(insertedProfile[0]);
          setEditedProfileData(insertedProfile[0]);
        } else {
          // Hvis vi ikke får noen feil, men heller ikke noen data tilbake
          setProfileData(emptyProfile);
          setEditedProfileData(emptyProfile);
          console.log('Profil opprettet, men ingen data returnert. Bruker lokal profil.');
        }
        
      } catch (dbError) {
        console.error('Database-feil:', dbError);
        setProfileError(`Database-feil: ${dbError.message}`);
      }
      
    } catch (error) {
      console.error('Feil ved henting av profildata:', error);
      setProfileError(`Kunne ikke hente profildata: ${error.message}`);
    } finally {
      setProfileLoading(false);
    }
  };

  // Funksjon for å håndtere endringer i profildata
  const handleProfileChange = (section, field, value) => {
    setEditedProfileData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Funksjon for å håndtere endringer i arrays (som allergier)
  const handleArrayChange = (field, value) => {
    // Sjekk om verdien allerede finnes i arrayet
    const currentArray = editedProfileData[field] || [];
    
    if (typeof currentArray === 'string') {
      // Hvis feltet er lagret som string, konverter til array
      const newArray = currentArray ? currentArray.split(',').map(item => item.trim()) : [];
      if (!newArray.includes(value)) {
        newArray.push(value);
      }
      setEditedProfileData(prev => ({
        ...prev,
        [field]: newArray
      }));
    } else {
      // Hvis feltet allerede er et array
      if (!currentArray.includes(value)) {
        setEditedProfileData(prev => ({
          ...prev,
          [field]: [...currentArray, value]
        }));
      }
    }
  };

  // Funksjon for å fjerne verdier fra arrays
  const handleRemoveArrayItem = (field, index) => {
    const currentArray = editedProfileData[field] || [];
    if (typeof currentArray === 'string') {
      const newArray = currentArray.split(',').map(item => item.trim());
      newArray.splice(index, 1);
      setEditedProfileData(prev => ({
        ...prev,
        [field]: newArray
      }));
    } else {
      const newArray = [...currentArray];
      newArray.splice(index, 1);
      setEditedProfileData(prev => ({
        ...prev,
        [field]: newArray
      }));
    }
  };

  // Funksjon for å lagre profildata
  const saveProfileData = async (section) => {
    try {
      setIsSaving(true);
      
      // Konverter arrays til Supabase array-format
      const dataToSave = { ...editedProfileData };
      ['dietary_preferences', 'allergies', 'disliked_ingredients'].forEach(field => {
        if (Array.isArray(dataToSave[field])) {
          dataToSave[field] = `{${dataToSave[field].join(',')}}`;
        }
      });
      
      console.log('Lagrer profildata:', dataToSave);
      
      // Fjern eventuelle udefinerte eller null-verdier
      Object.keys(dataToSave).forEach(key => {
        if (dataToSave[key] === undefined || dataToSave[key] === null) {
          delete dataToSave[key];
        }
      });
      
      // Sikre at bruker-ID er satt
      const profileId = user?.id;
      if (!profileId) {
        throw new Error('Bruker-ID mangler');
      }
      
      // Bruk en enklere tilnærming: Sjekk først om profilen eksisterer
      const { data: existingProfile, error: fetchError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', profileId)
        .maybeSingle();
      
      if (fetchError) {
        console.error('Feil ved sjekk av eksisterende profil:', fetchError);
      }
      
      let result;
      
      // Hvis profilen eksisterer, oppdater den
      if (existingProfile) {
        console.log('Oppdaterer eksisterende profil');
        result = await supabase
          .from('profiles')
          .update({
            ...dataToSave,
            updated_at: new Date().toISOString()
          })
          .eq('id', profileId);
      } 
      // Ellers opprett en ny profil
      else {
        console.log('Oppretter ny profil');
        result = await supabase
          .from('profiles')
          .insert({
            ...dataToSave,
            id: profileId,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
      }
      
      if (result.error) {
        console.error('Feil ved lagring av profil:', result.error);
        throw result.error;
      }
      
      console.log('Profildata lagret vellykket');
      
      // Hent oppdatert data
      await fetchProfileData();
      
      // Lukk redigeringsmodus for den aktuelle seksjonen
      setEditMode(prev => ({
        ...prev,
        [section]: false
      }));
      
      // Vis suksessmelding
      alert('Profildata oppdatert!');
      
    } catch (error) {
      console.error('Feil ved lagring av profildata:', error);
      alert(`Kunne ikke lagre profildata: ${error.message || 'Ukjent feil'}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Funksjon for å avbryte redigering
  const cancelEdit = (section) => {
    setEditedProfileData(profileData);
    setEditMode(prev => ({
      ...prev,
      [section]: false
    }));
  };

  // Dummy data for oversiktsfanen
  const userData = {
    name: getFirstName(user?.email) || 'Bruker',
    calories: '3233',
    protein: '150g',
    carbs: '300g',
    fat: '120g',
    streak: '12',
    nextMeal: 'Lunsj',
    nextMealTime: '12:30',
    progress: 75,
  };

  // Funksjon for å håndtere klikk på faner
  const handleTabClick = (tabName) => {
    console.log('Bytter til fane:', tabName);
    setActiveTab(tabName);
    
    // Oppdater URL for å reflektere den aktive fanen
    const norwegianTabName = tabName === 'profile' ? 'profil' : tabName;
    router.push(`/dashboard?tab=${norwegianTabName}`, undefined, { shallow: true });
  };

  // Funksjon for å håndtere utlogging
  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/login');
    } catch (error) {
      console.error('Feil ved utlogging:', error);
      alert('Kunne ikke logge ut. Vennligst prøv igjen.');
    }
  };

  // Funksjon for å håndtere endringer i måltidspreferanser
  const handleMealPreferenceChange = (e) => {
    const { name, value } = e.target;
    setMealPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Funksjon for å generere måltid
  const generateMeal = async () => {
    try {
      setIsGeneratingMeal(true);
      setMealError(null);
      
      const response = await fetch('/api/generate-meal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mealPreferences),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunne ikke generere måltid');
      }
      
      const data = await response.json();
      setGeneratedMeal(data);
      
      // Generer bilde for måltidet
      if (data.title) {
        generateMealImage(data.title);
      }
    } catch (error) {
      console.error('Feil ved generering av måltid:', error);
      setMealError(error.message || 'Kunne ikke generere måltid. Vennligst prøv igjen senere.');
    } finally {
      setIsGeneratingMeal(false);
    }
  };

  // Funksjon for å generere bilde for måltid
  const generateMealImage = async (mealTitle) => {
    try {
      const response = await fetch('/api/generate-meal-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mealTitle: mealTitle,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunne ikke generere måltidsbilde');
      }
      
      const imageData = await response.json();
      
      // Oppdater generatedMeal med bildeURL
      setGeneratedMeal(prevMeal => ({
        ...prevMeal,
        imageUrl: imageData.imageUrl
      }));
    } catch (error) {
      console.error('Feil ved generering av måltidsbilde:', error);
      // Vi viser ikke feil til brukeren her siden bildet er valgfritt
    }
  };

  // Funksjon for å håndtere endringer i måltidsplanpreferanser
  const handlePlanPreferenceChange = (e) => {
    const { name, value } = e.target;
    setPlanPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Funksjon for å generere måltidsplan
  const generateMealPlan = async () => {
    try {
      setIsGeneratingPlan(true);
      setPlanError(null);
      
      const response = await fetch('/api/generate-meal-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(planPreferences),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Kunne ikke generere måltidsplan');
      }
      
      const data = await response.json();
      setGeneratedPlan(data);
      
    } catch (error) {
      console.error('Feil ved generering av måltidsplan:', error);
      setPlanError(error.message || 'Kunne ikke generere måltidsplan. Vennligst prøv igjen senere.');
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Funksjon for å håndtere bildeopplastning
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      // Her kan vi senere implementere bildeanalyse med ChatGPT-4o Vision
    }
  };

  // Funksjon for å håndtere endringer i inspirasjonspreferanser
  const handleInspirationChange = (e) => {
    const { name, value } = e.target;
    setInspirationPreferences(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Funksjon for å bruke inspirasjonspreferanser
  const useInspirationPreferences = () => {
    // Her kan vi senere implementere logikk for å bruke inspirasjonspreferanser
    // For nå, lukker vi bare skjemaet og setter en melding
    setShowInspirationForm(false);
    alert('Inspirasjonspreferanser lagret! Vi bruker disse til å generere et måltid for deg.');
  };

  const nutritionData = {
    labels: ['Kalorier', 'Protein', 'Karbohydrater', 'Fett'],
    datasets: [
      {
        label: 'Inntak',
        data: [parseInt(userData.calories), parseInt(userData.protein), parseInt(userData.carbs), parseInt(userData.fat)],
        backgroundColor: [
          'rgba(255, 99, 132, 0.2)',
          'rgba(54, 162, 235, 0.2)',
          'rgba(255, 206, 86, 0.2)',
          'rgba(75, 192, 192, 0.2)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)'
        ],
        borderWidth: 1
      }
    ]
  };

  const nutritionOptions = {
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <motion.div
        className="w-64 bg-gradient-to-b from-orange-500 to-orange-600 text-white shadow-lg relative overflow-hidden"
        initial={{ x: -100 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          className="absolute w-32 h-32 bg-orange-300 rounded-full opacity-40 pointer-events-none"
          animate={{ x: [0, 8, 0], y: [0, 8, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: '-10px', left: '-10px', zIndex: 0 }}
        />
        <motion.div
          className="absolute w-24 h-24 bg-orange-400 rounded-full opacity-40 pointer-events-none"
          animate={{ x: [0, -8, 0], y: [0, -8, 0] }}
          transition={{ duration: 30, repeat: Infinity, ease: "easeInOut" }}
          style={{ bottom: '-10px', right: '-10px', zIndex: 0 }}
        />
        <motion.div
          className="absolute text-3xl pointer-events-none"
          animate={{ rotate: [0, 360] }}
          transition={{ duration: 40, repeat: Infinity, ease: "linear" }}
          style={{ top: '15px', right: '15px', zIndex: 0, opacity: 0.8 }}
        >
          🍽️
        </motion.div>
        <motion.div
          className="absolute text-2xl pointer-events-none"
          animate={{ rotate: [360, 0] }}
          transition={{ duration: 45, repeat: Infinity, ease: "linear" }}
          style={{ bottom: '15px', left: '15px', zIndex: 0, opacity: 0.8 }}
        >
          🥦
        </motion.div>
        <motion.div
          className="absolute text-2xl pointer-events-none"
          animate={{ y: [0, -8, 0] }}
          transition={{ duration: 35, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: '50%', right: '20px', zIndex: 0, opacity: 0.8 }}
        >
          🥩
        </motion.div>
        <motion.div
          className="absolute text-2xl pointer-events-none"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
          style={{ top: '30%', left: '20px', zIndex: 0, opacity: 0.8 }}
        >
          🥕
        </motion.div>
        <motion.div
          className="absolute text-2xl pointer-events-none"
          animate={{ rotate: [0, 180, 360] }}
          transition={{ duration: 50, repeat: Infinity, ease: "linear" }}
          style={{ bottom: '40%', right: '25px', zIndex: 0, opacity: 0.8 }}
        >
          🍗
        </motion.div>
        <div className="p-4 border-b border-orange-400 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mr-2" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
          </svg>
          <h2 className="text-xl font-bold">Smarte Måltider</h2>
        </div>
        
        <div className="p-4">
          <div className="mb-6">
            <p className="text-xs uppercase font-semibold mb-2 text-orange-200 px-2">Oversikt</p>
            <ul>
              <li className="mb-1">
                <button 
                  className={`flex items-center w-full p-2 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-white text-orange-600 font-medium shadow-md' : 'hover:bg-orange-400 text-white'}`}
                  onClick={() => handleTabClick('overview')}
                >
                  <FaTachometerAlt className="h-5 w-5 mr-3" />
                  <span>Dashboard</span>
                </button>
              </li>
              <li className="mb-1">
                <button 
                  className={`flex items-center w-full p-2 rounded-lg transition-colors ${activeTab === 'statistics' ? 'bg-white text-orange-600 font-medium shadow-md' : 'hover:bg-orange-400 text-white'}`}
                  onClick={() => handleTabClick('statistics')}
                >
                  <FaChartBar className="h-5 w-5 mr-3" />
                  <span>Statistikk</span>
                </button>
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <p className="text-xs uppercase font-semibold mb-2 text-orange-200 px-2">Måltidsplanlegging</p>
            <ul>
              <li className="mb-1">
                <button 
                  className={`flex items-center w-full p-2 rounded-lg transition-colors ${activeTab === 'ai-meal-generator' ? 'bg-white text-orange-600 font-medium shadow-md' : 'hover:bg-orange-400 text-white'}`}
                  onClick={() => handleTabClick('ai-meal-generator')}
                >
                  <FaUtensils className="h-5 w-5 mr-3" />
                  <span>Måltidsgenerator</span>
                </button>
              </li>
              <li className="mb-1">
                <button 
                  className={`flex items-center w-full p-2 rounded-lg transition-colors ${activeTab === 'meals' ? 'bg-white text-orange-600 font-medium shadow-md' : 'hover:bg-orange-400 text-white'}`}
                  onClick={() => handleTabClick('meals')}
                >
                  <FaUtensils className="h-5 w-5 mr-3" />
                  <span>Mine måltider</span>
                </button>
              </li>
              <li className="mb-1">
                <button 
                  className={`flex items-center w-full p-2 rounded-lg transition-colors ${activeTab === 'mealplan' ? 'bg-white text-orange-600 font-medium shadow-md' : 'hover:bg-orange-400 text-white'}`}
                  onClick={() => handleTabClick('mealplan')}
                >
                  <FaCalendarAlt className="h-5 w-5 mr-3" />
                  <span>Måltidsplan</span>
                </button>
              </li>
              <li className="mb-1">
                <button 
                  className={`flex items-center w-full p-2 rounded-lg transition-colors ${activeTab === 'shopping' ? 'bg-white text-orange-600 font-medium shadow-md' : 'hover:bg-orange-400 text-white'}`}
                  onClick={() => handleTabClick('shopping')}
                >
                  <FaShoppingCart className="h-5 w-5 mr-3" />
                  <span>Handleliste</span>
                </button>
              </li>
            </ul>
          </div>

          <div className="mb-6">
            <p className="text-xs uppercase font-semibold mb-2 text-orange-200 px-2">Konto</p>
            <ul>
              <li className="mb-1">
                <button 
                  className={`flex items-center w-full p-2 rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-white text-orange-600 font-medium shadow-md' : 'hover:bg-orange-400 text-white'}`}
                  onClick={() => handleTabClick('profile')}
                >
                  <FaUser className="h-5 w-5 mr-3" />
                  <span>Min profil</span>
                </button>
              </li>
              <li className="mb-1">
                <button 
                  className={`flex items-center w-full p-2 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-white text-orange-600 font-medium shadow-md' : 'hover:bg-orange-400 text-white'}`}
                  onClick={() => handleTabClick('settings')}
                >
                  <FaCog className="h-5 w-5 mr-3" />
                  <span>Innstillinger</span>
                </button>
              </li>
            </ul>
          </div>
          
          {/* Logg ut-knapp */}
          <div className="mt-auto pt-4 border-t border-orange-400">
            <button 
              className="flex items-center w-full p-2 rounded-lg text-white hover:bg-orange-700 transition-colors"
              onClick={handleLogout}
            >
              <FaSignOutAlt className="h-5 w-5 mr-3" />
              <span>Logg ut</span>
            </button>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <header className="bg-white p-4 shadow flex justify-between items-center">
          <div className="flex items-center">
            <input 
              type="text" 
              placeholder="Søk etter måltider, oppskrifter..." 
              className="border border-gray-300 rounded-lg px-4 py-2 w-64"
            />
          </div>
          <div className="flex items-center">
            <button 
              className="mr-4 text-gray-600 hover:text-orange-500"
              onClick={() => {/* Implementer varslingsfunksjonalitet */}}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="relative">
              <button 
                className="flex items-center"
                onClick={() => {/* Implementer profilmeny */}}
              >
                <div className="w-8 h-8 rounded-full bg-orange-200 flex items-center justify-center text-orange-800 font-bold mr-2">
                  {user?.email?.charAt(0).toUpperCase() || 'B'}
                </div>
                <span className="mr-1 font-medium">
                  {user ? 'Mushtoga' : 'Bruker'}
                </span>
              </button>
            </div>
          </div>
        </header>
        
        <main className="p-6">
          {/* E-postbekreftelsesadvarsel */}
          <EmailConfirmationBanner />
          
          {/* Vis en advarsel hvis brukeren prøver å få tilgang til en begrenset fane */}
          {activeTab !== 'overview' && activeTab !== 'profile' && activeTab !== 'ai-meal-generator' && !isEmailConfirmed && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
              <div className="flex">
                <FaLock className="h-5 w-5 text-yellow-500 mr-2" />
                <p>Denne funksjonen er låst inntil du bekrefter e-postadressen din.</p>
              </div>
            </div>
          )}
          
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Velkomstbanner med dagens dato */}
              <div className="bg-gradient-to-r from-orange-500 to-orange-600 text-white p-4 rounded-lg shadow-md mb-6">
                <div className="flex justify-between items-center">
                  <div>
                    <h1 className="text-2xl font-bold">Hei, {getFirstName(user?.email)}!</h1>
                    <p className="text-white text-opacity-90">
                      {new Date().toLocaleDateString('no-NO', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                  </div>
                  <div className="bg-white bg-opacity-20 p-3 rounded-lg">
                    <p className="text-sm font-medium">Dagens streak</p>
                    <p className="text-2xl font-bold flex items-center">
                      <span>{userData.streak}</span>
                      <span className="ml-1 text-sm">dager</span>
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Venstre kolonne - Dagens måltid */}
                <div className="md:col-span-2 space-y-6">
                  {/* Dagens måltid */}
                  <div className="bg-white p-5 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl font-semibold">Dagens måltid</h2>
                      <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-1 rounded">
                        Lunsj
                      </span>
                    </div>
                    
                    <div className="overflow-hidden rounded-lg mb-4">
                      <img 
                        src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c" 
                        alt="Dagens måltid" 
                        className="w-full h-64 object-cover hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    
                    <h3 className="text-xl font-bold mb-2">Kremet pasta med laks og spinat</h3>
                    
                    <div className="flex items-center mb-4">
                      <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">
                        Høyt protein
                      </span>
                      <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">
                        Omega-3
                      </span>
                      <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
                        Rask å lage
                      </span>
                    </div>
                    
                    {/* Næringsinnhold */}
                    <div className="grid grid-cols-4 gap-2 mb-4 bg-gray-50 p-3 rounded-lg">
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Kalorier</p>
                        <p className="font-bold">{userData.calories.slice(0, -1)}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Protein</p>
                        <p className="font-bold">{userData.protein}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Karbo</p>
                        <p className="font-bold">{userData.carbs}</p>
                      </div>
                      <div className="text-center">
                        <p className="text-sm text-gray-500">Fett</p>
                        <p className="font-bold">{userData.fat}</p>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-4">
                      En deilig og næringsrik pasta med fersk laks, spinat og en kremet saus. 
                      Dette måltidet er rikt på protein og sunne fettsyrer, perfekt for en aktiv livsstil.
                    </p>
                    
                    <div className="flex flex-wrap gap-2">
                      <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                        Se full oppskrift
                      </button>
                      <button className="border border-orange-500 text-orange-500 px-4 py-2 rounded-lg hover:bg-orange-50 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Generer alternativer
                      </button>
                    </div>
                  </div>
                  
                  {/* Ukens fremgang */}
                  <div className="bg-white p-5 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Ukens fremgang</h2>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Måltidsplan fulgt</span>
                          <span className="text-sm font-medium">85%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Proteinmål</span>
                          <span className="text-sm font-medium">92%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '92%' }}></div>
                        </div>
                      </div>
                      
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">Kaloribalanse</span>
                          <span className="text-sm font-medium">78%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '78%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Høyre kolonne - Dagens næringsstoffer og kommende måltider */}
                <div className="space-y-6">
                  {/* Dagens næringsstoffer */}
                  <div className="bg-white p-5 rounded-lg shadow-md">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-xl font-semibold">Dagens mål</h2>
                      <span className="text-sm font-medium text-orange-500">75% oppnådd</span>
                    </div>
                    
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                      <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-2 rounded-lg hover:bg-orange-50">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Kalorier</p>
                            <p className="text-sm text-gray-500">Daglig mål: 3500 kcal</p>
                          </div>
                        </div>
                        <p className="font-bold">{userData.calories}</p>
                      </div>
                      
                      <div className="flex justify-between items-center p-2 rounded-lg hover:bg-orange-50">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Protein</p>
                            <p className="text-sm text-gray-500">Daglig mål: 180g</p>
                          </div>
                        </div>
                        <p className="font-bold">{userData.protein}</p>
                      </div>
                      
                      <div className="flex justify-between items-center p-2 rounded-lg hover:bg-orange-50">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Karbohydrater</p>
                            <p className="text-sm text-gray-500">Daglig mål: 350g</p>
                          </div>
                        </div>
                        <p className="font-bold">{userData.carbs}</p>
                      </div>
                      
                      <div className="flex justify-between items-center p-2 rounded-lg hover:bg-orange-50">
                        <div className="flex items-center">
                          <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center mr-3">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                          </div>
                          <div>
                            <p className="font-medium">Fett</p>
                            <p className="text-sm text-gray-500">Daglig mål: 140g</p>
                          </div>
                        </div>
                        <p className="font-bold">{userData.fat}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Kommende måltider */}
                  <div className="bg-white p-5 rounded-lg shadow-md">
                    <h2 className="text-xl font-semibold mb-4">Dagens måltider</h2>
                    <ul className="space-y-3">
                      <li className="flex items-center p-3 rounded-lg hover:bg-gray-50">
                        <div className="w-2 h-2 rounded-full bg-gray-300 mr-3"></div>
                        <div className="flex-1">
                          <p className="font-medium">Frokost</p>
                          <p className="text-sm text-gray-500">Havregrøt med bær</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">08:00</span>
                          <p className="text-xs text-gray-500">450 kcal</p>
                        </div>
                      </li>
                      
                      <li className="flex items-center p-3 rounded-lg bg-orange-50 border-l-4 border-orange-500">
                        <div className="w-2 h-2 rounded-full bg-orange-500 mr-3"></div>
                        <div className="flex-1">
                          <p className="font-medium">Lunsj</p>
                          <p className="text-sm text-gray-500">Kremet pasta med laks</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">12:30</span>
                          <p className="text-xs text-gray-500">650 kcal</p>
                        </div>
                      </li>
                      
                      <li className="flex items-center p-3 rounded-lg hover:bg-gray-50">
                        <div className="w-2 h-2 rounded-full bg-gray-300 mr-3"></div>
                        <div className="flex-1">
                          <p className="font-medium">Middag</p>
                          <p className="text-sm text-gray-500">Kyllingwok med grønnsaker</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">18:00</span>
                          <p className="text-xs text-gray-500">580 kcal</p>
                        </div>
                      </li>
                      
                      <li className="flex items-center p-3 rounded-lg hover:bg-gray-50">
                        <div className="w-2 h-2 rounded-full bg-gray-300 mr-3"></div>
                        <div className="flex-1">
                          <p className="font-medium">Kveldsmat</p>
                          <p className="text-sm text-gray-500">Gresk yoghurt med honning</p>
                        </div>
                        <div className="text-right">
                          <span className="text-sm font-medium">21:00</span>
                          <p className="text-xs text-gray-500">320 kcal</p>
                        </div>
                      </li>
                    </ul>
                    
                    <button className="w-full mt-4 text-orange-500 border border-orange-500 px-4 py-2 rounded-lg hover:bg-orange-50 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Legg til måltid
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'overview' && activeTab !== 'profile' && activeTab !== 'ai-meal-generator' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-bold mb-4">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
              {!isEmailConfirmed ? (
                <p>Denne funksjonen er låst inntil du bekrefter e-postadressen din.</p>
              ) : (
                <p>Denne funksjonen er under utvikling. Vennligst kom tilbake senere.</p>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-2xl font-semibold mb-6">Min Profil</h2>
              
              {profileLoading ? (
                <div className="flex justify-center items-center h-64">
                  <FaSpinner className="animate-spin text-orange-500 text-4xl" />
                  <span className="ml-2">Laster inn profildata...</span>
                </div>
              ) : profileError ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  <p>{profileError}</p>
                  <p className="text-sm mt-1">Feilkode: {profileError.code || 'ukjent'}</p>
                  <button 
                    onClick={fetchProfileData}
                    className="mt-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                  >
                    Prøv igjen
                  </button>
                </div>
              ) : editedProfileData ? (
                <div className="space-y-8">
                  {/* Personlig informasjon */}
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Personlig informasjon</h3>
                      {!editMode.personal ? (
                        <button 
                          onClick={() => setEditMode(prev => ({ ...prev, personal: true }))}
                          className="text-orange-500 hover:text-orange-700"
                        >
                          Rediger
                        </button>
                      ) : (
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => cancelEdit('personal')}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            Avbryt
                          </button>
                          <button 
                            onClick={() => saveProfileData('personal')}
                            className="text-green-500 hover:text-green-700"
                            disabled={isSaving}
                          >
                            {isSaving ? 'Lagrer...' : 'Lagre'}
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Navn
                        </label>
                        {editMode.personal ? (
                          <input 
                            type="text" 
                            value={editedProfileData.name || ''} 
                            onChange={(e) => handleProfileChange('personal', 'name', e.target.value)}
                            className="w-full p-2 border rounded-md"
                          />
                        ) : (
                          <p>{editedProfileData.name || 'Ikke angitt'}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          E-post
                        </label>
                        <p>{editedProfileData.email || user?.email || 'Ikke angitt'}</p>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Telefon
                        </label>
                        {editMode.personal ? (
                          <input 
                            type="tel" 
                            value={editedProfileData.phone || ''} 
                            onChange={(e) => handleProfileChange('personal', 'phone', e.target.value)}
                            className="w-full p-2 border rounded-md"
                          />
                        ) : (
                          <p>{editedProfileData.phone || 'Ikke angitt'}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Adresse
                        </label>
                        {editMode.personal ? (
                          <input 
                            type="text" 
                            value={editedProfileData.address || ''} 
                            onChange={(e) => handleProfileChange('personal', 'address', e.target.value)}
                            className="w-full p-2 border rounded-md"
                          />
                        ) : (
                          <p>{editedProfileData.address || 'Ikke angitt'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Kostpreferanser */}
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Kostpreferanser</h3>
                      {!editMode.dietary ? (
                        <button 
                          onClick={() => setEditMode(prev => ({ ...prev, dietary: true }))}
                          className="text-orange-500 hover:text-orange-700"
                        >
                          Rediger
                        </button>
                      ) : (
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => cancelEdit('dietary')}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            Avbryt
                          </button>
                          <button 
                            onClick={() => saveProfileData('dietary')}
                            className="text-green-500 hover:text-green-700"
                            disabled={isSaving}
                          >
                            {isSaving ? 'Lagrer...' : 'Lagre'}
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Diettrestriksjoner
                        </label>
                        {editMode.dietary ? (
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <input 
                                type="text" 
                                placeholder="Legg til diettrestriksjon" 
                                id="new-diet-pref"
                                className="w-full p-2 border rounded-md"
                              />
                              <button 
                                onClick={() => {
                                  const input = document.getElementById('new-diet-pref');
                                  if (input.value.trim()) {
                                    handleArrayChange('dietary_preferences', input.value.trim());
                                    input.value = '';
                                  }
                                }}
                                className="bg-orange-500 text-white px-3 py-2 rounded-md hover:bg-orange-600"
                              >
                                Legg til
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {(Array.isArray(editedProfileData.dietary_preferences) 
                                ? editedProfileData.dietary_preferences 
                                : (editedProfileData.dietary_preferences || '').split(',').filter(i => i.trim())
                              ).map((item, index) => (
                                <div key={index} className="bg-orange-100 px-3 py-1 rounded-full flex items-center">
                                  <span>{item.trim()}</span>
                                  <button 
                                    onClick={() => handleRemoveArrayItem('dietary_preferences', index)}
                                    className="ml-2 text-orange-500 hover:text-orange-700"
                                  >
                                    &times;
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {(Array.isArray(editedProfileData.dietary_preferences) 
                              ? editedProfileData.dietary_preferences 
                              : (editedProfileData.dietary_preferences || '').split(',').filter(i => i.trim())
                            ).map((item, index) => (
                              <div key={index} className="bg-orange-100 px-3 py-1 rounded-full">
                                {item.trim()}
                              </div>
                            ))}
                            {(!editedProfileData.dietary_preferences || 
                              (Array.isArray(editedProfileData.dietary_preferences) && editedProfileData.dietary_preferences.length === 0) ||
                              (typeof editedProfileData.dietary_preferences === 'string' && !editedProfileData.dietary_preferences.trim())) && 
                              <p className="text-gray-500">Ingen diettrestriksjoner angitt</p>
                            }
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Allergier
                        </label>
                        {editMode.dietary ? (
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <input 
                                type="text" 
                                placeholder="Legg til allergi" 
                                id="new-allergy"
                                className="w-full p-2 border rounded-md"
                              />
                              <button 
                                onClick={() => {
                                  const input = document.getElementById('new-allergy');
                                  if (input.value.trim()) {
                                    handleArrayChange('allergies', input.value.trim());
                                    input.value = '';
                                  }
                                }}
                                className="bg-orange-500 text-white px-3 py-2 rounded-md hover:bg-orange-600"
                              >
                                Legg til
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {(Array.isArray(editedProfileData.allergies) 
                                ? editedProfileData.allergies 
                                : (editedProfileData.allergies || '').split(',').filter(i => i.trim())
                              ).map((item, index) => (
                                <div key={index} className="bg-red-100 px-3 py-1 rounded-full flex items-center">
                                  <span>{item.trim()}</span>
                                  <button 
                                    onClick={() => handleRemoveArrayItem('allergies', index)}
                                    className="ml-2 text-red-500 hover:text-red-700"
                                  >
                                    &times;
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {(Array.isArray(editedProfileData.allergies) 
                              ? editedProfileData.allergies 
                              : (editedProfileData.allergies || '').split(',').filter(i => i.trim())
                            ).map((item, index) => (
                              <div key={index} className="bg-red-100 px-3 py-1 rounded-full">
                                {item.trim()}
                              </div>
                            ))}
                            {(!editedProfileData.allergies || 
                              (Array.isArray(editedProfileData.allergies) && editedProfileData.allergies.length === 0) ||
                              (typeof editedProfileData.allergies === 'string' && !editedProfileData.allergies.trim())) && 
                              <p className="text-gray-500">Ingen allergier angitt</p>
                            }
                          </div>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Ingredienser du ikke liker
                        </label>
                        {editMode.dietary ? (
                          <div>
                            <div className="flex items-center space-x-2 mb-2">
                              <input 
                                type="text" 
                                placeholder="Legg til ingrediens" 
                                id="new-disliked"
                                className="w-full p-2 border rounded-md"
                              />
                              <button 
                                onClick={() => {
                                  const input = document.getElementById('new-disliked');
                                  if (input.value.trim()) {
                                    handleArrayChange('disliked_ingredients', input.value.trim());
                                    input.value = '';
                                  }
                                }}
                                className="bg-orange-500 text-white px-3 py-2 rounded-md hover:bg-orange-600"
                              >
                                Legg til
                              </button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {(Array.isArray(editedProfileData.disliked_ingredients) 
                                ? editedProfileData.disliked_ingredients 
                                : (editedProfileData.disliked_ingredients || '').split(',').filter(i => i.trim())
                              ).map((item, index) => (
                                <div key={index} className="bg-gray-100 px-3 py-1 rounded-full flex items-center">
                                  <span>{item.trim()}</span>
                                  <button 
                                    onClick={() => handleRemoveArrayItem('disliked_ingredients', index)}
                                    className="ml-2 text-gray-500 hover:text-gray-700"
                                  >
                                    &times;
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            {(Array.isArray(editedProfileData.disliked_ingredients) 
                              ? editedProfileData.disliked_ingredients 
                              : (editedProfileData.disliked_ingredients || '').split(',').filter(i => i.trim())
                            ).map((item, index) => (
                              <div key={index} className="bg-gray-100 px-3 py-1 rounded-full">
                                {item.trim()}
                              </div>
                            ))}
                            {(!editedProfileData.disliked_ingredients || 
                              (Array.isArray(editedProfileData.disliked_ingredients) && editedProfileData.disliked_ingredients.length === 0) ||
                              (typeof editedProfileData.disliked_ingredients === 'string' && !editedProfileData.disliked_ingredients.trim())) && 
                              <p className="text-gray-500">Ingen ingredienser angitt</p>
                            }
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Helsemål */}
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Helsemål</h3>
                      {!editMode.health ? (
                        <button 
                          onClick={() => setEditMode(prev => ({ ...prev, health: true }))}
                          className="text-orange-500 hover:text-orange-700"
                        >
                          Rediger
                        </button>
                      ) : (
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => cancelEdit('health')}
                            className="text-gray-500 hover:text-gray-700"
                          >
                            Avbryt
                          </button>
                          <button 
                            onClick={() => saveProfileData('health')}
                            className="text-green-500 hover:text-green-700"
                            disabled={isSaving}
                          >
                            {isSaving ? 'Lagrer...' : 'Lagre'}
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Helsemål
                        </label>
                        {editMode.health ? (
                          <select 
                            value={editedProfileData.health_goals || ''} 
                            onChange={(e) => handleProfileChange('health', 'health_goals', e.target.value)}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="">Velg helsemål</option>
                            <option value="vekttap">Vekttap</option>
                            <option value="vektøkning">Vektøkning</option>
                            <option value="vedlikehold">Vedlikehold av vekt</option>
                            <option value="muskelbygging">Muskelbygging</option>
                            <option value="energi">Mer energi</option>
                            <option value="helse">Bedre generell helse</option>
                          </select>
                        ) : (
                          <p>{editedProfileData.health_goals ? {
                            'vekttap': 'Vekttap',
                            'vektøkning': 'Vektøkning',
                            'vedlikehold': 'Vedlikehold av vekt',
                            'muskelbygging': 'Muskelbygging',
                            'energi': 'Mer energi',
                            'helse': 'Bedre generell helse'
                          }[editedProfileData.health_goals] : 'Ikke angitt'}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Aktivitetsnivå
                        </label>
                        {editMode.health ? (
                          <select 
                            value={editedProfileData.activity_level || 'moderat'} 
                            onChange={(e) => handleProfileChange('health', 'activity_level', e.target.value)}
                            className="w-full p-2 border rounded-md"
                          >
                            <option value="stillesittende">Stillesittende</option>
                            <option value="lett">Lett aktiv</option>
                            <option value="moderat">Moderat aktiv</option>
                            <option value="veldig">Veldig aktiv</option>
                            <option value="ekstremt">Ekstremt aktiv</option>
                          </select>
                        ) : (
                          <p>{editedProfileData.activity_level ? {
                            'stillesittende': 'Stillesittende',
                            'lett': 'Lett aktiv',
                            'moderat': 'Moderat aktiv',
                            'veldig': 'Veldig aktiv',
                            'ekstremt': 'Ekstremt aktiv'
                          }[editedProfileData.activity_level] : 'Ikke angitt'}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Vekt (kg)
                        </label>
                        {editMode.health ? (
                          <input 
                            type="number" 
                            value={editedProfileData.weight || ''} 
                            onChange={(e) => handleProfileChange('health', 'weight', e.target.value)}
                            className="w-full p-2 border rounded-md"
                            min="30"
                            max="300"
                          />
                        ) : (
                          <p>{editedProfileData.weight ? `${editedProfileData.weight} kg` : 'Ikke angitt'}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Høyde (cm)
                        </label>
                        {editMode.health ? (
                          <input 
                            type="number" 
                            value={editedProfileData.height || ''} 
                            onChange={(e) => handleProfileChange('health', 'height', e.target.value)}
                            className="w-full p-2 border rounded-md"
                            min="100"
                            max="250"
                          />
                        ) : (
                          <p>{editedProfileData.height ? `${editedProfileData.height} cm` : 'Ikke angitt'}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Medlemskap */}
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">Medlemskap</h3>
                      <span className={`px-3 py-1 rounded-full text-sm ${
                        editedProfileData.membership_tier === 'premium' ? 'bg-purple-100 text-purple-800' :
                        editedProfileData.membership_tier === 'familie' ? 'bg-blue-100 text-blue-800' :
                        'bg-orange-100 text-orange-800'
                      }`}>
                        {editedProfileData.membership_tier === 'premium' ? 'Premium' :
                         editedProfileData.membership_tier === 'familie' ? 'Familie' :
                         'Basis'}
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-600">
                          {editedProfileData.membership_tier === 'premium' ? 
                            'Du har Premium-medlemskap som gir deg ubegrensede AI-genererte måltider, detaljert næringsanalyse, og tilpasning for allergier og dietter.' :
                           editedProfileData.membership_tier === 'familie' ? 
                            'Du har Familie-medlemskap som gir deg måltidsplaner for hele familien, prioritert kundeservice, og alle Premium-funksjoner.' :
                            'Du har Basis-medlemskap som gir deg 5 AI-genererte måltider per uke, grunnleggende næringsanalyse, og generering av handleliste.'}
                        </p>
                      </div>
                      
                      <div>
                        <button 
                          onClick={() => router.push('/membership')}
                          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                        >
                          Oppgrader medlemskap
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center p-8">
                  <p className="text-gray-500 mb-4">Ingen profildata funnet. Vennligst oppdater profilen din.</p>
                  <button 
                    onClick={fetchProfileData} 
                    className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600"
                  >
                    Oppdater profil
                  </button>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'ai-meal-generator' && (
            <div className="space-y-6">
              {console.log('Renderer AI Måltidsgenerator-fanen')}
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-6">Måltidsgenerator</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Venstre kolonne - Preferanser */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Dine preferanser</h3>
                    
                    {/* Ingredienser tekstboks */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ingredienser
                      </label>
                      <textarea
                        name="ingredients"
                        value={mealPreferences.ingredients}
                        onChange={handleMealPreferenceChange}
                        placeholder="Skriv eller lim inn ingredienser (eks: kylling, ris, paprika)..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        rows="3"
                      />
                    </div>
                    
                    {/* Bildeopplastning */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last opp bilde av matvarer
                      </label>
                      <div className="mt-1 flex items-center">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="sr-only"
                          id="image-upload"
                        />
                        <label
                          htmlFor="image-upload"
                          className="relative cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                        >
                          <span>Velg bilde</span>
                        </label>
                        <span className="ml-3 text-sm text-gray-500">
                          {selectedImage ? selectedImage.name : 'Ingen fil valgt'}
                        </span>
                      </div>
                      {selectedImage && (
                        <div className="mt-2">
                          <img
                            src={URL.createObjectURL(selectedImage)}
                            alt="Forhåndsvisning"
                            className="h-24 w-auto object-cover rounded-md"
                          />
                          <button
                            type="button"
                            onClick={() => setSelectedImage(null)}
                            className="mt-1 text-xs text-red-500 hover:text-red-700"
                          >
                            Fjern bilde
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {/* Radioknapper for vektmål */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Vektmål
                      </label>
                      <div className="flex space-x-4">
                        <div className="flex items-center">
                          <input
                            id="weight-gain"
                            name="healthGoals"
                            type="radio"
                            value="vektøkning"
                            checked={mealPreferences.healthGoals === 'vektøkning'}
                            onChange={handleMealPreferenceChange}
                            className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300"
                          />
                          <label htmlFor="weight-gain" className="ml-2 block text-sm text-gray-700">
                            Øk vekt
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="weight-loss"
                            name="healthGoals"
                            type="radio"
                            value="vekttap"
                            checked={mealPreferences.healthGoals === 'vekttap'}
                            onChange={handleMealPreferenceChange}
                            className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300"
                          />
                          <label htmlFor="weight-loss" className="ml-2 block text-sm text-gray-700">
                            Reduser vekt
                          </label>
                        </div>
                        <div className="flex items-center">
                          <input
                            id="weight-maintain"
                            name="healthGoals"
                            type="radio"
                            value="vedlikehold"
                            checked={mealPreferences.healthGoals === 'vedlikehold'}
                            onChange={handleMealPreferenceChange}
                            className="focus:ring-orange-500 h-4 w-4 text-orange-600 border-gray-300"
                          />
                          <label htmlFor="weight-maintain" className="ml-2 block text-sm text-gray-700">
                            Behold vekt
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Type måltid
                      </label>
                      <select
                        name="mealType"
                        value={mealPreferences.mealType}
                        onChange={handleMealPreferenceChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="frokost">Frokost</option>
                        <option value="lunsj">Lunsj</option>
                        <option value="middag">Middag</option>
                        <option value="snack">Snack</option>
                        <option value="dessert">Dessert</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Diettpreferanser
                      </label>
                      <input
                        type="text"
                        name="dietaryPreferences"
                        value={mealPreferences.dietaryPreferences}
                        onChange={handleMealPreferenceChange}
                        placeholder="F.eks. vegetar, vegan, lavkarbo"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Allergier
                      </label>
                      <input
                        type="text"
                        name="allergies"
                        value={mealPreferences.allergies}
                        onChange={handleMealPreferenceChange}
                        placeholder="F.eks. nøtter, melk, gluten"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ingredienser du ikke liker
                      </label>
                      <input
                        type="text"
                        name="dislikedIngredients"
                        value={mealPreferences.dislikedIngredients}
                        onChange={handleMealPreferenceChange}
                        placeholder="F.eks. sopp, oliven, koriander"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Kalorimål
                      </label>
                      <input
                        type="range"
                        name="calorieTarget"
                        min="200"
                        max="1000"
                        step="50"
                        value={mealPreferences.calorieTarget}
                        onChange={handleMealPreferenceChange}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>200</span>
                        <span>{mealPreferences.calorieTarget} kalorier</span>
                        <span>1000</span>
                      </div>
                    </div>
                    
                    {/* Hjelpeknapp */}
                    <div>
                      <button
                        onClick={() => setShowInspirationForm(true)}
                        className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      >
                        <span className="flex items-center justify-center">
                          <FaQuestionCircle className="mr-2" />
                          Vet ikke hva jeg skal lage
                        </span>
                      </button>
                    </div>
                    
                    <button
                      onClick={generateMeal}
                      disabled={isGeneratingMeal}
                      className="w-full mt-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-lg shadow hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingMeal ? (
                        <span className="flex items-center justify-center">
                          <FaSpinner className="animate-spin mr-2" />
                          Genererer måltid...
                        </span>
                      ) : 'Generer måltid'}
                    </button>
                    
                    {mealError && (
                      <div className="mt-2 text-sm text-red-600">
                        {mealError}
                      </div>
                    )}
                  </div>
                  
                  {/* Høyre kolonne - Generert måltid */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {isGeneratingMeal ? (
                      <div className="flex flex-col items-center justify-center h-full py-10">
                        <FaSpinner className="animate-spin text-orange-500 text-4xl mb-4" />
                        <p className="text-gray-600">Genererer ditt personlige måltid...</p>
                        <p className="text-sm text-gray-500 mt-2">Dette kan ta opptil 30 sekunder</p>
                      </div>
                    ) : generatedMeal ? (
                      <div className="space-y-4">
                        <h3 className="text-xl font-bold text-gray-800">{generatedMeal.title}</h3>
                        
                        {generatedMeal.imageUrl ? (
                          <img 
                            src={generatedMeal.imageUrl} 
                            alt={generatedMeal.title} 
                            className="w-full h-48 object-cover rounded-lg"
                          />
                        ) : (
                          <div className="w-full h-48 bg-gray-200 rounded-lg flex items-center justify-center">
                            <p className="text-gray-500">Bilde ikke tilgjengelig</p>
                          </div>
                        )}
                        
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Ingredienser:</h4>
                          <ul className="list-disc list-inside space-y-1">
                            {generatedMeal.ingredients.map((ingredient, index) => (
                              <li key={index} className="text-gray-600">
                                {ingredient.amount} {ingredient.unit} {ingredient.name}
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-medium text-gray-700 mb-2">Tilberedning:</h4>
                          <ol className="list-decimal list-inside space-y-2">
                            {generatedMeal.instructions.map((step, index) => (
                              <li key={index} className="text-gray-600">{step}</li>
                            ))}
                          </ol>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Næringsinnhold:</h4>
                            <ul className="text-sm">
                              <li>Kalorier: {generatedMeal.nutrition.calories} kcal</li>
                              <li>Protein: {generatedMeal.nutrition.protein}g</li>
                              <li>Karbohydrater: {generatedMeal.nutrition.carbs}g</li>
                              <li>Fett: {generatedMeal.nutrition.fat}g</li>
                            </ul>
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-700 mb-2">Informasjon:</h4>
                            <ul className="text-sm">
                              <li>Tilberedningstid: {generatedMeal.prepTime} minutter</li>
                              <li>Vanskelighetsgrad: {generatedMeal.difficulty}</li>
                              <li>Porsjoner: {generatedMeal.servings}</li>
                            </ul>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2 mt-4">
                          <button 
                            className="flex-1 bg-orange-100 text-orange-600 py-2 px-4 rounded-md hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                          >
                            Lagre oppskrift
                          </button>
                          <button 
                            className="flex-1 bg-orange-100 text-orange-600 py-2 px-4 rounded-md hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                          >
                            Legg til i måltidsplan
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-700 mb-1">Ingen måltid generert ennå</h3>
                        <p className="text-gray-500">Fyll ut dine preferanser og klikk på "Generer måltid"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-6">Generer måltidsplan</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Venstre kolonne - Preferanser */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Dine preferanser</h3>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Antall dager
                        </label>
                        <select
                          name="daysToGenerate"
                          value={planPreferences.daysToGenerate}
                          onChange={handlePlanPreferenceChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        >
                          <option value="1">1 dag</option>
                          <option value="3">3 dager</option>
                          <option value="5">5 dager</option>
                          <option value="7">7 dager</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Måltider per dag
                        </label>
                        <select
                          name="mealsPerDay"
                          value={planPreferences.mealsPerDay}
                          onChange={handlePlanPreferenceChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                        >
                          <option value="2">2 måltider</option>
                          <option value="3">3 måltider</option>
                          <option value="4">4 måltider</option>
                          <option value="5">5 måltider</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Diettpreferanser
                      </label>
                      <input
                        type="text"
                        name="dietaryPreferences"
                        value={planPreferences.dietaryPreferences}
                        onChange={handlePlanPreferenceChange}
                        placeholder="F.eks. vegetar, vegan, lavkarbo"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Allergier
                      </label>
                      <input
                        type="text"
                        name="allergies"
                        value={planPreferences.allergies}
                        onChange={handlePlanPreferenceChange}
                        placeholder="F.eks. nøtter, melk, gluten"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ingredienser du ikke liker
                      </label>
                      <input
                        type="text"
                        name="dislikedIngredients"
                        value={planPreferences.dislikedIngredients}
                        onChange={handlePlanPreferenceChange}
                        placeholder="F.eks. sopp, oliven, koriander"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Helsemål
                      </label>
                      <select
                        name="healthGoals"
                        value={planPreferences.healthGoals}
                        onChange={handlePlanPreferenceChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                      >
                        <option value="">Velg helsemål</option>
                        <option value="vekttap">Vekttap</option>
                        <option value="muskelbygging">Muskelbygging</option>
                        <option value="vedlikehold">Vedlikehold</option>
                        <option value="energi">Mer energi</option>
                        <option value="balansert">Balansert kosthold</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Daglig kalorimål
                      </label>
                      <input
                        type="range"
                        name="dailyCalorieTarget"
                        min="1200"
                        max="3000"
                        step="100"
                        value={planPreferences.dailyCalorieTarget}
                        onChange={handlePlanPreferenceChange}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>1200</span>
                        <span>{planPreferences.dailyCalorieTarget} kalorier</span>
                        <span>3000</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={generateMealPlan}
                      disabled={isGeneratingPlan}
                      className="w-full mt-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-md shadow hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isGeneratingPlan ? (
                        <span className="flex items-center justify-center">
                          <FaSpinner className="animate-spin mr-2" />
                          Genererer måltidsplan...
                        </span>
                      ) : 'Generer måltidsplan'}
                    </button>
                    
                    {planError && (
                      <div className="mt-2 text-sm text-red-600">
                        {planError}
                      </div>
                    )}
                  </div>
                  
                  {/* Høyre kolonne - Generert måltidsplan */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {isGeneratingPlan ? (
                      <div className="flex flex-col items-center justify-center h-full py-10">
                        <FaSpinner className="animate-spin text-orange-500 text-4xl mb-4" />
                        <p className="text-gray-600">Genererer din personlige måltidsplan...</p>
                        <p className="text-sm text-gray-500 mt-2">Dette kan ta opptil 60 sekunder</p>
                      </div>
                    ) : generatedPlan ? (
                      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                        <h3 className="text-xl font-bold text-gray-800 sticky top-0 bg-gray-50 py-2">Din måltidsplan</h3>
                        
                        {generatedPlan.days.map((day, dayIndex) => (
                          <div key={dayIndex} className="border border-gray-200 rounded-lg p-4 mb-4">
                            <h4 className="font-bold text-lg text-gray-800 mb-3">{day.dayName}</h4>
                            
                            {day.meals.map((meal, mealIndex) => (
                              <div key={mealIndex} className="mb-3 pb-3 border-b border-gray-100 last:border-b-0 last:mb-0 last:pb-0">
                                <h5 className="font-medium text-gray-700">{meal.mealType}: {meal.title}</h5>
                                <p className="text-sm text-gray-600 mt-1">{meal.description}</p>
                                
                                <div className="flex space-x-4 mt-2 text-xs text-gray-500">
                                  <span>Kalorier: {meal.nutrition.calories}</span>
                                  <span>Protein: {meal.nutrition.protein}g</span>
                                  <span>Karbo: {meal.nutrition.carbs}g</span>
                                  <span>Fett: {meal.nutrition.fat}g</span>
                                </div>
                              </div>
                            ))}
                            
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <h5 className="font-medium text-gray-700 mb-1">Daglig totalt:</h5>
                              <div className="grid grid-cols-4 gap-2 text-sm">
                                <div className="bg-orange-50 p-2 rounded text-center">
                                  <div className="font-bold text-orange-600">{day.totalNutrition.calories}</div>
                                  <div className="text-xs text-gray-500">kalorier</div>
                                </div>
                                <div className="bg-blue-50 p-2 rounded text-center">
                                  <div className="font-bold text-blue-600">{day.totalNutrition.protein}g</div>
                                  <div className="text-xs text-gray-500">protein</div>
                                </div>
                                <div className="bg-green-50 p-2 rounded text-center">
                                  <div className="font-bold text-green-600">{day.totalNutrition.carbs}g</div>
                                  <div className="text-xs text-gray-500">karbo</div>
                                </div>
                                <div className="bg-yellow-50 p-2 rounded text-center">
                                  <div className="font-bold text-yellow-600">{day.totalNutrition.fat}g</div>
                                  <div className="text-xs text-gray-500">fett</div>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                        
                        <div className="flex space-x-2 mt-4 sticky bottom-0 bg-gray-50 py-2">
                          <button 
                            className="flex-1 bg-orange-100 text-orange-600 py-2 px-4 rounded-md hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                          >
                            Lagre måltidsplan
                          </button>
                          <button 
                            className="flex-1 bg-orange-100 text-orange-600 py-2 px-4 rounded-md hover:bg-orange-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                          >
                            Generer handleliste
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h3 className="text-lg font-medium text-gray-700 mb-1">Ingen måltidsplan generert ennå</h3>
                        <p className="text-gray-500">Fyll ut dine preferanser og klikk på "Generer måltidsplan"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Inspirasjonsspørreskjema */}
          {showInspirationForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-md w-full">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium">Hva har du lyst på?</h3>
                  <button 
                    onClick={() => setShowInspirationForm(false)}
                    className="text-gray-400 hover:text-gray-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hva slags stemning ønsker du?
                    </label>
                    <select
                      name="mood"
                      value={inspirationPreferences.mood}
                      onChange={handleInspirationChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="Kos">Kos</option>
                      <option value="Fitness">Fitness</option>
                      <option value="Fest">Fest</option>
                      <option value="Familiemiddag">Familiemiddag</option>
                      <option value="Eksperimentelt">Eksperimentelt</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tilgjengelig tid? ({inspirationPreferences.time} minutter)
                    </label>
                    <input
                      type="range"
                      name="time"
                      min="10"
                      max="60"
                      step="5"
                      value={inspirationPreferences.time}
                      onChange={handleInspirationChange}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>10 min</span>
                      <span>60 min</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Foretrukket kjøkken?
                    </label>
                    <select
                      name="cuisine"
                      value={inspirationPreferences.cuisine}
                      onChange={handleInspirationChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                      <option value="Italiensk">Italiensk</option>
                      <option value="Asiatisk">Asiatisk</option>
                      <option value="Mellomøstlig">Mellomøstlig</option>
                      <option value="Nordisk">Nordisk</option>
                      <option value="Meksikansk">Meksikansk</option>
                      <option value="Indisk">Indisk</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Hvor mange skal serveres?
                    </label>
                    <select
                      name="servings"
                      value={inspirationPreferences.servings}
                      onChange={handleInspirationChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                        <option key={num} value={num}>{num} {num === 1 ? 'person' : 'personer'}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="flex space-x-3 pt-4">
                    <button
                      onClick={() => setShowInspirationForm(false)}
                      className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                    >
                      Avbryt
                    </button>
                    <button
                      onClick={useInspirationPreferences}
                      className="flex-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-md shadow hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                    >
                      Bruk preferanser
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
