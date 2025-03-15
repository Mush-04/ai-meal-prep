import { useState, useEffect } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { FaUtensils, FaAppleAlt, FaShoppingCart, FaAllergies, FaUsers, FaHeadset, 
         FaTachometerAlt, FaListAlt, FaRulerCombined, FaStore, FaUser, FaVideo, 
         FaTrophy, FaBook, FaDumbbell, FaInfoCircle, FaQuestionCircle, FaCog, 
         FaPause, FaRedo, FaSignOutAlt, FaSpinner } from 'react-icons/fa';

export default function Dashboard() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('overview');
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState(null);

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
        .eq('id', user.id)
        .single();

      if (error) throw error;
      
      setProfileData(data);
    } catch (err) {
      console.error('Feil ved henting av profildata:', err);
      setProfileError('Kunne ikke hente profildata. Vennligst prøv igjen senere.');
    } finally {
      setProfileLoading(false);
    }
  };

  // Funksjon for å vise medlemskapsnivå på norsk
  const getMembershipName = (tier) => {
    switch (tier) {
      case 'basis':
        return 'Basis';
      case 'premium':
        return 'Premium';
      case 'familie':
        return 'Familie';
      default:
        return tier || 'Ikke angitt';
    }
  };

  // Funksjon for å vise aktivitetsnivå på norsk
  const getActivityLevelName = (level) => {
    switch (level) {
      case 'lav':
        return 'Lav aktivitet';
      case 'moderat':
        return 'Moderat aktivitet';
      case 'høy':
        return 'Høy aktivitet';
      case 'veldig høy':
        return 'Veldig høy aktivitet';
      default:
        return level || 'Ikke angitt';
    }
  };

  // Dummy data for oversiktsfanen
  const userData = {
    name: user?.email?.split('@')[0] || 'Bruker',
    calories: '3233',
    water: '40',
    exercise: '150',
    waterProgress: 75,
    waterMinGoal: 85,
    waterMaxGoal: 180,
    currentMeal: {
      items: [
        { category: 'Frukt', food: 'bringebær', amount: '1 Kopp', exchange: 'Bytt' },
        { category: 'Kjøtt', food: 'Helt egg', amount: '2 Stk', exchange: 'Bytt' },
        { category: 'Brød', food: 'havrekli', amount: '4 Stk', exchange: 'Bytt' }
      ]
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
          <h3 className="text-xs uppercase tracking-wider mb-3">Dashboard</h3>
          <ul>
            <li className="mb-2">
              <button 
                onClick={() => setActiveTab('overview')}
                className={`flex items-center w-full p-2 rounded ${activeTab === 'overview' ? 'bg-orange-600' : 'hover:bg-orange-400'}`}
              >
                <FaTachometerAlt className="mr-3" /> Oversikt
              </button>
            </li>
            <li className="mb-2">
              <button 
                onClick={() => setActiveTab('mealplan')}
                className={`flex items-center w-full p-2 rounded ${activeTab === 'mealplan' ? 'bg-orange-600' : 'hover:bg-orange-400'}`}
              >
                <FaListAlt className="mr-3" /> Måltidsplan
              </button>
            </li>
            <li className="mb-2">
              <button 
                onClick={() => setActiveTab('measurements')}
                className={`flex items-center w-full p-2 rounded ${activeTab === 'measurements' ? 'bg-orange-600' : 'hover:bg-orange-400'}`}
              >
                <FaRulerCombined className="mr-3" /> Målinger
              </button>
            </li>
            <li className="mb-2">
              <button 
                onClick={() => setActiveTab('shop')}
                className={`flex items-center w-full p-2 rounded ${activeTab === 'shop' ? 'bg-orange-600' : 'hover:bg-orange-400'}`}
              >
                <FaStore className="mr-3" /> Butikk
              </button>
            </li>
            <li className="mb-2">
              <button 
                onClick={() => setActiveTab('profile')}
                className={`flex items-center w-full p-2 rounded ${activeTab === 'profile' ? 'bg-orange-600' : 'hover:bg-orange-400'}`}
              >
                <FaUser className="mr-3" /> Profil
              </button>
            </li>
            <li className="mb-2">
              <button 
                onClick={() => setActiveTab('videos')}
                className={`flex items-center w-full p-2 rounded ${activeTab === 'videos' ? 'bg-orange-600' : 'hover:bg-orange-400'}`}
              >
                <FaVideo className="mr-3" /> Videoer
              </button>
            </li>
            <li className="mb-2">
              <button 
                onClick={() => setActiveTab('achievements')}
                className={`flex items-center w-full p-2 rounded ${activeTab === 'achievements' ? 'bg-orange-600' : 'hover:bg-orange-400'}`}
              >
                <FaTrophy className="mr-3" /> Prestasjoner
              </button>
            </li>
          </ul>
        </div>
        
        <div className="p-4">
          <h3 className="text-xs uppercase tracking-wider mb-3">Ekstra</h3>
          <ul>
            <li className="mb-2">
              <button 
                onClick={() => setActiveTab('recipes')}
                className={`flex items-center w-full p-2 rounded ${activeTab === 'recipes' ? 'bg-orange-600' : 'hover:bg-orange-400'}`}
              >
                <FaBook className="mr-3" /> Oppskrifter
              </button>
            </li>
            <li className="mb-2">
              <button 
                onClick={() => setActiveTab('fitness')}
                className={`flex items-center w-full p-2 rounded ${activeTab === 'fitness' ? 'bg-orange-600' : 'hover:bg-orange-400'}`}
              >
                <FaDumbbell className="mr-3" /> Trening
              </button>
            </li>
            <li className="mb-2">
              <button 
                onClick={() => setActiveTab('resources')}
                className={`flex items-center w-full p-2 rounded ${activeTab === 'resources' ? 'bg-orange-600' : 'hover:bg-orange-400'}`}
              >
                <FaInfoCircle className="mr-3" /> Ressurser
              </button>
            </li>
            <li className="mb-2">
              <button 
                onClick={() => setActiveTab('support')}
                className={`flex items-center w-full p-2 rounded ${activeTab === 'support' ? 'bg-orange-600' : 'hover:bg-orange-400'}`}
              >
                <FaQuestionCircle className="mr-3" /> Kundestøtte
              </button>
            </li>
          </ul>
        </div>
        
        <div className="p-4">
          <h3 className="text-xs uppercase tracking-wider mb-3">Konto</h3>
          <ul>
            <li className="mb-2">
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex items-center w-full p-2 rounded ${activeTab === 'settings' ? 'bg-orange-600' : 'hover:bg-orange-400'}`}
              >
                <FaCog className="mr-3" /> Kontoinnstillinger
              </button>
            </li>
            <li className="mb-2">
              <button 
                onClick={() => setActiveTab('pause')}
                className={`flex items-center w-full p-2 rounded ${activeTab === 'pause' ? 'bg-orange-600' : 'hover:bg-orange-400'}`}
              >
                <FaPause className="mr-3" /> Pause
              </button>
            </li>
            <li className="mb-2">
              <button 
                onClick={() => setActiveTab('reset')}
                className={`flex items-center w-full p-2 rounded ${activeTab === 'reset' ? 'bg-orange-600' : 'hover:bg-orange-400'}`}
              >
                <FaRedo className="mr-3" /> Tilbakestill uke
              </button>
            </li>
            <li className="mb-2">
              <button 
                onClick={signOut}
                className="flex items-center w-full p-2 rounded hover:bg-orange-400"
              >
                <FaSignOutAlt className="mr-3" /> Logg ut
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
              placeholder="Søk..." 
              className="border rounded-lg px-3 py-2 w-64"
            />
          </div>
          <div className="flex items-center">
            <span className="mr-2">{userData.name}</span>
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white">
              {userData.name.charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <main className="p-6">
          {activeTab === 'overview' && (
            <div>
              <div className="mb-6">
                <h1 className="text-2xl font-bold mb-2">{userData.name}</h1>
                <div className="flex items-center mb-4">
                  <span className="text-sm text-blue-500">Ditt nåværende måltid</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500">Kalorier</span>
                    <span className="font-bold">{userData.calories} <span className="text-xs text-gray-400">kcal</span></span>
                  </div>
                  <div className="h-12 bg-orange-100 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-orange-300 to-orange-500"
                      style={{ width: '70%' }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500">Vann</span>
                    <span className="font-bold">{userData.water} <span className="text-xs text-gray-400">oz</span></span>
                  </div>
                  <div className="h-12 bg-blue-100 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-300 to-blue-500"
                      style={{ width: '40%' }}
                    ></div>
                  </div>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-gray-500">Trening</span>
                    <span className="font-bold">{userData.exercise} <span className="text-xs text-gray-400">min</span></span>
                  </div>
                  <div className="h-12 bg-green-100 rounded-lg overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-green-300 to-green-500"
                      style={{ width: '60%' }}
                    ></div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-white p-4 rounded-lg shadow">
                  <h2 className="text-lg font-semibold mb-4">Dagens måltid</h2>
                  <div className="overflow-hidden rounded-lg mb-4">
                    <img 
                      src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c" 
                      alt="Måltid" 
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-500 text-sm">
                        <th className="pb-2">Kategori</th>
                        <th className="pb-2">Mat</th>
                        <th className="pb-2">Mengde</th>
                        <th className="pb-2 text-right">Bytte</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userData.currentMeal.items.map((item, index) => (
                        <tr key={index} className="border-t">
                          <td className="py-3">{item.category}</td>
                          <td className="py-3">{item.food}</td>
                          <td className="py-3">{item.amount}</td>
                          <td className="py-3 text-right">
                            <button className="text-orange-500 hover:text-orange-700">
                              {item.exchange}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-white p-4 rounded-lg shadow">
                  <h2 className="text-lg font-semibold mb-4">Vannsporing</h2>
                  <div className="flex justify-center mb-4">
                    <div className="relative w-40 h-40">
                      <svg className="w-full h-full" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#E5E7EB"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="#60A5FA"
                          strokeWidth="3"
                          strokeDasharray={`${userData.waterProgress}, 100`}
                        />
                        <text x="18" y="20.5" textAnchor="middle" className="text-3xl font-semibold">
                          {userData.waterProgress}
                        </text>
                      </svg>
                    </div>
                  </div>
                  <div className="flex justify-between mb-2">
                    <div className="bg-blue-50 p-2 rounded">
                      <div className="text-xs text-gray-500">Min mål</div>
                      <div className="text-lg font-semibold text-blue-500">{userData.waterMinGoal}</div>
                    </div>
                    <div className="bg-blue-50 p-2 rounded">
                      <div className="text-xs text-gray-500">Max mål</div>
                      <div className="text-lg font-semibold text-blue-500">{userData.waterMaxGoal}</div>
                    </div>
                  </div>
                  <div className="text-center text-sm text-gray-500 mb-4">
                    Spor vannforbruket ditt
                  </div>
                  <button className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600">
                    SPORING
                  </button>
                </div>
              </div>

              <div className="mt-6 bg-white p-4 rounded-lg shadow">
                <h2 className="text-lg font-semibold mb-4">Oversiktssporing</h2>
                <div className="flex justify-between mb-4">
                  <button className="text-blue-500 border-b-2 border-blue-500 pb-1">SISTE MÅNED</button>
                  <button className="text-gray-400 hover:text-blue-500">SISTE UKE</button>
                  <button className="text-gray-400 hover:text-blue-500">SISTE ÅR</button>
                </div>
                <div className="h-64 bg-gray-50 rounded-lg"></div>
              </div>
            </div>
          )}

          {activeTab !== 'overview' && activeTab !== 'profile' && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h2>
              <p>Denne funksjonen er under utvikling. Vennligst kom tilbake senere.</p>
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Personlig informasjon */}
                  <div className="md:col-span-2">
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Personlig informasjon</h3>
                        <button className="text-orange-500 hover:text-orange-700">
                          Rediger
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Fullt navn</p>
                          <p className="font-medium">
                            {profileData.first_name ? `${profileData.first_name} ${profileData.last_name || ''}` : 'Ikke angitt'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">E-post</p>
                          <p className="font-medium">{user?.email || 'Ikke angitt'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Telefon</p>
                          <p className="font-medium">{profileData.phone || 'Ikke angitt'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Fødselsdato</p>
                          <p className="font-medium">{profileData.birth_date || 'Ikke angitt'}</p>
                        </div>
                        <div className="md:col-span-2">
                          <p className="text-sm text-gray-500 mb-1">Adresse</p>
                          <p className="font-medium">{profileData.address || 'Ikke angitt'}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Kostpreferanser */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Kostpreferanser</h3>
                        <button className="text-orange-500 hover:text-orange-700">
                          Rediger
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Diettpreferanser</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {profileData.dietary_restrictions && profileData.dietary_restrictions.length > 0 ? (
                              profileData.dietary_restrictions.map((pref, index) => (
                                <span key={index} className="bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                                  {pref}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500">Ingen diettpreferanser angitt</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Allergier</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {profileData.allergies && profileData.allergies.length > 0 ? (
                              profileData.allergies.map((allergy, index) => (
                                <span key={index} className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                                  {allergy}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500">Ingen allergier angitt</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Ingredienser jeg ikke liker</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {profileData.disliked_ingredients && profileData.disliked_ingredients.length > 0 ? (
                              profileData.disliked_ingredients.map((ingredient, index) => (
                                <span key={index} className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded-full">
                                  {ingredient}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500">Ingen ulikte ingredienser angitt</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Helsemål */}
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Helsemål</h3>
                        <button className="text-orange-500 hover:text-orange-700">
                          Rediger
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Mål</p>
                          <div className="flex flex-wrap gap-2 mt-1">
                            {profileData.health_goals && profileData.health_goals.length > 0 ? (
                              profileData.health_goals.map((goal, index) => (
                                <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                                  {goal}
                                </span>
                              ))
                            ) : (
                              <span className="text-gray-500">Ingen helsemål angitt</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Aktivitetsnivå</p>
                          <p className="font-medium">{getActivityLevelName(profileData.activity_level)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Høyde</p>
                          <p className="font-medium">{profileData.height ? `${profileData.height} cm` : 'Ikke angitt'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Nåværende vekt</p>
                          <p className="font-medium">{profileData.weight ? `${profileData.weight} kg` : 'Ikke angitt'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500 mb-1">Målvekt</p>
                          <p className="font-medium">{profileData.target_weight ? `${profileData.target_weight} kg` : 'Ikke angitt'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Medlemskapsinformasjon */}
                  <div>
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 mb-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Medlemskap</h3>
                      </div>
                      
                      <div className="bg-gradient-to-r from-orange-400 to-orange-600 text-white p-4 rounded-lg mb-4">
                        <div className="text-sm mb-1">Nåværende plan</div>
                        <div className="text-xl font-bold mb-1">{getMembershipName(profileData.membership_tier)}</div>
                        <div className="text-sm">
                          {profileData.membership_tier === 'basis' ? '99 kr/mnd' : 
                           profileData.membership_tier === 'premium' ? '149 kr/mnd' : 
                           profileData.membership_tier === 'familie' ? '199 kr/mnd' : 'Kontakt kundestøtte'}
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Medlem siden</p>
                        <p className="font-medium">{profileData.member_since || 'Ikke tilgjengelig'}</p>
                      </div>
                      
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 mb-1">Neste betaling</p>
                        <p className="font-medium">{profileData.next_payment_date || 'Ikke tilgjengelig'}</p>
                      </div>
                      
                      <button className="w-full bg-orange-500 text-white py-2 rounded-lg hover:bg-orange-600 mb-2">
                        Oppgrader medlemskap
                      </button>
                      
                      <button className="w-full border border-orange-500 text-orange-500 py-2 rounded-lg hover:bg-orange-50">
                        Endre betalingsmetode
                      </button>
                    </div>
                    
                    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold">Kontoinnstillinger</h3>
                      </div>
                      
                      <div className="space-y-3">
                        <button className="w-full text-left py-2 px-3 rounded-lg hover:bg-gray-50 flex items-center justify-between">
                          <span>Endre passord</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        <button className="w-full text-left py-2 px-3 rounded-lg hover:bg-gray-50 flex items-center justify-between">
                          <span>Personverninnstillinger</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        <button className="w-full text-left py-2 px-3 rounded-lg hover:bg-gray-50 flex items-center justify-between">
                          <span>Varslingsinnstillinger</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
                        </button>
                        
                        <button className="w-full text-left py-2 px-3 rounded-lg hover:bg-gray-50 flex items-center justify-between text-red-500">
                          <span>Deaktiver konto</span>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                          </svg>
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
        </main>
      </div>
    </div>
  );
}
