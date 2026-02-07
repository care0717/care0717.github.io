import type { Paragraph } from 'mdast';
import { NodesRenderer } from '../NodesRenderer';

export function ParagraphNode({ node }: { node: Paragraph }) {
  return (
    <p>
      <NodesRenderer nodes={node.children} />
    </p>
  );
}
