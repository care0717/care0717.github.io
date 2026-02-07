import type { RootContent } from 'mdast';
import { TextNode } from './nodes/TextNode';
import { ParagraphNode } from './nodes/ParagraphNode';
import { HeadingNode } from './nodes/HeadingNode';
import { LinkNode } from './nodes/LinkNode';
import { ListNode } from './nodes/ListNode';
import { ListItemNode } from './nodes/ListItemNode';
import { CodeNode } from './nodes/CodeNode';
import { InlineCodeNode } from './nodes/InlineCodeNode';
import { BlockquoteNode } from './nodes/BlockquoteNode';
import { StrongNode } from './nodes/StrongNode';
import { EmphasisNode } from './nodes/EmphasisNode';
import { ThematicBreakNode } from './nodes/ThematicBreakNode';
import { ImageNode } from './nodes/ImageNode';

export function NodesRenderer({ nodes }: { nodes: RootContent[] }) {
  return (
    <>
      {nodes.map((node, index) => {
        switch (node.type) {
          case 'text':
            return <TextNode key={index} node={node} />;
          case 'paragraph':
            return <ParagraphNode key={index} node={node} />;
          case 'heading':
            return <HeadingNode key={index} node={node} />;
          case 'link':
            return <LinkNode key={index} node={node} />;
          case 'list':
            return <ListNode key={index} node={node} />;
          case 'listItem':
            return <ListItemNode key={index} node={node} />;
          case 'code':
            return <CodeNode key={index} node={node} />;
          case 'inlineCode':
            return <InlineCodeNode key={index} node={node} />;
          case 'blockquote':
            return <BlockquoteNode key={index} node={node} />;
          case 'strong':
            return <StrongNode key={index} node={node} />;
          case 'emphasis':
            return <EmphasisNode key={index} node={node} />;
          case 'thematicBreak':
            return <ThematicBreakNode key={index} />;
          case 'image':
            return <ImageNode key={index} node={node} />;
          case 'break':
            return <br key={index} />;
          default:
            console.warn('Unsupported node type:', node);
            return null;
        }
      })}
    </>
  );
}
