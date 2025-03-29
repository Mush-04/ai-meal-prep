import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { FaUtensils, FaAppleAlt, FaShoppingCart, FaAllergies, FaUsers, FaHeadset, 
         FaTachometerAlt, FaListAlt, FaRulerCombined, FaStore, FaUser, FaVideo, 
         FaTrophy, FaBook, FaDumbbell, FaInfoCircle, FaQuestionCircle, FaCog, 
         FaPause, FaRedo, FaSignOutAlt, FaSpinner, FaLock } from 'react-icons/fa';
import EmailConfirmationBanner from '../components/common/EmailConfirmationBanner';

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
  });
  const [generatedMeal, setGeneratedMeal] = useState(null);
  const [isGeneratingMeal, setIsGeneratingMeal] = useState(false);
  const [mealError, setMealError] = useState(null);

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
    name: user?.email?.split('@')[0] || 'Bruker',
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

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-orange-500 text-white">
        <div className="p-4 border-b border-orange-400">
          <h2 className="text-xl font-bold">Smarte Måltider</h2>
        </div>
        
        <div className="p-4">
          <ul>
            <li className="mb-2">
              <button 
                className={`flex items-center w-full p-2 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-orange-600 text-white' : 'hover:bg-orange-400'}`}
                onClick={() => handleTabClick('overview')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
                <span>Dashboard</span>
              </button>
            </li>
            <li className="mb-2">
              <button 
                className={`flex items-center w-full p-2 rounded-lg transition-colors ${activeTab === 'meals' ? 'bg-orange-600 text-white' : 'hover:bg-orange-400'}`}
                onClick={() => handleTabClick('meals')}
              >
                <FaUtensils className="mr-3" />
                <span>Måltider</span>
              </button>
            </li>
            <li className="mb-2">
              <button 
                className={`flex items-center w-full p-2 rounded-lg transition-colors ${activeTab === 'shopping' ? 'bg-orange-600 text-white' : 'hover:bg-orange-400'}`}
                onClick={() => handleTabClick('shopping')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                </svg>
                <span>Handleliste</span>
              </button>
            </li>
            <li className="mb-2">
              <button 
                className={`flex items-center w-full p-2 rounded-lg transition-colors ${activeTab === 'mealplan' ? 'bg-orange-600 text-white' : 'hover:bg-orange-400'}`}
                onClick={() => handleTabClick('mealplan')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                <span>Måltidsplan</span>
              </button>
            </li>
            <li className="mb-2">
              <button 
                className={`flex items-center w-full p-2 rounded-lg transition-colors ${activeTab === 'ai-meal-generator' ? 'bg-orange-600 text-white' : 'hover:bg-orange-400'}`}
                onClick={() => handleTabClick('ai-meal-generator')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M5 3a1 1 0 000 2c5.523 0 10 4.477 10 10a1 1 0 102 0C17 8.373 11.627 3 5 3z" />
                  <path d="M4 9a1 1 0 011-1 7 7 0 017 7 1 1 0 11-2 0 5 5 0 00-5-5 1 1 0 01-1-1zM3 15a2 2 0 114 0 2 2 0 01-4 0z" />
                </svg>
                <span>AI Måltidsgenerator</span>
              </button>
            </li>
            <li className="mb-2">
              <button 
                className={`flex items-center w-full p-2 rounded-lg transition-colors ${activeTab === 'statistics' ? 'bg-orange-600 text-white' : 'hover:bg-orange-400'}`}
                onClick={() => handleTabClick('statistics')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1h-2a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1h-2a1 1 0 01-1-1V7zM14 4a1 1 0 012-2h2a1 1 0 012 2v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                <span>Statistikk</span>
              </button>
            </li>
            <li className="mb-2">
              <button 
                className={`flex items-center w-full p-2 rounded-lg transition-colors ${activeTab === 'profile' ? 'bg-orange-600 text-white' : 'hover:bg-orange-400'}`}
                onClick={() => handleTabClick('profile')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                <span>Profil</span>
              </button>
            </li>
            <li className="mb-2">
              <button 
                className={`flex items-center w-full p-2 rounded-lg transition-colors ${activeTab === 'settings' ? 'bg-orange-600 text-white' : 'hover:bg-orange-400'}`}
                onClick={() => handleTabClick('settings')}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.533 1.533 0 012.287.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                </svg>
                <span>Innstillinger</span>
              </button>
            </li>
            
            {/* Logg ut-knapp */}
            <li className="mt-auto pt-4 border-t border-gray-200">
              <button 
                className="flex items-center w-full p-2 rounded-lg text-red-600 hover:bg-red-100 transition-colors"
                onClick={handleLogout}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V3a1 1 0 00-1-1H3zM3 14v-2.5a.5.5 0 01.5-.5h4a.5.5 0 000-1h-4a.5.5 0 01-.5-.5V7a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1z" />
                  <path d="M11 9.5a.5.5 0 01.5-.5h4a.5.5 0 010 1h-4a.5.5 0 01-.5-.5z" />
                  <path fillRule="evenodd" d="M13.5 10a.5.5 0 01.5.5v2.5a.5.5 0 01-1 0v-2.5a.5.5 0 01.5-.5z" clipRule="evenodd" />
                </svg>
                <span>Logg ut</span>
              </button>
            </li>
          </ul>
        </div>
      </div>

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
                <span className="mr-1">{userData.name}</span>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
            </div>
          </div>
        </header>
        
        <main className="p-6">
          {/* E-postbekreftelsesadvarsel */}
          <EmailConfirmationBanner />
          
          {/* Vis en advarsel hvis brukeren prøver å få tilgang til en begrenset fane */}
          {activeTab !== 'overview' && activeTab !== 'profile' && !isEmailConfirmed && (
            <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6">
              <div className="flex">
                <FaLock className="h-5 w-5 text-yellow-500 mr-2" />
                <p>Denne funksjonen er låst inntil du bekrefter e-postadressen din.</p>
              </div>
            </div>
          )}
          
          {activeTab === 'overview' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">{userData.name}</h1>
                <div className="flex items-center mb-4">
                  <span className="text-sm text-blue-500">Ditt nåværende måltid</span>
                  <span className="mx-2">•</span>
                  <span className="text-sm">{userData.nextMeal} kl. {userData.nextMealTime}</span>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-lg font-semibold">Dagens næringsstoffer</h2>
                    <span className="text-sm text-gray-500">75% av målet</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                    <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Kalorier</p>
                      <p className="font-bold text-lg">{userData.calories}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Protein</p>
                      <p className="font-bold text-lg">{userData.protein}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Karbohydrater</p>
                      <p className="font-bold text-lg">{userData.carbs}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-gray-500">Fett</p>
                      <p className="font-bold text-lg">{userData.fat}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white p-4 rounded-lg shadow">
                  <h2 className="text-lg font-semibold mb-4">Dagens måltid</h2>
                  <div className="overflow-hidden rounded-lg mb-4">
                    <img 
                      src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c" 
                      alt="Dagens måltid" 
                      className="w-full h-64 object-cover"
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
                  <p className="text-gray-600 mb-4">
                    En deilig og næringsrik pasta med fersk laks, spinat og en kremet saus. 
                    Dette måltidet er rikt på protein og sunne fettsyrer, perfekt for en aktiv livsstil.
                  </p>
                  <div className="flex justify-between">
                    <button className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600">
                      Se full oppskrift
                    </button>
                    <button className="border border-orange-500 text-orange-500 px-4 py-2 rounded-lg hover:bg-orange-50">
                      Generer alternativer
                    </button>
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow">
                  <h2 className="text-lg font-semibold mb-4">Ukentlig statistikk</h2>
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Måltidsstreak</span>
                      <span className="font-bold">{userData.streak} dager</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Proteinmål</span>
                      <span className="font-bold">92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-500">Kaloribalanse</span>
                      <span className="font-bold">78%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: '78%' }}></div>
                    </div>
                  </div>
                  
                  <div className="mt-6">
                    <h3 className="text-md font-semibold mb-3">Kommende måltider</h3>
                    <ul className="space-y-3">
                      <li className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Frokost</p>
                          <p className="text-sm text-gray-500">Havregrøt med bær</p>
                        </div>
                        <span className="text-sm">08:00</span>
                      </li>
                      <li className="flex items-center justify-between bg-orange-50 p-2 rounded-lg">
                        <div>
                          <p className="font-medium">Lunsj</p>
                          <p className="text-sm text-gray-500">Kremet pasta med laks</p>
                        </div>
                        <span className="text-sm">12:30</span>
                      </li>
                      <li className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Middag</p>
                          <p className="text-sm text-gray-500">Kyllingwok med grønnsaker</p>
                        </div>
                        <span className="text-sm">18:00</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab !== 'overview' && activeTab !== 'profile' && (
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
                          className="bg-gradient-to-r from-orange-500 to-orange-600 text-white px-4 py-2 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all"
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
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-2xl font-semibold mb-6">AI Måltidsgenerator</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Venstre kolonne - Preferanser */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-medium">Dine preferanser</h3>
                    
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
                        Helsemål
                      </label>
                      <select
                        name="healthGoals"
                        value={mealPreferences.healthGoals}
                        onChange={handleMealPreferenceChange}
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
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>200</span>
                        <span>{mealPreferences.calorieTarget} kalorier</span>
                        <span>1000</span>
                      </div>
                    </div>
                    
                    <button
                      onClick={generateMeal}
                      disabled={isGeneratingMeal}
                      className="w-full mt-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white py-2 px-4 rounded-md shadow hover:from-orange-600 hover:to-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
        </main>
      </div>
    </div>
  );
}
