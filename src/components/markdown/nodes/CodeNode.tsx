import type { Code } from 'mdast';

export function CodeNode({ node }: { node: Code }) {
  return (
    <pre>
      <code className={node.lang ? `language-${node.lang}` : undefined}>
        {node.value}
      </code>
    </pre>
  );
}
