export const playScanSound = (audioContext) => {
  const osc = audioContext.createOscillator();
  const gain = audioContext.createGain();
  osc.type = 'sine';
  osc.frequency.setValueAtTime(800, audioContext.currentTime);
  osc.frequency.exponentialRampToValueAtTime(100, audioContext.currentTime + 1.5);
  gain.gain.setValueAtTime(0.3, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1.5);
  osc.connect(gain);
  gain.connect(audioContext.destination);
  osc.start();
  osc.stop(audioContext.currentTime + 1.5);
};
