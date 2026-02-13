"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { 
  Send, 
  Save, 
  Eye, 
  EyeOff, 
  Settings, 
  Lock, 
  X,
  Hash,
  Folder,
  Globe,
  Shield
} from "lucide-react";
import { createBlogPost, saveBlogDraft, updateBlogPost } from "@/app/actions/blog-fixed";
import { useRouter } from "next/navigation";
import { BlogPost } from "@/lib/supabase";

interface BlogEditorProps {
  dict?: any;
  initialData?: BlogPost;
  mode?: 'create' | 'edit';
}

export default function BlogEditor({ dict, initialData, mode = 'create' }: BlogEditorProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [content, setContent] = useState(initialData?.content || "");
  const [showPreview, setShowPreview] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState({
    visibility: initialData?.visibility || "public",
    tags: initialData?.tags || [] as string[],
    category: initialData?.category || "",
    newTag: ""
  });

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // 自动调整 textarea 高度
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [content]);

  // 计算字数和字符数
  const wordCount = content.trim().split(/\s+/).filter(word => word.length > 0).length;
  const charCount = content.length;

  // 处理发布/更新
  const handlePublish = async () => {
    // 只有在创建新文章时才强制要求密码，编辑时如果是管理员已登录状态可能不需要（取决于需求）
    // 这里保持一致性，还是要求密码
    if (!password) {
      alert(dict?.passwordPlaceholder || "Please enter password");
      return;
    }

    if (!title.trim()) {
      alert("Title is required");
      return;
    }

    if (!content.trim()) {
      alert("Content is required");
      return;
    }

    setIsPublishing(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('password', password);
      formData.append('tags', settings.tags.join(','));
      formData.append('category', settings.category);
      formData.append('visibility', settings.visibility);
      formData.append('status', 'published');

      let result;
      if (mode === 'edit' && initialData) {
        result = await updateBlogPost(initialData.id, formData);
      } else {
        result = await createBlogPost(formData);
      }

      if (result.success) {
        // 清除 localStorage 缓存
        if (typeof window !== 'undefined' && mode === 'create') {
          localStorage.removeItem('blog_draft_title');
          localStorage.removeItem('blog_draft_content');
        }

        // 显示成功消息
        alert(dict?.publishSuccess || "Published successfully!");

        // 跳转到博客管理页面
        router.push('/admin/blog');
        router.refresh();
      } else {
        alert(result.error || dict?.publishError || "Failed to publish");
      }
    } catch (error) {
      console.error("Error publishing blog post:", error);
      alert(dict?.publishError || "Failed to publish");
    } finally {
      setIsPublishing(false);
    }
  };

  // 保存草稿
  const handleSaveDraft = async () => {
    if (!title.trim() && !content.trim()) {
      alert("Title or content is required for draft");
      return;
    }

    setIsSaving(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('content', content);
      formData.append('tags', settings.tags.join(','));
      formData.append('category', settings.category);
      formData.append('visibility', settings.visibility);
      formData.append('status', 'draft');

      let result;
      if (mode === 'edit' && initialData) {
        result = await updateBlogPost(initialData.id, formData);
      } else {
        result = await saveBlogDraft(formData);
      }

      if (result.success) {
        alert(dict?.draftSaved || "Draft saved.");
        if (mode === 'create') {
           // 如果是新建并保存草稿，可以选择跳转或留在此页。这里保持原样。
        }
      } else {
        alert(result.error || "Failed to save draft");
      }
    } catch (error) {
      console.error("Error saving draft:", error);
      alert("Failed to save draft");
    } finally {
      setIsSaving(false);
    }
  };

  // 添加标签
  const handleAddTag = () => {
    if (settings.newTag.trim() && !settings.tags.includes(settings.newTag.trim())) {
      setSettings({
        ...settings,
        tags: [...settings.tags, settings.newTag.trim()],
        newTag: ""
      });
    }
  };

  // 移除标签
  const handleRemoveTag = (tagToRemove: string) => {
    setSettings({
      ...settings,
      tags: settings.tags.filter(tag => tag !== tagToRemove)
    });
  };

  // 处理键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S 保存草稿
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveDraft();
      }
      // Ctrl/Cmd + P 发布
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handlePublish();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [title, content, password, settings]);

  // 自动保存草稿到 localStorage (仅在创建模式下)
  useEffect(() => {
    if (mode !== 'create') return;

    const saveDraftToLocalStorage = () => {
      if (typeof window !== 'undefined') {
        localStorage.setItem('blog_draft_title', title);
        localStorage.setItem('blog_draft_content', content);
      }
    };

    // 防抖保存
    const timeoutId = setTimeout(saveDraftToLocalStorage, 1000);
    return () => clearTimeout(timeoutId);
  }, [title, content, mode]);

  // 从 localStorage 加载草稿 (仅在创建模式下)
  useEffect(() => {
    if (mode !== 'create') return;

    if (typeof window !== 'undefined') {
      const savedTitle = localStorage.getItem('blog_draft_title');
      const savedContent = localStorage.getItem('blog_draft_content');
      
      if (savedTitle && !title) setTitle(savedTitle);
      if (savedContent && !content) setContent(savedContent);
    }
  }, [mode]);

  return (
    <div className="min-h-screen bg-black text-white p-4 md:p-8">
      {/* 标题栏 */}
      <div className="max-w-7xl mx-auto mb-8">
        <input
          ref={titleRef}
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={dict?.titlePlaceholder || "Enter post title..."}
          className="w-full bg-transparent border-none outline-none text-4xl md:text-5xl font-bold placeholder:text-white/30 focus:placeholder:text-white/10 transition-colors"
          autoFocus
        />
      </div>

      {/* 主编辑器区域 */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 左侧编辑器 */}
          <div className={`flex-1 ${showPreview ? 'lg:w-1/2' : 'lg:w-full'}`}>
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={dict?.editorPlaceholder || "Start writing your post..."}
                className="w-full min-h-[60vh] bg-transparent border-none outline-none resize-none text-lg placeholder:text-white/20 focus:placeholder:text-white/10 leading-relaxed transition-colors"
                rows={10}
              />
              
              {/* 字数统计 */}
              <div className="absolute bottom-4 right-4 text-sm text-white/40">
                {wordCount} {dict?.wordCount || "words"} • {charCount} {dict?.characters || "characters"}
              </div>
            </div>
          </div>

          {/* 右侧预览 */}
          {showPreview && (
            <div className="flex-1 lg:w-1/2">
              <div className="sticky top-8">
                <div className="bg-[#0A0A0A] rounded-2xl border border-white/10 p-6 h-[60vh] overflow-y-auto">
                  <div className="prose prose-invert max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {content || dict?.editorPlaceholder || "Start writing your post..."}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 浮动操作栏 */}
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50">
        <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/5 backdrop-blur-xl border border-white/10 shadow-xl">
          
          {/* 预览切换按钮 */}
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
          >
            {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
            <span>{dict?.preview || "Preview"}</span>
          </button>

          <div className="h-6 w-px bg-white/10" />

          {/* 密码输入 */}
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={dict?.passwordPlaceholder || "Enter password to publish..."}
              className="px-4 py-2 pl-10 pr-8 rounded-full text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30 w-48"
            />
            <Lock size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <button
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
            </button>
          </div>

          <div className="h-6 w-px bg-white/10" />

          {/* 设置按钮 */}
          <button
            onClick={() => setShowSettings(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all"
          >
            <Settings size={16} />
            <span>{dict?.settings || "Settings"}</span>
          </button>

          <div className="h-6 w-px bg-white/10" />

          {/* 保存草稿按钮 */}
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium text-white/80 hover:text-white hover:bg-white/10 transition-all disabled:opacity-50"
          >
            <Save size={16} />
            <span>{isSaving ? "Saving..." : dict?.saveDraft || "Save Draft"}</span>
          </button>

          {/* 发布按钮 */}
          <button
            onClick={handlePublish}
            disabled={isPublishing || !password}
            className="flex items-center gap-2 px-6 py-2 rounded-full text-sm font-medium text-black bg-white hover:bg-gray-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed ml-2"
          >
            <Send size={16} />
            <span>{isPublishing ? "Publishing..." : dict?.publish || "Publish"}</span>
          </button>
        </div>
      </div>

      {/* 设置模态框 */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] rounded-2xl border border-white/10 w-full max-w-md mx-4 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold">{dict?.settingsTitle || "Post Settings"}</h3>
              <button
                onClick={() => setShowSettings(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* 可见性设置 */}
            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                  <Globe size={16} />
                  {dict?.visibility || "Visibility"}
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSettings({...settings, visibility: "public"})}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      settings.visibility === "public" 
                        ? "bg-white text-black" 
                        : "bg-white/5 text-white/80 hover:bg-white/10"
                    }`}
                  >
                    {dict?.public || "Public"}
                  </button>
                  <button
                    onClick={() => setSettings({...settings, visibility: "private"})}
                    className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                      settings.visibility === "private" 
                        ? "bg-white text-black" 
                        : "bg-white/5 text-white/80 hover:bg-white/10"
                    }`}
                  >
                    {dict?.private || "Private"}
                  </button>
                </div>
              </div>

              {/* 分类设置 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                  <Folder size={16} />
                  {dict?.category || "Category"}
                </label>
                <input
                  type="text"
                  value={settings.category}
                  onChange={(e) => setSettings({...settings, category: e.target.value})}
                  placeholder={dict?.categoryPlaceholder || "Select category..."}
                  className="w-full px-4 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                />
              </div>

              {/* 标签设置 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-white/80 mb-2">
                  <Hash size={16} />
                  {dict?.tags || "Tags"}
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={settings.newTag}
                    onChange={(e) => setSettings({...settings, newTag: e.target.value})}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddTag()}
                    placeholder={dict?.tagsPlaceholder || "Add tags (comma separated)..."}
                    className="flex-1 px-4 py-2 rounded-lg text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-white/30"
                  />
                  <button
                    onClick={handleAddTag}
                    className="px-4 py-2 rounded-lg text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-colors"
                  >
                    Add
                  </button>
                </div>
                
                {/* 标签列表 */}
                <div className="flex flex-wrap gap-2">
                  {settings.tags.map((tag, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-1 px-3 py-1 rounded-full bg-white/10 text-sm"
                    >
                      <span>{tag}</span>
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="p-0.5 hover:bg-white/20 rounded-full"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 操作按钮 */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-white/5 text-white/80 hover:bg-white/10 transition-colors"
              >
                {dict?.cancel || "Cancel"}
              </button>
              <button
                onClick={() => {
                  setShowSettings(false);
                }}
                className="flex-1 px-4 py-2 rounded-lg text-sm font-medium bg-white text-black hover:bg-gray-200 transition-colors"
              >
                {dict?.saveSettings || "Save Settings"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}