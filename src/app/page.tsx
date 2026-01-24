'use client'

import { motion } from 'framer-motion'
import { BookOpen, Users, BarChart3, MessageSquare, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-primary-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" />
          <div className="absolute top-40 right-10 w-72 h-72 bg-accent-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '2s' }} />
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-primary-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="max-w-6xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl md:text-8xl font-display font-bold mb-6">
              <span className="gradient-text">to-teach.ai</span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-700 mb-4 font-medium">
              Weiterbildung
            </p>
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-12">
              Moderne Lernplattform für digitale Bildung mit KI-Tools und interaktiven Aufgaben
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link 
              href="/login"
              className="group relative px-8 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
            >
              <span className="relative z-10">Jetzt starten</span>
              <div className="absolute inset-0 bg-primary-700 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>
            
            <Link 
              href="/login?mode=admin"
              className="px-8 py-4 glass-card rounded-xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 text-gray-700"
            >
              Admin-Login
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-display font-bold text-center mb-16 gradient-text"
          >
            Deine Lernreise
          </motion.h2>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="glass-card p-6 rounded-2xl hover:shadow-2xl transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-7 h-7 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 glass-card mx-4 rounded-3xl">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-5xl md:text-6xl font-display font-bold gradient-text mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto text-center glass-card p-12 rounded-3xl"
        >
          <Sparkles className="w-16 h-16 mx-auto mb-6 text-primary-600" />
          <h2 className="text-4xl md:text-5xl font-display font-bold mb-6">
            Bereit loszulegen?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Starte deine Lernreise jetzt und entdecke die Möglichkeiten von KI im Bildungsbereich
          </p>
          <Link 
            href="/login"
            className="inline-block px-10 py-4 bg-primary-600 text-white rounded-xl font-semibold text-lg shadow-xl hover:shadow-2xl hover:bg-primary-700 transform hover:-translate-y-1 transition-all duration-200"
          >
            Jetzt anmelden
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 text-center text-gray-600 border-t border-gray-200 mt-20">
        <p className="font-medium">
          to-teach.ai Weiterbildung • Version 3.0 • {new Date().getFullYear()}
        </p>
      </footer>
    </main>
  )
}

const features = [
  {
    icon: BookOpen,
    title: '8 Aufgaben',
    description: 'Strukturierte Lerneinheiten mit klaren Zielen und Anleitungen'
  },
  {
    icon: Users,
    title: 'Gruppenarbeit',
    description: 'Gemeinsam lernen in fünf verschiedenen Tiergruppen'
  },
  {
    icon: BarChart3,
    title: 'Live Statistiken',
    description: 'Verfolge deinen Fortschritt in Echtzeit'
  },
  {
    icon: MessageSquare,
    title: 'Pinnwand',
    description: 'Teile deine Erfahrungen mit anderen Teilnehmern'
  }
]

const stats = [
  { value: '8', label: 'Lerneinheiten' },
  { value: '5', label: 'Gruppen' },
  { value: '∞', label: 'Möglichkeiten' }
]
