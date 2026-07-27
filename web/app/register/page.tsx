"use client";

import { useState, type FormEvent } from "react";
import { register } from "../../lib/api";

export default function RegisterPage() {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await register(username, password, displayName || undefined);
      window.location.href = "/";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registrierung fehlgeschlagen");
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <h1>Registrieren</h1>
      {error && <p className="error">{error}</p>}
      <label>
        Benutzername
        <input value={username} onChange={(e) => setUsername(e.target.value)} required />
      </label>
      <label>
        Anzeigename (optional)
        <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
      </label>
      <label>
        Passwort (mind. 8 Zeichen)
        <input
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </label>
      <button type="submit">Konto erstellen</button>
      <p>Schon registriert? <a href="/login">Anmelden</a></p>
    </form>
  );
}
