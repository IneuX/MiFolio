import Hero from "@/components/Hero";
import PortfolioGrid from "@/components/PortfolioGrid";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { DICTIONARY } from "@/constants";

// 生成静态路由参数
export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "zh" }];
}

export default function Home({ params }: { params: { lang: string } }) {
  const lang = params.lang === "zh" ? "zh" : "en";
  const dict = DICTIONARY[lang];

  return (
    <main className="min-h-screen bg-black selection:bg-white/20">
      <Hero dict={dict.hero} />
      <PortfolioGrid dict={dict.portfolio} />
      <Contact dict={dict.contact} />
      <Footer dict={dict.footer} />
    </main>
  );
}
