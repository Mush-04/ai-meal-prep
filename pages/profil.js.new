import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '../contexts/AuthContext';
import LoadingScreen from '../components/common/LoadingScreen';

export default function Profil() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    // Redirect to login if not logged in
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    // Redirect to dashboard with profile tab parameter
    if (!loading && user) {
      setRedirecting(true);
      router.push('/dashboard?tab=profile');
    }
  }, [user, loading, router]);

  // Show loading screen while redirecting
  return <LoadingScreen message="Omdirigerer til profil..." />;
}
