import { useParams, Link } from 'react-router';
import { useState, useEffect } from 'react';
import { getPostBySlug, type PostMeta } from '../lib/posts';
import { parseMarkdown } from '../lib/markdown';
import { NodesRenderer } from '../components/markdown/NodesRenderer';
import type { Root } from 'mdast';

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
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <p>読み込み中...</p>
      </div>
    );
  }

  if (!post || !mdast) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        <Link to="/blog">← Blog</Link>
        <p>記事が見つかりませんでした</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <Link to="/blog">← Blog</Link>

      <article style={{ marginTop: '2rem' }}>
        <header>
          <h1>{post.title}</h1>
          <time>{post.date}</time>
        </header>

        <div style={{ marginTop: '2rem' }}>
          <NodesRenderer nodes={mdast.children} />
        </div>
      </article>
    </div>
  );
}
