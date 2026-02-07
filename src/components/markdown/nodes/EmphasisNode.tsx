import type { Emphasis } from 'mdast';
import { NodesRenderer } from '../NodesRenderer';

export function EmphasisNode({ node }: { node: Emphasis }) {
  return (
    <em>
      <NodesRenderer nodes={node.children} />
    </em>
  );
}
