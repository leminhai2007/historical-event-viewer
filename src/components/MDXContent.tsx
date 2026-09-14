"use client";

import { MDXRemote, MDXRemoteSerializeResult } from "next-mdx-remote";
import { basePath, contentUrl } from "@/lib/paths";

function resolveImageSrc(src: string): string {
  if (/^(https?:)?\/\//i.test(src)) return src;
  if (src.startsWith("/")) return `${basePath}${src}`;
  const normalized = src.startsWith("images/") ? src.slice("images/".length) : src;
  return contentUrl(`images/${normalized}`);
}

function buildMdxComponents() {
return {
  img: ({ src, alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => {
    const resolvedSrc = resolveImageSrc(typeof src === "string" ? src : "");
    return (
      <figure className="my-6">
        <img
          src={resolvedSrc}
          alt={alt || ""}
          className="rounded-lg max-w-full h-auto"
          {...props}
        />
        {alt && (
          <figcaption className="mt-2 text-center text-sm text-gray-500 italic">
            {alt}
          </figcaption>
        )}
      </figure>
    );
  },
  h1: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h1 className="text-2xl font-bold text-gray-900 mt-6 mb-4" {...props}>
      {children}
    </h1>
  ),
  h2: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 className="text-xl font-semibold text-gray-900 mt-5 mb-3" {...props}>
      {children}
    </h2>
  ),
  h3: ({ children, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 className="text-lg font-semibold text-gray-900 mt-4 mb-2" {...props}>
      {children}
    </h3>
  ),
  p: ({ children, ...props }: React.HTMLAttributes<HTMLParagraphElement>) => (
    <p className="text-gray-700 leading-relaxed mb-4" {...props}>
      {children}
    </p>
  ),
  ul: ({ children, ...props }: React.HTMLAttributes<HTMLUListElement>) => (
    <ul className="list-disc list-inside text-gray-700 mb-4 space-y-1" {...props}>
      {children}
    </ul>
  ),
  ol: ({ children, ...props }: React.HTMLAttributes<HTMLOListElement>) => (
    <ol className="list-decimal list-inside text-gray-700 mb-4 space-y-1" {...props}>
      {children}
    </ol>
  ),
  a: ({ children, href, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} className="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  ),
  blockquote: ({ children, ...props }: React.HTMLAttributes<HTMLQuoteElement>) => (
    <blockquote className="border-l-4 border-blue-300 pl-4 italic text-gray-600 my-4" {...props}>
      {children}
    </blockquote>
  ),
  code: ({ children, ...props }: React.HTMLAttributes<HTMLElement>) => (
    <code className="bg-gray-100 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
      {children}
    </code>
  ),
  pre: ({ children, ...props }: React.HTMLAttributes<HTMLPreElement>) => (
    <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4" {...props}>
      {children}
    </pre>
  ),
};
}

export default function MDXContent({
  serialized,
}: {
  serialized: MDXRemoteSerializeResult;
}) {
  return <MDXRemote {...serialized} components={buildMdxComponents()} />;
}
