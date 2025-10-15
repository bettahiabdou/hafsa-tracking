import './globals.css'

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
              <div className="text-2xl font-bold text-gold">
                ✨ HAFSA BIJOUTERIE
              </div>
              <div className="flex gap-6">
                <a href="/">Dashboard</a>
                <a href="/packages">Colis</a>
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