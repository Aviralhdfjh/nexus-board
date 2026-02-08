'use client'

import { useState, useEffect } from 'react'
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
  Globe,
  Lock,
  Clock,
  Star,
} from 'lucide-react'

export default function Page() {
  const [dark, setDark] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const saved = localStorage.getItem('nexus-dark')
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = saved ? saved === 'true' : prefers
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    const handleScroll = () => {
      setScrollY(window.scrollY)
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const toggleDark = () => {
    setDark(!dark)
    document.documentElement.classList.toggle('dark', !dark)
    localStorage.setItem('nexus-dark', String(!dark))
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=DM+Sans:wght@400;500;700&display=swap');
        
        * {
          font-family: 'DM Sans', -apple-system, sans-serif;
        }
        
        h1, h2, h3, h4, h5, h6 {
          font-family: 'Syne', sans-serif;
          font-weight: 700;
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          33% { transform: translateY(-20px) rotate(3deg); }
          66% { transform: translateY(10px) rotate(-3deg); }
        }

        @keyframes glow-pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.05); }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.9); }
          to { opacity: 1; transform: scale(1); }
        }

        @keyframes draw-line {
          from { stroke-dashoffset: 1000; }
          to { stroke-dashoffset: 0; }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-glow-pulse {
          animation: glow-pulse 3s ease-in-out infinite;
        }

        .animate-slide-up {
          animation: slide-up 0.8s ease-out forwards;
        }

        .animate-scale-in {
          animation: scale-in 0.6s ease-out forwards;
        }

        .text-shimmer {
          background: linear-gradient(90deg, 
            currentColor 0%, 
            rgba(255,255,255,0.8) 50%, 
            currentColor 100%
          );
          background-size: 200% auto;
          -webkit-background-clip: text;
          background-clip: text;
          animation: shimmer 3s linear infinite;
        }

        .glass-effect {
          backdrop-filter: blur(12px) saturate(180%);
          -webkit-backdrop-filter: blur(12px) saturate(180%);
        }

        .custom-gradient-1 {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        }

        .custom-gradient-2 {
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        }

        .custom-gradient-3 {
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        }

        .grid-pattern {
          background-image: 
            linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        .noise-texture {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.05'/%3E%3C/svg%3E");
        }
      `}</style>

      <div className={dark ? 'dark' : ''}>
        {/* Custom Cursor Trail Effect */}
        <div 
          className="fixed pointer-events-none z-50 mix-blend-difference"
          style={{
            left: mousePosition.x - 10,
            top: mousePosition.y - 10,
            transition: 'all 0.1s ease-out'
          }}
        >
          <div className="w-5 h-5 rounded-full border-2 border-white opacity-50" />
        </div>

        {/* Navigation */}
        <nav className={`fixed top-0 w-full z-40 glass-effect border-b transition-all ${
          scrollY > 50 ? 'py-3' : 'py-5'
        } ${dark ? 'bg-neutral-950/70 border-white/10' : 'bg-white/70 border-gray-200/50'}`}>
          <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-500/30 rotate-3 hover:rotate-6 transition-transform">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                Nexus-Board
              </span>
            </div>
            
            <div className="flex items-center gap-6">
              <Link href="#features" className={`hidden md:block font-medium transition-colors ${
                dark ? 'text-neutral-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>
                Features
              </Link>
              <Link href="#how-it-works" className={`hidden md:block font-medium transition-colors ${
                dark ? 'text-neutral-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'
              }`}>
                How it Works
              </Link>
              <button
                onClick={toggleDark}
                className={`p-2.5 rounded-xl transition-all ${
                  dark 
                    ? 'bg-white/10 hover:bg-white/20 text-amber-400' 
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                }`}
              >
                {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </nav>

        {/* Hero Section */}
        <section className={`relative pt-32 pb-20 min-h-screen flex items-center justify-center overflow-hidden ${
          dark ? 'bg-neutral-950' : 'bg-white'
        }`}>
          {/* Animated Background Elements */}
          <div className="absolute inset-0 overflow-hidden">
            <div className={`absolute inset-0 ${dark ? 'grid-pattern' : ''}`} />
            <div className="absolute top-20 -left-20 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-glow-pulse" />
            <div className="absolute bottom-20 -right-20 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '2s' }} />
          </div>

          <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
            {/* Badge */}
            <div className="mb-8 animate-slide-up">
              <div className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full border backdrop-blur-sm ${
                dark 
                  ? 'border-white/20 bg-white/5 text-violet-300' 
                  : 'border-violet-200 bg-violet-50/80 text-violet-700'
              }`}>
                <Zap className="w-4 h-4" />
                <span className="text-sm font-semibold tracking-wide">REAL-TIME COLLABORATION REIMAGINED</span>
              </div>
            </div>

            {/* Main Heading */}
            <h1 className={`text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-[0.95] tracking-tight animate-slide-up ${
              dark ? 'text-white' : 'text-gray-900'
            }`} style={{ animationDelay: '0.1s' }}>
              Where Ideas
              <br />
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent text-shimmer">
                  Take Shape
                </span>
                <svg className="absolute -bottom-4 left-0 w-full" height="20" viewBox="0 0 300 20" fill="none">
                  <path 
                    d="M5 15 Q 75 5, 150 15 T 295 15" 
                    stroke="url(#gradient)" 
                    strokeWidth="3" 
                    fill="none"
                    strokeLinecap="round"
                    strokeDasharray="1000"
                    strokeDashoffset="1000"
                    style={{ animation: 'draw-line 2s ease-out 0.8s forwards' }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#8b5cf6" />
                      <stop offset="50%" stopColor="#a855f7" />
                      <stop offset="100%" stopColor="#d946ef" />
                    </linearGradient>
                  </defs>
                </svg>
              </span>
              <br />
              Together
            </h1>

            {/* Subheading */}
            <p className={`text-xl md:text-2xl lg:text-3xl mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up ${
              dark ? 'text-neutral-300' : 'text-gray-600'
            }`} style={{ animationDelay: '0.2s' }}>
              The best ideas aren't written — they're{' '}
              <span className="font-semibold text-violet-600 dark:text-violet-400">drawn</span>,{' '}
              <span className="font-semibold text-purple-600 dark:text-purple-400">shaped</span>, and{' '}
              <span className="font-semibold text-fuchsia-600 dark:text-fuchsia-400">reimagined</span> in real-time.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16 animate-slide-up" style={{ animationDelay: '0.3s' }}>
              <Link href="/board">
                <button className="group relative px-8 py-5 rounded-2xl font-bold text-lg text-white overflow-hidden shadow-2xl shadow-purple-500/30 hover:shadow-purple-500/50 transition-all hover:scale-105">
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600" />
                  <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="relative flex items-center gap-2">
                    Start Drawing Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </button>
              </Link>
              <button className={`px-8 py-5 rounded-2xl font-bold text-lg border-2 transition-all hover:scale-105 ${
                dark 
                  ? 'border-white/20 text-white hover:bg-white/10' 
                  : 'border-gray-300 text-gray-900 hover:bg-gray-100'
              }`}>
                Watch Demo
              </button>
            </div>

            {/* Social Proof */}
            <div className={`flex flex-wrap items-center justify-center gap-8 text-sm animate-slide-up ${
              dark ? 'text-neutral-400' : 'text-gray-500'
            }`} style={{ animationDelay: '0.4s' }}>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                <span className="ml-2 font-semibold">4.9/5 from 2,000+ teams</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4" />
                <span className="font-semibold">50,000+ active creators</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4" />
                <span className="font-semibold">Used in 120+ countries</span>
              </div>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
            <div className={`w-6 h-10 rounded-full border-2 flex items-center justify-center ${
              dark ? 'border-white/40' : 'border-gray-400'
            }`}>
              <div className={`w-1.5 h-3 rounded-full animate-pulse ${
                dark ? 'bg-white' : 'bg-gray-700'
              }`} />
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className={`relative py-32 px-6 ${
          dark ? 'bg-neutral-900' : 'bg-gradient-to-b from-gray-50 to-white'
        }`}>
          <div className="max-w-7xl mx-auto">
            {/* Section Header */}
            <div className="text-center mb-20">
              <div className={`inline-block px-4 py-2 rounded-full text-sm font-bold mb-6 ${
                dark ? 'bg-violet-500/10 text-violet-400' : 'bg-violet-100 text-violet-700'
              }`}>
                POWERFUL FEATURES
              </div>
              <h2 className={`text-5xl md:text-6xl lg:text-7xl font-black mb-6 tracking-tight ${
                dark ? 'text-white' : 'text-gray-900'
              }`}>
                Everything you need
                <br />
                <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                  to collaborate
                </span>
              </h2>
              <p className={`text-xl max-w-2xl mx-auto ${
                dark ? 'text-neutral-400' : 'text-gray-600'
              }`}>
                Built for teams who think visually and create together
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: PenTool,
                  title: 'Infinite Canvas',
                  desc: 'Draw, sketch, and design without boundaries. Your creativity has no limits.',
                  gradient: 'from-violet-500 to-purple-500',
                  delay: '0s'
                },
                {
                  icon: Users,
                  title: 'Live Presence',
                  desc: 'See who\'s creating where with real-time cursors and activity indicators.',
                  gradient: 'from-purple-500 to-fuchsia-500',
                  delay: '0.1s'
                },
                {
                  icon: MessageSquare,
                  title: 'Contextual Chat',
                  desc: 'Discuss ideas without leaving the canvas. Comments stay with your work.',
                  gradient: 'from-fuchsia-500 to-pink-500',
                  delay: '0.2s'
                },
                {
                  icon: Layers,
                  title: 'Smart Layers',
                  desc: 'Organize complex ideas with layers. Toggle, lock, and manage with ease.',
                  gradient: 'from-cyan-500 to-blue-500',
                  delay: '0.3s'
                },
                {
                  icon: Palette,
                  title: 'Pro Tools',
                  desc: 'Pen, highlighter, shapes, text, sticky notes — everything designers love.',
                  gradient: 'from-blue-500 to-indigo-500',
                  delay: '0.4s'
                },
                {
                  icon: Eye,
                  title: 'Beautiful Themes',
                  desc: 'Dark mode, light mode, and custom themes. Make it yours.',
                  gradient: 'from-indigo-500 to-violet-500',
                  delay: '0.5s'
                },
              ].map((feature, idx) => {
                const Icon = feature.icon
                return (
                  <div
                    key={idx}
                    className={`group relative p-8 rounded-3xl border backdrop-blur-sm transition-all duration-500 hover:scale-105 hover:-translate-y-2 ${
                      dark 
                        ? 'bg-neutral-800/50 border-white/10 hover:bg-neutral-800/80 hover:border-white/20' 
                        : 'bg-white/80 border-gray-200 hover:bg-white hover:border-gray-300 hover:shadow-xl'
                    }`}
                    style={{ animationDelay: feature.delay }}
                  >
                    {/* Gradient Accent */}
                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-10 rounded-3xl blur-2xl transition-opacity`} />
                    
                    {/* Icon */}
                    <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all`}>
                      <Icon className="w-8 h-8 text-white" />
                    </div>

                    {/* Content */}
                    <h3 className={`text-2xl font-bold mb-3 ${
                      dark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {feature.title}
                    </h3>
                    <p className={`leading-relaxed ${
                      dark ? 'text-neutral-400' : 'text-gray-600'
                    }`}>
                      {feature.desc}
                    </p>

                    {/* Hover Arrow */}
                    <div className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
                      <ArrowRight className={`w-5 h-5 ${
                        dark ? 'text-violet-400' : 'text-violet-600'
                      }`} />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Interactive Demo Section */}
        <section className={`relative py-32 px-6 overflow-hidden ${
          dark ? 'bg-neutral-950' : 'bg-white'
        }`}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-5xl md:text-6xl font-black mb-6 ${
                dark ? 'text-white' : 'text-gray-900'
              }`}>
                See it in action
              </h2>
            </div>

            {/* Demo Mockup */}
            <div className={`relative rounded-3xl overflow-hidden border shadow-2xl ${
              dark 
                ? 'bg-neutral-800/50 border-white/10' 
                : 'bg-gradient-to-br from-violet-50 to-fuchsia-50 border-gray-200'
            }`}>
              <div className="aspect-video p-8">
                <div className={`relative w-full h-full rounded-2xl overflow-hidden ${
                  dark ? 'bg-neutral-900' : 'bg-white'
                }`}>
                  {/* Toolbar */}
                  <div className="absolute left-6 top-1/2 -translate-y-1/2 flex flex-col gap-3 p-4 rounded-2xl glass-effect border backdrop-blur-xl" style={{
                    background: dark ? 'rgba(0, 0, 0, 0.5)' : 'rgba(255, 255, 255, 0.5)',
                    borderColor: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'
                  }}>
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                        i === 0
                          ? 'bg-gradient-to-br from-violet-500 to-purple-500 shadow-lg'
                          : 'bg-gray-400/30 hover:bg-gray-400/50'
                      }`}>
                        {i === 0 && <PenTool className="w-5 h-5 text-white" />}
                      </div>
                    ))}
                  </div>

                  {/* Canvas with drawings */}
                  <svg className="absolute inset-0 w-full h-full">
                    <defs>
                      <linearGradient id="stroke1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                      <linearGradient id="stroke2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#f43f5e" />
                      </linearGradient>
                    </defs>
                    <polyline 
                      points="120,120 180,180 240,120 300,180" 
                      stroke="url(#stroke1)" 
                      strokeWidth="4" 
                      fill="none" 
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="animate-float"
                    />
                    <circle 
                      cx="450" 
                      cy="220" 
                      r="60" 
                      stroke="url(#stroke2)" 
                      strokeWidth="4" 
                      fill="none"
                      className="animate-float"
                      style={{ animationDelay: '1s' }}
                    />
                    <rect 
                      x="550" 
                      y="170" 
                      width="120" 
                      height="100" 
                      stroke="#3b82f6" 
                      strokeWidth="4" 
                      fill="none"
                      rx="8"
                      className="animate-float"
                      style={{ animationDelay: '2s' }}
                    />
                  </svg>

                  {/* User cursors */}
                  <div className="absolute top-24 left-40 flex items-center gap-2 animate-float">
                    <div className="w-4 h-4 rounded-full bg-violet-500 shadow-lg" />
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-violet-500 text-white shadow-lg">
                      You
                    </span>
                  </div>
                  <div className="absolute top-48 right-48 flex items-center gap-2 animate-float" style={{ animationDelay: '0.5s' }}>
                    <div className="w-4 h-4 rounded-full bg-fuchsia-500 shadow-lg" />
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-fuchsia-500 text-white shadow-lg">
                      Alex
                    </span>
                  </div>
                  <div className="absolute bottom-32 left-1/2 flex items-center gap-2 animate-float" style={{ animationDelay: '1s' }}>
                    <div className="w-4 h-4 rounded-full bg-cyan-500 shadow-lg" />
                    <span className="text-xs font-bold px-2 py-1 rounded-lg bg-cyan-500 text-white shadow-lg">
                      Sam
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why Section */}
        <section className={`relative py-32 px-6 ${
          dark ? 'bg-neutral-900' : 'bg-gradient-to-b from-white to-gray-50'
        }`}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className={`text-5xl md:text-6xl font-black mb-12 tracking-tight ${
              dark ? 'text-white' : 'text-gray-900'
            }`}>
              Why Nexus-Board?
            </h2>
            
            <div className="space-y-8 text-xl md:text-2xl leading-relaxed">
              <p className={dark ? 'text-neutral-300' : 'text-gray-700'}>
                Because ideas don't happen in isolation.
              </p>
              
              <p className="font-bold text-3xl md:text-4xl bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                They evolve through discussion, sketches, mistakes, and collaboration.
              </p>
              
              <p className={dark ? 'text-neutral-300' : 'text-gray-700'}>
                Traditional tools lock your thinking into rigid documents and presentations. 
                <span className="font-semibold text-violet-600 dark:text-violet-400"> Nexus-Board frees it.</span>
              </p>

              <div className={`mt-12 p-8 rounded-3xl border ${
                dark ? 'bg-white/5 border-white/10' : 'bg-violet-50 border-violet-200'
              }`}>
                <p className={`text-lg italic ${
                  dark ? 'text-neutral-400' : 'text-gray-600'
                }`}>
                  "Your ideas become a living, breathing canvas that grows with every stroke, every comment, every moment of shared creativity."
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section id="how-it-works" className={`relative py-32 px-6 ${
          dark ? 'bg-neutral-950' : 'bg-white'
        }`}>
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-20">
              <h2 className={`text-5xl md:text-6xl font-black mb-6 ${
                dark ? 'text-white' : 'text-gray-900'
              }`}>
                Get started in seconds
              </h2>
              <p className={`text-xl ${
                dark ? 'text-neutral-400' : 'text-gray-600'
              }`}>
                Three simple steps to transform how your team collaborates
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 relative">
              {/* Connection Lines */}
              <div className="hidden md:block absolute top-24 left-0 right-0 h-0.5">
                <div className={`h-full mx-auto ${
                  dark ? 'bg-gradient-to-r from-transparent via-white/20 to-transparent' : 'bg-gradient-to-r from-transparent via-gray-300 to-transparent'
                }`} style={{ width: '70%' }} />
              </div>

              {[
                {
                  step: 1,
                  icon: Sparkles,
                  title: 'Create Your Board',
                  desc: 'Open a new canvas in seconds. No setup, no complexity — just pure creativity.',
                  gradient: 'from-violet-500 to-purple-500'
                },
                {
                  step: 2,
                  icon: Users,
                  title: 'Invite Your Team',
                  desc: 'Share a simple link. Anyone can join — no accounts required.',
                  gradient: 'from-purple-500 to-fuchsia-500'
                },
                {
                  step: 3,
                  icon: PenTool,
                  title: 'Create Together',
                  desc: 'Draw, chat, and brainstorm in real-time. Watch ideas come to life.',
                  gradient: 'from-fuchsia-500 to-pink-500'
                },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <div key={item.step} className="relative text-center group">
                    {/* Step Number & Icon */}
                    <div className="relative inline-block mb-6">
                      <div className={`relative w-28 h-28 rounded-3xl bg-gradient-to-br ${item.gradient} flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all`}>
                        <Icon className="w-14 h-14 text-white" />
                      </div>
                      <div className={`absolute -top-3 -right-3 w-10 h-10 rounded-full flex items-center justify-center font-black text-lg text-white shadow-lg ${
                        dark ? 'bg-neutral-800' : 'bg-gray-900'
                      }`}>
                        {item.step}
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className={`text-2xl font-bold mb-4 ${
                      dark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {item.title}
                    </h3>
                    <p className={`text-lg leading-relaxed ${
                      dark ? 'text-neutral-400' : 'text-gray-600'
                    }`}>
                      {item.desc}
                    </p>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className={`relative py-32 px-6 ${
          dark ? 'bg-neutral-900' : 'bg-gradient-to-b from-gray-50 to-white'
        }`}>
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <h2 className={`text-4xl md:text-5xl font-black mb-6 ${
                dark ? 'text-white' : 'text-gray-900'
              }`}>
                Built with cutting-edge technology
              </h2>
              <p className={`text-xl ${
                dark ? 'text-neutral-400' : 'text-gray-600'
              }`}>
                Enterprise-grade performance meets delightful design
              </p>
            </div>

            <div className={`relative p-10 md:p-16 rounded-3xl border ${
              dark 
                ? 'bg-neutral-800/50 border-white/10' 
                : 'bg-gradient-to-br from-violet-50/50 to-fuchsia-50/50 border-violet-200/50'
            }`}>
              <div className="grid md:grid-cols-2 gap-10 mb-10">
                {[
                  { icon: Zap, label: 'WebSocket Sync', value: '<100ms latency', color: 'text-yellow-500' },
                  { icon: Layers, label: 'Canvas Engine', value: 'Hardware-accelerated', color: 'text-blue-500' },
                  { icon: Users, label: 'Multi-User CRDT', value: 'Conflict-free merging', color: 'text-green-500' },
                  { icon: Lock, label: 'End-to-End Security', value: 'Enterprise-grade encryption', color: 'text-red-500' },
                ].map((tech, idx) => {
                  const Icon = tech.icon
                  return (
                    <div key={idx} className="flex gap-5">
                      <div className={`flex-shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center`}>
                        <Icon className={`w-7 h-7 text-white`} />
                      </div>
                      <div>
                        <h3 className={`font-bold text-lg mb-1 ${
                          dark ? 'text-white' : 'text-gray-900'
                        }`}>
                          {tech.label}
                        </h3>
                        <p className={`text-sm ${
                          dark ? 'text-neutral-400' : 'text-gray-600'
                        }`}>
                          {tech.value}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className={`border-t pt-8 ${
                dark ? 'border-white/10' : 'border-violet-200/50'
              }`}>
                <p className={`text-center font-bold ${
                  dark ? 'text-neutral-300' : 'text-gray-700'
                }`}>
                  ⚡ Next.js 14 • TypeScript • Tailwind CSS • Socket.io • Canvas API • CRDT
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA Section */}
        <section className={`relative py-32 px-6 overflow-hidden ${
          dark ? 'bg-neutral-950' : 'bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50'
        }`}>
          {/* Background Effects */}
          <div className="absolute inset-0">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-500/20 rounded-full blur-3xl animate-glow-pulse" />
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-fuchsia-500/20 rounded-full blur-3xl animate-glow-pulse" style={{ animationDelay: '1.5s' }} />
          </div>

          <div className="relative max-w-4xl mx-auto text-center">
            <h2 className={`text-5xl md:text-6xl lg:text-7xl font-black mb-8 tracking-tight ${
              dark ? 'text-white' : 'text-gray-900'
            }`}>
              Ready to transform
              <br />
              <span className="bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600 bg-clip-text text-transparent">
                how you collaborate?
              </span>
            </h2>
            
            <p className={`text-2xl mb-12 ${
              dark ? 'text-neutral-300' : 'text-gray-700'
            }`}>
              Join thousands of teams creating magic together
            </p>

            <Link href="/board">
              <button className="group relative px-10 py-6 rounded-2xl font-black text-xl text-white overflow-hidden shadow-2xl shadow-purple-500/40 hover:shadow-purple-500/60 transition-all hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 via-purple-600 to-fuchsia-600" />
                <div className="absolute inset-0 bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                <span className="relative flex items-center gap-3">
                  Launch Nexus-Board
                  <ArrowRight className="w-6 h-6 group-hover:translate-x-2 transition-transform" />
                </span>
              </button>
            </Link>

            <p className={`mt-6 text-sm ${
              dark ? 'text-neutral-500' : 'text-gray-500'
            }`}>
              Free forever • No credit card required • Start in seconds
            </p>
          </div>
        </section>

        {/* Footer */}
        <footer className={`relative border-t py-16 ${
          dark 
            ? 'bg-neutral-950 border-white/10' 
            : 'bg-white border-gray-200'
        }`}>
          <div className="max-w-7xl mx-auto px-6">
            <div className="grid md:grid-cols-5 gap-12 mb-12">
              {/* Brand */}
              <div className="md:col-span-2">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-violet-500 via-purple-500 to-fuchsia-500 rounded-2xl flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-xl font-bold ${
                    dark ? 'text-white' : 'text-gray-900'
                  }`}>
                    Nexus-Board
                  </span>
                </div>
                <p className={`text-sm leading-relaxed mb-6 ${
                  dark ? 'text-neutral-400' : 'text-gray-600'
                }`}>
                  The future of visual collaboration.
                  <br />
                  Ideas grow when shared.
                </p>
                <div className="flex gap-3">
                  <a href="#" className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    dark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
                  }`}>
                    <Globe className="w-5 h-5" />
                  </a>
                  <a href="#" className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${
                    dark ? 'bg-white/10 hover:bg-white/20' : 'bg-gray-100 hover:bg-gray-200'
                  }`}>
                    <MessageSquare className="w-5 h-5" />
                  </a>
                </div>
              </div>

              {/* Product */}
              <div>
                <h4 className={`font-bold mb-4 ${
                  dark ? 'text-white' : 'text-gray-900'
                }`}>
                  Product
                </h4>
                <ul className={`space-y-3 text-sm ${
                  dark ? 'text-neutral-400' : 'text-gray-600'
                }`}>
                  <li><a href="/board" className="hover:text-violet-600 transition-colors">Launch App</a></li>
                  <li><a href="#features" className="hover:text-violet-600 transition-colors">Features</a></li>
                  <li><a href="#" className="hover:text-violet-600 transition-colors">Pricing</a></li>
                  <li><a href="#" className="hover:text-violet-600 transition-colors">Changelog</a></li>
                </ul>
              </div>

              {/* Company */}
              <div>
                <h4 className={`font-bold mb-4 ${
                  dark ? 'text-white' : 'text-gray-900'
                }`}>
                  Company
                </h4>
                <ul className={`space-y-3 text-sm ${
                  dark ? 'text-neutral-400' : 'text-gray-600'
                }`}>
                  <li><a href="#" className="hover:text-violet-600 transition-colors">About</a></li>
                  <li><a href="#" className="hover:text-violet-600 transition-colors">Blog</a></li>
                  <li><a href="#" className="hover:text-violet-600 transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-violet-600 transition-colors">Contact</a></li>
                </ul>
              </div>

              {/* Resources */}
              <div>
                <h4 className={`font-bold mb-4 ${
                  dark ? 'text-white' : 'text-gray-900'
                }`}>
                  Resources
                </h4>
                <ul className={`space-y-3 text-sm ${
                  dark ? 'text-neutral-400' : 'text-gray-600'
                }`}>
                  <li><a href="https://github.com" className="hover:text-violet-600 transition-colors">GitHub</a></li>
                  <li><a href="#" className="hover:text-violet-600 transition-colors">Documentation</a></li>
                  <li><a href="#" className="hover:text-violet-600 transition-colors">Community</a></li>
                  <li><a href="#" className="hover:text-violet-600 transition-colors">Support</a></li>
                </ul>
              </div>
            </div>

            {/* Bottom Bar */}
            <div className={`border-t pt-8 flex flex-col md:flex-row justify-between items-center gap-4 ${
              dark ? 'border-white/10' : 'border-gray-200'
            }`}>
              <p className={`text-sm ${
                dark ? 'text-neutral-500' : 'text-gray-500'
              }`}>
                © 2024 Nexus-Board. Built with ❤️ as a final-year college project.
              </p>
              <div className={`flex gap-6 text-sm ${
                dark ? 'text-neutral-500' : 'text-gray-500'
              }`}>
                <a href="#" className="hover:text-violet-600 transition-colors">Privacy</a>
                <a href="#" className="hover:text-violet-600 transition-colors">Terms</a>
                <a href="#" className="hover:text-violet-600 transition-colors">Cookies</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}