type PageHeroProps = {
  eyebrow?: string;
  title: string;
  description?: string;
};

export function PageHero({ eyebrow, title, description }: PageHeroProps) {
  return (
    <section className="border-b border-beige-200 bg-gradient-to-b from-beige-100/60 to-cream py-12 sm:py-16">
      <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
        {eyebrow && (
          <span className="mb-2 inline-block text-[10px] font-semibold uppercase tracking-[0.16em] text-gold">
            {eyebrow}
          </span>
        )}
        <h1 className="font-display text-3xl font-semibold text-charcoal sm:text-4xl lg:text-5xl">
          {title}
        </h1>
        {description && (
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-sage-600 sm:text-base">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
