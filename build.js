const fs = require('fs');
const path = require('path');

const ROOT_DIR = __dirname;
const TEMPLATES_DIR = path.join(ROOT_DIR, 'templates');
const PARTIALS_DIR = path.join(TEMPLATES_DIR, 'partials');
const PAGES_DIR = path.join(TEMPLATES_DIR, 'pages');
const LAYOUT_PATH = path.join(TEMPLATES_DIR, 'layout.html');

const COMMON_BODY_CLASS =
  "bg-[radial-gradient(2000px_800px_at_50%_120%,#070910,transparent)] text-white font-sans antialiased";
const DEFAULT_LOGIN_BUTTON_CLASS =
  "magnetic group relative inline-flex items-center gap-2 rounded-xl px-6 py-3 text-lg font-semibold bg-discord hover:bg-discordDark transition-colors";

const NAV_CONFIG = [
  { id: 'home', label: 'Home', icon: 'home', color: '#60A5FA', path: 'index.html', anchor: '#home' },
  { id: 'leaderboard', label: 'Leaderboards', icon: 'trophy', color: '#F59E0B', path: 'pages/leaderboard.html' },
  { id: 'bonuses', label: 'Bonuses', icon: 'gift', color: '#EC4899', path: 'pages/bonuses.html' },
  { id: 'rewards', label: 'Rewards', icon: 'coins', color: '#FBBF24', path: 'pages/rewards.html' },
  { id: 'events', label: 'Events', icon: 'calendar', color: '#8B5CF6', path: '/events', external: true },
  { id: 'content', label: 'Content', icon: 'video', color: '#22D3EE', path: 'pages/content.html' }
];

const pages = [
  {
    template: 'index.html',
    output: 'index.html',
    title: 'TxPlays — Casino Hub',
    pageId: 'home',
    navActive: 'home',
    disableActiveNavLink: false,
    loginButtonClass: DEFAULT_LOGIN_BUTTON_CLASS
  },
  {
    template: 'pages/leaderboard.html',
    output: 'pages/leaderboard.html',
    title: 'TxPlays — Leaderboard',
    pageId: 'leaderboard',
    navActive: 'leaderboard',
    loginButtonClass:
      'magnetic group relative inline-flex items-center gap-2 rounded-xl px-8 py-3 text-sm font-medium bg-discord hover:bg-discordDark transition-colors'
  },
  {
    template: 'pages/bonuses.html',
    output: 'pages/bonuses.html',
    title: 'TxPlays — Bonuses',
    pageId: 'bonuses',
    navActive: 'bonuses',
    loginButtonClass: DEFAULT_LOGIN_BUTTON_CLASS
  },
  {
    template: 'pages/rewards.html',
    output: 'pages/rewards.html',
    title: 'TxPlays — Rewards',
    pageId: 'rewards',
    navActive: 'rewards',
    loginButtonClass: DEFAULT_LOGIN_BUTTON_CLASS
  },
  {
    template: 'pages/content.html',
    output: 'pages/content.html',
    title: 'TxPlays — Content',
    pageId: 'content',
    navActive: 'content',
    loginButtonClass: DEFAULT_LOGIN_BUTTON_CLASS
  }
];

const layoutTemplate = fs.readFileSync(LAYOUT_PATH, 'utf8');
const partialCache = new Map();

function readPartial(name) {
  if (!partialCache.has(name)) {
    const partialPath = path.join(PARTIALS_DIR, `${name}.html`);
    const content = fs.readFileSync(partialPath, 'utf8');
    partialCache.set(name, content);
  }
  return partialCache.get(name);
}

function renderTemplate(template, context) {
  return template.replace(/\{\{\s*([^}]+?)\s*\}\}/g, (match, token) => {
    const value = token.trim();
    if (!value) {
      return '';
    }
    if (value.startsWith('>')) {
      const partialName = value.slice(1).trim();
      return renderTemplate(readPartial(partialName), context);
    }
    if (!(value in context)) {
      return '';
    }
    return context[value];
  });
}

function normalizePath(filePath) {
  return filePath.split(path.sep).join('/');
}

function ensureDir(filePath) {
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
}

function computeRootPath(pageDir) {
  const relative = path.relative(pageDir, '.');
  if (!relative) {
    return '';
  }
  const normalized = normalizePath(relative);
  return normalized.endsWith('/') ? normalized : `${normalized}/`;
}

function buildNavItems(pageDir, outputPath, activeId, disableActiveLink) {
  return NAV_CONFIG.map((item) => {
    const isActive = item.id === activeId;
    let href = '';

    if (!item.external && (!isActive || disableActiveLink === false)) {
      const samePage = item.path === outputPath;
      const anchor = item.anchor || '';
      if (samePage && anchor) {
        href = anchor;
      } else {
        const relative = normalizePath(path.relative(pageDir, item.path));
        let base = relative;
        if (!base || base === '') {
          base = path.basename(item.path);
        }
        if (base) {
          href = anchor ? `${base}${anchor}` : base;
        } else {
          href = anchor;
        }
      }
    } else if (item.external) {
      href = item.path;
    } else if (!isActive) {
      // When we reach here we allow same-page links without anchor.
      href = item.path;
    }

    const hrefAttr = href && (!isActive || disableActiveLink === false || item.external) ? ` href="${href}"` : '';
    const activeClass = isActive ? ' is-active' : '';

    return `        <a${hrefAttr} class="nav-item${activeClass}" aria-label="${item.label}" style="--accent:${item.color}">
          <span class="nav-bubble"><i data-lucide="${item.icon}"></i></span>
          <span class="nav-label">${item.label}</span>
        </a>`;
  }).join('\n');
}

function buildPage(page) {
  const templatePath = path.join(PAGES_DIR, page.template);
  const templateContent = fs.readFileSync(templatePath, 'utf8');

  const outputPathNormalized = normalizePath(page.output);
  const pageDir = path.dirname(page.output) || '.';
  const rootPath = computeRootPath(pageDir);
  const assetBase = `${rootPath}assets`;
  const logoSrc = `${assetBase}/images/word.png`;
  const disableActiveLink = page.disableActiveNavLink !== undefined ? page.disableActiveNavLink : true;

  const context = {
    TITLE: page.title,
    BODY_CLASS: page.bodyClass || COMMON_BODY_CLASS,
    PAGE_ID: page.pageId,
    ASSET_BASE: assetBase,
    ROOT_PATH: rootPath,
    LOGO_SRC: logoSrc,
    LOGIN_BUTTON_CLASS: page.loginButtonClass || DEFAULT_LOGIN_BUTTON_CLASS,
    NAV_ITEMS: buildNavItems(pageDir === '' ? '.' : pageDir, outputPathNormalized, page.navActive, disableActiveLink)
  };

  const mainContent = renderTemplate(templateContent, context);
  const finalContext = { ...context, MAIN: mainContent };
  const renderedPage = renderTemplate(layoutTemplate, finalContext);

  const outputFilePath = path.join(ROOT_DIR, page.output);
  ensureDir(outputFilePath);
  fs.writeFileSync(outputFilePath, renderedPage);
}

function main() {
  pages.forEach(buildPage);
  console.log(`Built ${pages.length} pages.`);
}

main();
