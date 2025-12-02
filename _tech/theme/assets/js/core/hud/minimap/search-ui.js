export function ensureSearchInput(hudMinimap, minimapList, deps) {
  if (document.getElementById('minimap-search')) return;

  const wrapper = document.createElement('div');
  wrapper.id = 'minimap-search-wrapper';

  const search = document.createElement('input');
  search.id = 'minimap-search';
  search.type = 'search';
  search.placeholder = deps.isMobile() ? 'Filter objects…' : 'Filter objects… (#tag or /regex/)';
  search.value = window.minimapSearchTerm || '';
  search.autocapitalize = 'none';
  search.autocomplete = 'off';
  search.spellcheck = false;

  search.addEventListener('input', (e) => {
    if (deps.isMobile()) e.target.value = e.target.value.replace(/\s+/g, '');
    window.minimapSearchTerm = e.target.value;
  });

  search.addEventListener('keydown', (e) => {
    if (!deps.isMobile()) {
      if (e.key === 'Escape') search.blur();
      window.dispatchEvent(new KeyboardEvent('keydown', e));
    }
  });

  wrapper.appendChild(search);
  hudMinimap.insertBefore(wrapper, minimapList);
}

export function ensureToggleButton(hudMinimap) {
  let toggleBtn = document.getElementById('minimap-toggle');
  if (toggleBtn) return toggleBtn;

  toggleBtn = document.createElement('button');
  toggleBtn.id = 'minimap-toggle';
  toggleBtn.innerHTML = '⤢';
  toggleBtn.onclick = () => {
    hudMinimap.classList.toggle('expanded');
    toggleBtn.innerHTML = hudMinimap.classList.contains('expanded') ? '⤡' : '⤢';
  };
  hudMinimap.appendChild(toggleBtn);
  return toggleBtn;
}

export function buildSearchFilter(rawTerm, deps) {
  const normalized = (rawTerm || '').toLowerCase().trim();
  if (!normalized) return () => true;

  if (!deps.isMobile() && normalized.startsWith('/') && normalized.endsWith('/') && normalized.length > 2) {
    try {
      const regex = new RegExp(normalized.slice(1, -1), 'i');
      return (name) => regex.test(name || '');
    } catch (error) {
      console.warn('Invalid regex in minimap search:', error);
      return () => true;
    }
  }

  if (!deps.isMobile() && normalized.startsWith('#')) {
    const tag = normalized.slice(1);
    return (name) => (name || '').toLowerCase().includes(tag);
  }

  return (name) => (name || '').toLowerCase().includes(normalized);
}
