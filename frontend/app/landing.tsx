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
} from 'lucide-react'

function GradientBlob({ className, delay = 0 }: { className?: string; delay?: number }) {
  const animStyle: React.CSSProperties = {
    animation: `float ${6 + delay}s ease-in-out infinite`,
    animationDelay: `${delay}s`,
  }
  return (
    <div
      className={`absolute rounded-full blur-3xl opacity-20 ${className}`}
      style={animStyle}
    />
  )
}

export default function Page() {
  const [dark, setDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('nexus-dark')
    const prefers = window.matchMedia('(prefers-color-scheme: dark)').matches
    setDark(saved ? saved === 'true' : prefers)
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('nexus-dark', String(dark))
  }, [dark, mounted])

  if (!mounted) return null

  return (
    <div className={`relative w-full overflow-hidden ${dark ? 'dark' : ''}`}>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translate(0, 0) rotate(0deg); }
          25% { transform: translate(20px, -30px) rotate(90deg); }
          50% { transform: translate(-10px, 40px) rotate(180deg); }
          75% { transform: translate(-40px, -20px) rotate(270deg); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(99, 102, 241, 0.3); }
          50% { box-shadow: 0 0 30px rgba(99, 102, 241, 0.6); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradientShift {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        @keyframes subtlePulse {
          0%, 100% { transform: scale(1); box-shadow: 0 0 20px rgba(99, 102, 241, 0.4), 0 4px 20px rgba(0, 0, 0, 0.1); }
          50% { transform: scale(1.02); box-shadow: 0 0 30px rgba(99, 102, 241, 0.6), 0 4px 25px rgba(0, 0, 0, 0.15); }
        }
        @keyframes floatingCursor {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(8px, -8px); }
        }
        .animate-glow { animation: glow 3s ease-in-out infinite; }
        .animate-slide { animation: slideIn 0.6s ease-out forwards; }
        .animate-gradient-shift { 
          background-size: 200% 200%;
          animation: gradientShift 8s ease infinite;
        }
        .animate-subtle-pulse {
          animation: subtlePulse 3s ease-in-out infinite;
        }
        .animate-floating-cursor {
          animation: floatingCursor 4s ease-in-out infinite;
        }
      `}</style>

      {/* Navigation */}
      <nav className={`fixed top-0 w-full z-50 backdrop-blur-md border-b transition-all ${
        dark
          ? 'bg-neutral-950/50 border-white/10'
          : 'bg-white/50 border-gray-200'
      }`}>
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className={`text-lg font-bold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent`}>
              Nexus-Board
            </span>
          </div>
          <button
            onClick={() => setDark(!dark)}
            className={`p-2 rounded-lg transition-all ${
              dark
                ? 'bg-white/10 hover:bg-white/20 text-yellow-400'
                : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
            }`}
          >
            {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={`relative min-h-screen flex items-center justify-center overflow-hidden transition-colors ${
        dark ? 'bg-neutral-950' : 'bg-white'
      }`}>
        {/* Gradient Blobs */}
        <GradientBlob className="w-96 h-96 -top-48 -left-48 bg-indigo-500" delay={0} />
        <GradientBlob className="w-96 h-96 -bottom-48 -right-48 bg-pink-500" delay={2} />
        <GradientBlob className="w-96 h-96 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-500" delay={4} />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          {/* Floating cursor dot */}
          <div className="absolute -top-20 right-10 md:right-20 animate-floating-cursor">
            <div className="w-3 h-3 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 shadow-lg shadow-cyan-500/50" />
          </div>

          <div className="mb-8 animate-slide">
            <div className={`inline-block px-4 py-2 rounded-full border mb-6 ${
              dark
                ? 'border-white/20 bg-white/5 text-indigo-300'
                : 'border-indigo-200 bg-indigo-50 text-indigo-700'
            }`}>
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Real-Time Collaboration
              </span>
            </div>
          </div>

          <h1 className={`text-5xl md:text-7xl font-bold mb-6 leading-tight animate-slide ${
            dark ? 'text-white' : 'text-gray-900'
          }`}>
            Where Ideas Take
            <span className="block bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-shift">
              Shape Together
            </span>
          </h1>

          <p className={`text-lg md:text-xl mb-8 max-w-2xl mx-auto leading-relaxed animate-slide ${
            dark ? 'text-neutral-300' : 'text-gray-600'
          }`}>
            The best ideas aren't written — they're drawn, shaped, erased, and reimagined together.
            Nexus-Board is where your thoughts become visible, collaborative, and infinite.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12 animate-slide">
            <Link href="/board">
              <button className={`group px-8 py-4 rounded-xl font-semibold flex items-center gap-2 transition-all relative overflow-hidden animate-subtle-pulse ${
                dark
                  ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg hover:shadow-indigo-500/50'
                  : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-600/50'
              }`}>
                Start Drawing
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
            <button className={`px-8 py-4 rounded-xl font-semibold border-2 transition-all ${
              dark
                ? 'border-white/20 text-white hover:bg-white/10'
                : 'border-gray-300 text-gray-900 hover:bg-gray-100'
            }`}>
              See How It Works
            </button>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce z-20">
            <div className={`w-6 h-10 border-2 rounded-full flex items-center justify-center ${
              dark ? 'border-white/80' : 'border-gray-700'
            }`}>
              <div className={`w-1 h-2 rounded-full ${dark ? 'bg-white' : 'bg-gray-700'} animate-pulse`} />
            </div>
          </div>
        </div>
      </section>

      {/* Proof of Capability Strip */}
      <section className={`relative py-12 px-4 border-y transition-colors ${
        dark
          ? 'bg-neutral-900 border-white/20'
          : 'bg-gray-50 border-gray-300'
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {[
              { icon: Zap, label: 'Real-time Sync', color: 'text-yellow-500' },
              { icon: Users, label: 'Multi-user', color: 'text-indigo-500' },
              { icon: Moon, label: 'Dark Mode', color: 'text-purple-500' },
              { icon: MessageSquare, label: 'Live Chat', color: 'text-pink-500' },
            ].map((capability, idx) => {
              const Icon = capability.icon;
              return (
                <div key={idx} className="flex flex-col items-center gap-3 text-center">
                  <div className={`${capability.color} transition-transform hover:scale-110`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`text-sm font-medium ${
                    dark ? 'text-neutral-200' : 'text-gray-700'
                  }`}>
                    {capability.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`relative py-24 px-4 transition-colors ${
        dark ? 'bg-neutral-900' : 'bg-gray-50'
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${
              dark ? 'text-white' : 'text-gray-900'
            }`}>
              Features That Inspire
            </h2>
            <p className={`text-lg max-w-2xl mx-auto ${
              dark ? 'text-neutral-400' : 'text-gray-600'
            }`}>
              Everything you need to collaborate, create, and innovate in real-time
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: PenTool,
                title: 'Real-Time Drawing',
                description: 'Draw, sketch, and design together instantly',
                gradient: 'from-indigo-500 to-blue-500',
              },
              {
                icon: Users,
                title: 'Live Presence',
                description: 'See who\'s thinking where with live cursors',
                gradient: 'from-purple-500 to-pink-500',
              },
              {
                icon: MessageSquare,
                title: 'Chat & Discuss',
                description: 'Talk while you create without leaving the board',
                gradient: 'from-pink-500 to-rose-500',
              },
              {
                icon: Eye,
                title: 'Dark Mode',
                description: 'Create anytime, your way, day or night',
                gradient: 'from-cyan-500 to-blue-500',
              },
            ].map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <div
                  key={idx}
                  className={`group relative p-6 rounded-2xl backdrop-blur-xl border transition-all hover:scale-105 hover:shadow-xl ${
                    dark
                      ? 'bg-white/5 border-white/10 hover:bg-white/10 hover:shadow-lg hover:shadow-purple-500/20'
                      : 'bg-white/50 border-white/50 hover:bg-white/80 hover:shadow-lg hover:shadow-indigo-200'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className={`text-lg font-semibold mb-2 ${
                    dark ? 'text-white' : 'text-gray-900'
                  }`}>
                    {feature.title}
                  </h3>
                  <p className={dark ? 'text-neutral-400' : 'text-gray-600'}>
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Demo Preview Section */}
      <section className={`relative py-24 px-4 transition-colors ${
        dark ? 'bg-neutral-950' : 'bg-white'
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${
              dark ? 'text-white' : 'text-gray-900'
            }`}>
              See It In Action
            </h2>
          </div>

          <div className={`relative rounded-2xl overflow-hidden border backdrop-blur-xl ${
            dark
              ? 'bg-neutral-900/50 border-white/10'
              : 'bg-gradient-to-br from-indigo-50 to-purple-50 border-gray-200'
          }`}>
            <div className="aspect-video flex items-center justify-center p-8">
              <div className="relative w-full h-full rounded-lg overflow-hidden">
                {/* Fake whiteboard UI */}
                <div className={`absolute inset-0 ${dark ? 'bg-neutral-800' : 'bg-white'}`}>
                  {/* Toolbar mock */}
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col gap-2 p-3 rounded-xl backdrop-blur-xl border" style={{background: dark ? 'rgba(0, 0, 0, 0.3)' : 'rgba(255, 255, 255, 0.3)', borderColor: dark ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)'}}>
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-8 h-8 rounded-lg ${
                        i === 0
                          ? 'bg-blue-500'
                          : 'bg-gray-400 opacity-50'
                      }`} />
                    ))}
                  </div>

                  {/* Canvas strokes */}
                  <svg className="absolute inset-0 w-full h-full" style={{pointerEvents: 'none'}}>
                    <polyline points="100,100 150,150 200,100 250,150" stroke="#3b82f6" strokeWidth="3" fill="none" strokeLinecap="round" />
                    <circle cx="400" cy="200" r="50" stroke="#ec4899" strokeWidth="3" fill="none" />
                    <rect x="500" y="150" width="100" height="100" stroke="#8b5cf6" strokeWidth="3" fill="none" />
                    <polyline points="150,350 200,320 250,350 300,330" stroke="#10b981" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                  </svg>

                  {/* Cursor indicators */}
                  <div className="absolute top-20 left-32 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-indigo-500 animate-pulse" />
                    <span className="text-xs px-2 py-1 rounded bg-indigo-500 text-white">You</span>
                  </div>
                  <div className="absolute top-40 right-32 flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-pink-500 animate-pulse" />
                    <span className="text-xs px-2 py-1 rounded bg-pink-500 text-white">Alex</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Nexus-Board? Section */}
      <section className={`relative py-24 px-4 transition-colors ${
        dark ? 'bg-neutral-950' : 'bg-white'
      }`}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className={`text-4xl md:text-5xl font-bold mb-8 ${
            dark ? 'text-white' : 'text-gray-900'
          }`}>
            Why Nexus-Board?
          </h2>
          <div className={`space-y-6 text-lg md:text-xl leading-relaxed ${
            dark ? 'text-neutral-300' : 'text-gray-700'
          }`}>
            <p>
              Because ideas don't happen in isolation.
            </p>
            <p className="font-semibold bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
              They evolve through discussion, sketches, mistakes, and collaboration.
            </p>
            <p>
              Traditional tools lock your thinking into documents and presentations. Nexus-Board frees it. Your ideas become a living, breathing canvas that grows with every stroke, every comment, every moment of shared creativity.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className={`relative py-24 px-4 transition-colors ${
        dark ? 'bg-neutral-900' : 'bg-gray-50'
      }`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`text-4xl md:text-5xl font-bold mb-4 ${
              dark ? 'text-white' : 'text-gray-900'
            }`}>
              How It Works
            </h2>
            <p className={`text-lg ${
              dark ? 'text-neutral-400' : 'text-gray-600'
            }`}>
              Three simple steps to start collaborating
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                icon: Sparkles,
                title: 'Open a Board',
                description: 'Create a new blank canvas and start drawing instantly',
                color: 'from-indigo-500 to-blue-500',
              },
              {
                step: 2,
                icon: Users,
                title: 'Share the Link',
                description: 'Invite anyone to your board with a simple URL',
                color: 'from-purple-500 to-pink-500',
              },
              {
                step: 3,
                icon: MessageSquare,
                title: 'Create Together',
                description: 'Draw, chat, and build ideas in real-time with your team',
                color: 'from-pink-500 to-rose-500',
              },
            ].map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="relative">
                  <div className="flex flex-col items-center text-center">
                    <div className={`relative mb-6`}>
                      <div className={`w-20 h-20 rounded-full bg-gradient-to-br ${item.color} flex items-center justify-center mb-4`}>
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <div className={`absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        dark ? 'bg-neutral-700' : 'bg-gray-800'
                      }`}>
                        {item.step}
                      </div>
                    </div>

                    <h3 className={`text-xl font-semibold mb-2 ${
                      dark ? 'text-white' : 'text-gray-900'
                    }`}>
                      {item.title}
                    </h3>
                    <p className={`text-sm ${
                      dark ? 'text-neutral-400' : 'text-gray-600'
                    }`}>
                      {item.description}
                    </p>
                  </div>

                  {/* Arrow connector */}
                  {idx < 2 && (
                    <div className="hidden md:block absolute top-20 -right-4 transform translate-x-full">
                      <ArrowRight className={`w-6 h-6 ${
                        dark ? 'text-white/20' : 'text-gray-400'
                      }`} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Proof / Engineering Section */}
      <section className={`relative py-24 px-4 transition-colors ${
        dark ? 'bg-neutral-950' : 'bg-white'
      }`}>
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${
              dark ? 'text-white' : 'text-gray-900'
            }`}>
              Built with Modern Technology
            </h2>
            <p className={`text-lg ${
              dark ? 'text-neutral-400' : 'text-gray-600'
            }`}>
              Enterprise-grade architecture for real-time collaboration
            </p>
          </div>

          <div className={`relative p-8 md:p-12 rounded-2xl backdrop-blur-xl border ${
            dark
              ? 'bg-white/5 border-white/10'
              : 'bg-gradient-to-br from-indigo-50/50 to-purple-50/50 border-indigo-200/50'
          }`}>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              {[
                { icon: Zap, label: 'WebSocket Real-Time Sync', value: 'Sub-100ms latency' },
                { icon: Eye, label: 'Canvas-Based Drawing', value: 'Hardware-accelerated graphics' },
                { icon: Users, label: 'Multi-User Architecture', value: 'Conflict-free synchronization' },
                { icon: MessageSquare, label: 'Live Presence System', value: 'Live cursors & awareness' },
              ].map((tech, idx) => {
                const Icon = tech.icon;
                return (
                  <div key={idx} className="flex gap-4">
                    <div className="flex-shrink-0">
                      <div className="flex items-center justify-center h-12 w-12 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-500">
                        <Icon className="h-6 w-6 text-white" />
                      </div>
                    </div>
                    <div>
                      <h3 className={`font-semibold ${
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
                );
              })}
            </div>

            <div className={`border-t pt-6 ${dark ? 'border-white/10' : 'border-indigo-200/50'}`}>
              <p className={`text-sm font-medium ${
                dark ? 'text-neutral-300' : 'text-gray-700'
              }`}>
                ✨ Built with Next.js • TypeScript • Tailwind CSS • Socket.io • Canvas API
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Collaboration Section */}
      <section className={`relative py-24 px-4 transition-colors ${
        dark ? 'bg-neutral-900' : 'bg-gray-50'
      }`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
            dark ? 'text-white' : 'text-gray-900'
          }`}>
            Collaboration Reimagined
          </h2>
          <p className={`text-xl mb-12 leading-relaxed ${
            dark ? 'text-neutral-300' : 'text-gray-700'
          }`}>
            "Collaboration isn't about working together. It's about thinking together."
            <br />
            <span className={`text-base ${dark ? 'text-neutral-400' : 'text-gray-600'}`}>
              In Nexus-Board, every stroke matters. Every idea counts. Every conversation shapes the outcome.
            </span>
          </p>

          <div className={`relative p-12 rounded-2xl backdrop-blur-xl border ${
            dark
              ? 'bg-white/5 border-white/10'
              : 'bg-white/50 border-white/50'
          }`}>
            <div className="grid grid-cols-3 gap-4 max-w-sm mx-auto">
              {[
                { color: 'bg-indigo-500', name: 'You' },
                { color: 'bg-pink-500', name: 'Alex' },
                { color: 'bg-emerald-500', name: 'Sam' },
              ].map((user, idx) => (
                <div key={idx} className="flex flex-col items-center gap-2">
                  <div className={`w-12 h-12 rounded-full ${user.color} flex items-center justify-center`}>
                    <Users className="w-6 h-6 text-white" />
                  </div>
                  <span className={`text-sm ${dark ? 'text-neutral-300' : 'text-gray-700'}`}>
                    {user.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className={`relative py-24 px-4 transition-colors ${
        dark ? 'bg-neutral-950' : 'bg-gradient-to-br from-indigo-50 to-purple-50'
      }`}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`text-4xl md:text-5xl font-bold mb-6 ${
            dark ? 'text-white' : 'text-gray-900'
          }`}>
            Ready to Transform Ideas Into Reality?
          </h2>
          <p className={`text-lg mb-8 ${
            dark ? 'text-neutral-300' : 'text-gray-700'
          }`}>
            Join the creative revolution. Start collaborating now.
          </p>

          <Link href="/board">
            <button className={`group px-8 py-4 rounded-xl font-semibold flex items-center gap-2 transition-all mx-auto ${
              dark
                ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:shadow-lg hover:shadow-indigo-500/50'
                : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:shadow-indigo-600/50'
            }`}>
              Launch Nexus-Board
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className={`border-t transition-colors ${
        dark
          ? 'bg-neutral-950 border-white/10'
          : 'bg-white border-gray-200'
      }`}>
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 rounded-lg" />
                <span className={`font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>
                  Nexus-Board
                </span>
              </div>
              <p className={`text-sm ${dark ? 'text-neutral-400' : 'text-gray-600'}`}>
                Ideas grow when shared.
              </p>
            </div>

            <div>
              <h4 className={`font-semibold mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}>
                Product
              </h4>
              <ul className={`space-y-2 text-sm ${dark ? 'text-neutral-400' : 'text-gray-600'}`}>
                <li><a href="/board" className="hover:text-indigo-500 transition">Launch App</a></li>
                <li><a href="#" className="hover:text-indigo-500 transition">Features</a></li>
              </ul>
            </div>

            <div>
              <h4 className={`font-semibold mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}>
                Project
              </h4>
              <ul className={`space-y-2 text-sm ${dark ? 'text-neutral-400' : 'text-gray-600'}`}>
                <li><a href="https://github.com" className="hover:text-indigo-500 transition">GitHub</a></li>
                <li><a href="#" className="hover:text-indigo-500 transition">Docs</a></li>
              </ul>
            </div>

            <div>
              <h4 className={`font-semibold mb-3 ${dark ? 'text-white' : 'text-gray-900'}`}>
                Built With
              </h4>
              <p className={`text-sm ${dark ? 'text-neutral-400' : 'text-gray-600'}`}>
                Next.js • TypeScript • Tailwind • Socket.io
              </p>
            </div>
          </div>

          <div className={`border-t pt-8 ${dark ? 'border-white/10' : 'border-gray-200'}`}>
            <p className={`text-center text-sm ${dark ? 'text-neutral-400' : 'text-gray-600'}`}>
              © 2024 Nexus-Board. Built as a final-year college project with ❤️
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
