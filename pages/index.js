import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import LoadingScreen from '../components/common/LoadingScreen';

export default function Home() {
  const { user, signOut, error, loading } = useAuth();
  const router = useRouter();

  const handleGenerateMeal = () => {
    if (!user) {
      router.push('/login');
    } else {
      // Will implement meal generation in TRINN 4
      console.log('Meal generation coming soon!');
    }
  };

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-orange-400 to-orange-600">
      <Head>
        <title>AI Meal Prep</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
            {error}
          </div>
        )}
        
        <header className="py-6 flex justify-between items-center">
        <Link href="#" legacyBehavior>
  <a style={{
    color: 'white',
    fontSize: '1.125rem',
    fontWeight: '500',
    transition: 'color 0.15s ease-in-out'
  }}>
    Våre medlemskap
  </a>
</Link>
          <div className="space-x-8">
          {user ? (
  <>
    <span className="text-white text-lg">Hei, {user.email}</span>
    <button
      onClick={() => signOut()}
      style={{
        color: 'white',
        fontSize: '1.125rem',
        fontWeight: '500',
        transition: 'color 0.15s ease-in-out'
      }}
    >
      Logg ut
    </button>
  </>
) : (
  <>
    <Link href="/login" legacyBehavior>
      <a style={{
        color: 'white',
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: '0.5rem 1rem',
        borderRadius: '9999px',
        fontSize: '1.125rem',
        fontWeight: '500',
        transition: 'color 0.15s ease-in-out'
      }}>
        Logg inn
      </a>
    </Link>
    <Link href="/register" legacyBehavior>
      <a style={{
        color: 'white',
        fontSize: '1.125rem',
        fontWeight: '500',
        transition: 'color 0.15s ease-in-out'
      }}>
        Registrer deg
      </a>
    </Link>
  </>
)}
          </div>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center py-16 -mt-20">
          <div className="max-w-4xl text-center mb-16">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-white leading-tight">
              AI Meal Prep – Din personlige kokk i lomma
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-12">
              {user 
                ? 'Klar til å lage ditt neste måltid? La oss sette i gang!'
                : 'Generer måltider basert på dine ingredienser, mål og smak. Start nå!'}
            </p>
            <button 
  onClick={handleGenerateMeal}
  style={{
    backgroundColor: 'rgb(249, 115, 22)',
    color: 'white',
    fontWeight: '700',
    padding: '1rem 2.5rem',
    borderRadius: '9999px',
    fontSize: '1.125rem',
    transform: 'scale(1)',
    transition: 'all 0.2s ease-in-out',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
  }}
  onMouseOver={(e) => {
    e.currentTarget.style.backgroundColor = 'rgb(234, 88, 12)';
    e.currentTarget.style.transform = 'scale(1.05)';
    e.currentTarget.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)';
  }}
  onMouseOut={(e) => {
    e.currentTarget.style.backgroundColor = 'rgb(249, 115, 22)';
    e.currentTarget.style.transform = 'scale(1)';
    e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
  }}
>
  {user ? 'La AI lage ditt perfekte måltid' : 'Logg inn for å starte'}
</button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 w-full max-w-6xl px-4 mb-24">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm p-8 rounded-2xl shadow-lg 
              hover:bg-opacity-25 transition-all duration-300 flex flex-col items-center text-center">
              <span className="text-4xl mb-4">📸</span>
              <p className="text-white text-lg leading-relaxed">
                Skann ingredienser med bilde – vi kjenner igjen 5000+ matvarer!
              </p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm p-8 rounded-2xl shadow-lg 
              hover:bg-opacity-25 transition-all duration-300 flex flex-col items-center text-center">
              <span className="text-4xl mb-4">🍴</span>
              <p className="text-white text-lg leading-relaxed">
                Personlige oppskrifter for vektmål, allergier og livsstil
              </p>
            </div>
            <div className="bg-white bg-opacity-20 backdrop-blur-sm p-8 rounded-2xl shadow-lg 
              hover:bg-opacity-25 transition-all duration-300 flex flex-col items-center text-center">
              <span className="text-4xl mb-4">🌟</span>
              <p className="text-white text-lg leading-relaxed">
                Få tilbakemelding fra AI basert på dine vurderinger
              </p>
            </div>
          </div>

          <div className="w-full max-w-6xl px-4">
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12">
              Hvorfor AI Meal Prep er det smarte valget
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl hover:bg-white/15 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-3">AI-Personlig Meal Prep</h3>
                <p className="text-white/90 leading-relaxed">
                  Få skreddersydde måltider basert på dine ingredienser, vektmål og smak, mens du sparer tid og unngår matsvinn.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl hover:bg-white/15 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-3">Smart Handleliste + Zero Waste</h3>
                <p className="text-white/90 leading-relaxed">
                  Appen lager automatiske handlelister og hjelper deg med å bruke opp alt du har, slik at du sparer penger og reduserer sløsing.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl hover:bg-white/15 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-3">Næringsinnsikt i Sanntid</h3>
                <p className="text-white/90 leading-relaxed">
                  Få detaljert oversikt over kalorier, makronæringsstoffer og andre næringsverdier for hvert eneste måltid som genereres.
                </p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm p-8 rounded-2xl hover:bg-white/15 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-3">Vektmål På Autopilot</h3>
                <p className="text-white/90 leading-relaxed">
                  Uansett om du vil gå opp, ned eller beholde vekt, tilpasser appen måltidene dine for å holde deg på sporet mot dine helsemål.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
