interface ContactProps {
  dict?: {
    title: string;
    subtitle: string;
    email: string;
    message: string;
    send: string;
    placeholders: {
      email: string;
      message: string;
    };
  };
}

export default function Contact({ dict }: ContactProps) {
  if (!dict) return null;

  return (
    <section id="contact" className="py-28 px-4 bg-[#050505]">
      <div className="max-w-xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-white mb-4">{dict.title}</h2>
          <p className="text-white/40">{dict.subtitle}</p>
        </div>
        
        <div className="space-y-4 bg-[#0A0A0A] p-8 rounded-[32px] border border-white/5">
          <div>
             <label className="block text-xs uppercase tracking-wider text-white/40 mb-2 ml-4">{dict.email}</label>
             <input 
              type="email" 
              placeholder={dict.placeholders.email}
              className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-white/40 mb-2 ml-4">{dict.message}</label>
            <textarea 
              rows={4}
              placeholder={dict.placeholders.message}
              className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all resize-none"
            />
          </div>
          <button className="w-full py-4 rounded-full bg-white text-black font-bold hover:bg-gray-200 transition-colors mt-4">
            {dict.send}
          </button>
        </div>
      </div>
    </section>
  );
}
