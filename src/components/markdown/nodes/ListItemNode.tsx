import type { ListItem } from 'mdast';
import { NodesRenderer } from '../NodesRenderer';

export function ListItemNode({ node }: { node: ListItem }) {
  return (
    <li>
      <NodesRenderer nodes={node.children} />
    </li>
  );
}
