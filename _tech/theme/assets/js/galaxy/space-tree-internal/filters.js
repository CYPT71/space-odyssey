
export const stripBase = (val = '') => {
    if (!BASE_URL) return val;
    return val.startsWith(BASE_URL) ? (val.slice(BASE_URL.length) || '/') : val;
};

export const normalizeInput = (path, url) => {
    const safePath = path || '';
    const safeUrl = stripBase(url || '');
    return { path: safePath, url: safeUrl };
};