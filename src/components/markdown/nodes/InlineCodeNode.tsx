import type { InlineCode } from 'mdast';

export function InlineCodeNode({ node }: { node: InlineCode }) {
  return <code>{node.value}</code>;
}
