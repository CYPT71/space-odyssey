export function renderCategory({
  minimapList,
  rows,
  idSuffix,
  title,
  color,
  isCollapsed,
  toggleKey,
  limit,
  syncItems,
  deps,
}) {
  const catId = `minimap-cat-${idSuffix}`;
  let catDiv = document.getElementById(catId);

  if (rows.length === 0) {
    if (catDiv) catDiv.style.display = 'none';
    return;
  }

  if (!catDiv) {
    catDiv = document.createElement('div');
    catDiv.id = catId;
    catDiv.className = 'minimap-category';
    catDiv.style.borderLeft = `3px solid ${color}`;
    catDiv.style.paddingLeft = '8px';
    catDiv.style.margin = '8px 0';

    const header = document.createElement('div');
    header.className = 'category-header';
    header.style.fontWeight = 'bold';
    header.style.color = color;
    header.style.marginBottom = '4px';
    catDiv.appendChild(header);

    const itemsContainer = document.createElement('div');
    itemsContainer.className = 'items-container';
    catDiv.appendChild(itemsContainer);

    minimapList.appendChild(catDiv);
  } else {
    catDiv.style.display = 'block';
  }

  const header = catDiv.querySelector('.category-header');
  if (toggleKey) {
    const symbol = isCollapsed ? '▸' : '▾';
    header.textContent = `${symbol} ${title}`;
    header.style.cursor = 'pointer';
    header.onclick = () => window.toggleMinimap(toggleKey);
  } else {
    header.textContent = title;
    header.style.cursor = 'default';
    header.onclick = null;
  }

  const itemsContainer = catDiv.querySelector('.items-container');
  if (isCollapsed && toggleKey) {
    itemsContainer.style.display = 'none';
  } else {
    itemsContainer.style.display = 'block';
    syncItems(itemsContainer, rows, limit, deps);
  }
}

export function syncItems(container, rows, maxItems, deps) {
  const itemsToShow = rows.slice(0, maxItems);
  const currentIds = new Set();

  itemsToShow.forEach((item, index) => {
    const itemId = `minimap-item-${item.uuid}`;
    currentIds.add(itemId);

    let el = document.getElementById(itemId);
    if (!el) {
      el = document.createElement('div');
      el.id = itemId;
      el.className = 'minimap-item';
      el.style.cursor = 'pointer';
      el.onclick = item.onClick || (() => {
        if (deps.isMobile()) document.body.classList.remove('mobile-known-open');
        const event = new CustomEvent('teleportRequest', { detail: { uuid: item.uuid, object: item.obj } });
        window.dispatchEvent(event);
        window.teleportTo(item.obj);
      });
    }

    if (item.style) Object.assign(el.style, item.style);
    if (item.className) el.className = `minimap-item ${item.className}`;

    if (index === 0) el.classList.add('closest');
    else el.classList.remove('closest');

    let indentSpan = el.querySelector('.mm-indent');
    let caretSpan = el.querySelector('.mm-caret');
    let contentSpan = el.querySelector('.mm-content');

    if (!contentSpan) {
      el.innerHTML = '';
      el.style.display = 'flex';
      el.style.alignItems = 'center';
      el.style.gap = '6px';

      indentSpan = document.createElement('span');
      indentSpan.className = 'mm-indent';
      el.appendChild(indentSpan);

      caretSpan = document.createElement('span');
      caretSpan.className = 'mm-caret';
      caretSpan.style.cursor = 'pointer';
      el.appendChild(caretSpan);

      contentSpan = document.createElement('span');
      contentSpan.className = 'mm-content';
      contentSpan.style.flex = '1';
      el.appendChild(contentSpan);
    }

    indentSpan.style.width = `${item.indent || 0}px`;

    if (item.hasCaret) {
      caretSpan.textContent = item.caretSymbol;
      caretSpan.onclick = (e) => {
        e.stopPropagation();
        item.onCaretClick?.();
      };
      caretSpan.style.display = 'inline';
    } else {
      caretSpan.style.display = 'none';
    }

    const distStr = deps.formatDistance(item.distance);
    const text = `${item.icon ? item.icon + ' ' : ''}${item.name} - ${distStr}`;
    if (contentSpan.textContent !== text) contentSpan.textContent = text;

    if (container.children[index] !== el) container.appendChild(el);
  });

  Array.from(container.children).forEach((child) => {
    if (!currentIds.has(child.id)) container.removeChild(child);
  });
}
