const DB_NAME = 'spaceOddity';
const STORE = 'pages';

const detectBase = () => {
  const script = document.querySelector('script[src*="assets/js/init/site-init.js"]');
  if (!script) return '';
  try {
    const url = new URL(script.getAttribute('src'), window.location.href);
    return (url.pathname.replace(/\/assets\/js\/init\/site-init\.js.*$/, '') || '').replace(/\/+$/, '');
  } catch (_) {
    return '';
  }
};

const openDb = () => new Promise((resolve) => {
  if (!('indexedDB' in window)) return resolve(null);
  const req = indexedDB.open(DB_NAME, 1);
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => resolve(null);
  req.onupgradeneeded = () => {
    const db = req.result;
    if (!db.objectStoreNames.contains(STORE)) {
      const store = db.createObjectStore(STORE, { keyPath: 'url' });
      store.createIndex('title', 'title');
    }
  };
});

const getFromDb = async (url) => {
  const db = await openDb();
  if (!db) return null;
  return await new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const req = store.get(url);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  });
};

const getFirstPage = async () => {
  const db = await openDb();
  if (!db) return null;
  return await new Promise((resolve) => {
    const tx = db.transaction(STORE, 'readonly');
    const store = tx.objectStore(STORE);
    const req = store.getAll();
    req.onsuccess = () => resolve((req.result && req.result[0]) || null);
    req.onerror = () => resolve(null);
  });
};

export async function loadPageContent(url) {
  const base = (window.siteBase || detectBase() || '').replace(/\/+$/, '');
  const baseRegex = base ? new RegExp(`^${base}`) : null;
  const stripBase = (v) => baseRegex ? v.replace(baseRegex, '') : v;
  const normalized = (url || '').replace(window.location.origin, '');
  const withSlash = normalized.endsWith('/') ? normalized : `${normalized}/`;
  const withoutSlash = normalized.endsWith('/') ? normalized.slice(0, -1) : normalized;
  const withHtml = normalized.endsWith('.html') ? normalized : `${normalized}.html`;

  const variants = [
    normalized,
    withSlash,
    withoutSlash,
    withHtml,
    `${withoutSlash}/index.html`,
    `${withSlash}index.html`,
    normalized.startsWith(base) ? normalized : `${base}${normalized}`.replace(/\/{2,}/g, '/'),
    withSlash.startsWith(base) ? withSlash : `${base}${withSlash}`.replace(/\/{2,}/g, '/'),
    withoutSlash.startsWith(base) ? withoutSlash : `${base}${withoutSlash}`.replace(/\/{2,}/g, '/'),
    withHtml.startsWith(base) ? withHtml : `${base}${withHtml}`.replace(/\/{2,}/g, '/'),
    stripBase(normalized) || '/',
    stripBase(withSlash) || '/',
    stripBase(withoutSlash) || '/',
    stripBase(withHtml) || '/',
    `${stripBase(withoutSlash) || ''}/index.html`,
    `${stripBase(withSlash) || ''}index.html`
  ];

  const candidates = Array.from(new Set(variants)).filter(Boolean);

  for (const key of candidates) {
    const hit = await getFromDb(key);
    if (hit?.content) return hit.content;
  }

  // No network fetch: rely solely on IndexedDB; fall back to root content if available.
  const fallbackKeys = [
    '/',
    '/index.html',
    base,
    `${base}/`,
    `${base}/index.html`
  ];
  for (const fb of fallbackKeys) {
    const hit = await getFromDb(fb);
    if (hit?.content) return hit.content;
  }
  const anyPage = await getFirstPage();
  if (anyPage?.content) {
    console.warn('IDB fallback: using first cached page', anyPage.url || anyPage.name);
    return anyPage.content;
  }
  console.warn('IDB lookup failed for', url, 'candidates', candidates, 'base', base);
  return 'Content unavailable.';
}
