"use client";

import { useEffect, useState } from "react";
import { getCurrentUser, logout, type CurrentUser } from "../lib/api";

export default function AuthStatus() {
  const [user, setUser] = useState<CurrentUser | null | "loading">("loading");

  useEffect(() => {
    getCurrentUser().then(setUser);
  }, []);

  if (user === "loading") return null;

  if (!user) {
    return (
      <nav className="auth-status">
        <a href="/login">Anmelden</a>
        <a href="/register">Registrieren</a>
      </nav>
    );
  }

  return (
    <nav className="auth-status">
      <span>Angemeldet als {user.displayName ?? user.username}</span>
      <button
        onClick={async () => {
          await logout();
          window.location.reload();
        }}
      >
        Abmelden
      </button>
    </nav>
  );
}
