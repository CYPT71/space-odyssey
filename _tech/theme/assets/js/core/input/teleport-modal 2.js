export const createTeleportConfirm = () => {
  const showTeleportConfirm = (
    title,
    message,
    onConfirm,
    targetMeta = {}
  ) => {
    const overlay = document.createElement("div");
    overlay.className = "ap-overlay";

    const modal = document.createElement("div");
    modal.className = "ap-modal";

    const chrome = document.createElement("div");
    chrome.className = "ap-chrome";
    ["red", "yellow", "green"].forEach((color) => {
      const dot = document.createElement("span");
      dot.className = `dot ${color}`;
      chrome.appendChild(dot);
    });
    const label = document.createElement("span");
    label.className = "ap-label";
    label.textContent = "AUTOPILOT // FLIGHT CONTROL";
    chrome.appendChild(label);

    const body = document.createElement("div");
    body.className = "ap-body";

    const heading = document.createElement("h3");
    heading.textContent = title || "Pilot Confirmation";
    const paragraph = document.createElement("p");
    paragraph.textContent = message || "";
    const consolePre = document.createElement("pre");
    consolePre.className = "ap-console";
    consolePre.textContent = `target: ${targetMeta.name || "unknown"}
type: ${targetMeta.type || "object"}
distance: ${
      targetMeta.distance
        ? `${Math.round(targetMeta.distance / 1000)} km`
        : "n/a"
    }
approach: ${targetMeta.approach || "standard"}`;
    body.appendChild(heading);
    body.appendChild(paragraph);
    body.appendChild(consolePre);

    const actions = document.createElement("div");
    actions.className = "ap-actions";
    const engage = document.createElement("button");
    engage.textContent = "⚡ ENGAGE AUTOPILOT";
    const cancel = document.createElement("button");
    cancel.textContent = "✕ CANCEL";
    actions.appendChild(engage);
    actions.appendChild(cancel);

    const clean = () => {
      modal.remove();
      overlay.remove();
    };

    engage.onclick = () => {
      clean();
      onConfirm();
    };

    cancel.onclick = () => {
      clean();
    };

    modal.appendChild(chrome);
    modal.appendChild(body);
    modal.appendChild(actions);

    document.body.appendChild(overlay);
    document.body.appendChild(modal);
  };

  return { showTeleportConfirm };
};
