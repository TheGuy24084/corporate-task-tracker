import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import { AuthProvider } from './AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import { ListTodo, Shield, Users, ArrowRight } from 'lucide-react';

function Home() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-16 text-center">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold uppercase tracking-wider mb-6">
        Enterprise Task Management
      </div>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
        Streamline Corporate Projects <br className="hidden sm:inline" />
        <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
          with Real-time Precision
        </span>
      </h1>
      <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
        Corporate Task Tracker empowers cross-functional teams to collaborate seamlessly, track milestones, and deliver high-impact deliverables on schedule.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/dashboard"
          className="px-6 py-3 rounded-xl font-medium bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-[1.02] flex items-center gap-2"
        >
          <span>Go to Dashboard</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
        <Link
          to="/login"
          className="px-6 py-3 rounded-xl font-medium bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-200 dark:border-slate-700 transition-all hover:scale-[1.02]"
        >
          Sign In
        </Link>
        <Link
          to="/register"
          className="px-6 py-3 rounded-xl font-medium bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-lg shadow-purple-500/20 transition-all hover:scale-[1.02]"
        >
          Create Account
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-16 text-left">
        <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-sm shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-500 dark:text-indigo-400 mb-4">
            <ListTodo className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Task Organization</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Organize and prioritize sprints, deliverables, and team deadlines with clarity.</p>
        </div>
        <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-sm shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-500 dark:text-purple-400 mb-4">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Team Collaboration</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Keep team members aligned with role-based access, assignments, and updates.</p>
        </div>
        <div className="p-6 rounded-2xl bg-white/70 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 backdrop-blur-sm shadow-sm">
          <div className="w-10 h-10 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400 mb-4">
            <Shield className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Secure & Scalable</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400">Enterprise-ready authentication and persistent data tracking built for scale.</p>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Router>
        <AuthProvider>
          <div className="min-h-screen bg-gray-50 text-gray-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans transition-colors duration-200">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
          </div>
        </AuthProvider>
      </Router>
    </ThemeProvider>
  );
}
