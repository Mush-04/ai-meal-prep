import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { useRouter } from 'next/router';
import LoadingScreen from '../components/common/LoadingScreen';
import { useState } from 'react';

export default function Home() {
  const { user, signOut, error, loading } = useAuth();
  const router = useRouter();
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const handleGenerateMeal = () => {
    if (!user) {
      router.push('/demo');
    } else {
      // Will implement meal generation in TRINN 4
      console.log('Meal generation coming soon!');
    }
  };

  const toggleFaq = (index) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const faqItems = [
    {
      question: "Hvordan fungerer Smarte måltider?",
      answer: "Smarte måltider bruker kunstig intelligens for å generere personlige måltidsplaner basert på dine preferanser, tilgjengelige ingredienser, og ernæringsmål. Du kan enkelt skanne ingredienser, angi dine mål, og få skreddersydde oppskrifter på sekunder."
    },
    {
      question: "Er tjenesten gratis?",
      answer: "Vi tilbyr en gratis versjon med begrenset funksjonalitet. For full tilgang til alle funksjoner, inkludert ubegrenset måltidsgenerering, næringsanalyse og personlig tilpasning, tilbyr vi rimelige medlemskapsplaner."
    },
    {
      question: "Kan jeg bruke appen hvis jeg har matallergier?",
      answer: "Absolutt! Du kan angi alle dine matallergier og intoleranser i profilen din, og AI-en vår vil alltid ta hensyn til disse når den genererer måltidsforslag til deg."
    },
    {
      question: "Hvordan hjelper appen med å redusere matsvinn?",
      answer: "Appen lar deg skanne eller registrere ingrediensene du allerede har hjemme, og genererer deretter oppskrifter som bruker disse ingrediensene før de blir dårlige. Dette hjelper deg å redusere matsvinn og spare penger."
    },
    {
      question: "Kan jeg tilpasse måltidene etter mine treningsmål?",
      answer: "Ja, enten du ønsker å bygge muskler, gå ned i vekt, eller bare opprettholde en sunn livsstil, kan du angi dine mål og appen vil justere måltidsforslagene for å hjelpe deg å nå disse målene."
    }
  ];

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen animated-bg">
      <Head>
        <title>Smarte måltider</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Animated background elements */}
      {/* Floating circles */}
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
      <div className="floating-circle" style={{ 
        width: '300px', 
        height: '300px', 
        bottom: '5%', 
        left: '15%', 
        '--duration': '25s',
        '--float-y': '45px',
        '--float-x': '55px',
        '--blur': '4px',
        '--scale': '1.25'
      }}></div>
      <div className="floating-circle" style={{ 
        width: '250px', 
        height: '250px', 
        top: '25%', 
        right: '20%', 
        '--duration': '22s',
        '--float-y': '-35px',
        '--float-x': '-25px',
        '--blur': '7px',
        '--scale': '1.1'
      }}></div>
      <div className="floating-circle" style={{ 
        width: '200px', 
        height: '200px', 
        top: '50%', 
        left: '30%', 
        '--duration': '15s',
        '--float-y': '30px',
        '--float-x': '-30px',
        '--blur': '3px',
        '--scale': '1.3'
      }}></div>
      <div className="floating-circle" style={{ 
        width: '180px', 
        height: '180px', 
        bottom: '30%', 
        right: '35%', 
        '--duration': '17s',
        '--float-y': '-25px',
        '--float-x': '35px',
        '--blur': '4px',
        '--scale': '1.2'
      }}></div>
      
      {/* Food icons */}
      <div className="food-icon" style={{ 
        top: '15%', 
        left: '25%', 
        '--size': '60px',
        '--duration': '15s',
        '--float-y': '70px',
        '--float-x': '50px',
        '--rotate': '180deg'
      }}>🥗</div>
      <div className="food-icon" style={{ 
        top: '65%', 
        right: '15%', 
        '--size': '70px',
        '--duration': '18s',
        '--float-y': '-60px',
        '--float-x': '-40px',
        '--rotate': '220deg'
      }}>🍎</div>
      <div className="food-icon" style={{ 
        bottom: '20%', 
        left: '40%', 
        '--size': '50px',
        '--duration': '20s',
        '--float-y': '50px',
        '--float-x': '-60px',
        '--rotate': '150deg'
      }}>🥑</div>
      <div className="food-icon" style={{ 
        top: '40%', 
        right: '30%', 
        '--size': '55px',
        '--duration': '22s',
        '--float-y': '-40px',
        '--float-x': '70px',
        '--rotate': '200deg'
      }}>🍲</div>
      <div className="food-icon" style={{ 
        top: '30%', 
        left: '60%', 
        '--size': '65px',
        '--duration': '19s',
        '--float-y': '55px',
        '--float-x': '-50px',
        '--rotate': '170deg'
      }}>🥦</div>
      
      {/* Additional vegetables */}
      <div className="food-icon" style={{ 
        top: '22%', 
        left: '45%', 
        '--size': '58px',
        '--duration': '17s',
        '--float-y': '65px',
        '--float-x': '-45px',
        '--rotate': '190deg'
      }}>🥕</div>
      <div className="food-icon" style={{ 
        top: '55%', 
        left: '20%', 
        '--size': '62px',
        '--duration': '21s',
        '--float-y': '-55px',
        '--float-x': '65px',
        '--rotate': '160deg'
      }}>🍅</div>
      <div className="food-icon" style={{ 
        bottom: '35%', 
        right: '25%', 
        '--size': '54px',
        '--duration': '19s',
        '--float-y': '45px',
        '--float-x': '-50px',
        '--rotate': '210deg'
      }}>🥔</div>
      <div className="food-icon" style={{ 
        top: '75%', 
        left: '55%', 
        '--size': '56px',
        '--duration': '16s',
        '--float-y': '-60px',
        '--float-x': '40px',
        '--rotate': '175deg'
      }}>🥒</div>
      
      {/* Meat icons */}
      <div className="food-icon" style={{ 
        top: '35%', 
        left: '10%', 
        '--size': '64px',
        '--duration': '23s',
        '--float-y': '50px',
        '--float-x': '60px',
        '--rotate': '185deg'
      }}>🥩</div>
      <div className="food-icon" style={{ 
        bottom: '15%', 
        right: '40%', 
        '--size': '68px',
        '--duration': '20s',
        '--float-y': '-40px',
        '--float-x': '-55px',
        '--rotate': '195deg'
      }}>🍗</div>
      <div className="food-icon" style={{ 
        top: '50%', 
        right: '10%', 
        '--size': '60px',
        '--duration': '18s',
        '--float-y': '55px',
        '--float-x': '-65px',
        '--rotate': '165deg'
      }}>🥓</div>
      <div className="food-icon" style={{ 
        bottom: '45%', 
        left: '70%', 
        '--size': '66px',
        '--duration': '24s',
        '--float-y': '-50px',
        '--float-x': '45px',
        '--rotate': '205deg'
      }}>🍖</div>
      
      {/* Animated waves */}
      <div className="wave" style={{ 
        top: '30%', 
        left: '50%', 
        '--duration': '12s'
      }}></div>
      <div className="wave" style={{ 
        top: '60%', 
        left: '30%', 
        '--duration': '15s'
      }}></div>
      <div className="wave" style={{ 
        top: '20%', 
        left: '70%', 
        '--duration': '18s'
      }}></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col relative z-10">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
            {error}
          </div>
        )}
        
        <header className="py-6 flex justify-between items-center relative z-50">
          <div>
            <a 
              href="#medlemskap" 
              onClick={(e) => {
                e.preventDefault();
                document.getElementById('medlemskap').scrollIntoView({ 
                  behavior: 'smooth',
                  block: 'start'
                });
              }}
              style={{
                color: 'white',
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
                padding: '0.5rem 1rem',
                borderRadius: '9999px',
                fontSize: '1.125rem',
                fontWeight: '500',
                transition: 'all 0.2s ease-in-out',
                cursor: 'pointer',
                display: 'inline-block'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
              }}
            >
              Våre medlemskap
            </a>
          </div>
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
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: '0.5rem 1rem',
                  display: 'inline-block'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.color = 'rgba(255, 255, 255, 0.8)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.color = 'white';
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
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'pointer',
                  display: 'inline-block'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                }}
                >
                  Logg inn
                </a>
              </Link>
              <Link href="/register" legacyBehavior>
                <a style={{
                  color: 'white',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  padding: '0.5rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '1.125rem',
                  fontWeight: '500',
                  transition: 'all 0.2s ease-in-out',
                  cursor: 'pointer',
                  display: 'inline-block'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
                }}
                >
                  Registrer deg
                </a>
              </Link>
            </>
          )}
          </div>
        </header>

        {/* Lys hvit stripe under navigasjonsknappene */}
        <div className="w-full h-1 bg-white/20" style={{ 
          boxShadow: '0 0 12px rgba(255, 255, 255, 0.3)',
          marginLeft: '-100vw',
          paddingLeft: '100vw',
          marginRight: '-100vw',
          paddingRight: '100vw'
        }}></div>

        <main className="flex-grow flex flex-col items-center justify-center py-16 -mt-20">
          <div className="text-center mb-24 mt-16">
            <h1 className="text-5xl sm:text-6xl font-bold text-white mb-10 drop-shadow-lg">
              Smarte måltider
            </h1>
            <p className="text-xl sm:text-2xl text-white font-medium drop-shadow-md max-w-3xl mx-auto">
              Skreddersydde måltidsplaner generert av AI, basert på dine ingredienser, preferanser og mål
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-10 w-full max-w-6xl px-4 mb-32">
            <div className="bg-white bg-opacity-25 backdrop-blur-sm p-8 rounded-2xl shadow-lg 
              hover:bg-opacity-30 transition-all duration-300 flex flex-col items-center text-center border border-white/20"
              style={{ boxShadow: '0 0 20px rgba(255, 255, 255, 0.15)' }}>
              <span className="text-4xl mb-4">📸</span>
              <p className="text-white text-lg leading-relaxed font-medium">
                Skann ingredienser med bilde – vi kjenner igjen 5000+ matvarer!
              </p>
            </div>
            <div className="bg-white bg-opacity-25 backdrop-blur-sm p-8 rounded-2xl shadow-lg 
              hover:bg-opacity-30 transition-all duration-300 flex flex-col items-center text-center border border-white/20"
              style={{ boxShadow: '0 0 20px rgba(255, 255, 255, 0.15)' }}>
              <span className="text-4xl mb-4">🍴</span>
              <p className="text-white text-lg leading-relaxed font-medium">
                Personlige oppskrifter for vektmål, allergier og livsstil
              </p>
            </div>
            <div className="bg-white bg-opacity-25 backdrop-blur-sm p-8 rounded-2xl shadow-lg 
              hover:bg-opacity-30 transition-all duration-300 flex flex-col items-center text-center border border-white/20"
              style={{ boxShadow: '0 0 20px rgba(255, 255, 255, 0.15)' }}>
              <span className="text-4xl mb-4">🌟</span>
              <p className="text-white text-lg leading-relaxed font-medium">
                Få tilbakemelding fra AI basert på dine vurderinger
              </p>
            </div>
          </div>

          <div className="w-full max-w-6xl px-4">
            <div className="flex justify-center mb-12">
              <button
                onClick={handleGenerateMeal}
                className="relative group"
                style={{
                  color: '#ff8a00',
                  background: 'white',
                  padding: '1rem 2.5rem',
                  borderRadius: '9999px',
                  fontSize: '1.5rem',
                  fontWeight: '700',
                  transition: 'all 0.3s ease-in-out',
                  cursor: 'pointer',
                  border: '2px solid #ff8a00',
                  boxShadow: '0 10px 25px -5px rgba(255, 255, 255, 0.5), 0 5px 15px -10px rgba(255, 138, 0, 0.4)',
                  position: 'relative',
                  overflow: 'hidden',
                  zIndex: 1
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 15px 30px -5px rgba(255, 255, 255, 0.6), 0 10px 20px -10px rgba(255, 138, 0, 0.5)';
                  e.currentTarget.style.color = '#e53e3e';
                  e.currentTarget.style.borderColor = '#e53e3e';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 10px 25px -5px rgba(255, 255, 255, 0.5), 0 5px 15px -10px rgba(255, 138, 0, 0.4)';
                  e.currentTarget.style.color = '#ff8a00';
                  e.currentTarget.style.borderColor = '#ff8a00';
                }}
              >
                <span className="relative z-10">Prøv demo</span>
                <span className="absolute inset-0 bg-white opacity-100 group-hover:opacity-95 transition-opacity duration-300 rounded-full"></span>
                <span className="absolute -inset-1 scale-[0.8] opacity-0 group-hover:scale-[1.1] group-hover:opacity-20 bg-orange-500 blur-xl rounded-full transition-all duration-1000"></span>
              </button>
            </div>

            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-12 drop-shadow-lg">
              Hvorfor Smarte måltider er det smarte valget
            </h2>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="bg-white/15 backdrop-blur-sm p-8 rounded-2xl hover:bg-white/20 transition-all duration-300 border border-white/20 shadow-lg"
                style={{ boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)' }}>
                <h3 className="text-xl font-semibold text-white mb-3 drop-shadow-md">AI-Personlig Meal Prep</h3>
                <p className="text-white leading-relaxed font-medium">
                  Få skreddersydde måltider basert på dine ingredienser, vektmål og smak, mens du sparer tid og unngår matsvinn.
                </p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm p-8 rounded-2xl hover:bg-white/20 transition-all duration-300 border border-white/20 shadow-lg"
                style={{ boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)' }}>
                <h3 className="text-xl font-semibold text-white mb-3 drop-shadow-md">Smart Handleliste + Zero Waste</h3>
                <p className="text-white leading-relaxed font-medium">
                  Appen lager automatiske handlelister og hjelper deg med å bruke opp alt du har, slik at du sparer penger og reduserer sløsing.
                </p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm p-8 rounded-2xl hover:bg-white/20 transition-all duration-300 border border-white/20 shadow-lg"
                style={{ boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)' }}>
                <h3 className="text-xl font-semibold text-white mb-3 drop-shadow-md">Næringsinnsikt i Sanntid</h3>
                <p className="text-white leading-relaxed font-medium">
                  Få detaljert oversikt over kalorier, makronæringsstoffer og andre næringsverdier for hvert eneste måltid som genereres.
                </p>
              </div>
              <div className="bg-white/15 backdrop-blur-sm p-8 rounded-2xl hover:bg-white/20 transition-all duration-300 border border-white/20 shadow-lg"
                style={{ boxShadow: '0 0 15px rgba(255, 255, 255, 0.1)' }}>
                <h3 className="text-xl font-semibold text-white mb-3 drop-shadow-md">Vektmål På Autopilot</h3>
                <p className="text-white leading-relaxed font-medium">
                  Uansett om du vil gå opp, ned eller beholde vekt, tilpasser appen måltidene dine for å holde deg på sporet mot dine helsemål.
                </p>
              </div>
            </div>
          </div>
          
          {/* Membership Plans */}
          <div id="medlemskap" className="w-full max-w-6xl px-4 mt-24 mb-24">
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-16 drop-shadow-lg">
              Våre medlemskap
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Basic Plan */}
              <div 
                className="bg-gradient-to-b from-purple-950/80 to-purple-900/60 backdrop-blur-sm p-8 rounded-2xl border border-purple-600/30 relative flex flex-col h-full transform transition-all duration-500 hover:scale-105 hover:-translate-y-2"
                style={{
                  boxShadow: '0 0 20px rgba(147, 51, 234, 0.3)',
                  animation: 'pulse 3s infinite alternate'
                }}
              >
                <h3 className="text-purple-300 text-2xl font-bold mb-2">Basis</h3>
                <div className="flex items-end mb-6">
                  <span className="text-purple-300 text-5xl font-bold">99</span>
                  <span className="text-purple-300 text-xl ml-1 mb-1">kr/måned</span>
                </div>
                <p className="text-white/80 mb-4">
                  <span className="font-semibold">Måltidsgenerering:</span> 50 AI-måltidsplaner/mnd.
                </p>
                <button 
                  className="bg-purple-700 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 mb-6 transform hover:scale-105"
                  style={{ boxShadow: '0 0 10px rgba(147, 51, 234, 0.5)' }}
                >
                  Velg Basis
                </button>
                <h4 className="text-purple-300 text-lg font-semibold mb-3">Funksjoner:</h4>
                <ul className="space-y-3 text-white/90 flex-grow">
                  <li className="flex items-start">
                    <span className="text-purple-300 mr-2">✦</span>
                    <span>Sett vektmål (opp/ned/vedlikehold) for tilpassede kalorimål</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-300 mr-2">✦</span>
                    <span>Enkle oppskrifter med ingrediensliste, matvarebilder og basis ernæringsinfo</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-300 mr-2">✦</span>
                    <span>Personlige matvarepreferanser («Jeg hater løk!»)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-300 mr-2">✦</span>
                    <span>Opptil 2 brukere på samme konto</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-300 mr-2">✦</span>
                    <span>Enkle ernæringstips (f.eks. «Slik øker du proteininntaket»)</span>
                  </li>
                </ul>
              </div>
              
              {/* Premium Plan */}
              <div 
                className="bg-gradient-to-b from-orange-950/80 to-orange-800/60 backdrop-blur-sm p-8 rounded-2xl border border-orange-500/40 relative flex flex-col h-full transform transition-all duration-500 hover:scale-105 hover:-translate-y-2 z-10"
                style={{
                  boxShadow: '0 0 30px rgba(249, 115, 22, 0.4)',
                  animation: 'pulse 3s infinite alternate'
                }}
              >
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
                <h3 className="text-orange-300 text-2xl font-bold mb-2">Pro Chef</h3>
                <div className="flex items-end mb-6">
                  <span className="text-orange-300 text-5xl font-bold">229</span>
                  <span className="text-orange-300 text-xl ml-1 mb-1">kr/måned</span>
                </div>
                <p className="text-white/80 mb-4">
                  <span className="font-semibold">Måltidsgenerering:</span> 150 AI-måltidsplaner/mnd.
                </p>
                <button 
                  className="bg-orange-600 hover:bg-orange-500 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 mb-6 transform hover:scale-105"
                  style={{ boxShadow: '0 0 15px rgba(249, 115, 22, 0.6)' }}
                >
                  Velg Pro Chef
                </button>
                <h4 className="text-orange-300 text-lg font-semibold mb-3">Funksjoner:</h4>
                <ul className="space-y-3 text-white/90 flex-grow">
                  <li className="flex items-start">
                    <span className="text-orange-300 mr-2">✦</span>
                    <span>Alt i Basis, pluss:</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-300 mr-2">✦</span>
                    <span>Smart handleliste sortert etter butikkavdeling + automatisk kalorijustering</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-300 mr-2">✦</span>
                    <span>Vektprogressjonssporing med graf og ukentlige oppsummeringer</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-300 mr-2">✦</span>
                    <span>AI-måltidvurdering («Gjør denne oppskriften sunnere eller kaloririkere»)</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-300 mr-2">✦</span>
                    <span>Måltidplanlegger med balansert ernæring for ditt mål</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-300 mr-2">✦</span>
                    <span>Opptil 5 brukere + delt familiekalender</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-orange-300 mr-2">✦</span>
                    <span>Lagre opptil 200 oppskrifter</span>
                  </li>
                </ul>
              </div>
              
              {/* Family Plan */}
              <div 
                className="bg-gradient-to-b from-blue-950/80 to-blue-900/60 backdrop-blur-sm p-8 rounded-2xl border border-blue-600/30 relative flex flex-col h-full transform transition-all duration-500 hover:scale-105 hover:-translate-y-2"
                style={{
                  boxShadow: '0 0 20px rgba(37, 99, 235, 0.3)',
                  animation: 'pulse 3s infinite alternate'
                }}
              >
                <h3 className="text-blue-300 text-2xl font-bold mb-2">Ultimate Gourmet</h3>
                <div className="flex items-end mb-6">
                  <span className="text-blue-300 text-5xl font-bold">399</span>
                  <span className="text-blue-300 text-xl ml-1 mb-1">kr/måned</span>
                </div>
                <p className="text-white/80 mb-4">
                  <span className="font-semibold">Måltidsgenerering:</span> Ubegrenset
                </p>
                <button 
                  className="bg-blue-700 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 mb-6 transform hover:scale-105"
                  style={{ boxShadow: '0 0 10px rgba(37, 99, 235, 0.5)' }}
                >
                  Velg Ultimate
                </button>
                <h4 className="text-blue-300 text-lg font-semibold mb-3">Funksjoner:</h4>
                <ul className="space-y-3 text-white/90 flex-grow">
                  <li className="flex items-start">
                    <span className="text-blue-300 mr-2">✦</span>
                    <span>Alt i Pro Chef, pluss:</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-300 mr-2">✦</span>
                    <span>«Restemat-Magi»: Lag oppskrifter basert på rester i kjøleskapet</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-300 mr-2">✦</span>
                    <span>1:1 AI-ernæringscoach som gir ukentlige mål og motivasjonstips</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-300 mr-2">✦</span>
                    <span>Automatisk justering av makronæring hver 4. uke for å unngå platåer</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-300 mr-2">✦</span>
                    <span>Opptil 10 brukere + grupper med sanntidsoppdateringer</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-300 mr-2">✦</span>
                    <span>Integrasjon med treningsapper (MyFitnessPal, Strava) for helhetlig oversikt</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="w-full max-w-6xl px-4 mt-24 mb-24">
            <h2 className="text-3xl sm:text-4xl font-bold text-white text-center mb-16 drop-shadow-lg">
              Ofte stilte spørsmål
            </h2>
            <div className="space-y-6">
              {faqItems.map((item, index) => (
                <div 
                  key={index}
                  className={`bg-gradient-to-r from-amber-900/40 to-orange-800/30 backdrop-blur-sm rounded-2xl border border-amber-500/20 shadow-lg overflow-hidden transition-all duration-300 ${openFaqIndex === index ? 'shadow-orange-300/20' : ''}`}
                  style={{ 
                    boxShadow: openFaqIndex === index ? '0 0 25px rgba(251, 146, 60, 0.3)' : '0 0 15px rgba(146, 64, 14, 0.2)',
                    transform: openFaqIndex === index ? 'scale(1.02)' : 'scale(1)'
                  }}
                >
                  <button 
                    onClick={() => toggleFaq(index)}
                    className="w-full text-left p-6 flex justify-between items-center"
                  >
                    <h3 className="text-xl font-semibold text-white drop-shadow-md pr-4">{item.question}</h3>
                    <div 
                      className={`text-white text-2xl transition-transform duration-300 ${openFaqIndex === index ? 'rotate-180' : ''}`}
                      style={{ 
                        width: '30px', 
                        height: '30px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(255, 255, 255, 0.15)',
                        borderRadius: '50%',
                        flexShrink: 0
                      }}
                    >
                      <span style={{ marginTop: '-2px' }}>↓</span>
                    </div>
                  </button>
                  <div 
                    className={`overflow-hidden transition-all duration-500 ease-in-out ${openFaqIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                  >
                    <div className="p-6 pt-0 border-t border-amber-500/20">
                      <p className="text-white leading-relaxed font-medium">{item.answer}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* AI Chat Assistant CTA */}
            <div className="mt-12 bg-gradient-to-r from-orange-600/30 to-amber-500/30 backdrop-blur-sm p-8 rounded-2xl border border-orange-400/20 shadow-lg text-center"
              style={{ 
                boxShadow: '0 0 25px rgba(251, 146, 60, 0.2)',
                animation: 'pulse 4s infinite alternate'
              }}
            >
              <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                <div className="text-4xl">💬</div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-white mb-3 drop-shadow-md">Har du flere spørsmål?</h3>
                  <p className="text-white leading-relaxed font-medium">
                    Vår AI-assistent er her for å hjelpe deg! Få øyeblikkelige svar på alle spørsmål om måltidsplaner, 
                    ernæring eller medlemskap.
                  </p>
                </div>
                <button 
                  className="relative group bg-white text-orange-500 font-bold py-4 px-8 rounded-full transition-all duration-300 transform hover:scale-105 flex items-center gap-3"
                  style={{ 
                    boxShadow: '0 10px 25px -5px rgba(255, 255, 255, 0.4)',
                    border: 'none',
                    overflow: 'hidden'
                  }}
                  onClick={() => {
                    // This would open the chat assistant
                    console.log('Open chat assistant');
                    // You can implement the actual chat functionality later
                    alert('Chat-funksjonalitet kommer snart!');
                  }}
                >
                  <span className="relative z-10 text-lg">Start chat</span>
                  <div className="relative z-10 bg-orange-500 text-white rounded-full w-8 h-8 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 0a8 8 0 1 1 0 16A8 8 0 0 1 8 0zM4.5 7.5a.5.5 0 0 0 0 1h5.793l-2.147 2.146a.5.5 0 0 0 .708.708l3-3a.5.5 0 0 0 0-.708l-3-3a.5.5 0 1 0-.708.708L10.293 7.5H4.5z"/>
                    </svg>
                  </div>
                  {/* Gradient background effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-100 to-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {/* Glowing effect on hover */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-300 opacity-0 group-hover:opacity-30 blur-xl rounded-full transition-opacity duration-500"></div>
                </button>
              </div>
            </div>
          </div>
        </main>
        
        {/* Footer */}
        <footer className="py-8 text-center text-white/80">
          <p>&copy; {new Date().getFullYear()} Smarte måltider. Alle rettigheter reservert.</p>
        </footer>
      </div>
    </div>
  );
}
