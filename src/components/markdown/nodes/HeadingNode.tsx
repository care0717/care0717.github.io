import type { Heading } from 'mdast';
import { NodesRenderer } from '../NodesRenderer';

export function HeadingNode({ node }: { node: Heading }) {
  const Tag = `h${node.depth}` as const;
  return (
    <Tag>
      <NodesRenderer nodes={node.children} />
    </Tag>
  );
}
