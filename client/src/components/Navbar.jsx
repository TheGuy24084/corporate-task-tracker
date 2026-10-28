import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { CheckSquare, LayoutDashboard, LogIn, UserPlus, LogOut, Menu, X, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 text-slate-800 shadow-sm dark:bg-slate-900 dark:border-slate-800 dark:text-slate-100 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Title */}
          <Link
            to="/"
            className="flex items-center gap-3 group transition-transform duration-200 hover:scale-[1.02]"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 text-white shadow-md shadow-indigo-500/20 group-hover:shadow-indigo-500/30 transition-all">
              <CheckSquare className="w-5 h-5" />
            </div>
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:via-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              Corporate Task Tracker
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/70 transition-all duration-150"
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
              <span>Dashboard</span>
            </Link>

            {isAuthenticated ? (
              <div className="flex items-center gap-3 pl-2 border-l border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs">
                  <User className="w-3.5 h-3.5 text-indigo-500 dark:text-indigo-400" />
                  <span className="font-medium text-slate-700 dark:text-slate-200">{user?.name}</span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider ${
                      user?.role === 'Admin'
                        ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30'
                        : 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                    }`}
                  >
                    {user?.role || 'User'}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-rose-600 dark:text-rose-300 hover:text-rose-700 dark:hover:text-rose-200 hover:bg-rose-50 dark:hover:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 transition-all duration-150"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/70 transition-all duration-150"
                >
                  <LogIn className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                  <span>Login</span>
                </Link>
                <Link
                  to="/register"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-sm shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all duration-150"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Register</span>
                </Link>
              </div>
            )}

            {/* Dark/Light Mode Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800/80 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400 transition-transform duration-300 hover:rotate-45" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700 transition-transform duration-300 hover:-rotate-12" />
              )}
            </button>
          </div>

          {/* Mobile Menu & Theme Toggle */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
            >
              {theme === 'dark' ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-700" />
              )}
            </button>
            <button
              type="button"
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800/80 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-2">
          <Link
            to="/dashboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-200 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
          >
            <LayoutDashboard className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
            <span>Dashboard</span>
          </Link>

          {isAuthenticated ? (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <div className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800/50 flex items-center justify-between text-sm">
                <span className="text-slate-700 dark:text-slate-300 font-medium">{user?.name}</span>
                <span className="text-xs px-2 py-0.5 rounded bg-indigo-100 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 font-semibold uppercase">
                  {user?.role || 'User'}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-base font-medium bg-rose-50 hover:bg-rose-100 dark:bg-rose-500/10 dark:hover:bg-rose-500/20 text-rose-600 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-200 dark:hover:text-white dark:hover:bg-slate-800 transition-colors"
              >
                <LogIn className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />
                <span>Login</span>
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-base font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-colors"
              >
                <UserPlus className="w-5 h-5" />
                <span>Register</span>
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
