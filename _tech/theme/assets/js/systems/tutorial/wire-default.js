import { defaultSteps } from './default-steps';

function shouldShowTutorial() {
  return !localStorage.getItem('tutorialSeen');
}

function markTutorialSeen() {
  localStorage.setItem('tutorialSeen', '1');
}

function handleUniverseReady(createTutorial) {
  if (!shouldShowTutorial()) return;
  const tutorial = createTutorial();
  tutorial.open(defaultSteps);
  markTutorialSeen();
}

export function wireDefaultTutorial(createTutorial) {
  window.addEventListener('universeReady', () => handleUniverseReady(createTutorial));
}
