import { AUTH_API_URL } from "../config/api";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;
    setError("");
    if (password !== confirmation) {
      setError("Les mots de passe doivent être identiques.");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await fetch(`${AUTH_API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });
      if (!response.ok) {
        if (response.status === 409) setError("Cette adresse email est déjà utilisée.");
        else if (response.status === 400) setError("Email invalide ou mot de passe trop court : 8 caractères minimum.");
        else setError("Inscription impossible. Réessaie plus tard.");
        return;
      }
      navigate("/login", { replace: true });
    } catch {
      setError("Impossible de contacter le service d’inscription.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-layout">
      <h1>ApplyFlow</h1>
      <p>Organisez votre recherche. Suivez vos progrès.</p>
      <section className="auth-card">
        <h2>Créer un compte</h2>
        {error && <p role="alert">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="register-email">Adresse email</label>
          <input id="register-email" type="email" autoComplete="username" required disabled={isSubmitting} value={email} onChange={e => setEmail(e.target.value)} />
          <label htmlFor="register-password">Mot de passe (8 caractères minimum)</label>
          <input id="register-password" type="password" autoComplete="new-password" minLength={8} required disabled={isSubmitting} value={password} onChange={e => setPassword(e.target.value)} />
          <label htmlFor="confirmation">Confirmer le mot de passe</label>
          <input id="confirmation" type="password" autoComplete="new-password" minLength={8} required disabled={isSubmitting} value={confirmation} onChange={e => setConfirmation(e.target.value)} />
          <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Création…" : "Créer mon compte"}</button>
        </form>
        <p>Déjà un compte ? <Link to="/login">Se connecter</Link></p>
      </section>
    </main>
  );
}

export default Register;
