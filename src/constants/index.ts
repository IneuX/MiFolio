// 字典数据
export const DICTIONARY = {
  en: {
    nav: [
      { href: "/", label: "Home" },
      { href: "/en/blog", label: "Blog" },
      { href: "#project", label: "Project" },
      { href: "#moments", label: "Moments" },
      { href: "#aboutme", label: "About me" },
    ],
    hero: {
      name: "OUTHENA",
      tagline: "PROJECT MANANGER & PERSONAL DEVELOPER",
      description: "Focus on R&D project management, transcending the boundaries of product and development.",
      cta: {
        primary: "View Project",
        secondary: "Contact Me",
      },
    },
    portfolio: {
      title: "Selected Moments",
      items: [
        {
          title: "Hallstatt",
          description: "The most beautiful Hallstatt in winter.",
          link: "#",
          image: "/images/moment-1.jpg",
        },
        {
          title: "Tomorrow",
          description: "Coffee refueling station at my wedding.",
          link: "#",
          image: "/images/moment-2.jpg",
        },
        {
          title: "Mount Fuji",
          description: "On the bus heading to Mount Fuji.",
          link: "#",
          image: "/images/moment-3.jpg",
        },
      ],
    },
    contact: {
      title: "Let's Connect",
      subtitle: "Have a project in mind? Reach out.",
      email: "Email",
      message: "Message",
      send: "Send Message",
      placeholders: {
        email: "hello@example.com",
        message: "Tell me about something you'd like to work on."
      }
    },
    blog: {
      title: "New Blog Post",
      titlePlaceholder: "Enter post title...",
      editorPlaceholder: "Start writing your post...",
      preview: "Preview",
      publish: "Publish",
      saveDraft: "Save Draft",
      wordCount: "words",
      characters: "characters",
      password: "Password",
      passwordPlaceholder: "Enter password to publish...",
      settings: "Settings",
      publishSuccess: "Published successfully!",
      publishError: "Failed to publish. Please try again.",
      draftSaved: "Draft saved.",
      settingsTitle: "Post Settings",
      visibility: "Visibility",
      public: "Public",
      private: "Private",
      tags: "Tags",
      tagsPlaceholder: "Add tags (comma separated)...",
      category: "Category",
      categoryPlaceholder: "Select category...",
      saveSettings: "Save Settings",
      cancel: "Cancel"
    },
    footer: {
      copyright: "MiFolio. Powered by Outhena."
    },
    admin: {
      dashboard: {
        title: "管理面板",
        subtitle: "管理您的作品集和博客内容",
        blogManagement: "博客管理",
        blogDescription: "创建、编辑和管理您的博客文章和草稿",
        portfolioManagement: "作品集管理",
        portfolioDescription: "管理作品集项目和展示",
        userSettings: "用户设置",
        userSettingsDescription: "管理管理员设置和偏好",
        comingSoon: "即将推出"
      },
      blog: {
        title: "博客管理",
        subtitle: "管理您的所有博客文章、草稿和发布内容",
        newPost: "新建文章",
        totalPosts: "总文章数",
        published: "已发布",
        drafts: "草稿",
        allPosts: "所有文章",
        noPosts: "还没有博客文章",
        createFirst: "从创建您的第一篇文章开始",
        view: "查看",
        edit: "编辑",
        delete: "删除",
        published: "已发布",
        draft: "草稿",
        private: "私密",
        confirmDelete: "确认删除",
        deleteWarning: "您确定要删除这篇文章吗？此操作无法撤销。",
        cancel: "取消",
        confirm: "确认",
        deleting: "删除中..."
      },
      editor: {
        createNew: "创建新博客文章",
        editPost: "编辑博客文章",
        backToBlog: "返回博客",
        writeThoughts: "用 Markdown 格式写下您的想法，支持实时预览"
      },
      common: {
        dashboard: "仪表板",
        logout: "退出登录",
        welcome: "欢迎",
        adminPrivileges: "您拥有管理员权限"
      }
    },
    admin: {
      dashboard: {
        title: "Admin Dashboard",
        subtitle: "Manage your portfolio and blog content",
        blogManagement: "Blog Management",
        blogDescription: "Create, edit, and manage your blog posts and drafts",
        portfolioManagement: "Portfolio Management",
        portfolioDescription: "Manage portfolio items and project showcases",
        userSettings: "User Settings",
        userSettingsDescription: "Manage admin settings and preferences",
        comingSoon: "Coming Soon"
      },
      blog: {
        title: "Blog Management",
        subtitle: "Manage all your blog posts, drafts, and publications",
        newPost: "New Post",
        totalPosts: "Total Posts",
        published: "Published",
        drafts: "Drafts",
        allPosts: "All Posts",
        noPosts: "No blog posts yet",
        createFirst: "Start by creating your first blog post",
        view: "View",
        edit: "Edit",
        delete: "Delete",
        published: "Published",
        draft: "Draft",
        private: "Private",
        confirmDelete: "Confirm Delete",
        deleteWarning: "Are you sure you want to delete this post? This action cannot be undone.",
        cancel: "Cancel",
        confirm: "Confirm",
        deleting: "Deleting..."
      },
      editor: {
        createNew: "Create New Blog Post",
        editPost: "Edit Blog Post",
        backToBlog: "Back to Blog",
        writeThoughts: "Write your thoughts in Markdown format with live preview"
      },
      common: {
        dashboard: "Dashboard",
        logout: "Logout",
        welcome: "Welcome",
        adminPrivileges: "You have admin privileges"
      }
    }
  },
  zh: {
    nav: [
      { href: "/", label: "首页" },
      { href: "/zh/blog", label: "博客" },
      { href: "#project", label: "项目" },
      { href: "#moments", label: "时光" },
      { href: "#aboutme", label: "关于我" },
    ],
    hero: {
      name: "OUTHENA",
      tagline: "项目经理 & 个人开发者",
      description: "专注研发项目管理，跨越产品与开发的边界。",
      cta: {
        primary: "查看项目",
        secondary: "联系我",
      },
    },
    portfolio: {
      title: "精选时光",
      items: [
        {
          title: "哈尔施塔特",
          description: "冬季最美的哈尔施塔特。",
          link: "#",
          image: "/images/moment-1.jpg",
        },
        {
          title: "明日加油站",
          description: "婚礼上的咖啡加油站。",
          link: "#",
          image: "/images/moment-2.jpg",
        },
        {
          title: "富士山下",
          description: "开往富士山的大巴车上。",
          link: "#",
          image: "/images/moment-3.jpg",
        },
      ],
    },
    contact: {
      title: "建立联系",
      subtitle: "有项目想法？请联系我。",
      email: "邮箱",
      message: "留言",
      send: "发送信息",
      placeholders: {
        email: "hello@example.com",
        message: "告诉我你想合作的项目。"
      }
    },
    blog: {
      title: "新建博客文章",
      titlePlaceholder: "输入文章标题...",
      editorPlaceholder: "开始撰写你的文章...",
      preview: "预览",
      publish: "发布",
      saveDraft: "保存草稿",
      wordCount: "字",
      characters: "字符",
      password: "密码",
      passwordPlaceholder: "输入密码以发布...",
      settings: "设置",
      publishSuccess: "发布成功！",
      publishError: "发布失败，请重试。",
      draftSaved: "草稿已保存。",
      settingsTitle: "文章设置",
      visibility: "可见性",
      public: "公开",
      private: "私密",
      tags: "标签",
      tagsPlaceholder: "添加标签（逗号分隔）...",
      category: "分类",
      categoryPlaceholder: "选择分类...",
      saveSettings: "保存设置",
      cancel: "取消"
    },
    footer: {
      copyright: "MiFolio. Powered by Outhena."
    }
  }
};

export const NAV_LINKS = DICTIONARY.en.nav;
export const HERO_CONTENT = DICTIONARY.en.hero;
export const PORTFOLIO_ITEMS = DICTIONARY.en.portfolio.items;
