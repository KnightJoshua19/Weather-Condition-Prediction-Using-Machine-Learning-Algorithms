import { useEffect, useRef } from 'react';
import { theme } from '../config/theme';

interface WaveBackgroundProps {
  /** Optionally override the color palette for dark output view */
  variant?: 'default' | 'dark';
}

export function WaveBackground({ variant = 'default' }: WaveBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Color palettes per variant
  const palette =
    variant === 'dark'
      ? ['#1A2E42', '#29435C', '#1f3a52', '#223347', '#0f2030']
      : [theme.colors.dominant, theme.colors.theme, theme.colors.accent, '#b8bfb0', '#3d5c3b'];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let t = 0;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    // Wave blobs config
    interface Blob {
      x: number;
      y: number;
      radiusX: number;
      radiusY: number;
      vx: number;
      vy: number;
      color: string;
      alpha: number;
      phase: number;
      speed: number;
    }

    const blobs: Blob[] = [
      { x: 0.2,  y: 0.3,  radiusX: 0.55, radiusY: 0.45, vx: 0.00012,  vy: 0.00008,  color: palette[1], alpha: 0.72, phase: 0,   speed: 0.0008 },
      { x: 0.7,  y: 0.2,  radiusX: 0.5,  radiusY: 0.4,  vx: -0.0001,  vy: 0.00011,  color: palette[2], alpha: 0.60, phase: 1.2, speed: 0.0006 },
      { x: 0.5,  y: 0.7,  radiusX: 0.6,  radiusY: 0.5,  vx: 0.00009,  vy: -0.0001,  color: palette[3 % palette.length], alpha: 0.55, phase: 2.4, speed: 0.001  },
      { x: 0.85, y: 0.6,  radiusX: 0.45, radiusY: 0.35, vx: -0.00013, vy: -0.00007, color: palette[1], alpha: 0.50, phase: 0.8, speed: 0.0007 },
      { x: 0.1,  y: 0.8,  radiusX: 0.5,  radiusY: 0.4,  vx: 0.0001,   vy: 0.00009,  color: palette[2], alpha: 0.45, phase: 3.5, speed: 0.0009 },
    ];

    const draw = () => {
      if (!canvas || !ctx) return;
      const W = canvas.width;
      const H = canvas.height;

      ctx.clearRect(0, 0, W, H);

      // Base fill
      ctx.fillStyle = variant === 'dark' ? '#1A2E42' : theme.colors.dominant;
      ctx.fillRect(0, 0, W, H);

      blobs.forEach((blob) => {
        // Sinusoidal drift — larger amplitude so motion is visible
        const dx = Math.sin(t * blob.speed + blob.phase) * 0.22;
        const dy = Math.cos(t * blob.speed * 1.3 + blob.phase) * 0.18;

        const cx = (blob.x + dx) * W;
        const cy = (blob.y + dy) * H;
        const rx = blob.radiusX * W;
        const ry = blob.radiusY * H;

        const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(rx, ry));
        const hex = blob.color.replace('#', '');
        const r = parseInt(hex.slice(0, 2), 16);
        const g = parseInt(hex.slice(2, 4), 16);
        const b = parseInt(hex.slice(4, 6), 16);

        grad.addColorStop(0,   `rgba(${r},${g},${b},${blob.alpha})`);
        grad.addColorStop(0.5, `rgba(${r},${g},${b},${blob.alpha * 0.55})`);
        grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(Math.sin(t * 0.0003 + blob.phase) * 0.25);
        ctx.translate(-cx, -cy);

        ctx.beginPath();
        ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      });

      t += 1;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variant]);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
    >
      {/* Animated canvas — blur reduced so motion is clearly visible */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ filter: 'blur(28px)', opacity: 1 }}
      />
      {/* Very light frosted layer — just enough to keep text readable */}
      <div
        className="absolute inset-0"
        style={{
          background: variant === 'dark'
            ? 'rgba(26,46,66,0.08)'
            : 'rgba(209,212,201,0.08)',
        }}
      />
    </div>
  );
}