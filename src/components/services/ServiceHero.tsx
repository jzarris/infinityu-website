import Image from 'next/image';

interface ServiceHeroProps {
  category: string;
  headline: string;
  description: string;
  image?: { src: string; alt: string };
}

export function ServiceHero({
  category,
  headline,
  description,
  image,
}: ServiceHeroProps) {
  return (
    <section className="relative overflow-hidden gradient-primary">
      {image && (
        <>
          <Image
            src={image.src}
            alt={image.alt}
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-20"
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                'linear-gradient(180deg, rgba(58,27,48,0.5) 0%, rgba(58,27,48,0.65) 100%)',
            }}
          />
        </>
      )}
      <div className="container-custom relative z-10 py-20 text-center">
        <p className="text-accent font-medium tracking-wider uppercase text-sm mb-3">
          {category}
        </p>
        <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-6">
          {headline}
        </h1>
        <p className="text-white/80 text-lg max-w-2xl mx-auto">{description}</p>
      </div>
    </section>
  );
}
