// 字典数据
export const DICTIONARY = {
  en: {
    nav: [
      { href: "/", label: "Home" },
      { href: "#blog", label: "Blog" },
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
    footer: {
      copyright: "MiFolio. Powered by Outhena."
    }
  },
  zh: {
    nav: [
      { href: "/", label: "首页" },
      { href: "#blog", label: "博客" },
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
    footer: {
      copyright: "MiFolio. Powered by Outhena."
    }
  }
};

export const NAV_LINKS = DICTIONARY.en.nav;
export const HERO_CONTENT = DICTIONARY.en.hero;
export const PORTFOLIO_ITEMS = DICTIONARY.en.portfolio.items;
