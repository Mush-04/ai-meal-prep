import Head from 'next/head';
import Link from 'next/link';
import MultiStepRegisterForm from '../components/Auth/MultiStepRegisterForm';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/common/LoadingScreen';

export default function Register() {
  const { loading } = useAuth();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="min-h-screen animated-bg">
      <Head>
        <title>Registrer deg - Smarte Måltider</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
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
        '--size': '65px',
        '--duration': '20s',
        '--float-y': '50px',
        '--float-x': '60px',
        '--rotate': '200deg'
      }}>🥑</div>
      
      {/* Sparkles */}
      <div className="sparkle" style={{ 
        top: '30%', 
        left: '40%', 
        '--duration': '3s'
      }}></div>
      <div className="sparkle" style={{ 
        top: '60%', 
        right: '30%', 
        '--duration': '4s'
      }}></div>
      <div className="sparkle" style={{ 
        bottom: '20%', 
        left: '60%', 
        '--duration': '5s'
      }}></div>
      <div className="sparkle" style={{ 
        top: '40%', 
        right: '50%', 
        '--duration': '3.5s'
      }}></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 min-h-screen flex flex-col">
        <header className="py-6 relative z-50">
          <Link href="/" legacyBehavior>
            <a style={{
              color: '#ff8a00',
              background: 'white',
              padding: '0.5rem 1rem',
              borderRadius: '9999px',
              fontSize: '1.125rem',
              fontWeight: '500',
              transition: 'all 0.3s ease-in-out',
              cursor: 'pointer',
              display: 'inline-block',
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
              ← Tilbake til forsiden
            </a>
          </Link>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center -mt-10">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Velkommen til Smarte Måltider</h1>
            <p className="text-white/90 mb-3">Få personlige måltidsplaner tilpasset dine mål og preferanser</p>
            <p className="text-white/90">
              Allerede medlem?{' '}
              <Link href="/login" legacyBehavior>
                <a className="text-white underline hover:text-orange-200">Logg inn her</a>
              </Link>
            </p>
          </div>

          <MultiStepRegisterForm />
        </main>
      </div>
    </div>
  );
}
