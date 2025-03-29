import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import { FaEnvelope, FaSignInAlt, FaRedo } from 'react-icons/fa';
import Head from 'next/head';

const EmailBekreftelse = () => {
  const router = useRouter();
  const { resendConfirmationEmail } = useAuth();
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendError, setResendError] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);
  const [email, setEmail] = useState('');
  
  // Hent e-post fra query og sett den i state
  useEffect(() => {
    if (router.query.email) {
      setEmail(router.query.email);
    }
  }, [router.query.email]);

  // Sjekk om det finnes en lagret tidspunkt for siste sending i localStorage
  useEffect(() => {
    // Funksjon for å oppdatere nedtellingen
    const updateCountdown = () => {
      if (typeof window !== 'undefined') {
        const lastSentTime = localStorage.getItem('lastEmailSentTime');
        if (lastSentTime) {
          const elapsedSeconds = Math.floor((Date.now() - parseInt(lastSentTime)) / 1000);
          const remainingSeconds = Math.max(0, 30 - elapsedSeconds);
          setTimeLeft(remainingSeconds);
        }
      }
    };
    
    // Kjør umiddelbart
    updateCountdown();
    
    // Oppdater nedtellingen hvert sekund
    const timer = setInterval(() => {
      updateCountdown();
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleResendEmail = async () => {
    if (!email) {
      setResendError('Ingen e-postadresse funnet. Vennligst gå tilbake til innloggingssiden.');
      return;
    }

    // Ikke tillat sending hvis nedtellingen fortsatt pågår
    if (timeLeft > 0) {
      setResendError(`Vennligst vent ${timeLeft} sekunder før du prøver igjen.`);
      return;
    }

    setIsResending(true);
    setResendMessage('');
    setResendError('');

    try {
      await resendConfirmationEmail(email);
      setResendMessage('En ny bekreftelseslink er sendt til din e-post!');
      
      // Lagre tidspunktet for sending i localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('lastEmailSentTime', Date.now().toString());
      }
      
      // Start nedtelling på 30 sekunder
      setTimeLeft(30);
    } catch (error) {
      console.error('Feil ved sending av ny bekreftelseslink:', error);
      
      // Håndter rate limit feil spesifikt
      if (error?.code === 'over_email_send_rate_limit') {
        setResendError('Du har sendt for mange forespørsler. Vennligst vent 30 sekunder før du prøver igjen.');
        setTimeLeft(30);
        if (typeof window !== 'undefined') {
          localStorage.setItem('lastEmailSentTime', Date.now().toString());
        }
      } else {
        setResendError('Det oppstod en feil ved sending av ny bekreftelseslink. Vennligst prøv igjen senere.');
      }
    } finally {
      setIsResending(false);
    }
  };

  const handleLoginClick = () => {
    router.push('/login');
  };

  return (
    <>
      <Head>
        <title>Bekreft E-post | AI Meal Prep</title>
        <meta name="description" content="Bekreft din e-postadresse for å få tilgang til AI Meal Prep" />
      </Head>

      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full bg-white rounded-xl shadow-xl overflow-hidden p-8"
        >
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="h-20 w-20 rounded-full bg-orange-100 flex items-center justify-center">
                <FaEnvelope className="h-10 w-10 text-orange-500" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Bekreft din e-post</h1>
            <p className="text-gray-600">
              Vi har sendt en bekreftelseslink til{' '}
              <span className="font-semibold text-orange-600">{email || 'din e-postadresse'}</span>.
              Vennligst sjekk innboksen din og klikk på linken for å aktivere kontoen din.
            </p>
          </div>

          <div className="bg-orange-50 border-l-4 border-orange-500 text-orange-700 p-4 mb-6 rounded-r">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaEnvelope className="h-5 w-5 text-orange-500" />
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-orange-800">Viktig informasjon</p>
                <p className="text-sm mt-1">
                  Du må bekrefte e-postadressen din før du kan logge inn og få full tilgang til alle funksjoner.
                  Sjekk også i spam-mappen hvis du ikke finner e-posten.
                </p>
              </div>
            </div>
          </div>

          {resendMessage && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-green-50 border-l-4 border-green-500 text-green-700 p-4 mb-6 rounded-r"
            >
              <p className="text-sm">{resendMessage}</p>
            </motion.div>
          )}

          {resendError && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r"
            >
              <p className="text-sm">{resendError}</p>
            </motion.div>
          )}

          <div className="flex flex-col space-y-4">
            <motion.button
              onClick={handleResendEmail}
              disabled={isResending || timeLeft > 0}
              className={`w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white ${
                timeLeft > 0 
                  ? 'bg-orange-300 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700'
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500`}
              whileHover={timeLeft > 0 ? {} : { scale: 1.02 }}
              whileTap={timeLeft > 0 ? {} : { scale: 0.98 }}
            >
              {isResending ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sender...
                </span>
              ) : timeLeft > 0 ? (
                <span className="flex items-center">
                  <FaRedo className="mr-2" />
                  Send på nytt ({timeLeft}s)
                </span>
              ) : (
                <span className="flex items-center">
                  <FaRedo className="mr-2" />
                  Send bekreftelseslink på nytt
                </span>
              )}
            </motion.button>

            <motion.button
              onClick={handleLoginClick}
              className="w-full flex items-center justify-center px-4 py-3 border border-orange-500 text-base font-medium rounded-md text-orange-600 bg-white hover:bg-orange-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <FaSignInAlt className="mr-2" />
              Gå til innlogging
            </motion.button>
          </div>
        </motion.div>
      </div>
    </>
  );
};

export default EmailBekreftelse;
