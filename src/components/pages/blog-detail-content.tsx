import Link from "next/link";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getBlogPost } from "@/lib/blogs";
import { BlogEditButton } from "@/components/admin/blog-edit-button";

type BlogDetailContentProps = {
  slug: string;
};

function formatDate(dateString?: string) {
  if (!dateString) return null;
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return null;
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return null;
  }
}

export async function BlogDetailContent({ slug }: BlogDetailContentProps) {
  const post = await getBlogPost(slug);

  if (!post || !post.published) {
    notFound();
  }

  const formattedDate = formatDate(post.createdAt);

  let htmlContent = post.content;
  if (post.content && post.content.startsWith('{') && post.content.includes('"blocks"')) {
    try {
      const parsed = JSON.parse(post.content);
      if (parsed.blocks) {
        htmlContent = parsed.blocks.map((b: any) => {
          if (b.type === 'header') return `<h${b.data.level || 2}>${b.data.text || ''}</h${b.data.level || 2}>`;
          if (b.type === 'list') {
            const tag = b.data.style === 'ordered' ? 'ol' : 'ul';
            const items = b.data.items.map((i: string) => `<li>${i}</li>`).join('');
            return `<${tag}>${items}</${tag}>`;
          }
          if (b.type === 'image') return `<img src="${b.data.file?.url}" alt="${b.data.caption || ''}" />`;
          if (b.type === 'quote') return `<blockquote>${b.data.text || ''}</blockquote>`;
          return `<p>${b.data?.text || ''}</p>`;
        }).join('');
      }
    } catch(e) {}
  }

  const renderMetadata = () => (
    <div className="pb-6 border-b border-[#EBE3DB] space-y-2.5">
      <p className="text-[10px] uppercase tracking-widest font-semibold text-charcoal/50">
        Written By <span className="text-charcoal font-semibold">{post.author}</span>
      </p>
      {formattedDate && (
        <p className="text-[10px] uppercase tracking-widest font-semibold text-charcoal/50">
          Published On <span className="text-charcoal font-semibold">{formattedDate.toUpperCase()}</span>
        </p>
      )}
      {post.tags && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {post.tags.split(',').map((tag) => {
            const trimmedTag = tag.trim();
            if (!trimmedTag) return null;
            return (
              <span key={trimmedTag} className="text-charcoal/50 text-[9px] uppercase tracking-widest font-medium px-2 py-1 rounded bg-[#FAF8F5] border border-[#EBE3DB]/60">
                {trimmedTag}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );

  return (
      <article className="pt-16 pb-8 sm:pt-20 sm:pb-10 bg-cream min-h-[calc(100vh-400px)]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            {post.category && (
              <span className="mb-4 inline-block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#8C6D40]">
                {post.category}
              </span>
            )}
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl text-charcoal mb-6 leading-tight italic">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-base sm:text-lg text-charcoal/80 max-w-2xl mx-auto leading-relaxed">
                {post.excerpt}
              </p>
            )}
          </div>
          {post.image ? (
            <div className="mb-6">
              <div className="relative aspect-[16/9] overflow-hidden rounded-xl mb-4">
                <Image
                  src={post.image}
                  alt={post.title}
                  fill
                  className="object-cover"
                  sizes="768px"
                  priority
                  unoptimized
                />
              </div>
              {renderMetadata()}
            </div>
          ) : (
            <div className="mb-8">
              {renderMetadata()}
            </div>
          )}

          <div 
            className="prose prose-sage max-w-none prose-p:text-base prose-p:leading-relaxed prose-p:text-charcoal/90 prose-p:mb-6 prose-headings:font-display prose-headings:italic prose-headings:text-charcoal prose-headings:mt-10 prose-headings:mb-4 prose-a:text-[#8C6D40] prose-a:no-underline hover:prose-a:underline prose-li:text-charcoal/90 prose-strong:text-charcoal prose-img:rounded-md prose-img:border prose-img:border-[#EBE3DB]"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
          
          <div className="mt-16 pt-8 border-t border-[#EBE3DB]">
            <Link
              href="/resources/blogs"
              className="inline-flex items-center text-[11px] uppercase tracking-widest font-semibold text-[#8C6D40] hover:text-[#B8955F] transition-colors"
            >
              ← Back to Journal
            </Link>
          </div>
        </div>
      <BlogEditButton />
    </article>
  );
}
