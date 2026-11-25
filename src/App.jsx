import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Button,
  Card,
  Dropdown,
  Empty,
  Grid,
  Layout,
  Menu,
  Space,
  Spin,
  Tag,
  Typography,
} from "@arco-design/web-react";
import {
  IconClockCircle,
  IconDesktop,
  IconDownload,
  IconGithub,
  IconLanguage,
  IconLink,
  IconMoonFill,
  IconRefresh,
  IconStar,
  IconSunFill,
} from "@arco-design/web-react/icon";
import { TEXT, ago } from "./i18n.js";
import { load } from "./github.js";

const { Header, Content, Footer } = Layout;
const { Row, Col } = Grid;
const { Title, Paragraph, Text } = Typography;

const WEEK = 14 * 24 * 3600 * 1000;

function readSetting(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch (e) {
    return fallback;
  }
}

function writeSetting(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch (e) {
    // Not worth failing over.
  }
}

export default function App() {
  const [lang, setLang] = useState(() => (readSetting("lang", "zh") === "en" ? "en" : "zh"));
  const [theme, setTheme] = useState(() => readSetting("theme", "system"));
  const [base, setBase] = useState([]);
  const [live, setLive] = useState({});
  const [loading, setLoading] = useState(true);
  const [reading, setReading] = useState(true);
  const [error, setError] = useState("");

  const t = TEXT[lang];
  const dark = useMemo(() => {
    if (theme === "light") return false;
    if (theme === "dark") return true;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches;
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
  }, [lang]);

  useEffect(() => {
    document.body.setAttribute("arco-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    let alive = true;
    fetch("/projects.json", { cache: "no-cache" })
      .then((response) => {
        if (!response.ok) throw new Error(String(response.status));
        return response.json();
      })
      .then((list) => {
        if (alive) setBase(Array.isArray(list) ? list : []);
      })
      .catch(() => {
        if (alive) setBase([]);
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const refresh = useCallback(async (force) => {
    setReading(true);
    const result = await load({ force });
    setLive(result.projects || {});
    setError(result.error ? "failed" : "");
    setReading(false);
  }, []);

  useEffect(() => {
    refresh(false);
  }, [refresh]);

  const projects = useMemo(
    () =>
      base.map((project) => {
        const repo = live[project.name] || {};
        return {
          ...project,
          stars: repo.stars ?? project.stars ?? 0,
          version: repo.version || project.version || "",
          publishedAt: repo.publishedAt || "",
          pushedAt: repo.pushedAt || "",
          homepage: repo.homepage || project.links?.site || "",
        };
      }),
    [base, live]
  );

  const themeMenu = (
    <Menu selectedKeys={[theme]} onClickMenuItem={(key) => setTheme(key)}>
      <Menu.Item key="system">
        <IconDesktop /> {TEXT[lang].system}
      </Menu.Item>
      <Menu.Item key="light">
        <IconSunFill /> {TEXT[lang].light}
      </Menu.Item>
      <Menu.Item key="dark">
        <IconMoonFill /> {TEXT[lang].dark}
      </Menu.Item>
    </Menu>
  );

  return (
    <Layout className="page">
      <Header className="bar">
        <div className="wrap bar-in">
          <a className="brand" href="/">
            <img src="/assets/favicon.svg" alt="" width="26" height="26" />
            <span>logdns</span>
          </a>
          <nav className="nav">
            <a href="#projects">{t.navProjects}</a>
            <a href="#about">{t.navAbout}</a>
            <a href="https://github.com/logdns" target="_blank" rel="noreferrer">
              {t.navGitHub}
            </a>
          </nav>
          <Space size={6}>
            <Dropdown droplist={themeMenu} position="br" trigger="click">
              <Button
                type="text"
                size="small"
                icon={dark ? <IconMoonFill /> : <IconSunFill />}
                aria-label={t.theme}
              />
            </Dropdown>
            <Button
              type="text"
              size="small"
              icon={<IconLanguage />}
              onClick={() => {
                const next = lang === "zh" ? "en" : "zh";
                setLang(next);
                writeSetting("lang", next);
              }}
            >
              {lang === "zh" ? "EN" : "中文"}
            </Button>
          </Space>
        </div>
      </Header>

      <Content>
        <section className="wrap hero">
          <Tag className="eyebrow" color="arcoblue">
            {t.eyebrow}
          </Tag>
          <Title heading={1} className="hero-title">
            {t.title}
          </Title>
          <Paragraph className="lede">{t.lede}</Paragraph>
          <Space size={12} wrap>
            <Button type="primary" size="large" href="#projects">
              {t.cta}
            </Button>
            <Button size="large" href="https://github.com/logdns" target="_blank">
              <IconGithub /> {t.ctaGitHub}
            </Button>
          </Space>
        </section>

        <section id="projects" className="wrap">
          <div className="section-head">
            <Title heading={3} style={{ margin: 0 }}>
              {t.projects}
            </Title>
            <Text type="secondary">{t.projectsSub}</Text>
            <Button
              className="refresh"
              type="text"
              size="small"
              loading={reading}
              icon={<IconRefresh />}
              aria-label={t.loading}
              title={t.loading}
              onClick={() => refresh(true)}
            />
          </div>

          {error ? (
            <div className="notice">
              <Text type="warning">{t.failed}</Text>
            </div>
          ) : null}

          {loading ? (
            <div className="center">
              <Spin size={28} />
            </div>
          ) : projects.length === 0 ? (
            <Empty description={t.failed} />
          ) : (
            <Row gutter={[20, 20]}>
              {projects.map((project) => {
                const isNew = project.publishedAt && Date.now() - new Date(project.publishedAt).getTime() < WEEK;
                return (
                  <Col key={project.name} xs={24} sm={24} md={12}>
                    <Card
                      className="project"
                      hoverable
                      bordered
                      cover={
                        <a
                          className="shot"
                          href={project.links?.site || project.links?.repo}
                          target="_blank"
                          rel="noreferrer"
                        >
                          <img src={project.image} alt={project.name} loading="lazy" />
                        </a>
                      }
                    >
                      <div className="title-row">
                        <Text className="name">{project.name}</Text>
                        <Space size={6}>
                          {isNew ? <Tag color="green">{t.fresh}</Tag> : null}
                          {project.version ? <Tag color="arcoblue">{project.version}</Tag> : null}
                        </Space>
                      </div>
                      <Text className="tagline">{lang === "en" && project.taglineEn ? project.taglineEn : project.tagline}</Text>
                      <Paragraph className="desc" ellipsis={{ rows: 3 }}>
                        {project.description}
                      </Paragraph>
                      <Space wrap size={6} className="tags">
                        {(project.tags || []).map((tag) => (
                          <Tag key={tag} size="small" bordered>
                            {tag}
                          </Tag>
                        ))}
                        <Tag size="small" bordered icon={<IconStar />}>
                          {project.stars}
                        </Tag>
                        {project.pushedAt ? (
                          <Tag size="small" bordered icon={<IconClockCircle />}>
                            {t.updated} {ago(project.pushedAt, t)}
                          </Tag>
                        ) : null}
                      </Space>
                      <Space wrap size={8} className="actions">
                        {project.links?.repo ? (
                          <Button size="small" type="primary" href={project.links.repo} target="_blank">
                            {t.source}
                          </Button>
                        ) : null}
                        {project.links?.site ? (
                          <Button size="small" icon={<IconLink />} href={project.links.site} target="_blank">
                            {t.website}
                          </Button>
                        ) : null}
                        {project.links?.download ? (
                          <Button size="small" icon={<IconDownload />} href={project.links.download} target="_blank">
                            {t.download}
                          </Button>
                        ) : null}
                      </Space>
                    </Card>
                  </Col>
                );
              })}
            </Row>
          )}
        </section>

        <section id="about" className="wrap">
          <Card className="about" bordered>
            <Title heading={3} style={{ marginTop: 0 }}>
              {t.about}
            </Title>
            <Paragraph>{t.aboutBody}</Paragraph>
            <Text type="secondary">{t.aboutStack}</Text>
            <Space size={10} wrap style={{ marginTop: 18 }}>
              <Button icon={<IconGithub />} href="https://github.com/logdns" target="_blank">
                GitHub
              </Button>
              <Button href="https://github.com/logdns?tab=repositories" target="_blank">
                {t.allRepos}
              </Button>
            </Space>
          </Card>
        </section>
      </Content>

      <Footer className="foot">
        <div className="wrap foot-in">
          <Text type="secondary">
            © {new Date().getFullYear()} logdns · {t.footer}
          </Text>
          <Space size={14}>
            <a href="https://github.com/logdns" target="_blank" rel="noreferrer">
              GitHub
            </a>
            <a href="https://github.com/logdns/downmygo" target="_blank" rel="noreferrer">
              downmygo
            </a>
            <a href="https://github.com/logdns/imyemail" target="_blank" rel="noreferrer">
              imyemail
            </a>
          </Space>
        </div>
      </Footer>
    </Layout>
  );
}
