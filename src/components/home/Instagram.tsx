const posts = [
  { src: "/images/instagram-chakki.webp", alt: "Overhead view of a stone mill chakki" },
  { src: "/images/instagram-hands.webp", alt: "Wheat grains pouring from a miller's hands" },
  { src: "/images/instagram-roti.webp", alt: "Stack of hot phulkas on a brass plate" },
  { src: "/images/instagram-still.webp", alt: "Still life of flour, wheat ears and brass" },
  { src: "/images/process-grind.webp", alt: "Close-up of millstones grinding wheat" },
  { src: "/images/roti-kitchen.webp", alt: "Rotis cooking on a traditional tawa" },
];

export function Instagram() {
  return (
    <section className="px-4 py-16">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-terracotta">@bharatiyachakki</p>
            <h2 className="mt-2 font-serif text-4xl">From the mill floor</h2>
          </div>
          <a
            href="https://instagram.com/bharatiyachakki"
            className="hidden text-sm text-terracotta hover:underline sm:inline"
            target="_blank"
            rel="noreferrer"
          >
            Follow on Instagram
          </a>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
          {posts.map((p) => (
            <a
              key={p.src}
              href="https://instagram.com/bharatiyachakki"
              target="_blank"
              rel="noreferrer"
              className="aspect-square overflow-hidden rounded-xl"
            >
              <img src={p.src} alt={p.alt} className="h-full w-full object-cover transition hover:scale-105" loading="lazy" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
