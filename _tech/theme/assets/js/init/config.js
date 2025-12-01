let cachedConfig = null;

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
  const req = indexedDB.open('spaceOddity', 1);
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => resolve(null);
  req.onupgradeneeded = () => {
    const db = req.result;
    if (!db.objectStoreNames.contains('pages')) {
      const store = db.createObjectStore('pages', { keyPath: 'url' });
      store.createIndex('title', 'title');
    }
  };
});

const readEntries = (db) => new Promise((resolve) => {
  if (!db) return resolve([]);
  const tx = db.transaction('pages', 'readonly');
  const store = tx.objectStore('pages');
  const req = store.getAll();
  req.onsuccess = () => resolve(req.result || []);
  req.onerror = () => resolve([]);
});

export async function getSiteConfig() {
  if (cachedConfig) return cachedConfig;
  const db = await openDb();
  const entries = await readEntries(db);
  cachedConfig = {
    siteBase: (detectBase() || '/').replace(/\/+$/, '') || '/',
    fileSystem: entries.map((e) => ({
      title: e.title || e.name || '',
      url: e.url || '',
      name: e.name || '',
      path: e.path || '',
      dir: e.dir || '',
      date: e.date,
      content: e.content
    }))
  };
  return cachedConfig;
}
