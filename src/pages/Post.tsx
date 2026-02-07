import { useParams } from 'react-router';
import { useState, useEffect } from 'react';
import { getPostBySlug, type PostMeta } from '../lib/posts';
import { parseMarkdown } from '../lib/markdown';
import { NodesRenderer } from '../components/markdown/NodesRenderer';
import { Layout } from '../components/Layout';
import type { Root } from 'mdast';
import './Post.css';

export default function Post() {
  const { slug } = useParams();
  const [post, setPost] = useState<PostMeta | null>(null);
  const [mdast, setMdast] = useState<Root | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;

    getPostBySlug(slug).then(async (postData) => {
      if (postData) {
        setPost(postData);
        const ast = await parseMarkdown(postData.content);
        setMdast(ast);
      }
      setLoading(false);
    });
  }, [slug]);

  if (loading) {
    return (
      <Layout>
        <p className="loading">読み込み中...</p>
      </Layout>
    );
  }

  if (!post || !mdast) {
    return (
      <Layout>
        <div className="not-found">
          <p>記事が見つかりませんでした</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="post">
        <header className="post-header">
          <h1 className="post-title">{post.title}</h1>
          <time className="post-meta-date">{post.date}</time>
        </header>

        <div className="post-content">
          <NodesRenderer nodes={mdast.children} />
        </div>
      </article>
    </Layout>
  );
}
