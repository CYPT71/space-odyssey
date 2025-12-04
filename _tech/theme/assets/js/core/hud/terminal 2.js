import { loadPageContent } from '../../init/content-loader.js';
import { parseHtml } from '../../utils/html-parser.js';

export const openObjectTerminal = (obj) => {
    if (!obj) return false;
    const ud = obj.userData || {};
    const url = ud.planetData?.url;
    if (!url) return false;

    if (window.loadIntoReader) {
        window.loadIntoReader(url);
        return true;
    }

    const terminal = document.getElementById('reading-overlay');
    const terminalContent = document.getElementById('reading-content');
    if (!terminal || !terminalContent) return false;
    const panel = document.getElementById('reader-panel');

    loadPageContent(url)
        .then((html) => {
            const doc = parseHtml(html);
            const content = doc.querySelector('main') || doc.querySelector('article') || doc.body;
            terminalContent.innerHTML = content ? content.innerHTML : html;
            terminal.classList.remove('hidden');
            if (panel) panel.classList.add('collapsed');
            terminal.classList.add('content-only');
            terminalContent.style.display = 'block';
            if (window.uiManager?.openReadingMode) {
                window.uiManager.openReadingMode();
            }
            if (window.inputSystem?.interceptLinksInContent) {
                window.inputSystem.interceptLinksInContent(terminalContent);
            }
        })
        .catch(err => console.warn('Failed to open terminal for object', err));
    return true;
};
