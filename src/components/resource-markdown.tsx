import Markdown, { type Components } from "react-markdown";
import remarkBreaks from "remark-breaks";
import remarkGfm from "remark-gfm";

import { cn } from "@/lib/utils";
import { getSafeHttpUrl } from "@/utils/http-url";

const allowedElements = [
  "p",
  "strong",
  "em",
  "del",
  "ul",
  "ol",
  "li",
  "blockquote",
  "code",
  "a",
  "br",
] as const;

const components: Components = {
  p: ({ children }) => (
    <p className="my-2 first:mt-0 last:mb-0">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-bold text-brand-navy">{children}</strong>
  ),
  em: ({ children }) => <em className="italic">{children}</em>,
  del: ({ children }) => <del className="line-through">{children}</del>,
  ul: ({ children }) => (
    <ul className="my-2 list-disc space-y-1 pl-5">{children}</ul>
  ),
  ol: ({ children, start }) => (
    <ol start={start} className="my-2 list-decimal space-y-1 pl-5">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-0.5">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-2 border-l-2 border-brand-blue/40 pl-3 italic text-brand-slate">
      {children}
    </blockquote>
  ),
  code: ({ children }) => (
    <code className="rounded bg-brand-pale px-1.5 py-0.5 font-mono text-[0.9em] text-brand-navy">
      {children}
    </code>
  ),
  a: ({ children, href }) => {
    const safeUrl = getSafeHttpUrl(href);
    if (!safeUrl) return <span>{children}</span>;

    return (
      <a
        href={safeUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-bold text-brand-blue underline decoration-brand-blue/40 underline-offset-2 hover:decoration-brand-blue"
      >
        {children}
      </a>
    );
  },
};

interface ResourceMarkdownProps {
  children: string;
  className?: string;
}

export const ResourceMarkdown = ({
  children,
  className,
}: ResourceMarkdownProps) => (
  <div className={cn("break-words", className)}>
    <Markdown
      remarkPlugins={[remarkGfm, remarkBreaks]}
      allowedElements={[...allowedElements]}
      unwrapDisallowed
      components={components}
    >
      {children}
    </Markdown>
  </div>
);
