
import React, { useState } from 'react';
import { Language } from '../types';
import { signUpWithEmail, signInWithEmail, signInWithGoogle } from '../services/supabaseService';
import { translations } from '../translations';
import { X, Mail, Lock, User as UserIcon, Loader2, ArrowRight, ArrowLeft } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, lang }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  
  const t = translations[lang];

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError(null);
    try {
      if (isLoginMode) {
        await signInWithEmail(email, password);
      } else {
        await signUpWithEmail(email, password, name);
      }
      // onAuthChange in App.tsx handles updating user state
      setEmail('');
      setPassword('');
      setName('');
      onClose();
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setAuthError(null);
    try {
      await signInWithGoogle();
      // Will redirect to Google — session handled by onAuthChange after redirect
    } catch (err: any) {
      setAuthError(err.message || 'Google sign-in failed.');
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
         <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-slate-800 rounded-full text-slate-400 hover:text-white transition-colors rtl:right-auto rtl:left-4 z-10"
          >
            <X className="w-5 h-5" />
        </button>

        <div className="p-8">
            <h2 className="text-2xl font-bold text-white mb-2">{t.authTitle}</h2>
            <p className="text-slate-400 text-sm mb-6">
                {isLoginMode ? t.switchSignup : t.switchLogin}
            </p>
            
            <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="w-full bg-white hover:bg-slate-100 text-slate-800 font-bold py-2.5 rounded-lg shadow-sm transition-all flex items-center justify-center gap-2 mb-4"
            >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <GoogleIcon />}
                <span>{t.continueGoogle}</span>
            </button>

            <div className="flex items-center gap-3 mb-4">
                <div className="h-px bg-slate-700 flex-1"></div>
                <span className="text-xs text-slate-500 font-medium">{t.orDivider}</span>
                <div className="h-px bg-slate-700 flex-1"></div>
            </div>

            {authError && (
              <div className="bg-red-900/30 border border-red-500/40 text-red-300 text-sm rounded-lg px-4 py-3 mb-2">
                {authError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLoginMode && (
                    <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{t.nameLabel}</label>
                        <div className="relative">
                            <UserIcon className="absolute left-3 top-3 w-4 h-4 text-slate-500 rtl:right-3 rtl:left-auto" />
                            <input 
                                type="text"
                                required 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                placeholder={t.nameLabel}
                            />
                        </div>
                    </div>
                )}

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{t.emailLabel}</label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-slate-500 rtl:right-3 rtl:left-auto" />
                        <input 
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            placeholder="name@example.com"
                        />
                    </div>
                </div>

                <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{t.passwordLabel}</label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-slate-500 rtl:right-3 rtl:left-auto" />
                        <input 
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 px-10 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                            placeholder="••••••••"
                        />
                    </div>
                </div>

                <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-lg shadow-lg shadow-indigo-900/50 transition-all flex items-center justify-center gap-2 mt-2"
                >
                    {isLoading ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                        <>
                            {isLoginMode ? t.submitLogin : t.submitSignup}
                            {lang === 'he' ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                        </>
                    )}
                </button>
            </form>

            <div className="mt-6 text-center">
                 <button 
                    onClick={() => setIsLoginMode(!isLoginMode)}
                    className="text-indigo-400 hover:text-indigo-300 text-sm font-medium hover:underline"
                 >
                    {isLoginMode ? t.switchSignup : t.switchLogin}
                 </button>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
