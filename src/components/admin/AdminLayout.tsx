import React, { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useShop } from '../../context/ShopContext';
import {
  LayoutDashboard,
  Package,
  PlusCircle,
  Tag,
  Settings,
  LogOut,
  ExternalLink,
  Shield,
  Sparkles,
  Menu,
  X,
  Radio,
  RefreshCw,
} from 'lucide-react';

export const AdminLayout: React.FC = () => {
  const { user, isAdmin, loading, logout, hasCheckedAdmin } = useAuth();
  const { settings, realtimeConnected, refreshAll } = useShop();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Authentication & Authorization Route Guard
  React.useEffect(() => {
    if (!loading && hasCheckedAdmin) {
      if (!user || !isAdmin) {
        navigate('/admin/login', { replace: true });
      }
    }
  }, [user, isAdmin, loading, hasCheckedAdmin, navigate]);

  if (loading || !hasCheckedAdmin) {
    return (
      <div className="min-h-screen bg-cream-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 text-champagne-600 animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-brown-700">Verifying owner credentials...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/admin/login');
  };

  const navItems = [
    { name: 'Dashboard Overview', path: '/admin', icon: LayoutDashboard, end: true },
    { name: 'Manage Products', path: '/admin/products', icon: Package, end: false },
    { name: 'Add New Jewellery', path: '/admin/products/new', icon: PlusCircle, end: false },
    { name: 'Promotions & Offers', path: '/admin/offers', icon: Tag, end: false },
    { name: 'Shop & WhatsApp Settings', path: '/admin/settings', icon: Settings, end: false },
  ];

  return (
    <div className="min-h-screen bg-cream-100/60 flex flex-col font-sans">
      
      {/* Top Admin Bar */}
      <header className="bg-brown-950 text-cream-100 border-b border-champagne-500/30 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Brand Identity */}
            <div className="flex items-center space-x-3">
              <Link to="/admin" className="flex items-center space-x-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-champagne-400 to-amber-600 p-0.5 flex items-center justify-center">
                  <div className="w-full h-full bg-brown-900 rounded-xl flex items-center justify-center text-champagne-300">
                    <Shield className="w-5 h-5" />
                  </div>
                </div>
                <div>
                  <span className="font-serif font-bold text-white text-base tracking-wide">
                    {settings.shop_name} &bull; Admin
                  </span>
                  <div className="flex items-center space-x-1.5 text-[10px] text-cream-300">
                    <span className={`w-2 h-2 rounded-full ${realtimeConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                    <span>Realtime Sync: {realtimeConnected ? 'Active' : 'Connecting'}</span>
                  </div>
                </div>
              </Link>
            </div>

            {/* Right: Quick Live Site Link & User Controls */}
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center space-x-1.5 text-xs text-champagne-300 hover:text-white bg-brown-900 hover:bg-brown-800 px-3.5 py-1.5 rounded-full border border-champagne-500/30 transition shadow-sm"
              >
                <span>View Customer Website</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>

              <div className="text-right border-l border-brown-800 pl-4">
                <p className="text-[11px] text-cream-400 font-medium">Logged in as</p>
                <p className="text-xs text-champagne-200 font-bold max-w-xs truncate">{user.email}</p>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center space-x-1 text-xs text-rose-300 hover:text-white bg-rose-950/60 hover:bg-rose-900 px-3 py-1.5 rounded-xl transition border border-rose-800/40"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center space-x-2">
              <Link
                to="/"
                target="_blank"
                className="p-1.5 text-champagne-300 hover:text-white"
                title="View Website"
              >
                <ExternalLink className="w-5 h-5" />
              </Link>

              <button
                onClick={() => setMobileNavOpen(!mobileNavOpen)}
                className="p-1.5 text-cream-300 hover:text-white"
              >
                {mobileNavOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Sub Navigation Bar for Desktop */}
      <div className="bg-white border-b border-champagne-200 shadow-xs hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-2 py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-champagne-100 text-brown-950 shadow-sm border border-champagne-300'
                      : 'text-brown-700 hover:text-brown-950 hover:bg-cream-100'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {mobileNavOpen && (
        <div className="md:hidden bg-brown-900 text-cream-100 px-4 py-4 space-y-1.5 border-b border-champagne-500/30">
          {navItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              end={item.end}
              onClick={() => setMobileNavOpen(false)}
              className={({ isActive }) =>
                `flex items-center space-x-2.5 px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-champagne-500 text-brown-950 font-bold'
                    : 'text-cream-200 hover:bg-brown-800'
                }`
              }
            >
              <item.icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          ))}

          <div className="pt-3 border-t border-brown-800 flex items-center justify-between">
            <span className="text-[11px] text-cream-400 truncate max-w-[200px]">{user.email}</span>
            <button
              onClick={handleLogout}
              className="text-xs text-rose-300 flex items-center space-x-1"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}

      {/* Admin Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Outlet />
      </main>

    </div>
  );
};
