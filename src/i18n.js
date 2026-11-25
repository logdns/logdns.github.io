// The text of the site, in the two languages it is written in.

export const TEXT = {
  zh: {
    navProjects: "项目",
    navAbout: "关于",
    navGitHub: "GitHub",
    eyebrow: "开源 · 原生 · 自托管",
    title: "把工具做得像系统自带的一样。",
    lede: "得益于互联网的发展、AI 与科技的进步，这些工具才可能长成这样：原生界面由 Go 与 MyGo 绘制，不套 WebView；该自托管的自托管，该单文件的就是一个二进制。",
    cta: "看项目",
    ctaGitHub: "github.com/logdns",
    projects: "项目",
    projectsSub: "每个项目都在维护，版本与更新时间直接来自 GitHub。",
    loading: "正在从 GitHub 读取最新状态…",
    failed: "暂时读不到 GitHub 的数据，显示的是内置的版本。",
    updated: "更新于",
    fresh: "新版本",
    source: "源码",
    website: "官网",
    download: "下载",
    stars: "星标",
    about: "关于",
    aboutBody:
      "喜欢把复杂的东西做成一个安静的窗口：下载器、邮箱、Finder 小工具、Windows 网络工具。界面尽量少打扰，配置尽量能看见，能自托管就不依赖别人的服务。",
    aboutStack: "常用：Go、MyGo、Swift、C#、Docker、Postfix / Dovecot。",
    allRepos: "全部仓库",
    footer: "独立实现，MIT 许可。",
    theme: "主题",
    light: "浅色",
    dark: "深色",
    system: "跟随系统",
    language: "语言",
    justNow: "刚刚",
    minutesAgo: "{n} 分钟前",
    hoursAgo: "{n} 小时前",
    daysAgo: "{n} 天前",
    monthsAgo: "{n} 个月前",
    yearsAgo: "{n} 年前",
  },
  en: {
    navProjects: "Projects",
    navAbout: "About",
    navGitHub: "GitHub",
    eyebrow: "Open source · native · self-hosted",
    title: "Tools that feel like they came with the system.",
    lede: "Thanks to the open internet, AI and the pace of technology, tools like these can have a native window: Go and MyGo draw it, with no WebView. What can be self-hosted is; what can be one binary is.",
    cta: "See the projects",
    ctaGitHub: "github.com/logdns",
    projects: "Projects",
    projectsSub: "All maintained; versions and update times come straight from GitHub.",
    loading: "Reading the latest state from GitHub…",
    failed: "GitHub could not be read; showing the versions the site was built with.",
    updated: "Updated",
    fresh: "New",
    source: "Source",
    website: "Website",
    download: "Download",
    stars: "stars",
    about: "About",
    aboutBody:
      "I like turning complicated things into a quiet window: a downloader, a mail server, a Finder tool, a Windows network toolkit. Few interruptions, visible settings, and self-hosting where it makes sense.",
    aboutStack: "Mostly Go, MyGo, Swift, C#, Docker, Postfix and Dovecot.",
    allRepos: "All repositories",
    footer: "An independent implementation, MIT licensed.",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    language: "Language",
    justNow: "just now",
    minutesAgo: "{n}m ago",
    hoursAgo: "{n}h ago",
    daysAgo: "{n}d ago",
    monthsAgo: "{n}mo ago",
    yearsAgo: "{n}y ago",
  },
};

// ago says how long before now a date was, in the language's words.
export function ago(date, t) {
  if (!date) return "";
  const seconds = Math.max(0, (Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return t.justNow;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return t.minutesAgo.replace("{n}", minutes);
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t.hoursAgo.replace("{n}", hours);
  const days = Math.floor(hours / 24);
  if (days < 30) return t.daysAgo.replace("{n}", days);
  const months = Math.floor(days / 30);
  if (months < 12) return t.monthsAgo.replace("{n}", months);
  return t.yearsAgo.replace("{n}", Math.floor(months / 12));
}
