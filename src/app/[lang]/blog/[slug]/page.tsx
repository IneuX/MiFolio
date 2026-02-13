import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogActions from "@/components/BlogActions";
import { DICTIONARY } from "@/constants";
import Link from "next/link";
import { Calendar, Clock, ArrowLeft } from "lucide-react";
import { getBlogPostBySlug, getBlogPosts } from "@/app/actions/blog-fixed";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/cjs/styles/prism";
import { Metadata } from "next";

// 生成静态路由参数
export async function generateStaticParams() {
  const result = await getBlogPosts('published');
  
  if (!result.success || !result.data) {
    return [];
  }
  
  const posts = result.data;
  const languages = ['en', 'zh'];
  
  // 为每种语言生成所有文章的路径
  const params = [];
  for (const lang of languages) {
    for (const post of posts) {
      if (post.slug) {
        params.push({
          lang,
          slug: post.slug
        });
      }
    }
  }
  
  return params;
}

// 生成动态 Metadata
export async function generateMetadata({ params }: { params: { lang: string; slug: string } }): Promise<Metadata> {
  const result = await getBlogPostBySlug(params.slug);
  
  if (!result.success || !result.data) {
    return {
      title: params.lang === "zh" ? "文章未找到" : "Post Not Found",
      description: params.lang === "zh" ? "您要查找的文章不存在或已被删除。" : "The post you're looking for doesn't exist or has been deleted."
    };
  }
  
  const post = result.data;
  const title = post.title;
  const description = post.content?.substring(0, 160) || '';
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'article',
      publishedTime: post.created_at,
      modifiedTime: post.updated_at,
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  };
}

interface BlogPostPageProps {
  params: { 
    lang: string;
    slug: string;
  };
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const lang = params.lang === "zh" ? "zh" : "en";
  const dict = DICTIONARY[lang];
  
  // 从 Supabase 获取博客文章
  const result = await getBlogPostBySlug(params.slug);
  
  if (!result.success || !result.data) {
    return (
      <main className="min-h-screen bg-black selection:bg-white/20">
        <Navbar lang={lang} dict={dict.nav} />
        <div className="pt-32 pb-20 px-4 md:px-8 max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold mb-4">
            {lang === "zh" ? "文章未找到" : "Post Not Found"}
          </h1>
          <p className="text-white/60 mb-8">
            {lang === "zh" 
              ? "抱歉，您要查找的文章不存在或已被删除。"
              : "Sorry, the post you're looking for doesn't exist or has been deleted."
            }
          </p>
          <Link
            href={`/${lang}/blog`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-black bg-white hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft size={16} />
            <span>{lang === "zh" ? "返回博客列表" : "Back to Blog"}</span>
          </Link>
        </div>
        <Footer dict={dict.footer} />
      </main>
    );
  }

  const post = result.data;

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
    const minutes = Math.ceil(words / 200);
    return lang === "zh" ? `${minutes} 分钟阅读` : `${minutes} min read`;
  };

  return (
    <main className="min-h-screen bg-black selection:bg-white/20">
      <Navbar lang={lang} dict={dict.nav} />
      
      <div className="pt-32 pb-20 px-4 md:px-8 max-w-4xl mx-auto">
        {/* 返回按钮 */}
        <div className="mb-8">
          <Link
            href={`/${lang}/blog`}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
          >
            <ArrowLeft size={16} />
            <span>{lang === "zh" ? "返回博客" : "Back to Blog"}</span>
          </Link>
        </div>

        {/* 文章头部 */}
        <header className="mb-12">
          {/* 分类和元信息 */}
          <div className="flex items-center gap-4 mb-6">
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

          {/* 文章标题 */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            {post.title}
          </h1>

          {/* 标签 */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              {post.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-xs font-medium bg-white/5 text-white/60"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* 操作按钮 */}
          <BlogActions
            slug={post.slug}
            title={post.title}
            lang={lang as 'en' | 'zh'}
          />
        </header>

        {/* 文章内容 */}
        <article className="prose prose-invert max-w-none">
          <div className="bg-[#0A0A0A] rounded-2xl border border-white/10 p-8 md:p-12">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={{
                code({ node, className, children, ...props }: any) {
                  const match = /language-(\w+)/.exec(className || '');
                  const isInline = !className || !match;
                  
                  if (!isInline && match) {
                    return (
                      <SyntaxHighlighter
                        style={vscDarkPlus as any}
                        language={match[1]}
                        PreTag="div"
                        className="rounded-lg"
                        {...props}
                      >
                        {String(children).replace(/\n$/, '')}
                      </SyntaxHighlighter>
                    );
                  }
                  
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                },
              }}
            >
              {post.content}
            </ReactMarkdown>
          </div>
        </article>

        {/* 文章底部 */}
        <footer className="mt-16 pt-8 border-t border-white/10">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <p className="text-sm text-white/40 mb-2">
                {lang === "zh" ? "最后更新于" : "Last updated on"} {formatDate(post.updated_at)}
              </p>
              <p className="text-sm text-white/60">
                {lang === "zh" 
                  ? "文章状态：" + (post.status === 'published' ? "已发布" : "草稿")
                  : "Status: " + (post.status === 'published' ? "Published" : "Draft")
                }
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <Link
                href={`/${lang}/blog`}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-black bg-white hover:bg-gray-200 transition-colors"
              >
                <ArrowLeft size={16} />
                <span>{lang === "zh" ? "返回博客列表" : "Back to Blog"}</span>
              </Link>
            </div>
          </div>
        </footer>
      </div>
      
      <Footer dict={dict.footer} />
    </main>
  );
}