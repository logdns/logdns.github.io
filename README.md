# logdns.github.io

个人项目站：https://2sb.org/ （GitHub Pages 用户站，仓库名必须是 `logdns.github.io`）

## 加一个项目

只有一步：在 [`projects.json`](projects.json) 里加一条。

```json
{
  "name": "my-project",
  "tagline": "一句话中文介绍",
  "taglineEn": "One line in English",
  "description": "两三句说明它解决什么问题、有什么特点。",
  "image": "assets/shots/my-project.png",
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

- `image`：16:9 的截图或封面，放到 `assets/shots/`，建议宽 1200 以上、小于 500 KB。
- `links.site` 和 `links.download` 可以省略，卡片上就不会出现对应按钮。
- `version` 可以省略；`stars` 目前是手写的，不自动更新。
- 顺序就是数组顺序，想置顶就放前面。

提交后 GitHub Pages 会自动重新发布（约 30 秒）。

## 本地预览

```sh
python3 -m http.server 8091
# 打开 http://127.0.0.1:8091/
```

`projects.json` 用 `fetch` 读取，所以必须走 HTTP，直接双击 `index.html` 会载入失败。

## 结构

```
index.html      页面骨架（中文默认，右上角可切英文）
style.css       样式，跟随系统深浅色
app.js          读取 projects.json 渲染卡片，切换语言
projects.json   项目列表 —— 加项目只改这里
assets/
  favicon.svg   站点图标
  shots/        每个项目的封面图
CNAME           自定义域名 2sb.org
```

## 域名

`CNAME` 文件写着 `2sb.org`，仓库 Settings → Pages → Custom domain 也填了同一个。

DNS 在 Cloudflare，需要这些记录（**先设为 DNS only，不要开橙色云朵**，等 GitHub 签好证书再考虑代理）：

| 类型 | 名称 | 值 |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| AAAA | `@` | `2606:50c0:8000::153` |
| AAAA | `@` | `2606:50c0:8001::153` |
| AAAA | `@` | `2606:50c0:8002::153` |
| AAAA | `@` | `2606:50c0:8003::153` |
| CNAME | `www` | `logdns.github.io` |

生效后，仓库 Settings → Pages 勾上 **Enforce HTTPS**。

项目子站会跟着走：`2sb.org/downmygo/`、`2sb.org/<其它项目>/`，各自仓库里的 CNAME 不需要改。
