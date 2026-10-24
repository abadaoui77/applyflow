import { APPLICATION_API_URL } from "../config/api";
import { useState, useEffect } from "react";
import PageHeader from "../components/PageHeader";

function Dashboard({ onLogout }) {
  const [stats, setStats] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    async function getStats() {
      setIsLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(`${APPLICATION_API_URL}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (!active) return;
        if (response.status === 401) { onLogout(); return; }
        if (!response.ok) throw new Error("Impossible de charger les statistiques.");
        const data = await response.json();
        if (active) setStats(data);
      } catch {
        if (active) setError("Impossible de charger les statistiques.");
      } finally {
        if (active) setIsLoading(false);
      }
    }
    getStats();
    return () => { active = false; };
  }, [onLogout]);

  const statistics = [
    { label: "Total", value: stats.total },
    { label: "À envoyer", value: stats.toApply },
    { label: "Envoyées", value: stats.applied },
    { label: "En entretien", value: stats.interviews },
    { label: "Refusées", value: stats.rejected },
    { label: "Offres reçues", value: stats.offers }
  ];

  return (
    <main>
      <PageHeader onLogout={onLogout} />
      <h1>Tableau de bord</h1>
      <p>Une vue d’ensemble de vos candidatures.</p>
      {isLoading ? <p role="status">Chargement des statistiques…</p> :
       error ? <p role="alert">{error}</p> : (
        <>
          <section aria-label="Statistiques" className="dashboard-grid">
            {statistics.map(stat => (
              <article key={stat.label} className="dashboard-card">
                <h2>{stat.label}</h2>
                <p className="dashboard-value">{stat.value ?? 0}</p>
              </article>
            ))}
          </section>
          {stats.total === 0 && <p>Ajoutez votre première candidature pour commencer.</p>}
          <p>Les compteurs représentent le statut actuel de vos candidatures.</p>
        </>
      )}
    </main>
  );
}
export default Dashboard;
