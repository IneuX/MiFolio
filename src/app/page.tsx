import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PortfolioGrid from "@/components/PortfolioGrid";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { DICTIONARY } from "@/constants";

export default function Home() {
  // 默认渲染英文版
  const dict = DICTIONARY.en;

  return (
    <main className="min-h-screen bg-black selection:bg-white/20">
      <Navbar lang="en" dict={dict.nav} />
      <Hero dict={dict.hero} />
      <PortfolioGrid dict={dict.portfolio} />
      <Contact dict={dict.contact} />
      <Footer dict={dict.footer} />
    </main>
  );
}
