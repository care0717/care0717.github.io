import type { Strong } from 'mdast';
import { NodesRenderer } from '../NodesRenderer';

export function StrongNode({ node }: { node: Strong }) {
  return (
    <strong>
      <NodesRenderer nodes={node.children} />
    </strong>
  );
}
