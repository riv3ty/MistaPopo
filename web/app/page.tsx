import { getTopics } from "../lib/api";

export default async function HomePage() {
  try {
    const topics = await getTopics();

    if (topics.length === 0) {
      return <p>Noch keine Topics vorhanden. Lege welche im Backend an.</p>;
    }

    return (
      <ul className="topic-list">
        {topics.map((topic) => (
          <li key={topic.id}>
            <a className="topic-card" href={`/topics/${topic.slug}`}>
              <h2>{topic.name}</h2>
              {topic.description && <p>{topic.description}</p>}
            </a>
          </li>
        ))}
      </ul>
    );
  } catch {
    return (
      <p className="error">
        Backend nicht erreichbar. Läuft der Server unter der in
        <code> NEXT_PUBLIC_API_URL</code> hinterlegten Adresse?
      </p>
    );
  }
}
