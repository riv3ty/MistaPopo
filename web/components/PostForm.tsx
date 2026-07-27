"use client";

import { useEffect, useState, type FormEvent } from "react";
import { createPost, getCurrentUser } from "../lib/api";

export default function PostForm({ slug }: { slug: string }) {
  const [loggedIn, setLoggedIn] = useState(false);
  const [content, setContent] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getCurrentUser().then((u) => setLoggedIn(u !== null));
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    try {
      await createPost(slug, content);
      setContent("");
      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Beitrag konnte nicht erstellt werden");
    }
  }

  if (!loggedIn) {
    return (
      <p>
        <a href="/login">Anmelden</a>, um hier einen Beitrag zu schreiben.
      </p>
    );
  }

  return (
    <form className="post-form" onSubmit={handleSubmit}>
      {error && <p className="error">{error}</p>}
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Was gibt's Neues?"
        required
      />
      <button type="submit">Posten</button>
    </form>
  );
}
