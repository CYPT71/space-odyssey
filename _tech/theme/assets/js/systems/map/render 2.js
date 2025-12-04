import * as THREE from 'three';

export const renderMap = (state) => {
  const { ctx, canvas, isOpen, galaxyManager, shipGroup, offset, scale } = state;
  if (!isOpen) return;
  requestAnimationFrame(() => renderMap(state));

  ctx.fillStyle = '#000510';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;
  const allObjects = galaxyManager.getAllObjects();
  let renderedCount = 0;

  allObjects.forEach((obj) => {
    const ud = obj.userData;
    if (!ud) return;
    const hasData = ud.planetData || ud.isNebula || ud.isGasCloud || ud.galaxyData || ud.isGalaxy;
    if (!hasData) return;

    const pos = new THREE.Vector3();
    obj.getWorldPosition(pos);
    const sx = cx + offset.x + pos.x * scale;
    const sy = cy + offset.y + pos.z * scale;
    if (sx < -100 || sx > canvas.width + 100 || sy < -100 || sy > canvas.height + 100) return;

    renderedCount++;
    if (ud.galaxyData || ud.isGalaxy) {
      ctx.fillStyle = '#FF00FF';
      ctx.beginPath();
      ctx.arc(sx, sy, 10, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFF';
      ctx.font = '12px monospace';
      const name = ud.galaxyData?.name || ud.name || 'Galaxy';
      ctx.fillText(name, sx + 12, sy + 4);
    } else if (ud.planetData) {
      ctx.fillStyle = '#00F0FF';
      ctx.beginPath();
      ctx.arc(sx, sy, 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#AAA';
      ctx.font = '10px monospace';
      const planetName = ud.planetData.title || ud.planetData.tiitle || ud.planetData.name || 'Planet';
      ctx.fillText(planetName, sx + 6, sy + 3);
    } else if (ud.isGasCloud) {
      ctx.fillStyle = 'rgba(0, 255, 136, 0.3)';
      ctx.beginPath();
      ctx.arc(sx, sy, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0F8';
      ctx.font = '10px monospace';
      const cloudName = ud.cloudName || ud.categoryName || ud.cloudData?.name || 'Gas Cloud';
      ctx.fillText(cloudName, sx + 22, sy + 4);
    } else if (ud.isNebula) {
      ctx.fillStyle = 'rgba(255, 100, 255, 0.2)';
      ctx.beginPath();
      ctx.arc(sx, sy, 15, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#F6F';
      ctx.font = '10px monospace';
      const nebulaName = ud.nebulaName || ud.tagName || 'Nebula';
      ctx.fillText(nebulaName, sx + 17, sy + 4);
    }
  });

  const shipX = cx + offset.x + shipGroup.position.x * scale;
  const shipY = cy + offset.y + shipGroup.position.z * scale;
  ctx.save();
  ctx.translate(shipX, shipY);
  ctx.rotate(-shipGroup.rotation.y + Math.PI);
  ctx.fillStyle = '#FFF';
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(6, 8);
  ctx.lineTo(0, 5);
  ctx.lineTo(-6, 8);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = '#00F0FF';
  ctx.font = '14px monospace';
  ctx.fillText('MAP VIEW - [M] to Close - Double Click to Autopilot', 20, 30);
  ctx.fillText(`Zoom: ${scale.toExponential(1)} | Objects: ${renderedCount}/${allObjects.length}`, 20, 50);
  ctx.fillText(`Ship: (${Math.round(shipGroup.position.x / 1000)}km, ${Math.round(shipGroup.position.z / 1000)}km)`, 20, 70);
};
