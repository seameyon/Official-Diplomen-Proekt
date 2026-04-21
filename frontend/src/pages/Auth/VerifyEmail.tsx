// VerifyEmail.tsx
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { authApi } from '../../services/api';
import { useTranslation } from '../../i18n';

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { t } = useTranslation();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('error');
      setMessage('Invalid verification link');
      return;
    }

    authApi.verifyEmail(token)
      .then(() => {
        setStatus('success');
        setMessage(t('auth.emailVerified'));
      })
      .catch((error) => {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Verification failed');
      });
  }, [searchParams, t]);

  return (
    <div className="text-center">
      {status === 'loading' && (
        <>
          <Loader2 className="w-16 h-16 mx-auto text-primary-500 animate-spin mb-6" />
          <h1 className="text-2xl font-display font-bold mb-2">Verifying your email...</h1>
          <p className="text-gray-600 dark:text-gray-400">Please wait a moment.</p>
        </>
      )}

      {status === 'success' && (
        <>
          <div className="w-20 h-20 mx-auto bg-secondary-100 dark:bg-secondary-900/30 rounded-full flex items-center justify-center mb-6">
            <CheckCircle className="w-10 h-10 text-secondary-500" />
          </div>
          <h1 className="text-2xl font-display font-bold mb-2">Email Verified! 🎉</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{message}</p>
          <Link to="/login" className="btn-primary">
            Continue to Login
          </Link>
        </>
      )}

      {status === 'error' && (
        <>
          <div className="w-20 h-20 mx-auto bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-6">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-2xl font-display font-bold mb-2">Verification Failed</h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">{message}</p>
          <Link to="/login" className="btn-primary">
            Back to Login
          </Link>
        </>
      )}
    </div>
  );
}
