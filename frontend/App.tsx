import React, { useState, useEffect } from 'react';
import { Role, User } from './types';
import Login from './pages/Login';
import Layout from './components/Layout';
import { Language } from './i18n';

// Client Pages
import MyOrders from './pages/client/MyOrders';
import NewOrder from './pages/client/NewOrder';
// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard';
import OrderDetails from './pages/seller/OrderDetails';
import Products from './pages/seller/Products';
// Driver Pages
import DriverDashboard from './pages/driver/DriverDashboard';
// Admin Pages
import UserManagement from './pages/admin/UserManagement';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentPage, setCurrentPage] = useState<string>('');
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [lang, setLang] = useState<Language>('ru');
  const [isDark, setIsDark] = useState(false);

  // Initialize theme from system preference
  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setIsDark(true);
    }
  }, []);

  const handleLogin = (loggedUser: User) => {
      setUser(loggedUser);
      // Set default page based on role
      if (loggedUser.role === Role.CLIENT) setCurrentPage('client_dashboard');
      if (loggedUser.role === Role.SELLER) setCurrentPage('seller_dashboard');
      if (loggedUser.role === Role.DRIVER) setCurrentPage('driver_dashboard');
      if (loggedUser.role === Role.ADMIN) setCurrentPage('admin_users');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('');
    setSelectedOrderId(null);
  };

  const renderContent = () => {
    if (!user) return <Login onLogin={handleLogin} lang={lang} setLang={setLang} isDark={isDark} toggleDark={() => setIsDark(!isDark)} />;

    switch (currentPage) {
      // Admin
      case 'admin_users':
        return <UserManagement lang={lang} />;

      // Client
      case 'client_dashboard':
        return <MyOrders user={user} onViewOrder={(id) => { console.log('View', id); /* Mock detail view for client if needed */ }} />;
      case 'client_new_order':
        return <NewOrder user={user} onSuccess={() => setCurrentPage('client_dashboard')} />;
      
      // Seller / Manager
      case 'seller_dashboard':
        return <SellerDashboard onViewOrder={(id) => { setSelectedOrderId(id); setCurrentPage('seller_order_detail'); }} />;
      case 'seller_order_detail':
        return selectedOrderId ? (
          <OrderDetails 
            orderId={selectedOrderId} 
            onBack={() => { setSelectedOrderId(null); setCurrentPage('seller_dashboard'); }} 
          />
        ) : <div>Error: No order selected</div>;
      case 'seller_products':
        return <Products />;

      // Driver
      case 'driver_dashboard':
        return <DriverDashboard user={user} />;

      default:
        return <div>Page not found</div>;
    }
  };

  return (
    <Layout 
      user={user} 
      onLogout={handleLogout} 
      currentPage={currentPage}
      onNavigate={setCurrentPage}
      lang={lang}
      setLang={setLang}
      isDark={isDark}
      toggleDark={() => setIsDark(!isDark)}
    >
      {renderContent()}
    </Layout>
  );
};

export default App;