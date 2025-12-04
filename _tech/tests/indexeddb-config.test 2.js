import { getSiteConfig } from '../theme/assets/js/init/config.js';

const script = document.createElement('script');
script.setAttribute('src', '/space-odyssey/assets/js/init/site-init.js');
document.head.appendChild(script);

const makeRequest = (db) => {
  const req = {};
  // Defer to simulate async IDB callbacks
  setTimeout(() => {
    req.result = db;
    if (req.onsuccess) req.onsuccess({ target: { result: db } });
  }, 0);
  return req;
};

const buildIndexedDB = (entries = []) => {
  const db = {
    transaction: () => ({
      objectStore: () => ({
        getAll: () => {
          const req = {};
          setTimeout(() => {
            req.result = entries;
            if (req.onsuccess) req.onsuccess({ target: { result: entries } });
          }, 0);
          return req;
        }
      })
    })
  };
  global.indexedDB = {
    open: () => makeRequest(db)
  };
};

describe('IndexedDB-backed site config', () => {
  it('reads file system entries from IndexedDB and derives siteBase', async () => {
    const entries = [
      { url: '/space-odyssey/planet-alpha', title: 'Planet Alpha', name: 'alpha.md', path: '_pages/alpha.md', dir: '' },
      { url: '/space-odyssey/nebula-beta', title: 'Nebula Beta', name: 'beta.md', path: '_pages/beta.md', dir: '' }
    ];
    buildIndexedDB(entries);

    const cfg = await getSiteConfig();
    expect(cfg.siteBase).toBe('/space-odyssey');
    expect(cfg.fileSystem).toHaveLength(2);
    expect(cfg.fileSystem[0].url).toBe('/space-odyssey/planet-alpha');
    expect(cfg.fileSystem[1].title).toBe('Nebula Beta');
  });
});
