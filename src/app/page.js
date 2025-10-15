export default function Dashboard() {
  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gold mb-2">
          📊 Tableau de Bord
        </h1>
        <p className="text-slate-light">
          Vue d'ensemble de vos envois Amana
        </p>
      </div>

      <div className="grid grid-cols-4 mb-8">
        <StatCard 
          title="Total Colis"
          value="0"
          icon="📦"
        />
        <StatCard 
          title="En Transit"
          value="0"
          icon="🚚"
        />
        <StatCard 
          title="Livrés"
          value="0"
          icon="✅"
        />
        <StatCard 
          title="En Attente"
          value="0"
          icon="⏳"
        />
      </div>

      <div className="card mb-8">
        <h2 className="text-2xl font-bold text-gold mb-4">
          Actions Rapides
        </h2>
        <div className="flex gap-4">
          <a href="/packages/new" className="btn btn-primary">
            + Ajouter un Colis
          </a>
          <button className="btn btn-secondary">
            🔄 Actualiser Tous
          </button>
        </div>
      </div>

      <div className="card">
        <h2 className="text-2xl font-bold text-gold mb-4">
          Activité Récente
        </h2>
        <p className="text-slate-light">
          Aucune activité récente. Ajoutez votre premier colis pour commencer.
        </p>
      </div>
    </div>
  )
}

function StatCard({ title, value, icon }) {
  return (
    <div className="card">
      <div className="flex items-center justify-between mb-2">
        <span className="text-3xl">{icon}</span>
        <span className="text-3xl font-bold text-gold">{value}</span>
      </div>
      <p className="text-slate-light font-medium">{title}</p>
    </div>
  )
}