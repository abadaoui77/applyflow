import { AUTH_API_URL } from "../config/api";
import { useState } from "react";
import { Link } from "react-router-dom";

function Login({ onLoginSucces }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch(`${AUTH_API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password })
      });

      if (!response.ok) {
        setError(response.status === 401
          ? "Email ou mot de passe incorrect."
          : "Connexion impossible. Réessaie plus tard.");
        return;
      }

      const data = await response.json();
      if (typeof data.token !== "string" || !data.token) {
        setError("La réponse du serveur est invalide.");
        return;
      }
      localStorage.setItem("token", data.token);
      onLoginSucces();
    } catch {
      setError("Impossible de contacter le service de connexion.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-layout">
      <h1>ApplyFlow</h1>
      <p>Toutes vos candidatures, au même endroit.</p>
      <section className="auth-card">
        <h2>Connexion</h2>
        {error && <p role="alert">{error}</p>}
        <form onSubmit={handleSubmit}>
          <label htmlFor="login-email">Adresse email</label>
          <input id="login-email" type="email" autoComplete="username" required disabled={isSubmitting} value={email} onChange={e => setEmail(e.target.value)} />
          <label htmlFor="login-password">Mot de passe</label>
          <input id="login-password" type="password" autoComplete="current-password" required disabled={isSubmitting} value={password} onChange={e => setPassword(e.target.value)} />
          <button type="submit" disabled={isSubmitting}>{isSubmitting ? "Connexion…" : "Se connecter"}</button>
        </form>
        <p>Pas encore de compte ? <Link to="/register">Créer un compte</Link></p>
      </section>
    </main>
  );
}

export default Login;
