import Navbar from "@/components/Navbar";
import BlogEditor from "@/components/BlogEditor";
import Footer from "@/components/Footer";
import { DICTIONARY } from "@/constants";

// 生成静态路由参数
export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "zh" }];
}

interface NewBlogPageProps {
  params: { lang: string };
}

export default function NewBlogPage({ params }: NewBlogPageProps) {
  const lang = params.lang === "zh" ? "zh" : "en";
  const dict = DICTIONARY[lang];

  return (
    <main className="min-h-screen bg-black selection:bg-white/20">
      <Navbar lang={lang} dict={dict.nav} />
      <BlogEditor dict={dict.blog} />
      <Footer dict={dict.footer} />
    </main>
  );
}