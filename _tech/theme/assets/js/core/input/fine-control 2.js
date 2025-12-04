export const setupFineControl = ({
  shipControls,
  uiManager,
  exitPointerLock,
}) => {
  const moveHandler = (e) => {
    if (!shipControls.isFineControlActive()) return;
    if (uiManager.isReadingMode) return;
    shipControls.applyMouseDelta(e.movementX, e.movementY);
  };
  const closeHandler = (e) => {
    const fineBtn = document.getElementById("fine-control");
    const isToggle = fineBtn && fineBtn.contains(e.target);
    if (isToggle) return;
    if (shipControls.isFineControlActive()) {
      shipControls.setFineControl(false);
      exitPointerLock();
    }
  };
  window.addEventListener("mousemove", moveHandler);
  window.addEventListener("click", closeHandler);
  return () => {
    window.removeEventListener("mousemove", moveHandler);
    window.removeEventListener("click", closeHandler);
  };
};
