'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  Sparkles,
  Users,
  MessageSquare,
  Moon,
  Sun,
  ArrowRight,
  Zap,
  PenTool,
  Eye,
  Layers,
  Palette,
} from 'lucide-react'

const FEATURES = [
  {
    icon: PenTool,
    title: 'Infinite Canvas',
    description: 'Sketch, diagram, and brainstorm without limits. Pan and zoom seamlessly across your ideas.',
    wide: true,
  },
  {
    icon: Users,
    title: 'Live Presence',
    description: 'See who’s on the board in real time. Cursors and names keep collaboration clear.',
    wide: false,
  },
  {
    icon: MessageSquare,
    title: 'Contextual Chat',
    description: 'Discuss right next to the work. Threads stay with the board so nothing gets lost.',
    wide: false,
  },
  {
    icon: Layers,
    title: 'Smart Layers',
    description: 'Organize strokes and shapes. Tidy boards without losing a single idea.',
    wide: false,
  },
  {
    icon: Palette,
    title: 'Pro Drawing Tools',
    description: 'Pencil, shapes, text, and more. Export to PNG and share with one click.',
    wide: true,
  },
  {
    icon: Eye,
    title: 'Beautiful Themes',
    description: 'Light and dark modes that stay easy on the eyes during long sessions.',
    wide: false,
  },
]

export default function Page() {
  const [dark, setDark] = useState(false)
  const [scrollY, setScrollY] = useState(0)
  const [mouse, setMouse] = useState({ x: 0.5, y: 0.5 })
  const [featuresInView, setFeaturesInView] = useState(false)
  const featuresRef = useRef<HTMLElement>(null)

  /* ================= THEME ================= */
  useEffect(() => {
    const saved = localStorage.getItem('nexus-dark')
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = saved ? saved === 'true' : prefers
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggleDark = () => {
    setDark((d) => {
      document.documentElement.classList.toggle('dark', !d)
      localStorage.setItem('nexus-dark', String(!d))
      return !d
    })
  }

  /* ================= SCROLL ================= */
  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ================= MOUSE (for glow) ================= */
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      setMouse({
        x: e.clientX / window.innerWidth,
        y: e.clientY / window.innerHeight,
      })
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  /* ================= FEATURES IN VIEW (staggered animation) ================= */
  useEffect(() => {
    const el = featuresRef.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([e]) => e.isIntersecting && setFeaturesInView(true),
      { threshold: 0.15, rootMargin: '0px 0px -80px 0px' }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <div
      className={`relative w-full min-h-screen ${
        dark ? 'bg-[#030303] text-neutral-100' : 'bg-[#fafafa] text-neutral-900'
      }`}
    >
      {/* Fixed grid mesh */}
      <div
        className={`fixed inset-0 pointer-events-none z-0 ${
          dark ? 'landing-grid' : 'landing-grid-light'
        }`}
        aria-hidden
      />

      {/* ================= NAV ================= */}
      <nav
        className={`fixed top-0 z-50 w-full backdrop-blur-xl border-b transition-all duration-300 ${
          scrollY > 20 ? 'py-3' : 'py-4'
        } ${
          dark
            ? 'bg-[#030303]/80 border-white/10'
            : 'bg-[#fafafa]/80 border-slate-200'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span
              className={`font-semibold text-lg tracking-tight bg-gradient-to-r bg-clip-text text-transparent ${
                dark ? 'from-indigo-400 to-cyan-400' : 'from-indigo-600 to-cyan-600'
              }`}
            >
              Nexus-Board
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <Link
              href="#features"
              className={`hidden md:block text-sm font-medium px-4 py-2 rounded-lg transition ${
                dark
                  ? 'text-neutral-400 hover:text-white hover:bg-white/5'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              Features
            </Link>
            <Link
              href="/login"
              className={`hidden md:block text-sm font-medium px-4 py-2 rounded-lg transition ${
                dark
                  ? 'text-neutral-300 hover:bg-white/5'
                  : 'text-slate-700 hover:bg-slate-100'
              }`}
            >
              Sign In
            </Link>
            <button
              onClick={toggleDark}
              className={`p-2 rounded-lg transition ${
                dark
                  ? 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <Link href="/login">
              <button
                className={`text-sm font-medium px-4 py-2.5 rounded-lg transition btn-shiny ${
                  dark
                    ? 'bg-white text-[#030303] hover:bg-neutral-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-500/25'
                }`}
              >
                Get Started
              </button>
            </Link>
          </div>
        </div>
      </nav>

      {/* ================= HERO ================= */}
      <section className="relative min-h-screen pt-28 flex items-center justify-center overflow-hidden">
        {/* Mouse-following glow blobs */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute w-[600px] h-[600px] rounded-full blur-[120px] opacity-30 transition-all duration-500 ease-out"
            style={{
              background: dark ? 'rgb(99, 102, 241)' : 'rgb(99, 102, 241)',
              left: `${mouse.x * 100}%`,
              top: `${mouse.y * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
          <div
            className="absolute w-[400px] h-[400px] rounded-full blur-[100px] opacity-25 transition-all duration-500 ease-out delay-75"
            style={{
              background: dark ? 'rgb(34, 211, 238)' : 'rgb(34, 211, 238)',
              left: `${(1 - mouse.x) * 100}%`,
              top: `${(1 - mouse.y) * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
        </div>

        <div className="relative z-10 text-center max-w-4xl px-6">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border mb-8 backdrop-blur-md ${
              dark
                ? 'border-white/10 bg-neutral-900/50 text-indigo-300'
                : 'border-slate-200 bg-white/80 text-indigo-600'
            }`}
          >
            <Zap className="w-4 h-4" />
            <span className="text-sm font-medium">Real-time collaboration</span>
          </div>

          <h1
            className={`text-5xl sm:text-6xl md:text-7xl font-black leading-[1.1] tracking-tighter mb-6 ${
              dark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Where ideas
            <span className="block mt-1 bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              take shape together
            </span>
          </h1>

          <p
            className={`text-lg md:text-xl max-w-2xl mx-auto mb-10 ${
              dark ? 'text-neutral-400' : 'text-slate-600'
            }`}
          >
            Sketch, diagram, and brainstorm in real time. Create a free account to save boards and collaborate with your team.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <button className="btn-shiny group px-7 py-4 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 text-white font-semibold flex items-center gap-2 shadow-xl shadow-indigo-500/25 hover:shadow-indigo-500/30 transition-all duration-300">
                Start Drawing
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </Link>
            <a
              href="#features"
              className={`px-7 py-4 rounded-xl border font-semibold transition ${
                dark
                  ? 'border-white/10 text-neutral-200 hover:bg-white/5 hover:border-white/20'
                  : 'border-slate-200 text-slate-700 hover:bg-white hover:border-slate-300'
              }`}
            >
              See features
            </a>
          </div>

          <p
            className={`mt-8 text-sm font-medium ${
              dark ? 'text-neutral-500' : 'text-slate-500'
            }`}
          >
            Trusted by 500+ students & creators
          </p>
        </div>
      </section>

      {/* ================= FEATURES (Bento) ================= */}
      <section
        id="features"
        ref={featuresRef}
        className={`relative py-32 px-6 z-10 ${
          dark ? 'bg-neutral-900/30' : 'bg-slate-100/50'
        }`}
      >
        <div className="max-w-6xl mx-auto">
          <h2
            className={`text-4xl md:text-5xl font-black text-center tracking-tighter mb-4 ${
              dark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Built for visual thinkers
          </h2>
          <p
            className={`text-center max-w-xl mx-auto mb-16 ${
              dark ? 'text-neutral-500' : 'text-slate-600'
            }`}
          >
            Everything you need to think and create together.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-5">
            {FEATURES.map((f, i) => {
              const Icon = f.icon
              return (
                <div
                  key={i}
                  className={`rounded-2xl border backdrop-blur-md p-6 md:p-8 ${
                    featuresInView ? 'animate-fade-up-in' : 'opacity-0'
                  } ${
                    dark
                      ? 'bg-neutral-900/50 border-white/10 shadow-xl shadow-black/20 hover:border-white/20'
                      : 'bg-white/80 border-slate-200 shadow-lg shadow-slate-200/50 hover:shadow-xl hover:border-slate-300'
                  } ${f.wide ? 'md:col-span-2' : ''}`}
                  style={
                    featuresInView
                      ? {
                          animationDelay: `${i * 80}ms`,
                          animationFillMode: 'backwards' as const,
                        }
                      : undefined
                  }
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/20 mb-5">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3
                    className={`text-lg font-bold tracking-tight mb-2 ${
                      dark ? 'text-white' : 'text-slate-900'
                    }`}
                  >
                    {f.title}
                  </h3>
                  <p
                    className={`text-sm leading-relaxed ${
                      dark ? 'text-neutral-400' : 'text-slate-600'
                    }`}
                  >
                    {f.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ================= WHY ================= */}
      <section
        className={`relative py-28 px-6 z-10 ${
          dark ? 'bg-[#030303]' : 'bg-[#fafafa]'
        }`}
      >
        <div className="max-w-3xl mx-auto text-center space-y-6">
          <h2
            className={`text-4xl font-black tracking-tighter ${
              dark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Why Nexus-Board?
          </h2>
          <p className={`text-lg ${dark ? 'text-neutral-400' : 'text-slate-600'}`}>
            Because great ideas don't happen alone.
          </p>
          <p className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-indigo-400 to-cyan-400 bg-clip-text text-transparent">
            They evolve through collaboration.
          </p>
        </div>
      </section>

      {/* ================= CTA ================= */}
      <section className="relative py-28 px-6 bg-gradient-to-br from-indigo-600 via-indigo-500 to-cyan-500 text-white text-center z-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter mb-4">
            Start building ideas together
          </h2>
          <p className="text-indigo-100 mb-8">
            Free to use. No credit card required.
          </p>
          <Link href="/login">
            <button className="btn-shiny px-10 py-4 bg-white text-indigo-900 font-bold rounded-xl hover:shadow-2xl transition-all duration-300">
              Launch Nexus-Board
            </button>
          </Link>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer
        className={`relative py-12 px-6 border-t z-10 ${
          dark
            ? 'border-white/10 bg-[#030303]'
            : 'border-slate-200 bg-[#fafafa]'
        }`}
      >
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <p
            className={`text-sm ${
              dark ? 'text-neutral-500' : 'text-slate-500'
            }`}
          >
            © 2024 Nexus-Board · Built with care as a final-year project
          </p>
          <div
            className={`flex gap-6 text-sm ${
              dark
                ? 'text-neutral-400 hover:text-white'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
            <a href="#">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
