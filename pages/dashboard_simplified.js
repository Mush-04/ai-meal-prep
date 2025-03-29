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
      fetchProfileData();
    }
  }, [user, activeTab, router.query.tab]);

  // Funksjon for å hente profildata fra Supabase
  const fetchProfileData = async () => {
    try {
      setProfileLoading(true);
      setProfileError(null);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setProfileData(data);
        setEditedProfileData(data);
      }
    } catch (error) {
      console.error('Feil ved henting av profildata:', error);
      setProfileError('Kunne ikke hente profildata. Vennligst prøv igjen senere.');
    } finally {
      setProfileLoading(false);
    }
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
    setActiveTab(tabName);
    
    // Oppdater URL for å reflektere den aktive fanen
    const norwegianTabName = tabName === 'profile' ? 'profil' : tabName;
    router.push(`/dashboard?tab=${norwegianTabName}`, undefined, { shallow: true });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-64 bg-orange-500 text-white">
        <div className="p-4 border-b border-orange-400">
          <h2 className="text-xl font-bold">Smarte Måltider</h2>
        </div>
        
        <div className="p-4">
          <h3 className="text-xs uppercase tracking-wider mb-3">Hovedmeny</h3>
          <ul>
            <li className="mb-2">
              <button 
                className={`flex items-center w-full p-2 rounded-lg transition-colors ${activeTab === 'overview' ? 'bg-orange-600 text-white' : 'hover:bg-orange-400'}`}
                onClick={() => handleTabClick('overview')}
              >
                <FaTachometerAlt className="mr-3" />
                <span>Oversikt</span>
              </button>
            </li>
            <li className="mb-2">
              <button 
                className={`flex items-center w-full p-2 rounded-lg transition-colors ${activeTab === 'meals' ? 'bg-orange-600 text-white' : 'hover:bg-orange-400'}`}
                onClick={() => handleTabClick('meals')}
              >
                <FaUtensils className="mr-3" />
                <span>Mine måltider</span>
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
                </div>
              ) : profileError ? (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                  {profileError}
                  <button 
                    onClick={fetchProfileData}
                    className="ml-4 text-orange-500 hover:text-orange-700 underline"
                  >
                    Prøv igjen
                  </button>
                </div>
              ) : profileData ? (
                <div>
                  <p>Profildata lastet inn</p>
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
        </main>
      </div>
    </div>
  );
}
