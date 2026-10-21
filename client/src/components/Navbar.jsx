import { useState } from 'react'
import { Link } from 'react-router-dom'
import { CheckSquare, LayoutDashboard, LogIn, Menu, X } from 'lucide-react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  const toggleMenu = () => {
    setIsOpen(!isOpen)
  }

  return (
    <nav className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-lg">
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
            <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Corporate Task Tracker
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/dashboard"
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/70 transition-all duration-150"
            >
              <LayoutDashboard className="w-4 h-4 text-indigo-400" />
              <span>Dashboard</span>
            </Link>

            <Link
              to="/login"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white shadow-sm shadow-indigo-500/25 hover:shadow-indigo-500/35 transition-all duration-150"
            >
              <LogIn className="w-4 h-4" />
              <span>Login</span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isOpen && (
        <div className="md:hidden border-t border-slate-800/80 bg-slate-900/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-2">
          <Link
            to="/dashboard"
            onClick={() => setIsOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <LayoutDashboard className="w-5 h-5 text-indigo-400" />
            <span>Dashboard</span>
          </Link>

          <Link
            to="/login"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-base font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 transition-colors mt-2"
          >
            <LogIn className="w-5 h-5" />
            <span>Login</span>
          </Link>
        </div>
      )}
    </nav>
  )
}
