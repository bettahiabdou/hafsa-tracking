import Link from 'next/link'

// At the top of the component, replace the back link:
<div className="mb-6">
  <Link href="/packages" className="text-gold hover:text-gold-light" style={{ textDecoration: 'none' }}>
    ← Retour aux Colis
  </Link>
</div>