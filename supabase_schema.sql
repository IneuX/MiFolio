-- Supabase 博客系统数据库表结构
-- 在 Supabase SQL 编辑器中运行此脚本

-- 创建博客文章表
CREATE TABLE IF NOT EXISTS blog_posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published')),
  tags TEXT[] DEFAULT '{}',
  category TEXT DEFAULT '',
  visibility TEXT NOT NULL CHECK (visibility IN ('public', 'private')) DEFAULT 'public',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_created_at ON blog_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);

-- 启用行级安全 (RLS)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- 创建策略：任何人都可以读取已发布的公开文章
CREATE POLICY "任何人都可以读取已发布的公开文章" ON blog_posts
  FOR SELECT USING (
    status = 'published' AND visibility = 'public'
  );

-- 创建策略：管理员可以执行所有操作（需要配置管理员角色）
-- 注意：这只是一个示例策略，实际使用时需要根据你的认证系统调整
CREATE POLICY "管理员可以执行所有操作" ON blog_posts
  FOR ALL USING (true) WITH CHECK (true);

-- 创建更新时间的触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_blog_posts_updated_at 
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 创建生成 slug 的函数
CREATE OR REPLACE FUNCTION generate_slug(title TEXT)
RETURNS TEXT AS $$
DECLARE
  slug TEXT;
BEGIN
  -- 转换为小写，保留中文、字母、数字、连字符和空格
  slug := LOWER(title);
  slug := REGEXP_REPLACE(slug, '[^\w\s\u4e00-\u9fa5-]', '', 'g');
  slug := REGEXP_REPLACE(slug, '\s+', '-', 'g');
  slug := REGEXP_REPLACE(slug, '-+', '-', 'g');
  slug := TRIM(BOTH '-' FROM slug);
  
  -- 如果 slug 为空，生成一个基于时间的 slug
  IF slug = '' THEN
    slug := 'post-' || EXTRACT(EPOCH FROM NOW())::INT;
  END IF;
  
  RETURN LEFT(slug, 100);
END;
$$ LANGUAGE plpgsql;