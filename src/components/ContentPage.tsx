import type { ReactNode } from "react";

interface ContentPageProps {
  children: ReactNode;
}

export default function ContentPage({ children }: ContentPageProps) {
  return (
    <article className="max-w-3xl mx-auto px-4 py-10">
      <div className="prose prose-lg prose-slate max-w-none prose-headings:font-serif prose-headings:text-primary prose-a:text-primary-light prose-a:underline hover:prose-a:text-accent prose-blockquote:border-accent prose-blockquote:text-warm-gray">
        {children}
      </div>
    </article>
  );
}
