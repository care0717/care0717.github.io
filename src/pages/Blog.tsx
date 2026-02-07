import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { getAllPosts, type PostMeta } from '../lib/posts';
import { Layout } from '../components/Layout';
import './Blog.css';

export default function Blog() {
  const [posts, setPosts] = useState<PostMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPosts().then((allPosts) => {
      setPosts(allPosts);
      setLoading(false);
    });
  }, []);

  const postsByYear = posts.reduce((acc, post) => {
    const year = post.date.split('-')[0] || 'Unknown';
    if (!acc[year]) acc[year] = [];
    acc[year].push(post);
    return acc;
  }, {} as Record<string, PostMeta[]>);

  return (
    <Layout>
      <div className="blog">
        <header className="page-header">
          <h1>Blog</h1>
          <p className="page-description">技術や読書の記録</p>
        </header>

        {loading ? (
          <p className="loading">読み込み中...</p>
        ) : (
          <div className="years">
            {Object.entries(postsByYear)
              .sort(([a], [b]) => b.localeCompare(a))
              .map(([year, yearPosts]) => (
                <section key={year} className="year-section">
                  <h2 className="year-title">{year}</h2>
                  <div className="year-posts">
                    {yearPosts.map((post) => (
                      <article key={post.slug} className="blog-post-item">
                        <time className="blog-post-date">{post.date.slice(5)}</time>
                        <Link to={`/blog/${post.slug}`} className="blog-post-link">
                          {post.title}
                        </Link>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
