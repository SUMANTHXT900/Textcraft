// Confetti Effects

import confetti from "canvas-confetti";

export function triggerConfetti() {
  const duration = 2000;
  const animationEnd = Date.now() + duration;
  const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

  function randomInRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
  }

  const interval: any = setInterval(function () {
    const timeLeft = animationEnd - Date.now();

    if (timeLeft <= 0) {
      return clearInterval(interval);
    }

    const particleCount = 50 * (timeLeft / duration);

    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
    });
    confetti({
      ...defaults,
      particleCount,
      origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
    });
  }, 250);
}

export function checkMilestone(
  prevStats: { words: number; charactersWithSpaces: number },
  currentStats: { words: number; charactersWithSpaces: number }
): boolean {
  // Check for word milestones
  if (prevStats.words < 1000 && currentStats.words >= 1000) {
    return true;
  }

  // Check for character milestones
  if (
    prevStats.charactersWithSpaces < 5000 &&
    currentStats.charactersWithSpaces >= 5000
  ) {
    return true;
  }

  return false;
}
