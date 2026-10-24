
import { useState } from "react";

const STATUS_OPTIONS = [
  { value: "TO_APPLY", label: "À envoyer" },
  { value: "APPLIED", label: "Envoyée" },
  { value: "HR_INTERVIEW", label: "Entretien RH" },
  { value: "TECH_INTERVIEW", label: "Entretien technique" },
  { value: "REJECTED", label: "Refusée" },
  { value: "OFFER", label: "Offre reçue" }
];

function ApplicationForm({
  onSubmitApplication,
  applicationToEdit,
  onCancel,
  isSaving
}) {
  const [company, setCompany] = useState(
    applicationToEdit?.company ?? ""
  );

  const [role, setRole] = useState(
    applicationToEdit?.role ?? ""
  );

  const [notes, setNotes] = useState(
    applicationToEdit?.notes ?? ""
  );

  const [url, setUrl] = useState(
    applicationToEdit?.offer_url ?? ""
  );

  const [status, setStatus] = useState(
    applicationToEdit?.status ?? "TO_APPLY"
  );

  function resetForm() {
    setCompany("");
    setRole("");
    setNotes("");
    setUrl("");
    setStatus("TO_APPLY");
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (isSaving) return;

    const success = await onSubmitApplication({
      company: company.trim(),
      role: role.trim(),
      notes: notes.trim(),
      offer_url: url.trim(),
      status
    });

    if (success) {
      resetForm();
    }
  }

  return (
    <section>
      <h2 id="application-form-title">
        {applicationToEdit
          ? "Modifier la candidature"
          : "Nouvelle candidature"}
      </h2>

      <p>Renseignez les informations de votre candidature.</p>

      <form onSubmit={handleSubmit}>
        <label htmlFor="company">Entreprise</label>
        <input
          id="company"
          required
          disabled={isSaving}
          value={company}
          onChange={e => setCompany(e.target.value)}
        />

        <label htmlFor="role">Poste</label>
        <input
          id="role"
          required
          disabled={isSaving}
          value={role}
          onChange={e => setRole(e.target.value)}
        />

        <label htmlFor="offer-url">Lien de l'offre</label>
        <input
          id="offer-url"
          type="url"
          disabled={isSaving}
          value={url}
          onChange={e => setUrl(e.target.value)}
        />

        <label htmlFor="application-status">Statut</label>
        <select
          id="application-status"
          disabled={isSaving}
          value={status}
          onChange={e => setStatus(e.target.value)}
        >
          {STATUS_OPTIONS.map(option => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <label htmlFor="application-notes">Notes</label>
        <textarea
          id="application-notes"
          rows={3}
          disabled={isSaving}
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />

        <div>
          <button type="submit" disabled={isSaving}>
            {isSaving
              ? "Enregistrement…"
              : applicationToEdit
                ? "Enregistrer"
                : "Ajouter la candidature"}
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              disabled={isSaving}
            >
              Annuler
            </button>
          )}
        </div>
      </form>
    </section>
  );
}

export default ApplicationForm;
