import type { Text } from 'mdast';

export function TextNode({ node }: { node: Text }) {
  return <>{node.value}</>;
}
