'use client'

import { motion } from 'framer-motion'
import { BookOpen, Users, BarChart3, MessageSquare } from 'lucide-react'
import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50">
      {/* Compact Hero Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl flex items-center justify-center mb-4">
                <BookOpen className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl md:text-5xl font-display font-bold mb-3 gradient-text">
                to-teach.ai Weiterbildung
              </h1>
              <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
                Moderne Lernplattform für digitale Bildung mit KI-Tools
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
              <Link 
                href="/login"
                className="px-8 py-3 bg-primary-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl hover:bg-primary-700 transition-all"
              >
                Jetzt anmelden
              </Link>
              <Link 
                href="/login?mode=admin"
                className="px-8 py-3 glass-card rounded-xl font-semibold hover:shadow-xl transition-all text-gray-700"
              >
                Admin-Login
              </Link>
            </div>
          </motion.div>

          {/* Compact Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8"
          >
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="glass-card p-4 rounded-xl hover:shadow-lg transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-accent-500 rounded-lg flex items-center justify-center mb-2 mx-auto">
                  <feature.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="font-bold text-sm mb-1">{feature.title}</h3>
                <p className="text-xs text-gray-600">{feature.description}</p>
              </div>
            ))}
          </motion.div>

          {/* Compact Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="grid grid-cols-3 gap-4 mt-8"
          >
            {stats.map((stat) => (
              <div key={stat.label} className="glass-card p-4 rounded-xl">
                <div className="text-3xl font-display font-bold gradient-text">
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 px-4 text-center text-gray-600 text-sm">
        <p>to-teach.ai Weiterbildung • {new Date().getFullYear()}</p>
      </footer>
    </main>
  )
}

const features = [
  {
    icon: BookOpen,
    title: '8 Aufgaben',
    description: 'Strukturierte Lerneinheiten'
  },
  {
    icon: Users,
    title: 'Gruppen',
    description: 'Gemeinsam lernen'
  },
  {
    icon: BarChart3,
    title: 'Statistiken',
    description: 'Live Fortschritt'
  },
  {
    icon: MessageSquare,
    title: 'Pinnwand',
    description: 'Feedback teilen'
  }
]

const stats = [
  { value: '8', label: 'Aufgaben' },
  { value: '5', label: 'Gruppen' },
  { value: '∞', label: 'Zertifikate' }
]
