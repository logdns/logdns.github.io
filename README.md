# logdns.github.io

个人项目站：https://2sb.org/

React + [Arco Design](https://arco.design/)，Vite 构建。项目卡片上的版本、星标、最近更新时间直接从 GitHub 读取，不用手改。

## 本地开发

```sh
npm install
npm run dev          # http://localhost:5173
npm run build        # 产物在 dist/
npm run preview      # 预览 dist/
```

## 加一个项目

只有一步：在 [`public/projects.json`](public/projects.json) 里加一条。

```json
{
  "name": "my-project",
  "tagline": "一句话中文介绍",
  "taglineEn": "One line in English",
  "description": "两三句说明它解决什么问题、有什么特点。",
  "image": "/assets/shots/my-project.png",
  "language": "Go",
  "license": "MIT",
  "version": "v1.0.0",
  "stars": 0,
  "tags": ["cli", "self-hosted"],
  "links": {
    "repo": "https://github.com/logdns/my-project",
    "site": "https://example.com/",
    "download": "https://github.com/logdns/my-project/releases/latest"
  }
}
```

- `name` 必须和 GitHub 仓库名一致，版本与星标靠它去查。
- `image` 放 `public/assets/shots/`，建议 16:9 或 4:3、宽 1200 以上、小于 500 KB。
- `version` / `stars` 只是没有网络时的兜底，页面上显示的是 GitHub 的实时值。
- `links.site` 和 `links.download` 可以省略，卡片上就不出现对应按钮。
- 数组顺序就是显示顺序，想置顶就放前面。

## 数据从哪来

| 来源 | 何时用 |
|---|---|
| 浏览器缓存（`localStorage`，6 小时） | 回访，不发请求 |
| `public/state.json`（构建时写入） | 首次访问，或 API 限流时 |
| GitHub API（`/users/logdns/repos` + 每个项目的 `/releases/latest`） | 缓存过期时刷新 |

`npm run build` 会先跑 `scripts/snapshot.mjs`，用构建机的 GitHub 令牌把当前状态写进 `public/state.json`。CI 每天 03:00 重新构建一次，所以**项目发新版后，最迟到第二天首页就会显示新版本号和「新版本」标记**；访客打开页面时也会顺带刷新一次。

API 挂了或限流时，页面照常显示 `projects.json` 里的兜底值，只在顶部提示一行。

## 主题与语言

- 右上角切换浅色 / 深色 / 跟随系统（Arco 的 `arco-theme`），记在 localStorage。
- 中英文切换，默认中文。

## 部署

`.github/workflows/deploy.yml`：推送到 `main`、每天 03:00、或手动触发 → `npm ci && npm run build` → 发布 `dist/` 到 Pages。

仓库 Settings → Pages → Source 选 **GitHub Actions**。

自定义域名 `2sb.org` 在仓库 Settings → Pages → Custom domain 里，`public/CNAME` 也会复制进产物。DNS 在 Cloudflare：

| 类型 | 名称 | 值 |
|---|---|---|
| A | `@` | `185.199.108.153`、`185.199.109.153`、`185.199.110.153`、`185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153`、`8001::153`、`8002::153`、`8003::153` |
| CNAME | `www` | `logdns.github.io` |

先设成 DNS only，证书签好后再考虑开代理。

## 结构

```
index.html          Vite 入口
src/
  main.jsx          React 挂载，引入 Arco 样式
  App.jsx           页面：导航、hero、项目、关于、页脚
  github.js         实时状态：缓存 → state.json → API
  i18n.js           中英文文案与相对时间
  styles.css        版式与截图框（Arco 组件之上的少量样式）
public/
  projects.json     项目列表 —— 加项目只改这里
  state.json        构建时写入的版本与更新时间
  assets/           图标与项目截图
  404.html          404 页
  CNAME             自定义域名
scripts/snapshot.mjs 构建时抓取 GitHub 状态
```
