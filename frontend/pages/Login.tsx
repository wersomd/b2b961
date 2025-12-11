import React, { useState } from 'react';
import { Role, User } from '../types';
import { db } from '../services/mockDatabase';
import { Language, translations } from '../i18n';
import { Lock, Mail, AlertCircle, Sun, Moon } from 'lucide-react';

interface LoginProps {
  onLogin: (user: User) => void;
  lang: Language;
  setLang: (l: Language) => void;
  isDark: boolean;
  toggleDark: () => void;
}

const Login: React.FC<LoginProps> = ({ onLogin, lang, setLang, isDark, toggleDark }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const t = translations[lang];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const user = await db.login(email, password);
      onLogin(user);
    } catch (err) {
      setError(t.loginError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-4 relative overflow-hidden transition-colors duration-300 ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-1/2 bg-brand-600 dark:bg-brand-900 skew-y-3 transform -translate-y-24 z-0"></div>

      {/* Top Controls */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button 
           onClick={toggleDark}
           className="bg-white/10 backdrop-blur-md border border-white/20 p-2 rounded-full text-white hover:bg-white/20 transition-all"
        >
           {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-1 rounded-full flex">
          <button 
            onClick={() => setLang('ru')} 
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'ru' ? 'bg-white text-brand-600' : 'text-white/70 hover:text-white'}`}
          >
            RU
          </button>
          <button 
            onClick={() => setLang('kk')} 
            className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${lang === 'kk' ? 'bg-white text-brand-600' : 'text-white/70 hover:text-white'}`}
          >
            KK
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-md p-8 z-10 relative border border-gray-100 dark:border-slate-700 transition-colors">
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 bg-brand-500 rounded-2xl shadow-lg shadow-brand-500/40 flex items-center justify-center mb-4 transform rotate-3">
             <span className="text-3xl font-black text-white tracking-tighter -rotate-3">9</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">961<span className="text-brand-500">.kz</span></h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-2">{t.loginSubtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input 
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 font-medium"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-3.5 text-gray-400" size={20} />
              <input 
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={t.passwordPlaceholder}
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 dark:bg-slate-900/50 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400 font-medium"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-500 dark:text-red-400 text-sm bg-red-50 dark:bg-red-900/20 p-4 rounded-xl border border-red-100 dark:border-red-900/30">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-600 hover:bg-brand-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-brand-600/30 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed text-lg"
          >
            {loading ? t.loading : t.loginButton}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-100 dark:border-slate-700 pt-6">
          <p className="text-xs text-gray-400 dark:text-slate-500">© 2024 961.kz Construction Supply</p>
        </div>
      </div>
    </div>
  );
};

export default Login;