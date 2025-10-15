'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function PackageDetailPage() {
  const params = useParams();
  const [packageData, setPackageData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPackage = async () => {
      try {
        const response = await fetch(`/api/track/${params.code}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Erreur lors de la récupération');
        }

        if (!result.success) {
          setError(result.message || 'Aucune information trouvée');
          setLoading(false);
          return;
        }

        setPackageData(result.data);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    if (params.code) {
      fetchPackage();
    }
  }, [params.code]);

  if (loading) {
    return (
      <div className="container py-8">
        <div className="card text-center">
          <div className="text-4xl mb-4">🔄</div>
          <p className="text-gold text-xl">Chargement des informations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-8">
        <div className="card text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl text-gold mb-2">Erreur</h2>
          <p className="text-slate-light">{error}</p>
          <a href="/packages" className="btn btn-primary mt-4">
            Retour aux Colis
          </a>
        </div>
      </div>
    );
  }

  if (!packageData) {
    return null;
  }

  return (
    <div className="container py-8">
      {/* Header with back button */}
      <div className="mb-6">
        <a href="/packages" className="text-gold hover:text-gold-light" style={{ textDecoration: 'none' }}>
          ← Retour aux Colis
        </a>
      </div>

      {/* Tracking Code Header */}
      <div className="card mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-slate-light mb-1">CODE SUIVI:</p>
            <h1 className="text-3xl font-bold text-gold">{packageData.trackingCode}</h1>
          </div>
          <StatusBadge data={packageData} />
        </div>
      </div>

      {/* Package Info Grid */}
      <div className="card mb-6">
        <h2 className="text-2xl font-bold text-gold mb-6">Informations du Colis</h2>
        <div className="grid gap-6" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))' }}>
          <InfoBox icon="🏷️" label="PRODUIT" value={packageData.product} />
          <InfoBox icon="💰" label="MONTANT CRBT" value={packageData.amount} />
          <InfoBox icon="📍" label="POSITION ACTUELLE" value={packageData.currentPosition} />
          <InfoBox icon="⚖️" label="POIDS DU COLIS" value={packageData.weight} />
        </div>
      </div>

      {/* Journey Map */}
      <div className="card mb-6" style={{ background: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)' }}>
        <JourneyMap data={packageData} />
      </div>

      {/* Timeline */}
      <div className="card">
        <h2 className="text-2xl font-bold text-gold mb-6">SUIVI LIVRAISON</h2>
        {packageData.timeline && packageData.timeline.length > 0 ? (
          <Timeline events={packageData.timeline} />
        ) : (
          <p className="text-slate-light">Aucun événement disponible</p>
        )}
      </div>
    </div>
  );
}

// Info Box Component
function InfoBox({ icon, label, value }) {
  return (
    <div className="flex gap-3">
      <div style={{
        width: '60px',
        height: '60px',
        background: '#FF5722',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '24px',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div className="flex flex-col justify-center">
        <p className="text-slate-light" style={{ fontSize: '12px', textTransform: 'uppercase' }}>
          {label}
        </p>
        <p className="font-medium" style={{ fontSize: '16px' }}>
          {value || 'N/A'}
        </p>
      </div>
    </div>
  );
}

// Journey Map Component
function JourneyMap({ data }) {
  return (
    <div style={{ padding: '2rem 0' }}>
      <div className="flex items-center justify-between" style={{ position: 'relative', maxWidth: '800px', margin: '0 auto' }}>
        {/* Origin Point */}
        <div className="text-center" style={{ flex: '0 0 auto', maxWidth: '200px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            background: '#FF5722',
            border: '4px solid white',
            borderRadius: '50%',
            margin: '0 auto 10px',
            position: 'relative',
            zIndex: 2
          }}></div>
          <div style={{
            background: 'white',
            color: '#1e3a8a',
            padding: '8px 16px',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '14px',
            marginBottom: '8px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {data.origin || 'ORIGINE'}
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>DATE DÉPÔT</p>
            <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>
              {data.depositDate || 'N/A'}
            </p>
          </div>
        </div>

        {/* Dotted Line */}
        <div style={{
          flex: '1',
          height: '4px',
          background: 'repeating-linear-gradient(to right, #FF5722 0, #FF5722 10px, transparent 10px, transparent 20px)',
          margin: '0 20px',
          position: 'relative',
          top: '-45px'
        }}></div>

        {/* Destination Point */}
        <div className="text-center" style={{ flex: '0 0 auto', maxWidth: '200px' }}>
          <div style={{
            width: '50px',
            height: '50px',
            background: data.deliveryDate ? '#10b981' : '#FF5722',
            border: '4px solid white',
            borderRadius: '50%',
            margin: '0 auto 10px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '24px',
            position: 'relative',
            zIndex: 2
          }}>
            {data.deliveryDate ? '✓' : ''}
          </div>
          <div style={{
            background: 'white',
            color: '#1e3a8a',
            padding: '8px 16px',
            borderRadius: '20px',
            fontWeight: 'bold',
            fontSize: '14px',
            marginBottom: '8px',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis'
          }}>
            {data.destination || 'DESTINATION'}
          </div>
          <div>
            <p style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>DATE LIVRAISON</p>
            <p style={{ fontSize: '14px', fontWeight: 'bold', color: 'white' }}>
              {data.deliveryDate || '../../....'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Timeline Component
function Timeline({ events }) {
  return (
    <div style={{ position: 'relative' }}>
      {events.map((event, index) => (
        <div key={index} style={{ 
          position: 'relative', 
          paddingLeft: '80px',
          paddingBottom: index < events.length - 1 ? '40px' : '0'
        }}>
          {/* Vertical Line */}
          {index < events.length - 1 && (
            <div style={{
              position: 'absolute',
              left: '30px',
              top: '50px',
              bottom: '0',
              width: '3px',
              background: '#FF5722'
            }}></div>
          )}

          {/* Number Circle */}
          <div style={{
            position: 'absolute',
            left: '0',
            top: '0',
            width: '60px',
            height: '60px',
            background: '#1e3a8a',
            border: '3px solid #FF5722',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontWeight: 'bold',
            fontSize: '24px'
          }}>
            {event.number}
          </div>

          {/* Event Content */}
          <div>
            {/* Date/Time Pills */}
            <div className="flex gap-2 mb-3" style={{ flexWrap: 'wrap' }}>
              <span style={{
                background: '#1e3a8a',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
                border: '2px solid #FF5722'
              }}>
                {event.date}
              </span>
              <span style={{
                background: '#FF5722',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '50%',
                fontSize: '14px',
                fontWeight: 'bold',
                width: '50px',
                height: '50px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                🕐
              </span>
              <span style={{
                background: '#1e3a8a',
                color: 'white',
                padding: '8px 16px',
                borderRadius: '20px',
                fontSize: '14px',
                fontWeight: 'bold',
                border: '2px solid #FF5722'
              }}>
                {event.time}
              </span>
            </div>

            {/* Description */}
            <p style={{ 
              fontSize: '16px', 
              lineHeight: '1.6',
              color: 'var(--slate-light)'
            }}>
              {event.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

// Status Badge Component
function StatusBadge({ data }) {
  let status = 'pending';
  if (data.deliveryDate) {
    status = 'delivered';
  } else if (data.timeline && data.timeline.length > 0) {
    status = 'in-transit';
  }

  const badges = {
    delivered: { text: 'Livré', color: '#10b981' },
    'in-transit': { text: 'En Transit', color: '#f59e0b' },
    pending: { text: 'En Attente', color: '#6b7280' }
  };

  const badge = badges[status];

  return (
    <span style={{
      background: badge.color,
      color: 'white',
      padding: '8px 20px',
      borderRadius: '9999px',
      fontSize: '16px',
      fontWeight: 'bold'
    }}>
      {badge.text}
    </span>
  );
}