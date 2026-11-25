// Writes public/state.json: the versions and update times of every
// project, taken from the GitHub API at build time.
//
// The site reads this first, so a visitor sees the state of the projects
// without waiting on the API (and without its rate limit). The browser
// then refreshes it in the background when the file is old.
//
//   GITHUB_TOKEN=… node scripts/snapshot.mjs
//
// Without a token the API allows 60 calls an hour, which is enough for
// this script and a few visitors. CI passes the repository's token.

import { readFile, writeFile } from "node:fs/promises";

const OWNER = "logdns";
const API = "https://api.github.com";

async function main() {
  const projects = JSON.parse(await readFile(new URL("../public/projects.json", import.meta.url)));
  if (!Array.isArray(projects) || projects.length === 0) {
    throw new Error("public/projects.json holds no projects");
  }

  const headers = {
    Accept: "application/vnd.github+json",
    "User-Agent": "logdns-site",
  };
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const get = async (path) => {
    const response = await fetch(API + path, { headers });
    if (!response.ok) throw new Error(`${path} answered ${response.status}`);
    return response.json();
  };

  const repos = await get(`/users/${OWNER}/repos?per_page=100&sort=updated`);
  const byName = {};
  for (const repo of Array.isArray(repos) ? repos : []) {
    byName[repo.name] = {
      stars: repo.stargazers_count || 0,
      pushedAt: repo.pushed_at || "",
      homepage: repo.homepage || "",
      archived: Boolean(repo.archived),
    };
  }

  for (const project of projects) {
    const name = project.name;
    if (!byName[name]) byName[name] = {};
    try {
      const release = await get(`/repos/${OWNER}/${name}/releases/latest`);
      byName[name].version = release.tag_name || "";
      byName[name].publishedAt = release.published_at || "";
    } catch (error) {
      // A project without a release simply keeps the version in
      // projects.json.
    }
  }

  const body = { at: Date.now(), projects: byName };
  const out = new URL("../public/state.json", import.meta.url);
  await writeFile(out, JSON.stringify(body, null, 2) + "\n", "utf8");
  const names = Object.keys(byName).length;
  console.log(`state.json: ${names} repositories`);
}

main().catch((error) => {
  // A build must not fail because GitHub was busy: the site falls back to
  // what projects.json says, and to the browser's own cache.
  console.warn("snapshot skipped:", error.message);
});
