interface PortfolioGridProps {
  dict?: {
    title: string;
    items: {
      title: string;
      description: string;
      link: string;
      image?: string;
    }[];
  };
}

export default function PortfolioGrid({ dict }: PortfolioGridProps) {
  if (!dict) return null;

  return (
    <section id="portfolio" className="py-28 px-4 bg-black">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-4xl font-bold text-white mb-16 text-center">{dict.title}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dict.items.map((item, index) => (
            <a 
              key={index}
              href={item.link}
              className="group relative block aspect-[3/4] rounded-[32px] overflow-hidden bg-[#0A0A0A] border border-white/10 hover:border-white/30 transition-all duration-500 hover:scale-[1.02]"
            >
              {/* Background Image */}
              {item.image && (
                <div className="absolute inset-0 z-0">
                  <div 
                    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                    style={{ backgroundImage: `url('${item.image}')` }}
                  />
                  {/* Overlay to ensure text readability */}
                  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/50 transition-colors duration-500" />
                </div>
              )}

              {/* Card Gradient Background (kept for non-image cards or extra effect) */}
              <div className={`absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 ${item.image ? 'mix-blend-overlay' : ''}`} />
              
              <div className="absolute inset-0 p-8 flex flex-col justify-end z-10">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                  <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-md">{item.title}</h3>
                  <p className="text-white/80 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 drop-shadow-md font-medium">
                    {item.description}
                  </p>
                </div>
              </div>
              
              {/* Arrow Icon */}
              <div className="absolute top-8 right-8 text-white/60 group-hover:text-white group-hover:rotate-45 transition-all duration-500 z-10 drop-shadow-md">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7" />
                  <path d="M7 7h10v10" />
                </svg>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
