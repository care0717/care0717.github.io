import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { getAllPosts, type PostMeta } from '../lib/posts';

export default function Blog() {
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPosts().then((allPosts) => {
      setPosts(allPosts);
      setLoading(false);
    });
  }, []);

  // 年ごとにグループ化
  const postsByYear = posts.reduce((acc, post) => {
    const year = post.date.split('-')[0] || 'Unknown';
    if (!acc[year]) acc[year] = [];
    acc[year].push(post);
    return acc;
  }, {} as Record<string, PostMeta[]>);

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1>Blog</h1>
      <Link to="/">← Home</Link>

      <section style={{ marginTop: '2rem' }}>
        {loading ? (
          <p>読み込み中...</p>
        ) : (
          Object.entries(postsByYear)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([year, yearPosts]) => (
              <div key={year}>
                <h3>{year}</h3>
                <ul>
                  {yearPosts.map((post) => (
                    <li key={post.slug}>
                      <span>{post.date.slice(5)} » </span>
                      <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))
        )}
      </section>
    </div>
  );
}
