interface HeroProps {
  dict?: {
    name: string;
    tagline: string;
    description: string;
    cta: {
      primary: string;
      secondary: string;
    };
  };
}

export default function Hero({ dict }: HeroProps) {
  if (!dict) return null;
  
  return (
    <section className="relative h-screen w-full flex flex-col items-center justify-center overflow-hidden">
      {/* Background with mask */}
      <div className="absolute inset-0 bg-[url('/images/hero-bg.jpg')] bg-cover bg-center opacity-80">
        <div className="absolute inset-0 bg-black/50" />
      </div>
      
      {/* Radial gradient for extra immersion */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black pointer-events-none" />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center text-center px-4 max-w-5xl mx-auto space-y-8 animate-in fade-in zoom-in duration-1000">
        <h1 className="text-6xl md:text-8xl font-bold tracking-tight text-white drop-shadow-lg">
          {dict.name}
        </h1>
        <p className="text-lg md:text-xl text-white/70 max-w-2xl font-light tracking-wide">
          {dict.tagline}
        </p>
        <div className="flex gap-4 pt-8">
          <button className="px-8 py-3 rounded-full bg-white text-black font-medium hover:bg-gray-200 transition-colors hover:scale-105 transform duration-200">
            {dict.cta.primary}
          </button>
          <button className="px-8 py-3 rounded-full border border-white/20 bg-white/5 backdrop-blur-sm text-white hover:bg-white/10 transition-all hover:scale-105 transform duration-200">
            {dict.cta.secondary}
          </button>
        </div>
      </div>
    </section>
  );
}
