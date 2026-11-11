// The page is one file of data and one of code: projects.json lists the
// projects, and this renders them. Adding a project is one entry there.

const TEXT = {
  zh: {
    "nav.projects": "项目",
    "nav.about": "关于",
    "hero.eyebrow": "开源 · 原生 · 自托管",
    "hero.title": "把工具做得像系统自带的一样。",
    "hero.lede": "我写原生界面的软件：Go 与 MyGo 绘制窗口，不套 WebView；该自托管的自托管，该单文件的就是一个二进制。",
    "hero.projects": "看项目",
    "projects.title": "项目",
    "projects.sub": "四个在维护的开源项目，都是 MIT。",
    "projects.loading": "正在载入…",
    "projects.failed": "项目列表载入失败，请直接访问 GitHub。",
    "about.title": "关于",
    "about.body": "喜欢把复杂的东西做成一个安静的窗口：下载器、邮箱、Finder 小工具、Windows 网络工具。界面尽量少打扰，配置尽量能看见，能自托管就不依赖别人的服务。",
    "about.stack": "常用：Go、MyGo、Swift、C#、Docker、Postfix / Dovecot。",
    "about.all": "全部仓库",
    "card.repo": "源码",
    "card.site": "官网",
    "card.download": "下载",
    "card.stars": "星标",
  },
  en: {
    "nav.projects": "Projects",
    "nav.about": "About",
    "hero.eyebrow": "Open source · native · self-hosted",
    "hero.title": "Tools that feel like they came with the system.",
    "hero.lede": "I build software with a native window: Go and MyGo draw it, with no WebView. What can be self-hosted is; what can be one binary is.",
    "hero.projects": "See the projects",
    "projects.title": "Projects",
    "projects.sub": "Four open-source projects, all MIT.",
    "projects.loading": "Loading…",
    "projects.failed": "The project list did not load; the repositories are on GitHub.",
    "about.title": "About",
    "about.body": "I like turning complicated things into a quiet window: a downloader, a mail server, a Finder tool, a Windows network toolkit. Few interruptions, visible settings, and self-hosting where it makes sense.",
    "about.stack": "Mostly Go, MyGo, Swift, C#, Docker, Postfix and Dovecot.",
    "about.all": "All repositories",
    "card.repo": "Source",
    "card.site": "Website",
    "card.download": "Download",
    "card.stars": "stars",
  },
};

// Chinese by default, as the site is written in it first.
let lang = localStorage.getItem("lang");
if (lang !== "zh" && lang !== "en") lang = "zh";
let projects = [];

const t = (key) => (TEXT[lang] && TEXT[lang][key]) || key;

function applyText() {
  document.documentElement.lang = lang === "zh" ? "zh-Hans" : "en";
  for (const el of document.querySelectorAll("[data-i18n]")) {
    const key = el.getAttribute("data-i18n");
    el.textContent = t(key);
  }
  const button = document.getElementById("lang");
  if (button) button.textContent = lang === "zh" ? "EN" : "中文";
  render();
}

function esc(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function card(p) {
  const tagline = lang === "en" && p.taglineEn ? p.taglineEn : p.tagline;
  const links = [];
  if (p.links && p.links.repo) {
    links.push(`<a href="${esc(p.links.repo)}" target="_blank" rel="noopener">${t("card.repo")}</a>`);
  }
  if (p.links && p.links.site) {
    links.push(`<a class="ghost" href="${esc(p.links.site)}" target="_blank" rel="noopener">${t("card.site")}</a>`);
  }
  if (p.links && p.links.download) {
    links.push(`<a class="ghost" href="${esc(p.links.download)}" target="_blank" rel="noopener">${t("card.download")}</a>`);
  }
  const tags = (p.tags || []).map((tag) => `<span class="tag">${esc(tag)}</span>`).join("");
  const badge = p.version ? `<span class="badge">${esc(p.version)}</span>` : "";
  return `
    <article class="card">
      <a class="shot" href="${esc((p.links && (p.links.site || p.links.repo)) || "#")}" target="_blank" rel="noopener">
        <img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">
      </a>
      <div class="body">
        <div class="title-row">
          <h3>${esc(p.name)}</h3>
          ${badge}
        </div>
        <p class="tagline">${esc(tagline)}</p>
        <p class="desc">${esc(p.description)}</p>
        <div class="tags">${tags}</div>
        <div class="card-links">${links.join("")}</div>
      </div>
    </article>`;
}

function render() {
  const grid = document.getElementById("grid");
  if (!grid) return;
  if (!projects.length) {
    grid.innerHTML = `<p class="loading">${t("projects.loading")}</p>`;
    return;
  }
  grid.innerHTML = projects.map(card).join("");
}

async function load() {
  try {
    const response = await fetch("projects.json", { cache: "no-cache" });
    if (!response.ok) throw new Error(String(response.status));
    projects = await response.json();
  } catch (e) {
    const grid = document.getElementById("grid");
    if (grid) grid.innerHTML = `<p class="loading">${t("projects.failed")}</p>`;
    return;
  }
  render();
}

document.addEventListener("DOMContentLoaded", () => {
  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
  const button = document.getElementById("lang");
  if (button) {
    button.addEventListener("click", () => {
      lang = lang === "zh" ? "en" : "zh";
      localStorage.setItem("lang", lang);
      applyText();
    });
  }
  applyText();
  load();
});
