export const createTeleportEffect = () => {
  const triggerTeleportEffect = () => {
    const flash = document.createElement("div");
    flash.style.cssText =
      "position:fixed;top:0;left:0;width:100%;height:100%;background:white;opacity:0.8;transition:opacity 0.5s;z-index:1000;pointer-events:none;";
    document.body.appendChild(flash);
    setTimeout(() => {
      flash.style.opacity = "0";
      setTimeout(() => flash.remove(), 500);
    }, 50);
  };
  return { triggerTeleportEffect };
};
