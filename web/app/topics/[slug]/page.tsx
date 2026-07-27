import { getTopicPosts } from "../../../lib/api";

export default async function TopicPage({ params }: { params: { slug: string } }) {
  try {
    const posts = await getTopicPosts(params.slug);

    return (
      <div>
        <a className="back-link" href="/">← Alle Topics</a>
        <h1>{params.slug}</h1>
        {posts.length === 0 && <p>Noch keine Beiträge in diesem Topic.</p>}
        {posts.map((post) => (
          <article className="post" key={post.id}>
            <div className="meta">
              {post.author.displayName ?? post.author.username} ·{" "}
              {new Date(post.createdAt).toLocaleString("de-DE")}
            </div>
            <p>{post.content}</p>
          </article>
        ))}
      </div>
    );
  } catch {
    return <p className="error">Beiträge konnten nicht geladen werden.</p>;
  }
}
