// The state of the projects: their latest release, when the repository
// was last pushed, and its stars.
//
// Three sources, best first: the browser's cache (half a day), the file
// the build wrote from the GitHub API (public/state.json), and the API
// itself. A failure never leaves the page empty.

const CACHE_KEY = "logdns.github.v3";
const TTL = 6 * 60 * 60 * 1000; // six hours

const API = "https://api.github.com";
const OWNER = "logdns";

function readCache() {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.at || !parsed.projects) return null;
    return parsed;
  } catch (e) {
    return null;
  }
}

function writeCache(at, projects) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ at, projects }));
  } catch (e) {
    // A full or blocked storage is not worth a broken page.
  }
}

async function json(url) {
  const response = await fetch(url, {
    headers: { Accept: "application/vnd.github+json" },
  });
  if (response.status === 403 || response.status === 429) {
    throw new Error("rate limited");
  }
  if (!response.ok) {
    throw new Error(url + " answered " + response.status);
  }
  return response.json();
}

// snapshot is what the build wrote: the same shape as the answer.
async function snapshot() {
  try {
    const response = await fetch("/state.json", { cache: "no-cache" });
    if (!response.ok) return null;
    const body = await response.json();
    if (!body || !body.at || !body.projects) return null;
    return body;
  } catch (e) {
    return null;
  }
}

// live asks the API for the current numbers.
async function live() {
  const repos = await json(`${API}/users/${OWNER}/repos?per_page=100&sort=updated`);
  const projects = {};
  for (const repo of Array.isArray(repos) ? repos : []) {
    projects[repo.name] = {
      stars: repo.stargazers_count || 0,
      pushedAt: repo.pushed_at || "",
      homepage: repo.homepage || "",
      archived: Boolean(repo.archived),
    };
  }
  // One release per project, in parallel; a repository without a release
  // simply has no tag.
  await Promise.all(
    Object.keys(projects).map(async (name) => {
      try {
        const release = await json(`${API}/repos/${OWNER}/${name}/releases/latest`);
        projects[name].version = release.tag_name || "";
        projects[name].publishedAt = release.published_at || "";
      } catch (e) {
        projects[name].version = "";
        projects[name].publishedAt = "";
      }
    })
  );
  return projects;
}

// load returns { projects, at, fresh, error }.
export async function load({ force = false } = {}) {
  const cached = readCache();
  if (!force && cached && Date.now() - cached.at < TTL) {
    return { projects: cached.projects, at: cached.at, fresh: false };
  }

  // What the build knew, which costs nothing to read.
  const built = await snapshot();
  const known = built || cached;
  if (!force && known && Date.now() - known.at < TTL) {
    writeCache(known.at, known.projects);
    return { projects: known.projects, at: known.at, fresh: false };
  }

  try {
    const projects = await live();
    writeCache(Date.now(), projects);
    return { projects, at: Date.now(), fresh: true };
  } catch (error) {
    if (known) {
      return { projects: known.projects, at: known.at, fresh: false, error };
    }
    return { projects: {}, at: 0, fresh: false, error };
  }
}
