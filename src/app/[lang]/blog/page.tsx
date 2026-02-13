import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DICTIONARY } from "@/constants";
import Link from "next/link";
import { Calendar, Clock, ArrowRight, Plus } from "lucide-react";
import { getBlogPosts } from "@/app/actions/blog-fixed";

// 生成静态路由参数
export function generateStaticParams() {
  return [{ lang: "en" }, { lang: "zh" }];
}

interface BlogPageProps {
  params: { lang: string };
}

export default async function BlogPage({ params }: BlogPageProps) {
  const lang = params.lang === "zh" ? "zh" : "en";
  const dict = DICTIONARY[lang];
  
  // 从 Supabase 获取已发布的博客文章
  const result = await getBlogPosts('published');
  const blogPosts = result.success ? result.data || [] : [];

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return lang === "zh" 
      ? date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' })
      : date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // 计算阅读时间
  const calculateReadTime = (content: string) => {
    const words = content.trim().split(/\s+/).length;
    const minutes = Math.ceil(words / 200); // 假设每分钟阅读200个单词
    return lang === "zh" ? `${minutes} 分钟阅读` : `${minutes} min read`;
  };

  return (
    <main className="min-h-screen bg-black selection:bg-white/20">
      <Navbar lang={lang} dict={dict.nav} />
      
      <div className="pt-32 pb-20 px-4 md:px-8 max-w-6xl mx-auto">
        {/* 页面标题 */}
        <div className="mb-16">
          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            {lang === "zh" ? "博客" : "Blog"}
          </h1>
          <p className="text-xl text-white/60 max-w-2xl">
            {lang === "zh" 
              ? "关于设计、开发和产品管理的思考、想法和见解。"
              : "Thoughts, ideas, and insights on design, development, and product management."
            }
          </p>
        </div>

        {/* 博客文章列表 */}
        <div className="space-y-8">
          {blogPosts.length > 0 ? (
            blogPosts.map((post) => (
              <article
                key={post.id}
                className="group relative p-8 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/30 transition-all duration-500 hover:scale-[1.02]"
              >
                <Link href={`/${lang}/blog/${post.slug}`}>
                  <div className="space-y-4">
                    {/* 分类标签 */}
                    <div className="flex items-center gap-3">
                      {post.category && (
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80">
                          {post.category}
                        </span>
                      )}
                      <div className="flex items-center gap-4 text-sm text-white/40">
                        <span className="flex items-center gap-1">
                          <Calendar size={14} />
                          {formatDate(post.created_at)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {calculateReadTime(post.content)}
                        </span>
                      </div>
                    </div>

                    {/* 文章标题和摘要 */}
                    <div>
                      <h2 className="text-2xl md:text-3xl font-bold mb-3 group-hover:text-white transition-colors">
                        {post.title}
                      </h2>
                      <p className="text-white/60 leading-relaxed line-clamp-2">
                        {post.content.substring(0, 200)}...
                      </p>
                    </div>

                    {/* 标签 */}
                    {post.tags && post.tags.length > 0 && (
                      <div className="flex flex-wrap gap-2 pt-4">
                        {post.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/60"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* 阅读更多 */}
                    <div className="pt-4">
                      <span className="inline-flex items-center gap-2 text-sm font-medium text-white/80 group-hover:text-white transition-colors">
                        {lang === "zh" ? "阅读更多" : "Read more"}
                        <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </span>
                    </div>
                  </div>
                </Link>
              </article>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="text-white/40 mb-4">
                <Calendar size={48} className="mx-auto" />
              </div>
              <h3 className="text-xl font-medium text-white/60 mb-2">
                {lang === "zh" ? "暂无博客文章" : "No blog posts yet"}
              </h3>
              <p className="text-white/40">
                {lang === "zh" 
                  ? "更多精彩内容即将呈现。"
                  : "More content coming soon."
                }
              </p>
            </div>
          )}
        </div>
      </div>
      
      <Footer dict={dict.footer} />
    </main>
  );
}