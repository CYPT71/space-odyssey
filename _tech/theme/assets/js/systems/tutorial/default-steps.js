const defaultSteps = [
  {
    selector: '#hud-minimap',
    title: 'KNOWN OBJECTS',
    text: 'Liste des galaxies 🌌, poches de gaz 🌫️, nébuleuses ✨ et planètes 🌍. Cliquez pour téléporter.',
    terminal: 'ship@academy:~$ map --list\n- Galaxies 🌌\n- Gaz clouds 🌫️\n- Nebulae ✨\n- Planets 🌍\nTip: click any entry to warp.'
  },
  {
    selector: '#compass-bar',
    title: 'COMPASS',
    text: 'Indique les cibles visibles. La plus proche est surlignée.',
    terminal: 'ship@academy:~$ compass --tracking\nNearest target is highlighted. Keep it centered to intercept.'
  },
  {
    selector: '#controls-hint',
    title: 'PROPULSION AVANT',
    text: 'Appuie sur Z pour avancer.',
    keys: ['z'],
    terminal: 'ship@academy:~$ thrust --forward\nHold Z to accelerate forward.'
  },
  {
    selector: '#controls-hint',
    title: 'PROPULSION ARRIÈRE',
    text: 'Appuie sur S pour reculer.',
    keys: ['s'],
    terminal: 'ship@academy:~$ thrust --reverse\nHold S to brake or fly backward.'
  },
  {
    selector: '#controls-hint',
    title: 'YAW GAUCHE/DROITE',
    text: 'Q pour gauche, D pour droite.',
    keys: ['q','d'],
    terminal: 'ship@academy:~$ yaw --left/right\nQ = port turn\nD = starboard turn'
  },
  {
    selector: '#controls-hint',
    title: 'ASCENDRE/DESCENDRE',
    text: 'SPACE pour monter, SHIFT pour descendre.',
    keys: [' ', 'Shift'],
    terminal: 'ship@academy:~$ vertical --ascend/descend\nSPACE = ascend\nSHIFT = descend'
  },
  {
    selector: '#controls-hint',
    title: 'STOP D’URGENCE',
    text: 'Appuie sur C pour arrêt immédiat.',
    keys: ['c'],
    terminal: 'ship@academy:~$ emergency-stop\nPress C to zero velocity now.'
  },
  {
    selector: '#warp-boost',
    title: 'WARP BOOST',
    text: 'Active le warp pour un saut rapide (bouton ou maintenir vitesse). Clique sur le bouton pour continuer.',
    terminal: 'ship@academy:~$ warp --engage\nClick the ⚡ button or build speed to jump.'
  }
];

export { defaultSteps };
