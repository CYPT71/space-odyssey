import { loadPageContent } from '../theme/assets/js/init/content-loader.js';

const mockEntries = [
  { url: '/space-odyssey/MyBrain.exe/projects', content: '<main>Projects Content</main>' },
  { url: '/space-odyssey/', content: 'Root Content' }
];

const buildIndexedDB = (entries = []) => {
  const db = {
    transaction: () => ({
      objectStore: () => ({
        get: (key) => {
          const req = {};
          setTimeout(() => {
            const hit = entries.find(e => e.url === key) || null;
            req.result = hit;
            req.onsuccess?.({ target: { result: hit } });
          }, 0);
          return req;
        }
      })
    })
  };
  global.indexedDB = {
    open: () => {
      const req = {};
      setTimeout(() => {
        req.result = db;
        req.onsuccess?.({ target: { result: db } });
      }, 0);
      return req;
    }
  };
};

describe('content-loader IndexedDB-only', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() => Promise.reject(new Error('fetch should not be called')));
    window.siteBase = '/space-odyssey';
  });

  it('returns content from IndexedDB without hitting fetch', async () => {
    buildIndexedDB(mockEntries);
    const html = await loadPageContent('/space-odyssey/MyBrain.exe/projects');
    expect(html).toContain('Projects Content');
    expect(global.fetch).not.toHaveBeenCalled();
  });

  it('falls back to root content when specific entry is missing', async () => {
    buildIndexedDB([{ url: '/', content: 'Root' }]);
    const html = await loadPageContent('/missing');
    expect(html).toBe('Root');
  });
});
