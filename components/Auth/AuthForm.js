import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';

export default function AuthForm({ mode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'login') {
        await signIn(email, password);
        
        // Sjekk om brukeren er admin (har e-posten munashe.toga@gmail.com)
        if (email.toLowerCase() === 'munashe.toga@gmail.com') {
          router.push('/admin');
        } else {
          router.push('/dashboard');
        }
      } else {
        await signUp(email, password);
        // Standardiserer omdirigeringen til dashboard uten tab-parameter
        router.push('/dashboard');
      }
    } catch (err) {
      setError(
        err.message === 'Invalid login credentials'
          ? 'Feil e-post eller passord'
          : err.message === 'User already registered'
          ? 'E-posten er allerede registrert'
          : err.code === 'email_address_invalid'
          ? 'E-postadressen er ikke gyldig'
          : 'Det oppstod en feil. Vennligst prøv igjen.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="bg-white/10 backdrop-blur-sm shadow-lg rounded-lg px-8 pt-6 pb-8 mb-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        
        <div className="mb-4">
          <label className="block text-white text-sm font-bold mb-2" htmlFor="email">
            E-post
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="email"
            type="email"
            placeholder="din@epost.no"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-white text-sm font-bold mb-2" htmlFor="password">
            Passord
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline"
            id="password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />
          <p className="text-white/70 text-xs">
            {mode === 'register' && 'Passordet må være minst 6 tegn langt'}
          </p>
        </div>
        
        <div className="flex items-center justify-between">
        <button
          type="submit"
          disabled={loading}
          style={{
            backgroundColor: 'rgb(249, 115, 22)',
            color: 'white',
            fontWeight: '700',
            padding: '0.5rem 1rem',
            borderRadius: '0.25rem',
            width: '100%',
            transition: 'background-color 0.15s ease-in-out',
            outline: 'none'
          }}
          onMouseOver={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = 'rgb(234, 88, 12)';
            }
          }}
          onMouseOut={(e) => {
            if (!loading) {
              e.currentTarget.style.backgroundColor = 'rgb(249, 115, 22)';
            }
          }}
          onFocus={(e) => {
            if (!loading) {
              e.currentTarget.style.boxShadow = '0 0 0 3px rgba(249, 115, 22, 0.5)';
            }
          }}
          onBlur={(e) => {
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          {loading ? (
            'Laster...'
          ) : mode === 'login' ? (
            'Logg inn'
          ) : (
            'Registrer deg'
          )}
        </button>
        </div>
        
        {mode === 'login' && (
          <div className="mt-6 text-center">
            <p className="text-white/90">
              Har du ikke konto?{' '}
              <Link href="/register" legacyBehavior>
                <a className="text-white underline hover:text-orange-200 font-medium">
                  Registrer deg her
                </a>
              </Link>
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
