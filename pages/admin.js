import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import LoadingScreen from '../components/common/LoadingScreen';
import dynamic from 'next/dynamic';

// Dynamisk import av Chart.js komponenter for klientside-rendering
const DynamicChartComponent = dynamic(
  () => import('../components/admin/ChartComponent'),
  { ssr: false, loading: () => <div className="animate-pulse h-64 bg-white bg-opacity-10 rounded-lg"></div> }
);

export default function Admin() {
  const { user, loading, signOut } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalMeals: 0,
    premiumUsers: 0
  });
  const [users, setUsers] = useState([]);
  const [meals, setMeals] = useState([]);
  const [mealsByDay, setMealsByDay] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isClient, setIsClient] = useState(false);

  // State for user management
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userFormData, setUserFormData] = useState({
    email: '',
    password: '',
    subscription_tier: 'basis',
    first_name: '',
    last_name: '',
    phone: ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Abonnementspakker
  const subscriptionPackages = [
    { id: 'basis', name: 'Basis', color: 'rgb(255, 159, 64)' },
    { id: 'pro_chef', name: 'Pro Chef', color: 'rgb(54, 162, 235)' },
    { id: 'ultimate_gourmet', name: 'Ultimate Gourmet', color: 'rgb(153, 102, 255)' }
  ];

  // Sjekk om vi er på klientsiden
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Memoiser fetchAdminData for å unngå unødvendige re-renders
  const fetchAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch user statistics
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*');
      
      if (usersError) throw usersError;
      
      // Fetch meal data
      const { data: mealsData, error: mealsError } = await supabase
        .from('meals')
        .select('*');
      
      if (mealsError) throw mealsError;
      
      // Calculate statistics
      const premiumCount = usersData?.filter(user => 
        user.subscription_tier === 'pro_chef' || user.subscription_tier === 'ultimate_gourmet'
      ).length || 0;
      
      setStats({
        totalUsers: usersData?.length || 0,
        totalMeals: mealsData?.length || 0,
        premiumUsers: premiumCount
      });
      
      setUsers(usersData || []);
      setMeals(mealsData || []);

      // Beregn måltider per dag for grafen
      processMealsByDay(mealsData || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sjekk om brukeren er admin (har e-posten munashe.toga@gmail.com)
  useEffect(() => {
    if (user) {
      const adminEmail = 'munashe.toga@gmail.com';
      setIsAdmin(user.email === adminEmail);
      
      if (user.email !== adminEmail) {
        // Hvis ikke admin, omdiriger til forsiden
        router.push('/');
      } else {
        fetchAdminData();
      }
    }
  }, [user, router, fetchAdminData]);

  // Omdiriger hvis ikke logget inn
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Sett opp Supabase Realtime-abonnementer for sanntidsoppdateringer
  useEffect(() => {
    if (!user || !isAdmin) return;

    // Abonner på endringer i profiles-tabellen
    const profilesSubscription = supabase
      .channel('profiles-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'profiles' 
      }, () => {
        console.log('Profiles data updated, refreshing...');
        fetchAdminData();
      })
      .subscribe();

    // Abonner på endringer i meals-tabellen
    const mealsSubscription = supabase
      .channel('meals-changes')
      .on('postgres_changes', { 
        event: '*', 
        schema: 'public', 
        table: 'meals' 
      }, () => {
        console.log('Meals data updated, refreshing...');
        fetchAdminData();
      })
      .subscribe();

    // Cleanup ved unmounting
    return () => {
      profilesSubscription.unsubscribe();
      mealsSubscription.unsubscribe();
    };
  }, [user, isAdmin, fetchAdminData]);

  useEffect(() => {
    const handleRouteChange = (url) => {
      if (!url.includes('/admin') && !url.includes('/dashboard')) {
        signOut();
      }
    };

    router.events.on('routeChangeStart', handleRouteChange);
    return () => {
      router.events.off('routeChangeStart', handleRouteChange);
    };
  }, [router, signOut]);

  // Behandle måltidsdata for grafer
  const processMealsByDay = (mealsData) => {
    // Hvis ingen data, bruk demodata
    if (!mealsData || mealsData.length === 0) {
      // Opprett demodata for siste 7 dager
      const demoData = {};
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        demoData[dateStr] = Math.floor(Math.random() * 10) + 1; // Tilfeldig antall mellom 1-10
      }
      
      setMealsByDay(demoData);
      return;
    }
    
    // Gruppere måltider etter dato
    const mealsByDate = {};
    
    mealsData.forEach(meal => {
      if (!meal.created_at) return;
      
      const date = new Date(meal.created_at).toISOString().split('T')[0];
      mealsByDate[date] = (mealsByDate[date] || 0) + 1;
    });
    
    // Sorter datoer
    const sortedDates = Object.keys(mealsByDate).sort();
    const sortedMealsByDay = {};
    
    // Hvis vi har mindre enn 7 datoer, fyll inn med nuller
    if (sortedDates.length < 7) {
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        sortedMealsByDay[dateStr] = mealsByDate[dateStr] || 0;
      }
    } else {
      // Bruk de siste 7 datoene
      sortedDates.slice(-7).forEach(date => {
        sortedMealsByDay[date] = mealsByDate[date];
      });
    }
    
    setMealsByDay(sortedMealsByDay);
  };

  // Forbered data for grafene
  const getChartData = () => {
    // Måltider per dag data
    const mealsByDayData = {
      labels: Object.keys(mealsByDay).sort().map(date => {
        const [year, month, day] = date.split('-');
        return `${day}.${month}`;
      }),
      datasets: [{
        label: 'Genererte måltider',
        data: Object.values(mealsByDay),
        fill: true,
        backgroundColor: 'rgba(249, 115, 22, 0.4)',
        borderColor: 'rgba(249, 115, 22, 1)',
        tension: 0.4,
      }]
    };

    // Brukerstatistikk data
    const userStatsData = {
      labels: ['Totalt antall brukere', 'Premium brukere'],
      datasets: [{
        label: 'Brukerstatistikk',
        data: [stats.totalUsers, stats.premiumUsers],
        backgroundColor: [
          'rgba(249, 115, 22, 0.9)',
          'rgba(234, 88, 12, 0.9)',
        ],
        borderColor: [
          'rgba(249, 115, 22, 1)',
          'rgba(234, 88, 12, 1)',
        ],
        borderWidth: 1,
      }]
    };

    // Abonnement fordeling data
    const basisCount = users.filter(u => u.subscription_tier === 'basis').length;
    const proChefCount = users.filter(u => u.subscription_tier === 'pro_chef').length;
    const ultimateGourmetCount = users.filter(u => u.subscription_tier === 'ultimate_gourmet').length;
    const ingenCount = users.filter(u => !u.subscription_tier).length;
    
    const subscriptionData = {
      labels: ['Basis', 'Pro Chef', 'Ultimate Gourmet', 'Ingen'],
      datasets: [{
        data: [basisCount, proChefCount, ultimateGourmetCount, ingenCount],
        backgroundColor: [
          'rgb(255, 159, 64)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)',
          'rgb(160, 174, 192)'
        ],
        borderColor: [
          'rgb(255, 159, 64)',
          'rgb(54, 162, 235)',
          'rgb(153, 102, 255)',
          'rgb(160, 174, 192)'
        ],
        borderWidth: 1,
      }]
    };

    return {
      mealsByDayData,
      userStatsData,
      subscriptionData
    };
  };

  // Behandle brukerform-input
  const handleUserInputChange = (e) => {
    const { name, value } = e.target;
    setUserFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Åpne modal for å legge til ny bruker
  const openAddUserModal = () => {
    setEditingUser(null);
    setUserFormData({
      email: '',
      password: '',
      subscription_tier: 'basis',
      first_name: '',
      last_name: '',
      phone: ''
    });
    setFormError('');
    setFormSuccess('');
    setShowUserModal(true);
  };

  // Åpne modal for å redigere en eksisterende bruker
  const openEditUserModal = (userToEdit) => {
    setEditingUser(userToEdit);
    setUserFormData({
      email: userToEdit.email || '',
      password: '', // Ikke vis passord av sikkerhetshensyn
      subscription_tier: userToEdit.subscription_tier || 'basis',
      first_name: userToEdit.first_name || '',
      last_name: userToEdit.last_name || '',
      phone: userToEdit.phone || ''
    });
    setFormError('');
    setFormSuccess('');
    setShowUserModal(true);
  };

  // Lukk brukermodal
  const closeUserModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
    setFormError('');
    setFormSuccess('');
  };

  // Opprett ny bruker
  const createUser = async () => {
    try {
      setFormError('');
      setFormSuccess('');
      
      // Valider input
      if (!userFormData.email || !userFormData.password) {
        setFormError('E-post og passord er påkrevd');
        return;
      }
      
      if (userFormData.password.length < 6) {
        setFormError('Passordet må være minst 6 tegn');
        return;
      }
      
      // Opprett bruker i Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: userFormData.email,
        password: userFormData.password,
        email_confirm: true // Bekreft e-post automatisk
      });
      
      if (authError) throw authError;
      
      // Opprett eller oppdater profil i profiles-tabellen
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: authData.user.id,
            email: userFormData.email,
            subscription_tier: userFormData.subscription_tier,
            first_name: userFormData.first_name,
            last_name: userFormData.last_name,
            phone: userFormData.phone
          }
        ]);
      
      if (profileError) throw profileError;
      
      setFormSuccess('Bruker opprettet');
      fetchAdminData(); // Oppdater brukerlisten
      
      // Lukk modal etter 2 sekunder
      setTimeout(() => {
        closeUserModal();
      }, 2000);
      
    } catch (error) {
      console.error('Feil ved opprettelse av bruker:', error);
      setFormError(error.message || 'Kunne ikke opprette bruker');
    }
  };

  // Oppdater eksisterende bruker
  const updateUser = async () => {
    try {
      setFormError('');
      setFormSuccess('');
      
      // Valider input
      if (!userFormData.email) {
        setFormError('E-post er påkrevd');
        return;
      }
      
      const updates = {
        email: userFormData.email,
        subscription_tier: userFormData.subscription_tier,
        first_name: userFormData.first_name,
        last_name: userFormData.last_name,
        phone: userFormData.phone,
        updated_at: new Date()
      };
      
      // Oppdater profil i profiles-tabellen
      const { error: profileError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', editingUser.id);
      
      if (profileError) throw profileError;
      
      // Hvis passord er angitt, oppdater også passordet
      if (userFormData.password) {
        if (userFormData.password.length < 6) {
          setFormError('Passordet må være minst 6 tegn');
          return;
        }
        
        const { error: passwordError } = await supabase.auth.admin.updateUserById(
          editingUser.id,
          { password: userFormData.password }
        );
        
        if (passwordError) throw passwordError;
      }
      
      setFormSuccess('Bruker oppdatert');
      fetchAdminData(); // Oppdater brukerlisten
      
      // Lukk modal etter 2 sekunder
      setTimeout(() => {
        closeUserModal();
      }, 2000);
      
    } catch (error) {
      console.error('Feil ved oppdatering av bruker:', error);
      setFormError(error.message || 'Kunne ikke oppdatere bruker');
    }
  };

  // Slett bruker
  const deleteUser = async (userId) => {
    if (!confirm('Er du sikker på at du vil slette denne brukeren? Dette kan ikke angres.')) {
      return;
    }
    
    try {
      // Slett bruker fra Supabase Auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) throw authError;
      
      // Profilen slettes automatisk via cascade delete i databasen
      
      fetchAdminData(); // Oppdater brukerlisten
    } catch (error) {
      console.error('Feil ved sletting av bruker:', error);
      alert('Kunne ikke slette bruker: ' + (error.message || 'Ukjent feil'));
    }
  };

  // Håndter skjema-innsending
  const handleUserFormSubmit = (e) => {
    e.preventDefault();
    if (editingUser) {
      updateUser();
    } else {
      createUser();
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen animated-bg flex items-center justify-center">
        <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-8 shadow-lg text-center">
          <h1 className="text-2xl font-bold text-black mb-4">Ingen tilgang</h1>
          <p className="text-black mb-6">Du har ikke tilgang til admin-panelet.</p>
          <button 
            onClick={() => router.push('/')}
            className="primary-button"
          >
            Tilbake til forsiden
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animated-bg">
      <Head>
        <title>Admin Dashboard | Smarte måltider</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Animated background elements */}
      <div className="floating-circle" style={{ 
        width: '400px', 
        height: '400px', 
        top: '10%', 
        left: '5%', 
        '--duration': '20s',
        '--float-y': '60px',
        '--float-x': '40px',
        '--blur': '5px',
        '--scale': '1.2'
      }}></div>
      <div className="floating-circle" style={{ 
        width: '350px', 
        height: '350px', 
        top: '70%', 
        right: '2%', 
        '--duration': '18s',
        '--float-y': '-50px',
        '--float-x': '-40px',
        '--blur': '6px',
        '--scale': '1.15'
      }}></div>
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center mb-8">
          <h1 className="text-4xl font-extrabold text-black mb-4 md:mb-0 drop-shadow-lg">Admin Dashboard</h1>
          <div className="flex items-center">
            <span className="text-black text-lg font-semibold mr-4 drop-shadow-md" data-component-name="Admin">Munashe</span>
            <button 
              onClick={async () => {
                try {
                  await signOut();
                  router.push('/');
                } catch (error) {
                  console.error('Utloggingsfeil:', error);
                }
              }}
              className="login-button text-base font-medium"
              data-component-name="Admin"
            >
              Logg ut
            </button>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-black"></div>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="mb-6 border-b border-black border-opacity-30">
              <div className="flex flex-wrap -mb-px">
                <button
                  className={`mr-2 inline-block p-4 text-lg ${
                    activeTab === 'dashboard' 
                      ? 'text-black border-b-2 border-black font-bold' 
                      : 'text-black text-opacity-70 hover:text-opacity-100 font-medium'
                  }`}
                  onClick={() => setActiveTab('dashboard')}
                >
                  Dashboard
                </button>
                <button
                  className={`mr-2 inline-block p-4 text-lg ${
                    activeTab === 'users' 
                      ? 'text-black border-b-2 border-black font-bold' 
                      : 'text-black text-opacity-70 hover:text-opacity-100 font-medium'
                  }`}
                  onClick={() => setActiveTab('users')}
                >
                  Brukere
                </button>
                <button
                  className={`mr-2 inline-block p-4 text-lg ${
                    activeTab === 'meals' 
                      ? 'text-black border-b-2 border-black font-bold' 
                      : 'text-black text-opacity-70 hover:text-opacity-100 font-medium'
                  }`}
                  onClick={() => setActiveTab('meals')}
                >
                  Måltider
                </button>
              </div>
            </div>
            
            {/* Tab Content */}
            <div className="bg-white bg-opacity-40 backdrop-filter backdrop-blur-lg rounded-lg p-6 shadow-lg">
              {activeTab === 'dashboard' && (
                <div>
                  <h2 className="text-3xl font-bold text-black mb-6 drop-shadow-md">Oversikt</h2>
                  
                  {isClient && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-white bg-opacity-40 backdrop-filter backdrop-blur-lg rounded-lg p-6 shadow-lg">
                        <div className="h-64">
                          <DynamicChartComponent 
                            type="bar"
                            data={getChartData().subscriptionData}
                            options={{
                              responsive: true,
                              plugins: {
                                legend: {
                                  position: 'top',
                                  labels: {
                                    color: 'black',
                                    font: { size: 16, weight: 'bold' },
                                    padding: 20,
                                    usePointStyle: true,
                                    pointStyle: 'rectRounded',
                                  },
                                },
                                title: {
                                  display: true,
                                  text: 'Abonnement fordeling',
                                  color: 'black',
                                  font: { size: 22, weight: 'bold' },
                                  padding: { bottom: 20 },
                                },
                                tooltip: {
                                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                                  titleColor: 'black',
                                  bodyColor: 'black',
                                  bodyFont: { size: 14 },
                                  borderColor: 'rgba(0, 0, 0, 0.1)',
                                  borderWidth: 1,
                                  cornerRadius: 8,
                                  padding: 12,
                                  displayColors: true,
                                  usePointStyle: true,
                                  callbacks: {
                                    label: function(context) {
                                      return context.dataset.label + ': ' + context.raw + ' brukere';
                                    }
                                  }
                                }
                              },
                              scales: {
                                y: {
                                  beginAtZero: true,
                                  grid: { color: 'rgba(0, 0, 0, 0.05)', drawBorder: false },
                                  ticks: { 
                                    color: 'black',
                                    font: { size: 14, weight: 'bold' },
                                    precision: 0,
                                    padding: 10
                                  },
                                  border: { dash: [4, 4] }
                                },
                                x: {
                                  grid: { display: false },
                                  ticks: { 
                                    color: 'black',
                                    font: { size: 14, weight: 'bold' },
                                    padding: 10
                                  }
                                }
                              },
                              elements: {
                                bar: {
                                  borderRadius: 8,
                                  borderWidth: 1,
                                  borderColor: 'rgba(0, 0, 0, 0.1)',
                                }
                              },
                              layout: {
                                padding: 10
                              },
                              animation: {
                                duration: 1000,
                                easing: 'easeOutQuart'
                              }
                            }}
                          />
                        </div>
                      </div>
                      
                      <div className="bg-white bg-opacity-40 backdrop-filter backdrop-blur-lg rounded-lg p-6 shadow-lg">
                        <h3 className="text-2xl font-bold text-black mb-4 drop-shadow-md">Statistikk</h3>
                        <div className="space-y-5">
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-black text-lg font-semibold">Totalt antall brukere</span>
                              <span className="text-black text-lg font-bold">{stats.totalUsers}</span>
                            </div>
                            <div className="w-full bg-white bg-opacity-30 rounded-full h-4">
                              <div className="bg-orange-500 h-4 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-black text-lg font-semibold">Premium brukere</span>
                              <span className="text-black text-lg font-bold">{stats.premiumUsers}</span>
                            </div>
                            <div className="w-full bg-white bg-opacity-30 rounded-full h-4">
                              <div className="bg-orange-500 h-4 rounded-full" style={{ width: `${(stats.premiumUsers / stats.totalUsers) * 100}%` }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-black text-lg font-semibold">Genererte måltider</span>
                              <span className="text-black text-lg font-bold">{stats.totalMeals}</span>
                            </div>
                            <div className="w-full bg-white bg-opacity-30 rounded-full h-4">
                              <div className="bg-orange-500 h-4 rounded-full" style={{ width: '100%' }}></div>
                            </div>
                          </div>
                          
                          <div>
                            <div className="flex justify-between mb-2">
                              <span className="text-black text-lg font-semibold">Måltider per bruker</span>
                              <span className="text-black text-lg font-bold">
                                {stats.totalUsers > 0 ? (stats.totalMeals / stats.totalUsers).toFixed(1) : '0'}
                              </span>
                            </div>
                            <div className="w-full bg-white bg-opacity-30 rounded-full h-4">
                              <div className="bg-orange-500 h-4 rounded-full" style={{ width: '70%' }}></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {isClient && (
                    <div className="mb-8">
                      <div className="bg-white bg-opacity-40 backdrop-filter backdrop-blur-lg rounded-lg p-6 shadow-lg" data-component-name="Admin">
                        <div className="h-96" data-component-name="Admin">
                          <DynamicChartComponent 
                            type="line"
                            data={getChartData().mealsByDayData}
                            options={{
                              responsive: true,
                              maintainAspectRatio: false,
                              plugins: {
                                legend: {
                                  position: 'top',
                                  labels: {
                                    color: 'black',
                                    font: { size: 16, weight: 'bold' },
                                  },
                                },
                                title: {
                                  display: true,
                                  text: 'Måltider generert per dag',
                                  color: 'black',
                                  font: { size: 22, weight: 'bold' },
                                },
                              },
                              scales: {
                                x: {
                                  grid: { color: 'rgba(0, 0, 0, 0.3)' },
                                  ticks: { 
                                    color: 'black',
                                    font: { size: 16, weight: 'bold' },
                                  },
                                },
                                y: {
                                  grid: { color: 'rgba(0, 0, 0, 0.3)' },
                                  ticks: { 
                                    color: 'black', 
                                    precision: 0,
                                    font: { size: 16, weight: 'bold' },
                                  },
                                  beginAtZero: true,
                                },
                              },
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h3 className="text-2xl font-bold text-black mb-4 drop-shadow-md">Nylige aktiviteter</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full bg-white bg-opacity-40 rounded-lg overflow-hidden">
                        <thead>
                          <tr className="border-b border-black border-opacity-20">
                            <th className="px-6 py-3 text-left text-lg font-bold text-black">Bruker</th>
                            <th className="px-6 py-3 text-left text-lg font-bold text-black">Aktivitet</th>
                            <th className="px-6 py-3 text-left text-lg font-bold text-black">Dato</th>
                          </tr>
                        </thead>
                        <tbody>
                          {meals.slice(0, 5).map((meal, index) => (
                            <tr key={index} className="border-t border-black border-opacity-10 hover:bg-white hover:bg-opacity-10">
                              <td className="px-6 py-4 text-black text-base font-medium">{meal.user_id}</td>
                              <td className="px-6 py-4 text-black text-base font-medium">Genererte måltid</td>
                              <td className="px-6 py-4 text-black text-base font-medium">{new Date(meal.created_at).toLocaleDateString('no-NO')}</td>
                            </tr>
                          ))}
                          {meals.length === 0 && (
                            <tr className="border-t border-black border-opacity-10">
                              <td colSpan="3" className="px-6 py-4 text-black text-base font-medium text-center">Ingen aktiviteter ennå</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
              
              {activeTab === 'users' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-3xl font-bold text-black mb-6 drop-shadow-md">Brukere</h2>
                    <button 
                      onClick={openAddUserModal}
                      className="bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-black font-medium py-2 px-4 rounded-lg shadow-md transition-all duration-300 flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="black">
                        <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd" />
                      </svg>
                      Legg til bruker
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white bg-opacity-40 backdrop-filter backdrop-blur-lg rounded-lg overflow-hidden">
                      <thead>
                        <tr className="border-b border-black border-opacity-20">
                          <th className="px-6 py-3 text-left text-lg font-bold text-black">ID</th>
                          <th className="px-6 py-3 text-left text-lg font-bold text-black">E-post</th>
                          <th className="px-6 py-3 text-left text-lg font-bold text-black">Navn</th>
                          <th className="px-6 py-3 text-left text-lg font-bold text-black">Abonnement</th>
                          <th className="px-6 py-3 text-left text-lg font-bold text-black">Opprettet</th>
                          <th className="px-6 py-3 text-center text-lg font-bold text-black">Handlinger</th>
                        </tr>
                      </thead>
                      <tbody>
                        {users.map((user, index) => (
                          <tr key={index} className="border-t border-black border-opacity-10 hover:bg-white hover:bg-opacity-10">
                            <td className="px-6 py-4 text-black text-base font-medium">{user.id?.substring(0, 8) || '-'}...</td>
                            <td className="px-6 py-4 text-black text-base font-medium">{user.email || '-'}</td>
                            <td className="px-6 py-4 text-black text-base font-medium">
                              {user.first_name && user.last_name 
                                ? `${user.first_name} ${user.last_name}`
                                : user.first_name || user.last_name || '-'}
                            </td>
                            <td className="px-6 py-4 text-black text-base font-medium capitalize">{user.subscription_tier || 'Ingen'}</td>
                            <td className="px-6 py-4 text-black text-base font-medium">{user.created_at ? new Date(user.created_at).toLocaleDateString('no-NO') : '-'}</td>
                            <td className="px-6 py-4 text-black text-base font-medium text-center">
                              <div className="flex justify-center space-x-2">
                                <button 
                                  onClick={() => openEditUserModal(user)}
                                  className="bg-blue-500 hover:bg-blue-600 text-black p-2 rounded-lg transition-colors"
                                  title="Rediger bruker"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="black">
                                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                                  </svg>
                                </button>
                                <button 
                                  onClick={() => deleteUser(user.id)}
                                  className="bg-red-500 hover:bg-red-600 text-black p-2 rounded-lg transition-colors"
                                  title="Slett bruker"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="black">
                                    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {users.length === 0 && (
                          <tr className="border-t border-black border-opacity-10">
                            <td colSpan="6" className="px-6 py-4 text-black text-base font-medium text-center">Ingen brukere ennå</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
              
              {activeTab === 'meals' && (
                <div>
                  <h2 className="text-3xl font-bold text-black mb-6 drop-shadow-md">Måltider</h2>
                  <div className="overflow-x-auto">
                    <table className="min-w-full bg-white bg-opacity-40 backdrop-filter backdrop-blur-lg rounded-lg overflow-hidden">
                      <thead>
                        <tr className="border-b border-black border-opacity-20">
                          <th className="px-6 py-3 text-left text-lg font-bold text-black">ID</th>
                          <th className="px-6 py-3 text-left text-lg font-bold text-black">Bruker</th>
                          <th className="px-6 py-3 text-left text-lg font-bold text-black">Måltidsnavn</th>
                          <th className="px-6 py-3 text-left text-lg font-bold text-black">Opprettet</th>
                        </tr>
                      </thead>
                      <tbody>
                        {meals.map((meal, index) => (
                          <tr key={index} className="border-t border-black border-opacity-10 hover:bg-white hover:bg-opacity-10">
                            <td className="px-6 py-4 text-black text-base font-medium">{meal.id || '-'}</td>
                            <td className="px-6 py-4 text-black text-base font-medium">{meal.user_id?.substring(0, 8) || '-'}...</td>
                            <td className="px-6 py-4 text-black text-base font-medium">{meal.name || 'Ukjent måltid'}</td>
                            <td className="px-6 py-4 text-black text-base font-medium">{meal.created_at ? new Date(meal.created_at).toLocaleDateString('no-NO') : '-'}</td>
                          </tr>
                        ))}
                        {meals.length === 0 && (
                          <tr className="border-t border-black border-opacity-10">
                            <td colSpan="4" className="px-6 py-4 text-black text-base font-medium text-center">Ingen måltider ennå</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Bruker Modal */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white bg-opacity-90 backdrop-filter backdrop-blur-lg rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button 
              onClick={closeUserModal}
              className="absolute top-4 right-4 text-gray-600 hover:text-gray-900"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <h3 className="text-2xl font-bold text-gray-800 mb-4">
              {editingUser ? 'Rediger bruker' : 'Legg til ny bruker'}
            </h3>
            
            {formError && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {formError}
              </div>
            )}
            
            {formSuccess && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                {formSuccess}
              </div>
            )}
            
            <form onSubmit={handleUserFormSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="email">
                  E-post *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={userFormData.email}
                  onChange={handleUserInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="password">
                  {editingUser ? 'Passord (la stå tomt for å beholde eksisterende)' : 'Passord *'}
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={userFormData.password}
                  onChange={handleUserInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500"
                  required={!editingUser}
                  minLength={6}
                />
                <p className="text-gray-500 text-xs mt-1">Minimum 6 tegn</p>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="first_name">
                    Fornavn
                  </label>
                  <input
                    type="text"
                    id="first_name"
                    name="first_name"
                    value={userFormData.first_name}
                    onChange={handleUserInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="last_name">
                    Etternavn
                  </label>
                  <input
                    type="text"
                    id="last_name"
                    name="last_name"
                    value={userFormData.last_name}
                    onChange={handleUserInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={userFormData.phone}
                  onChange={handleUserInputChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="subscription_tier">
                  Abonnement
                </label>
                <div className="mb-4">
                  <select
                    id="subscription_tier"
                    name="subscription_tier"
                    value={userFormData.subscription_tier}
                    onChange={handleUserInputChange}
                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="basis">Basis</option>
                    <option value="pro_chef">Pro Chef</option>
                    <option value="ultimate_gourmet">Ultimate Gourmet</option>
                  </select>
                </div>
                
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={closeUserModal}
                    className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-2 px-4 rounded-lg mr-2"
                  >
                    Avbryt
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-orange-500 to-orange-700 hover:from-orange-600 hover:to-orange-800 text-black font-medium py-2 px-4 rounded-lg"
                  >
                    {editingUser ? 'Oppdater bruker' : 'Opprett bruker'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
