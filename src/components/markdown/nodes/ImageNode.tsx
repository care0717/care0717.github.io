import type { Image } from 'mdast';

export function ImageNode({ node }: { node: Image }) {
  return <img src={node.url} alt={node.alt || ''} title={node.title || undefined} />;
}
