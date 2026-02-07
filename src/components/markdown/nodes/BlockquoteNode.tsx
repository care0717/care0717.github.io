import type { Blockquote } from 'mdast';
import { NodesRenderer } from '../NodesRenderer';

export function BlockquoteNode({ node }: { node: Blockquote }) {
  return (
    <blockquote>
      <NodesRenderer nodes={node.children} />
    </blockquote>
  );
}
