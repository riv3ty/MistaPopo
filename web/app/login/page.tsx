"use client";

import { useState, type FormEvent } from "react";
import { login } from "../../lib/api";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await login(username, password);
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Anmeldung fehlgeschlagen");
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h1>Anmelden</h1>
      {error && <p className="error">{error}</p>}
      <label>
        Benutzername
        <input value={username} onChange={(e) => setUsername(e.target.value)} required />
      </label>
      <label>
        Passwort
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      <button type="submit">Anmelden</button>
      <p>Noch kein Konto? <a href="/register">Registrieren</a></p>
    </form>
  );
}
