import { extractFrontmatter } from './markdown';

export interface PostMeta {
  slug: string;
  title: string;
  date: string;
  layout?: string;
  content: string;
}

/**
 * すべての記事を取得
 */
export async function getAllPosts(): Promise<PostMeta[]> {
  // Viteのglob importで全てのMarkdownファイルを取得
  const modules = import.meta.glob<string>('/src/posts/*.md', {
    query: '?raw',
    import: 'default',
  });

  const posts: PostMeta[] = [];

  for (const [path, loader] of Object.entries(modules)) {
    const content = await loader();
    const frontmatter = extractFrontmatter(content);

    // ファイル名からslugを抽出 (例: 2022-01-01-title.md -> 2022-01-01-title)
    const filename = path.split('/').pop() || '';
    const slug = filename.replace(/\.md$/, '');

    // ファイル名から日付を抽出 (例: 2022-01-01-title.md -> 2022-01-01)
    const dateMatch = filename.match(/^(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch ? dateMatch[1] : frontmatter.date || '';

    posts.push({
      slug,
      title: frontmatter.title || slug,
      date,
      layout: frontmatter.layout,
      content,
    });
  }

  // 日付の新しい順にソート
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

/**
 * 特定の記事を取得
 */
export async function getPostBySlug(slug: string): Promise<PostMeta | null> {
  try {
    const content = await import(`../posts/${slug}.md?raw`);
    const frontmatter = extractFrontmatter(content.default);

    // ファイル名から日付を抽出
    const dateMatch = slug.match(/^(\d{4}-\d{2}-\d{2})/);
    const date = dateMatch ? dateMatch[1] : frontmatter.date || '';

    return {
      slug,
      title: frontmatter.title || slug,
      date,
      layout: frontmatter.layout,
      content: content.default,
    };
  } catch (error) {
    console.error(`Failed to load post: ${slug}`, error);
    return null;
  }
}
