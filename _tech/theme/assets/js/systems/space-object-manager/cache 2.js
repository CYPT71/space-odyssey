export const hashFiles = (files) => {
  if (!Array.isArray(files)) return 0;
  let hash = 0;
  files.forEach((f) => {
    const str = `${f.path || ''}|${f.url || ''}`;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
  });
  return hash;
};

export const loadCachedTree = (hash) => {
  try {
    const raw = localStorage.getItem('spaceTreeCache');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed.hash !== hash) return null;
    return parsed.tree;
  } catch (_) {
    return null;
  }
};

export const saveCachedTree = (hash, tree) => {
  try {
    localStorage.setItem('spaceTreeCache', JSON.stringify({ hash, tree }));
  } catch (_) {
    /* ignore */
  }
};
