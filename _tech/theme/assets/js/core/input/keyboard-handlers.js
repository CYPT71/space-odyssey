import * as THREE from "three";
import { getObjectType, getDetectionRange } from "../space-object-utils.js";
import { loadPageContent } from "../../init/content-loader.js";
import { parseHtml } from "../../utils/html-parser.js";

const buildJournalList = (posts) =>
  posts
    .map((p) => `<li><a href="${p.url}">${p.title || p.name}</a></li>`)
    .join("");

export const setupKeyboardHandlers = ({
  shipGroup,
  shipControls,
  uiManager,
  galaxyManager,
  scannerSystem,
  triggerTeleportEffect,
  audioSystem,
  terminal,
  interceptLinksInContent,
  terminalContent,
}) => {

  const openInTerminal = async (url) => {
    try {
      const html = await loadPageContent(url);
      const doc = parseHtml(html);
      const body = doc.querySelector("main") || doc.querySelector("article") || doc.body;
      terminalContent.innerHTML = body ? body.innerHTML : html;
      terminal.classList.remove("hidden");
      terminalContent.style.display = "block";
      uiManager.openReadingMode();
      interceptLinksInContent(terminalContent);
    } catch (err) {
      console.error("Failed to load content:", err);
    }
  };

  const handleEnter = (e) => {
    if (e.key !== "Enter") return;
    
    if (uiManager.isReadingMode) {
      uiManager.closeReadingMode();
      return;
    }
    const closest = galaxyManager.findClosest(shipGroup.position);
    if (closest && closest.planetData?.url) {
      openInTerminal(closest.planetData.url);
      return;
    }
    if (closest && closest.isGasCloud) {
      const name = closest.cloudData?.name || "Gas Cloud";
      const posts = [
        ...(closest.cloudData?.posts || []),
        ...Object.values(closest.cloudData?.nebulae || {}).flatMap((n) => n.posts || []),
      ];
      terminalContent.innerHTML = `<h2>Journal: ${name}</h2><ul>${buildJournalList(posts)}</ul>`;
      terminal.classList.remove("hidden");
      uiManager.openReadingMode();
      interceptLinksInContent(terminalContent);
      return;
    }
    if (closest && closest.isNebula && closest.obj?.userData?.posts) {
      const name = closest.obj.userData.nebulaName || closest.obj.userData.tagName || "Nebula";
      const posts = closest.obj.userData.posts || [];
      terminalContent.innerHTML = `<h2>Journal: ${name}</h2><ul>${buildJournalList(posts)}</ul>`;
      terminal.classList.remove("hidden");
      uiManager.openReadingMode();
      interceptLinksInContent(terminalContent);
    }
  };

  const handleKeydown = (e) => {
    if (e.key === "l") {
      const closest = galaxyManager.findClosest(shipGroup.position);
      if (!closest || !closest.obj) return;
      const targetPos = new THREE.Vector3();
      closest.obj.getWorldPosition(targetPos);
      let stopDistance = 100000;
      const ud = closest.obj.userData || {};
      if (ud.isGasCloud || ud.cloudData) stopDistance = 500000;
      else if (ud.isGalaxy || ud.galaxyData || ud.isNebula) stopDistance = 0;
      shipControls.engageAutopilot(targetPos, stopDistance, closest.obj);
      triggerTeleportEffect();
      audioSystem.playSound("warp");
    }
    if (e.key.toLowerCase() === "n") {
      const shipPos = shipGroup.position;
      const all = galaxyManager.getAllObjects();
      const candidates = all
        .map((obj) => {
          const ud = obj.userData || {};
          const type = getObjectType(ud);
          if (type === "unknown") return null;
          const pos = new THREE.Vector3();
          obj.getWorldPosition(pos);
          const dist = shipPos.distanceTo(pos);
          const range = getDetectionRange(type);
          return { obj, dist, type, range };
        })
        .filter(Boolean);
      if (!candidates.length) return;
      const minDist = Math.min(...candidates.map((c) => c.dist));
      const valid = candidates
        .filter((c) => c.range && c.dist <= Math.min(c.range * 0.25, minDist + 20000))
        .sort((a, b) => a.dist - b.dist);
      if (!valid.length) return;
      const pick = valid[0];
      window.manualTarget = pick.obj;
      const name =
        pick.obj.userData?.planetData?.title ||
        pick.obj.userData?.planetData?.name ||
        pick.obj.userData?.name ||
        "Object";
      uiManager.hudTarget.textContent = `TARGET: ${name}`;
    }
  };

  const handleTab = (e) => {
    if (e.key === "Tab") {
      e.preventDefault();
      scannerSystem.triggerScan(shipGroup.position);
    }
  };

  document.addEventListener("keydown", handleEnter);
  document.addEventListener("keydown", handleKeydown);
  document.addEventListener("keydown", handleTab);

  return () => {
    document.removeEventListener("keydown", handleEnter);
    document.removeEventListener("keydown", handleKeydown);
    document.removeEventListener("keydown", handleTab);
  };
};
