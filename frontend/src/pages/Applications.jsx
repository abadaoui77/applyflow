import { APPLICATION_API_URL } from "../config/api";
import { useState, useEffect } from "react";
import ApplicationForm from "../components/ApplicationForm.jsx";
import PageHeader from "../components/PageHeader.jsx";

const API_URL = `${APPLICATION_API_URL}/applications`;
const STATUS_LABELS = {
  TO_APPLY: "À envoyer",
  APPLIED: "Envoyée",
  HR_INTERVIEW: "Entretien RH",
  TECH_INTERVIEW: "Entretien technique",
  REJECTED: "Refusée",
  OFFER: "Offre reçue"
};

function Applications({ onLogout }) {
  const [applications, setApplications] = useState([]);
  const [editingApplication, setEditingApplication] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadApplications() {
      setIsLoading(true);
      setError("");

      try {
        const token = localStorage.getItem("token");

        const response = await fetch(API_URL, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        if (!active) return;

        if (response.status === 401) {
          onLogout();
          return;
        }

        if (!response.ok) {
          throw new Error(
            `Impossible de charger les candidatures (${response.status}).`
          );
        }

        const data = await response.json();

        if (active) {
          setApplications(data);
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Le service est inaccessible.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadApplications();

    return () => {
      active = false;
    };
  }, [onLogout]);

  async function handleSaveApplication(applicationData) {
    if (isSaving) return false;

    if (!applicationData.company || !applicationData.role) {
      setError("L’entreprise et le poste sont obligatoires.");
      return false;
    }

    setIsSaving(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const isEditing = editingApplication !== null;

      const response = await fetch(
        isEditing
          ? `${API_URL}/${editingApplication.id}`
          : API_URL,
        {
          method: isEditing ? "PUT" : "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(applicationData)
        }
      );

      if (response.status === 401) {
        onLogout();
        return false;
      }

      if (!response.ok) {
        throw new Error(
          `Impossible d’enregistrer la candidature (${response.status}).`
        );
      }

      const data = await response.json();

      setApplications(current =>
        isEditing
          ? current.map(app => app.id === data.id ? data : app)
          : [...current, data]
      );

      setEditingApplication(null);
      setIsFormOpen(false);
      return true;
    } catch (err) {
      setError(err.message || "Le service est inaccessible.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteApplication(id) {
    if (deletingId !== null || isSaving) return;

    if (!window.confirm("Supprimer cette candidature ?")) return;

    setDeletingId(id);
    setError("");

    try {
      const token = localStorage.getItem("token");

      const response = await fetch(`${API_URL}/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 401) {
        onLogout();
        return;
      }

      if (!response.ok) {
        throw new Error(
          `Impossible de supprimer la candidature (${response.status}).`
        );
      }

      setApplications(current =>
        current.filter(app => app.id !== id)
      );

      if (editingApplication?.id === id) {
        setEditingApplication(null);
      }
    } catch (err) {
      setError(err.message || "Le service est inaccessible.");
    } finally {
      setDeletingId(null);
    }
  }

  function openAddForm() {
    setError("");
    setEditingApplication(null);
    setIsFormOpen(true);
  }

  function closeForm() {
    if (isSaving) return;
    setIsFormOpen(false);
    setEditingApplication(null);
    setError("");
  }


  const isBusy = isSaving || deletingId !== null;

  return (
    <main>
      <PageHeader onLogout={onLogout} disabled={isBusy} />
      <h1>Mes candidatures</h1>
      <p>Centralisez vos offres et suivez chaque étape.</p>

      {error && !isFormOpen && <p role="alert">{error}</p>}

      {isFormOpen && (
        <section aria-labelledby="application-form-title">
          {error && <p role="alert">{error}</p>}
          <ApplicationForm
            key={editingApplication?.id ?? "new"}
            onSubmitApplication={handleSaveApplication}
            applicationToEdit={editingApplication}
            onCancel={closeForm}
            isSaving={isSaving}
          />
          <hr />
        </section>
      )}

      {isLoading ? (
        <p role="status">Chargement des candidatures…</p>
      ) : (
        <section>
          <h2>Toutes les candidatures ({applications.length})</h2>
          <button type="button" disabled={isBusy} onClick={openAddForm}>
            Ajouter une candidature
          </button>

          {applications.length === 0 ? (
            <p>Aucune candidature pour le moment.</p>
          ) : (
            <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Entreprise</th>
                  <th>Poste</th>
                  <th>Statut</th>
                  <th>Offre</th>
                  <th>Notes</th>
                  <th>Création</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map(application => (
                  <tr key={application.id}>
                    <td>{application.company}</td>
                    <td>{application.role}</td>
                    <td><span className={`status-badge status-${application.status}`}>{STATUS_LABELS[application.status] ?? application.status}</span></td>
                    <td>
                      {application.offer_url
                        ? <a href={application.offer_url} target="_blank" rel="noopener noreferrer">Voir l’offre</a>
                        : "—"}
                    </td>
                    <td>{application.notes || "—"}</td>
                    <td>
                      {application.created_at
                        ? new Date(application.created_at).toLocaleDateString("fr-FR")
                        : "—"}
                    </td>
                    <td>
                      <button
                        type="button"
                        disabled={isBusy}
                        onClick={() => {
                          setError("");
                          setEditingApplication(application);
                          setIsFormOpen(true);
                        }}
                      >
                        Modifier
                      </button>
                      {" "}
                      <button
                        type="button"
                        disabled={isBusy}
                        className="danger-button"
                        onClick={() => handleDeleteApplication(application.id)}
                      >
                        {deletingId === application.id ? "Suppression…" : "Supprimer"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default Applications;
