import React from 'react';
import { Role, User } from '../types';
import { LogOut, Package, ShoppingCart, Truck, ClipboardList, PlusCircle, LayoutDashboard, Users, Globe, Moon, Sun } from 'lucide-react';
import { Language, translations } from '../i18n';

interface LayoutProps {
  children: React.ReactNode;
  user: User | null;
  onLogout: () => void;
  currentPage: string;
  onNavigate: (page: string) => void;
  lang: Language;
  setLang: (l: Language) => void;
  isDark: boolean;
  toggleDark: () => void;
}

const Layout: React.FC<LayoutProps> = ({ children, user, onLogout, currentPage, onNavigate, lang, setLang, isDark, toggleDark }) => {
  const t = translations[lang];

  if (!user) return <>{children}</>;

  const getMenuItems = () => {
    switch (user.role) {
      case Role.ADMIN:
        return [
          { id: 'admin_users', label: t.menuUsers, icon: Users },
          { id: 'seller_dashboard', label: t.menuAllOrders, icon: LayoutDashboard }, // Admin can also view orders
          { id: 'seller_products', label: t.menuProducts, icon: Package },
        ]
      case Role.CLIENT:
        return [
          { id: 'client_dashboard', label: t.menuMyOrders, icon: ClipboardList },
          { id: 'client_new_order', label: t.menuCreateOrder, icon: PlusCircle },
        ];
      case Role.SELLER:
        return [
          { id: 'seller_dashboard', label: t.menuAllOrders, icon: LayoutDashboard },
          { id: 'seller_products', label: t.menuProducts, icon: Package },
        ];
      case Role.DRIVER:
        return [
          { id: 'driver_dashboard', label: t.menuDeliveries, icon: Truck },
        ];
      default:
        return [];
    }
  };

  // 961.kz Logo Component
  const Logo = () => (
    <div className="flex items-center gap-3">
        <div className="relative w-10 h-10 flex items-center justify-center">
            <div className="absolute inset-0 bg-brand-500 rounded-lg transform rotate-3 opacity-90"></div>
            <div className="absolute inset-0 bg-brand-600 rounded-lg transform -rotate-3 opacity-90"></div>
            <div className="relative w-full h-full bg-brand-500 rounded-lg flex items-center justify-center shadow-lg shadow-brand-500/50">
               <span className="text-white font-extrabold text-xl">9</span>
            </div>
        </div>
        <div>
            <h1 className="text-2xl font-black tracking-tighter text-white">961<span className="text-brand-300">.kz</span></h1>
        </div>
    </div>
  );

  return (
    <div className={`flex h-screen font-sans ${isDark ? 'dark bg-slate-950' : 'bg-slate-50'}`}>
      {/* Sidebar */}
      <aside className="w-72 bg-white/80 dark:bg-slate-950/80 backdrop-blur border-r border-gray-200 dark:border-slate-800 flex flex-col hidden md:flex z-20 transition-colors duration-200">
        <div className="p-6 border-b border-gray-100 dark:border-slate-800 bg-slate-900/90">
          <Logo />

          <div className="mt-6 p-3 bg-slate-800/80 rounded-lg border border-slate-700/50 shadow-inner">
            <p className="text-sm font-medium text-white">{user.name}</p>
            <p className="text-xs text-brand-300 mt-0.5 font-bold uppercase tracking-wider">{translations[lang][`role${user.role.charAt(0).toUpperCase() + user.role.slice(1).toLowerCase()}` as keyof typeof t] || user.role}</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 bg-white/60 dark:bg-slate-950/60">
          {getMenuItems().map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 group ${
                currentPage === item.id 
                  ? 'bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 font-semibold' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <item.icon size={20} className={`transition-colors ${currentPage === item.id ? 'text-brand-600 dark:text-brand-400' : 'text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300'}`} />
              <span className="">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-200 dark:border-slate-800 bg-gray-50/80 dark:bg-slate-950/60 space-y-3 backdrop-blur">
          <div className="flex gap-2">
              {/* Language Switcher */}
              <div className="flex bg-white dark:bg-slate-800 rounded-lg p-1 border border-gray-200 dark:border-slate-700 flex-1">
                <button 
                    onClick={() => setLang('ru')}
                    className={`flex-1 text-xs py-1.5 rounded-md transition-colors font-medium ${lang === 'ru' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                >
                  RU
                </button>
                <button 
                    onClick={() => setLang('kk')}
                    className={`flex-1 text-xs py-1.5 rounded-md transition-colors font-medium ${lang === 'kk' ? 'bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-300' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'}`}
                >
                  KK
                </button>
              </div>

              {/* Theme Toggle */}
              <button 
                onClick={toggleDark}
                className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 text-slate-500 hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400 transition-colors"
              >
                {isDark ? <Sun size={18} /> : <Moon size={18} />}
              </button>
          </div>

          <button
            onClick={onLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-sm font-medium"
          >
            <LogOut size={18} />
            {t.logout}
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 text-white z-50 p-4 flex justify-between items-center shadow-md">
         <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-500 rounded flex items-center justify-center font-bold text-sm">9</div>
            <span className="font-bold text-lg">961<span className="text-brand-400">.kz</span></span>
         </div>
         <div className="flex items-center gap-3">
            <button onClick={toggleDark} className="p-1">
                {isDark ? <Sun size={20}/> : <Moon size={20}/>}
            </button>
            <button onClick={() => setLang(lang === 'ru' ? 'kk' : 'ru')} className="text-xs font-bold border border-slate-600 px-2 py-1 rounded">
               {lang.toUpperCase()}
            </button>
            <button onClick={onLogout}><LogOut size={20} /></button>
         </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-auto md:p-8 p-4 pt-20 md:pt-8 bg-gray-50 dark:bg-gradient-to-br dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200">
        {children}
      </main>
    </div>
  );
};

export default Layout;