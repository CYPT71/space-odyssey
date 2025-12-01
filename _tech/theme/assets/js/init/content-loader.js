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

const getFromDb = async (url) => {
  const db = await openDb();
  if (!db) return null;
  return await new Promise((resolve) => {
    const tx = db.transaction('pages', 'readonly');
    const store = tx.objectStore('pages');
    const req = store.get(url);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => resolve(null);
  });
};

export async function loadPageContent(url) {
  const base = (window.siteBase || '').replace(/\/+$/, '');
  const normalized = (url || '').replace(window.location.origin, '');
  const candidates = Array.from(new Set([
    normalized,
    normalized.startsWith(base) ? normalized : `${base}${normalized}`.replace(/\/{2,}/g, '/'),
    normalized.replace(new RegExp(`^${base}`), '') || '/'
  ])).filter(Boolean);

  for (const key of candidates) {
    const hit = await getFromDb(key);
    if (hit?.content) return hit.content;
  }

  // No network fetch: rely solely on IndexedDB; fall back to root content if available.
  const fallback = await getFromDb('/');
  return fallback?.content || 'Content unavailable.';
}
