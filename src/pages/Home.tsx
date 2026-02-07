import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { getAllPosts, type PostMeta } from '../lib/posts';

export default function Home() {
  const [recentPosts, setRecentPosts] = useState<PostMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPosts().then((allPosts) => {
      setRecentPosts(allPosts.slice(0, 3)); // 最新3件
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>care0717</h1>
      <p>エンジニア / Tride Tech</p>

      <section style={{ marginTop: '3rem' }}>
        <h2>最新記事</h2>
        {loading ? (
          <p>読み込み中...</p>
        ) : (
          <ul>
            {recentPosts.map((post) => (
              <li key={post.slug}>
                <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                <span style={{ marginLeft: '1rem', color: '#666', fontSize: '0.9rem' }}>
                  {post.date}
                </span>
              </li>
            ))}
          </ul>
        )}
        <Link to="/blog">→ すべての記事を見る</Link>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <h2>サンドボックス</h2>
        <Link to="/sandbox">→ すべて見る</Link>
      </section>

      <section style={{ marginTop: '3rem' }}>
        <Link to="/about">About</Link>
      </section>
    </div>
  );
}
