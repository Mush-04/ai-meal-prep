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
        <title>Logg inn - AI Meal Prep</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col">
        <header className="py-6">
          <Link href="/" legacyBehavior>
            <a style={{
              color: 'white',
              fontSize: '1.125rem',
              fontWeight: '500',
              transition: 'color 0.15s ease-in-out'
            }}>
              ← Tilbake til forsiden
            </a>
          </Link>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center -mt-20">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Logg inn på AI Meal Prep</h1>
            <p className="text-white/90">
              Ikke medlem ennå?{' '}
              <Link href="/register" legacyBehavior>
                <a className="text-white underline hover:text-orange-200">Registrer deg her</a>
              </Link>
            </p>
          </div>

          <AuthForm mode="login" />
        </main>
      </div>
    </div>
  );
}
