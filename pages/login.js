import Head from 'next/head';
import Link from 'next/link';
import AuthForm from '../components/Auth/AuthForm';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/common/LoadingScreen';

export default function Login() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-r from-orange-400 to-orange-600">
      <Head>
        <title>Smarte måltider - Logg inn</title>
        <meta name="description" content="Logg inn på Smarte måltider" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col">
        <header className="py-6 relative z-50">
          <Link href="/" legacyBehavior>
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
              ← Tilbake til forsiden
            </a>
          </Link>
        </header>

        {/* Lys hvit stripe under navigasjonsknappene */}
        <div className="w-full h-1 bg-white/20" style={{ 
          boxShadow: '0 0 12px rgba(255, 255, 255, 0.3)',
          marginLeft: '-100vw',
          paddingLeft: '100vw',
          marginRight: '-100vw',
          paddingRight: '100vw'
        }}></div>

        <main className="flex-grow flex flex-col items-center justify-center -mt-20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white drop-shadow-lg">Velkommen til Smarte måltider</h1>
            <p className="text-white mt-2 font-medium">Logg inn for å fortsette</p>
          </div>

          <AuthForm mode="login" />
        </main>
      </div>
    </div>
  );
}
