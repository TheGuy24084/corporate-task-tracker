import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckSquare, Sparkles, Sun, Moon } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { useTheme } from '../context/ThemeContext';

export default function LandingPage() {
  const videoRef = useRef(null);
  const trackRef = useRef(null);
  const { isAuthenticated } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth <= 900 : false
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const videoSrc = isMobile
    ? 'https://assets.mixkit.co/videos/preview/mixkit-server-room-with-blinking-lights-in-a-data-center-40742-medium.mp4'
    : 'https://assets.mixkit.co/videos/preview/mixkit-server-room-with-blinking-lights-in-a-data-center-40742-large.mp4';

  useEffect(() => {
    const video = videoRef.current;
    const track = trackRef.current;
    if (!video || !track) return;

    let animationFrameId;
    let cur = 0;
    const knee = 0.55;

    const onLoadedMetadata = () => {
      try {
        video.pause();
        video.currentTime = 0;
      } catch {
        // Safe catch for media playback policies
      }
    };

    video.addEventListener('loadedmetadata', onLoadedMetadata);

    const scrubLoop = () => {
      if (track && video && video.duration && !isNaN(video.duration)) {
        const rect = track.getBoundingClientRect();
        const maxScroll = rect.height - window.innerHeight;
        if (maxScroll > 0) {
          const rawP = Math.min(Math.max(-rect.top / maxScroll, 0), 1);
          const mappedP =
            rawP < knee
              ? (rawP / knee) * 0.46
              : 0.46 + ((rawP - knee) / (1 - knee)) * 0.54;
          const target = mappedP * video.duration;

          cur += (target - cur) * 0.22;

          if (!video.seeking && Math.abs(video.currentTime - cur) > 1 / 60) {
            video.currentTime = cur;
          }
        }
      }
      animationFrameId = requestAnimationFrame(scrubLoop);
    };

    animationFrameId = requestAnimationFrame(scrubLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
    };
  }, [videoSrc]);

  return (
    <div className="relative w-full bg-[#0a0b0c] text-white selection:bg-indigo-500 selection:text-white">
      {/* ====================================================================
          Sticky Track for Scroll-Scrubbed Aerial Video & Centered Narrative
          Track height: 3000 / 8 vh = 375vh
         ==================================================================== */}
      <div
        ref={trackRef}
        className="relative w-full"
        style={{ height: 'calc(3000 / 8 * 1vh)' }}
      >
        {/* Full-Viewport Sticky Container (.scene) */}
        <div className="scene sticky top-0 h-screen w-full overflow-hidden bg-[#0a0b0c]">
          {/* Enterprise Data Center Server Room Scrubbed Video */}
          <video
            ref={videoRef}
            src={videoSrc}
            poster="https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=1920&q=80"
            muted
            playsInline
            preload="auto"
            tabIndex={-1}
            className="absolute inset-0 h-full w-full object-cover object-center pointer-events-none"
          />

          {/* Cinematic Dark Vignette Gradients */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-[#0a0b0c]" />
          <div className="pointer-events-none absolute inset-0 bg-radial-[ellipse_at_center] from-transparent via-black/20 to-black/75" />

          {/* Central Alignment Axis Guide (Desktop) */}
          <div className="pointer-events-none absolute left-1/2 top-0 bottom-0 w-px -translate-x-1/2 bg-white/10 hidden md:block" />

          {/* Floating Transparent Top Bar */}
          <header className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-6 py-6 md:px-12 backdrop-blur-xs">
            <Link
              to="/"
              className="flex items-center gap-3 group transition-transform duration-200 hover:scale-[1.02]"
            >
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-indigo-600 to-cyan-400 text-white shadow-lg shadow-indigo-500/25">
                <CheckSquare className="w-5 h-5" />
              </div>
              <span className="font-['Exo_2',sans-serif] text-lg md:text-xl font-extrabold uppercase tracking-wider text-white">
                Corporate Task Tracker
              </span>
            </Link>

            <nav className="flex items-center gap-3 md:gap-4">
              {isAuthenticated ? (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 backdrop-blur-md transition-all duration-150"
                >
                  Dashboard
                </Link>
              ) : (
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-200 hover:text-white hover:bg-white/10 backdrop-blur-md transition-all duration-150"
                >
                  Sign In
                </Link>
              )}
              <Link
                to={isAuthenticated ? '/dashboard' : '/register'}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-lg shadow-indigo-500/30 hover:scale-[1.03] transition-all duration-200"
              >
                <span>Launch Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
                className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 backdrop-blur-md transition-all duration-200 focus:outline-none cursor-pointer"
              >
                {theme === 'dark' ? (
                  <Sun className="w-5 h-5 text-amber-400" />
                ) : (
                  <Moon className="w-5 h-5 text-slate-200" />
                )}
              </button>
            </nav>
          </header>
        </div>

        {/* ====================================================================
            Scrolling Axis Content Blocks (.content)
           ==================================================================== */}
        <div className="content absolute inset-0 pointer-events-none w-full">
          {/* Intro Block: top calc(940 / 8 * 1vh) */}
          <div
            className="absolute left-1/2 -translate-x-1/2 w-[90vw] max-w-4xl text-center z-20 pointer-events-auto"
            style={{ top: 'calc(940 / 8 * 1vh)' }}
          >
            <div className="landing-eyebrow mb-4 inline-block px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/15">
              ENTERPRISE WORKSPACE PLATFORM
            </div>
            <h1 className="landing-headline text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05]">
              INFRASTRUCTURE <br />
              DESIGNED TO DELIVER <br />
              EVERY SPRINT <br />
              ON TIME.
            </h1>
          </div>

          {/* 5 Mirrored Feature Blocks Straddling the Axis */}
          {/* Row 1 Left: 1500/8 vh, 78u left of axis */}
          <div className="feature-block feature-block-r1-left pointer-events-auto">
            <div className="flex items-center justify-end md:justify-end gap-3 mb-3">
              <span className="font-['Exo_2',sans-serif] font-extrabold text-base sm:text-lg md:text-xl text-white uppercase tracking-tight">
                ONE UNIFIED WORKSPACE
              </span>
              <div className="w-[calc(34*var(--u))] h-[calc(34*var(--u))] min-w-[34px] min-h-[34px] flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white p-2">
                {/* Dotted ring globe SVG */}
                <svg
                  viewBox="0 0 34 34"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full stroke-white"
                >
                  <circle
                    cx="17"
                    cy="17"
                    r="13"
                    strokeWidth="1.8"
                    strokeDasharray="3 3"
                  />
                  <ellipse cx="17" cy="17" rx="6.5" ry="13" strokeWidth="1.6" />
                  <line x1="4" y1="17" x2="30" y2="17" strokeWidth="1.6" />
                </svg>
              </div>
            </div>
            <p className="landing-body">
              Switch seamlessly between Kanban boards, <br className="hidden sm:inline" />
              Scrum sprints, and Project Management <br className="hidden sm:inline" />
              views in a single click.
            </p>
          </div>

          {/* Row 1 Right: 1500/8 vh, 78u right of axis */}
          <div className="feature-block feature-block-r1-right pointer-events-auto">
            <div className="flex items-center justify-start gap-3 mb-3">
              <div className="w-[calc(34*var(--u))] h-[calc(34*var(--u))] min-w-[34px] min-h-[34px] flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white p-2">
                {/* Stepped container blocks SVG */}
                <svg
                  viewBox="0 0 34 34"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full stroke-white"
                >
                  <rect x="5" y="16" width="6" height="12" rx="1.5" strokeWidth="1.8" />
                  <rect x="14" y="10" width="6" height="18" rx="1.5" strokeWidth="1.8" />
                  <rect x="23" y="4" width="6" height="24" rx="1.5" strokeWidth="1.8" />
                </svg>
              </div>
              <span className="font-['Exo_2',sans-serif] font-extrabold text-base sm:text-lg md:text-xl text-white uppercase tracking-tight">
                FULL SPRINT VISIBILITY
              </span>
            </div>
            <p className="landing-body">
              Track story points, velocity, and task <br className="hidden sm:inline" />
              progress in real time before bottlenecks <br className="hidden sm:inline" />
              become missed deadlines.
            </p>
          </div>

          {/* Row 2 Left: 1759/8 vh, 88u left of axis */}
          <div className="feature-block feature-block-r2-left pointer-events-auto">
            <div className="flex items-center justify-end gap-3 mb-3">
              <span className="font-['Exo_2',sans-serif] font-extrabold text-base sm:text-lg md:text-xl text-white uppercase tracking-tight">
                ENTERPRISE JWT SECURITY
              </span>
              <div className="w-[calc(34*var(--u))] h-[calc(34*var(--u))] min-w-[34px] min-h-[34px] flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white p-2">
                {/* Dotted ring check shield SVG */}
                <svg
                  viewBox="0 0 34 34"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full stroke-white"
                >
                  <circle
                    cx="17"
                    cy="17"
                    r="14"
                    strokeWidth="1.6"
                    strokeDasharray="3 3"
                  />
                  <path
                    d="M17 7L10 11V17C10 21.5 13 25.5 17 27C21 25.5 24 21.5 24 17V11L17 7Z"
                    strokeWidth="1.8"
                  />
                  <path
                    d="M13.5 17L16 19.5L20.5 14.5"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
            </div>
            <p className="landing-body">
              Role-based access control and JSON Web <br className="hidden sm:inline" />
              Tokens keep Admin actions and team <br className="hidden sm:inline" />
              permissions locked down.
            </p>
          </div>

          {/* Row 2 Right: 1759/8 vh, 88u right of axis */}
          <div className="feature-block feature-block-r2-right pointer-events-auto">
            <div className="flex items-center justify-start gap-3 mb-3">
              <div className="w-[calc(34*var(--u))] h-[calc(34*var(--u))] min-w-[34px] min-h-[34px] flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white p-2">
                {/* Bold "@" / mail stroke SVG */}
                <svg
                  viewBox="0 0 34 34"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full stroke-white"
                >
                  <circle
                    cx="17"
                    cy="17"
                    r="14"
                    strokeWidth="1.6"
                    strokeDasharray="4 2"
                  />
                  <circle cx="17" cy="17" r="4.5" strokeWidth="1.8" />
                  <path
                    d="M21.5 17V19C21.5 20.8 19.8 22.5 17 22.5C13 22.5 10 19.5 10 15.5C10 11.5 13 8.5 17 8.5C21.5 8.5 23.5 12 23.5 15.5"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                  />
                </svg>
              </div>
              <span className="font-['Exo_2',sans-serif] font-extrabold text-base sm:text-lg md:text-xl text-white uppercase tracking-tight">
                INSTANT TEAM INVITES
              </span>
            </div>
            <p className="landing-body">
              Onboard members via automated email <br className="hidden sm:inline" />
              invitations and assign owners to every <br className="hidden sm:inline" />
              deliverable from day one.
            </p>
          </div>

          {/* Row 3 Center: 2063/8 vh, centered on axis */}
          <div className="feature-block feature-block-r3-center pointer-events-auto">
            <div className="flex flex-col items-center justify-center gap-3 mb-3">
              <div className="w-[calc(34*var(--u))] h-[calc(34*var(--u))] min-w-[34px] min-h-[34px] flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white p-2">
                {/* Double chevron SVG */}
                <svg
                  viewBox="0 0 34 34"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-full h-full stroke-white"
                >
                  <path
                    d="M10 10L17 17L24 10"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M10 17L17 24L24 17"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <span className="font-['Exo_2',sans-serif] font-extrabold text-base sm:text-lg md:text-2xl text-white uppercase tracking-tight">
                REAL-TIME @MENTION SYNC
              </span>
            </div>
            <p className="landing-body text-center">
              Keep discussions attached to the work. <br className="hidden sm:inline" />
              Mention teammates in task threads to <br className="hidden sm:inline" />
              trigger instant alerts and resolve blockers.
            </p>
          </div>
        </div>
      </div>

      {/* ====================================================================
          After the Clouds: About Us & Testimonials Section (<section className="trust">)
          Pulled up -34vh over the sticky track with a 34vh gradient into cloud grey #e2dedd
         ==================================================================== */}
      <section
        className="trust relative z-30 w-full"
        style={{
          marginTop: '-34vh',
          backgroundColor: '#e2dedd',
          color: '#141516',
        }}
      >
        {/* 34vh Smooth Linear Gradient Transition from Transparent to Cloud Grey */}
        <div
          className="w-full pointer-events-none"
          style={{
            height: '34vh',
            background: 'linear-gradient(to bottom, transparent 0%, #e2dedd 100%)',
          }}
        />

        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-28 pt-8">
          {/* Mission Block */}
          <div className="mb-20 pb-16 border-b border-[#141516]/15">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#141516]/5 border border-[#141516]/10 text-xs font-['Public_Sans',sans-serif] font-bold tracking-widest uppercase mb-6 text-[#141516]">
              <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
              <span>Our Mission & Purpose</span>
            </div>
            <p className="font-['Public_Sans',sans-serif] text-xl sm:text-2xl md:text-3xl lg:text-4xl leading-snug font-medium text-[#141516] max-w-5xl">
              Corporate Task Tracker was engineered to eliminate cross-functional friction in agile organizations. By harmonizing Kanban velocity, Scrum sprint rituals, and project roadmaps into a single real-time surface, we empower engineering leaders, product managers, and developers to build faster and ship without surprises.
            </p>
          </div>

          {/* 2-Column Section Header */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-end mb-20">
            <div className="lg:col-span-7">
              <span className="text-xs font-bold tracking-widest uppercase text-indigo-700 block mb-3 font-['Public_Sans',sans-serif]">
                Global Proof & Validation
              </span>
              <h2 className="font-['Exo_2',sans-serif] text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase leading-[1.05] tracking-tight text-[#141516]">
                TRUSTED <br />
                BY ENGINEERING TEAMS <br />
                ACROSS THE GLOBE
              </h2>
            </div>
            <div className="lg:col-span-5">
              <p className="font-['Public_Sans',sans-serif] text-base sm:text-lg text-[#141516]/80 leading-relaxed">
                From high-growth scaleups to distributed enterprise engineering teams, product organizations rely on Corporate Task Tracker to orchestrate complex sprints, align cross-functional stakeholders, and track deliverables with sub-second precision.
              </p>
            </div>
          </div>

          {/* 3 Editorial Quote Rows */}
          <div className="divide-y divide-[#141516]/15 border-y border-[#141516]/15 mb-20">
            {/* Quote Row 1 */}
            <div className="py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
              <div className="md:col-span-8">
                <blockquote className="font-['Public_Sans',sans-serif] text-lg sm:text-xl font-medium text-[#141516] leading-relaxed">
                  &ldquo;Corporate Task Tracker completely replaced our fragmented toolchain. Moving between Kanban and Scrum views without losing task context has boosted our sprint delivery velocity by over 35%.&rdquo;
                </blockquote>
              </div>
              <div className="md:col-span-4 md:text-right">
                <div className="font-['Exo_2',sans-serif] font-bold text-base text-[#141516]">
                  Elena Rostova
                </div>
                <div className="text-xs font-medium text-[#141516]/70 uppercase tracking-wider font-['Public_Sans',sans-serif]">
                  VP of Engineering, CloudScale Systems
                </div>
              </div>
            </div>

            {/* Quote Row 2 */}
            <div className="py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
              <div className="md:col-span-8">
                <blockquote className="font-['Public_Sans',sans-serif] text-lg sm:text-xl font-medium text-[#141516] leading-relaxed">
                  &ldquo;The role-based security, automated email invitations, and instant @mention synchronization give our distributed security team total peace of mind and frictionless daily standups.&rdquo;
                </blockquote>
              </div>
              <div className="md:col-span-4 md:text-right">
                <div className="font-['Exo_2',sans-serif] font-bold text-base text-[#141516]">
                  Marcus Chen
                </div>
                <div className="text-xs font-medium text-[#141516]/70 uppercase tracking-wider font-['Public_Sans',sans-serif]">
                  Principal Systems Architect, Hyperion Tech
                </div>
              </div>
            </div>

            {/* Quote Row 3 */}
            <div className="py-10 grid grid-cols-1 md:grid-cols-12 gap-6 items-baseline">
              <div className="md:col-span-8">
                <blockquote className="font-['Public_Sans',sans-serif] text-lg sm:text-xl font-medium text-[#141516] leading-relaxed">
                  &ldquo;Story points, milestone roadmaps, and real-time velocity calculations actually reflect reality. Our product managers and engineers finally share the exact same mental model.&rdquo;
                </blockquote>
              </div>
              <div className="md:col-span-4 md:text-right">
                <div className="font-['Exo_2',sans-serif] font-bold text-base text-[#141516]">
                  Sarah Jenkins
                </div>
                <div className="text-xs font-medium text-[#141516]/70 uppercase tracking-wider font-['Public_Sans',sans-serif]">
                  Head of Product, FinVerse Global
                </div>
              </div>
            </div>
          </div>

          {/* Get Started Free CTA Block */}
          <div className="rounded-3xl p-8 sm:p-12 md:p-16 bg-[#141516] text-white flex flex-col md:flex-row items-center justify-between gap-8 shadow-2xl">
            <div className="max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-widest text-indigo-400 block mb-2 font-['Public_Sans',sans-serif]">
                Ready to accelerate your cycles?
              </span>
              <h3 className="font-['Exo_2',sans-serif] text-2xl sm:text-3xl md:text-4xl font-extrabold uppercase text-white tracking-tight">
                Supercharge Your Engineering Workflow Today.
              </h3>
              <p className="mt-3 text-sm sm:text-base text-slate-300 font-['Public_Sans',sans-serif]">
                Join thousands of engineers delivering on schedule with automated sprints, Kanban flexibility, and instant collaboration.
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link
                to="/register"
                className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl font-['Public_Sans',sans-serif] font-bold text-base bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white shadow-xl shadow-indigo-500/30 hover:scale-105 transition-all duration-200"
              >
                <span>Get Started Free</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

