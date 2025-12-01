import { getSiteConfig } from './config.js';
import { initMobileUI } from './mobile-ui.js';
import { initNav } from './nav.js';
import { initReader } from './reader.js';

(async function bootstrap() {
  const cfg = await getSiteConfig();
  window.siteBase = cfg.siteBase;
  window.fileSystem = cfg.fileSystem;
  initMobileUI();
  initNav(cfg.fileSystem || []);
  initReader(cfg);
})();
