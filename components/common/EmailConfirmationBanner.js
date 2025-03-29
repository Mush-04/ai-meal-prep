import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { FaEnvelope, FaExclamationTriangle, FaTimes, FaSpinner } from 'react-icons/fa';

export default function EmailConfirmationBanner() {
  const { user, isEmailConfirmed, resendConfirmationEmail } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [isResending, setIsResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState(null);

  // Ikke vis banneret hvis brukeren ikke er logget inn eller e-posten er bekreftet
  if (!user || isEmailConfirmed || !isVisible) {
    return null;
  }

  const handleResendEmail = async () => {
    setIsResending(true);
    setResendSuccess(false);
    setResendError(null);

    try {
      await resendConfirmationEmail();
      setResendSuccess(true);
    } catch (error) {
      setResendError('Det oppstod en feil ved sending av e-post. Vennligst prøv igjen senere.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        className="bg-orange-50 border-l-4 border-orange-500 text-orange-700 p-4 mb-6 relative"
        role="alert"
      >
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3">
            <FaExclamationTriangle className="text-orange-500 text-xl" />
          </div>
          <div className="flex-grow">
            <div className="font-bold mb-1">E-postadressen din er ikke bekreftet</div>
            <p className="text-sm">
              For å få full tilgang til alle funksjoner, vennligst bekreft e-postadressen din. 
              Vi har sendt en bekreftelseslink til <span className="font-semibold">{user.email}</span>.
            </p>
            
            {resendSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-green-600 bg-green-50 p-2 rounded"
              >
                En ny bekreftelseslink er sendt til din e-post.
              </motion.div>
            )}
            
            {resendError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded"
              >
                {resendError}
              </motion.div>
            )}
            
            <div className="mt-3">
              <button
                onClick={handleResendEmail}
                disabled={isResending || resendSuccess}
                className={`inline-flex items-center mr-3 px-3 py-1.5 text-sm font-medium rounded-md 
                  ${isResending || resendSuccess 
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                    : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
              >
                {isResending ? (
                  <>
                    <FaSpinner className="animate-spin mr-2" />
                    Sender...
                  </>
                ) : resendSuccess ? (
                  <>
                    <FaEnvelope className="mr-2" />
                    Sendt
                  </>
                ) : (
                  <>
                    <FaEnvelope className="mr-2" />
                    Send på nytt
                  </>
                )}
              </button>
            </div>
          </div>
          <button
            onClick={() => setIsVisible(false)}
            className="text-orange-500 hover:text-orange-700 ml-4"
            aria-label="Lukk"
          >
            <FaTimes />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
