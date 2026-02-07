import type { Link } from 'mdast';
import { NodesRenderer } from '../NodesRenderer';

export function LinkNode({ node }: { node: Link }) {
  return (
    <a href={node.url} title={node.title || undefined}>
      <NodesRenderer nodes={node.children} />
    </a>
  );
}
