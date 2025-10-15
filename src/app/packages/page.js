'use client';

import { useState } from 'react';

export default function PackagesPage() {
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(false);

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gold mb-2">
          📦 Gestion des Colis
        </h1>
        <p className="text-slate-light">
          Liste de tous vos envois Amana
        </p>
      </div>

      {/* Add Package Section */}
      <div className="card mb-8">
        <h2 className="text-2xl font-bold text-gold mb-4">
          Ajouter un Colis
        </h2>
        <AddPackageForm onAdd={(pkg) => setPackages([pkg, ...packages])} />
      </div>

      {/* Packages List */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gold mb-4">
          Tous les Colis ({packages.length})
        </h2>
        
        {packages.length === 0 ? (
          <p className="text-slate-light">
            Aucun colis ajouté. Commencez par ajouter un code de suivi ci-dessus.
          </p>
        ) : (
          <div className="grid gap-4">
            {packages.map((pkg) => (
              <PackageCard key={pkg.trackingCode} package={pkg} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AddPackageForm({ onAdd }) {
  const [trackingCode, setTrackingCode] = useState('');
  const [clientName, setClientName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch(`/api/track/${trackingCode}`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors de la récupération');
      }

      if (!result.success) {
        setError(result.message || 'Aucune information trouvée');
        setLoading(false);
        return;
      }

      // Add package to list
      onAdd({
        ...result.data,
        status: result.status, 
        clientName,
        addedAt: new Date().toISOString()
      });

      // Reset form
      setTrackingCode('');
      setClientName('');
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 mb-4" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div>
          <label className="text-slate-light mb-2" style={{ display: 'block' }}>
            Code de Suivi
          </label>
          <input
            type="text"
            value={trackingCode}
            onChange={(e) => setTrackingCode(e.target.value.toUpperCase())}
            placeholder="Ex: QB212119762MA"
            required
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(201, 169, 97, 0.3)',
              background: 'var(--charcoal-dark)',
              color: 'var(--slate-light)',
              fontSize: '1rem'
            }}
          />
        </div>
        <div>
          <label className="text-slate-light mb-2" style={{ display: 'block' }}>
            Client
          </label>
          <input
            type="text"
            value={clientName}
            onChange={(e) => setClientName(e.target.value)}
            placeholder="Nom du client"
            style={{
              width: '100%',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid rgba(201, 169, 97, 0.3)',
              background: 'var(--charcoal-dark)',
              color: 'var(--slate-light)',
              fontSize: '1rem'
            }}
          />
        </div>
      </div>

      {error && (
        <div style={{ 
          padding: '0.75rem', 
          background: 'rgba(239, 68, 68, 0.1)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          borderRadius: '0.5rem',
          color: '#f87171',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}

      <button 
        type="submit" 
        className="btn btn-primary"
        disabled={loading}
      >
        {loading ? '🔄 Recherche...' : '+ Ajouter le Colis'}
      </button>
    </form>
  );
}

function PackageCard({ package: pkg }) {
  const getStatusBadge = () => {
    const badges = {
      delivered: { text: 'Livré', color: '#10b981' },
      'in-transit': { text: 'En Transit', color: '#f59e0b' },
      pending: { text: 'En Attente', color: '#6b7280' }
    };
    
    const status = pkg.status || 'pending';
    const badge = badges[status] || badges.pending;
    
    return (
      <span style={{
        background: badge.color,
        color: 'white',
        padding: '0.25rem 0.75rem',
        borderRadius: '9999px',
        fontSize: '0.875rem',
        fontWeight: 'bold'
      }}>
        {badge.text}
      </span>
    );
  };

  return (
    <a 
      href={`/packages/${pkg.trackingCode}`}
      style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
    >
      <div 
        className="card" 
        style={{ 
          borderLeft: '4px solid var(--gold)',
          cursor: 'pointer',
          transition: 'transform 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
      >
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-gold font-bold text-xl mb-1">
              {pkg.trackingCode}
            </h3>
            {pkg.clientName && (
              <p className="text-slate-light">Client: {pkg.clientName}</p>
            )}
          </div>
          {getStatusBadge()}
        </div>

        <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
          <div>
            <p className="text-slate-light" style={{ fontSize: '0.875rem' }}>Produit</p>
            <p className="font-medium">{pkg.product || 'N/A'}</p>
          </div>
          <div>
            <p className="text-slate-light" style={{ fontSize: '0.875rem' }}>Position</p>
            <p className="font-medium">{pkg.currentPosition || 'N/A'}</p>
          </div>
          <div>
            <p className="text-slate-light" style={{ fontSize: '0.875rem' }}>Poids</p>
            <p className="font-medium">{pkg.weight || 'N/A'}</p>
          </div>
          <div>
            <p className="text-slate-light" style={{ fontSize: '0.875rem' }}>Montant</p>
            <p className="font-medium text-gold">{pkg.amount || 'N/A'}</p>
          </div>
        </div>

        {pkg.timeline && pkg.timeline.length > 0 && (
          <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(201, 169, 97, 0.2)' }}>
            <p className="text-slate-light" style={{ fontSize: '0.875rem' }}>
              Dernier événement: {pkg.timeline[0].date} {pkg.timeline[0].time}
            </p>
            <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
              {pkg.timeline[0].description}
            </p>
          </div>
        )}
      </div>
    </a>
  );
}