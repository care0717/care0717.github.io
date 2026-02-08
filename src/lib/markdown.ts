import { remark } from 'remark';
import remarkFrontmatter from 'remark-frontmatter';
import remarkGfm from 'remark-gfm';
import type { Root } from 'mdast';

// remarkプロセッサーを作成
const processor = remark()
  .use(remarkFrontmatter, ['yaml'])
  .use(remarkGfm);

/**
 * Markdownテキストをmdast（抽象構文木）に変換
 */
export async function parseMarkdown(markdown: string): Promise<Root> {
  const parsed = processor.parse(markdown);
  const mdast = await processor.run(parsed);
  return mdast as Root;
}

/**
 * フロントマターを抽出
 */
export function extractFrontmatter(markdown: string): Record<string, string> {
  const frontmatterMatch = markdown.match(/^---\n([\s\S]*?)\n---/);
  if (!frontmatterMatch) return {};

  const frontmatter: Record<string, string> = {};
  const lines = frontmatterMatch[1].split('\n');

  for (const line of lines) {
    const match = line.match(/^(\w+):\s*(.+)$/);
    if (match) {
      const [, key, value] = match;
      // 引用符を削除
      frontmatter[key] = value.replace(/^["']|["']$/g, '');
    }
  }

  return frontmatter;
}
