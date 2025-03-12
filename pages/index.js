import Head from 'next/head';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-r from-orange-400 to-orange-600">
      <Head>
        <title>AI Meal Prep</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col">
        <header className="py-6 flex justify-between items-center">
          <Link href="#" legacyBehavior>
            <a className="text-white hover:text-orange-100 transition-colors text-lg font-medium">
              Våre medlemskap
            </a>
          </Link>
          <div className="space-x-8">
            <Link href="#" legacyBehavior>
              <a className="text-white hover:text-orange-100 transition-colors text-lg font-medium">
                Logg inn
              </a>
            </Link>
            <Link href="#" legacyBehavior>
              <a className="text-white hover:text-orange-100 transition-colors text-lg font-medium">
                Registrer deg
              </a>
            </Link>
          </div>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center py-16 -mt-20">
          <div className="max-w-4xl text-center mb-16">
            <h1 className="text-5xl sm:text-6xl font-bold mb-6 text-white leading-tight">
              AI Meal Prep – Din personlige kokk i lomma
            </h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-12">
              Generer måltider basert på dine ingredienser, mål og smak. Start nå!
            </p>
            <button className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-4 px-10 rounded-full 
              transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl text-lg">
              La AI lage ditt perfekte måltid
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
              <div className="lg:col-span-2 bg-white/10 backdrop-blur-sm p-8 rounded-2xl hover:bg-white/15 transition-all duration-300">
                <h3 className="text-xl font-semibold text-white mb-3">Enkelhet Og Effektivitet</h3>
                <p className="text-white/90 leading-relaxed">
                  Med AI-genererte oppskrifter, automatiske planleggingsverktøy og sanntidsnæringsdata blir meal prep enkelt, smart og motiverende.
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
