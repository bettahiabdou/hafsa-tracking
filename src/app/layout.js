import './globals.css'
import Link from 'next/link'

export const metadata = {
  title: 'Hafsa Bijouterie - Suivi de Colis',
  description: 'Système de suivi des colis Amana pour Hafsa Bijouterie',
}

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <nav>
          <div className="nav-container">
            <div className="nav-content">
              <Link href="/" style={{ textDecoration: 'none' }}>
                <div className="text-2xl font-bold text-gold" style={{ cursor: 'pointer' }}>
                  ✨ HAFSA BIJOUTERIE
                </div>
              </Link>
              <div className="flex gap-6">
                <Link href="/" style={{ color: 'var(--slate-light)', textDecoration: 'none' }}>
                  Dashboard
                </Link>
                <Link href="/packages" style={{ color: 'var(--slate-light)', textDecoration: 'none' }}>
                  Colis
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main>
          {children}
        </main>
        <footer>
          <div className="container text-center text-slate-light">
            <p>© 2025 Hafsa Bijouterie - Système de Suivi de Colis</p>
          </div>
        </footer>
      </body>
    </html>
  )
}