import { Link } from 'react-router';
import { useState, useEffect } from 'react';
import { getAllPosts, type PostMeta } from '../lib/posts';
import { Layout } from '../components/Layout';
import './Home.css';

export default function Home() {
  const [recentPosts, setRecentPosts] = useState<PostMeta[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllPosts().then((allPosts) => {
      setRecentPosts(allPosts.slice(0, 3));
      setLoading(false);
    });
  }, []);

  return (
    <Layout>
      <div className="home">
        <section className="hero">
          <h1 className="hero-title">care0717</h1>
          <p className="hero-subtitle">エンジニア / Tride Tech</p>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>最新記事</h2>
            <Link to="/blog" className="view-all">すべて見る →</Link>
          </div>
          {loading ? (
            <p className="loading">読み込み中...</p>
          ) : (
            <div className="post-list">
              {recentPosts.map((post) => (
                <article key={post.slug} className="post-card">
                  <Link to={`/blog/${post.slug}`} className="post-title">
                    {post.title}
                  </Link>
                  <time className="post-date">{post.date}</time>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="section">
          <div className="section-header">
            <h2>サンドボックス</h2>
            <Link to="/sandbox" className="view-all">すべて見る →</Link>
          </div>
          <p className="section-description">
            個人プロジェクトや実験的なツールを公開しています
          </p>
        </section>
      </div>
    </Layout>
  );
}
