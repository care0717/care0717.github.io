import type { List } from 'mdast';
import { NodesRenderer } from '../NodesRenderer';

export function ListNode({ node }: { node: List }) {
  const Tag = node.ordered ? 'ol' : 'ul';
  return (
    <Tag>
      <NodesRenderer nodes={node.children} />
    </Tag>
  );
}
