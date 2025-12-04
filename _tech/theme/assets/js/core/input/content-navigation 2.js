import { parseHtml } from "../../utils/html-parser.js";

export const createContentNavigator = ({
  galaxyManager,
  uiManager,
  loadPageContent,
  terminal,
  terminalContent,
}) => {
  const openInTerminal = async (rawUrl) => {
    if (!terminalContent || !terminal) return;
    try {
      const html = await loadPageContent(rawUrl);
      const doc = parseHtml(html);
      const body = doc.querySelector("main") || doc.querySelector("article") || doc.body;
      terminalContent.innerHTML = body ? body.innerHTML : html;
      terminal.classList.remove("hidden");
      uiManager.openReadingMode();
      interceptLinksInContent(terminalContent);
    } catch (err) {
      console.error("Failed to load content:", err);
    }
  };

  const navigateToObject = (href) => {
    const allObjects = galaxyManager.getAllObjects();
    const targetPlanet = allObjects.find((obj) => {
      if (!obj.userData?.planetData) return false;
      const planetUrl = obj.userData.planetData.url;
      return planetUrl === href || planetUrl.endsWith(href);
    });
    if (!targetPlanet) return false;
    uiManager.closeReadingMode();
    window.dispatchEvent(
      new CustomEvent("teleportRequest", { detail: { uuid: targetPlanet.uuid } })
    );
    return true;
  };

  const interceptLinksInContent = (container) => {
    if (!container) return;
    const links = container.querySelectorAll("a[href]");
    links.forEach((link) => {
      const rawHref = link.getAttribute("href");
      if (!rawHref || rawHref.startsWith("http") || rawHref.startsWith("#")) return;
      link.addEventListener(
        "click",
        async (e) => {
          e.preventDefault();
          const href = rawHref.startsWith("/")
            ? rawHref
            : new URL(rawHref, window.location.origin).pathname;
          if (href.startsWith("/posts/")) {
            await openInTerminal(href);
            return;
          }
          if (!navigateToObject(href)) {
            await openInTerminal(href);
          }
        },
        { passive: false }
      );
    });
  };

  return { interceptLinksInContent };
};
