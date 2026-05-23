/** Celebración al completar compra (estilo blueprint). */
export async function celebratePurchase(): Promise<void> {
  try {
    const confetti = (await import('canvas-confetti')).default;
    const colors = ['#1b4332', '#fbbf24', '#2d6a4f', '#52b788', '#ffffff'];
    const duration = 2800;
    const end = Date.now() + duration;

    confetti({
      particleCount: 100,
      spread: 90,
      origin: { y: 0.55 },
      colors,
      ticks: 200,
      gravity: 0.9,
      scalar: 1.1,
    });

    const frame = (): void => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.65 },
        colors,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.65 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  } catch {
    /* sin dependencia cargada */
  }
}
