import { useEffect, useRef } from 'react';
import { getAnalyserData } from '../audio';
import { ThemeConfig } from '../themes';

interface SoundVisualizerProps {
  themeConfig: ThemeConfig;
  isDark: boolean;
}

export function SoundVisualizer({ themeConfig, isDark }: SoundVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const dataArray = new Uint8Array(16);

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      getAnalyserData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      const width = canvas.width;
      const height = canvas.height;
      const barWidth = Math.max(1, (width / dataArray.length) * 0.6);
      const spacing = (width / dataArray.length) * 0.4;

      ctx.fillStyle = isDark ? 'rgba(255, 255, 255, 0.4)' : 'rgba(0, 0, 0, 0.3)';
      
      for (let i = 0; i < dataArray.length; i++) {
        // Soften the height for a subtle effect
        const barHeight = (dataArray[i] / 255) * height * 0.9;
        const y = (height - barHeight) / 2;
        
        ctx.beginPath();
        ctx.roundRect(i * (barWidth + spacing), y, barWidth, Math.max(2, barHeight), 2);
        ctx.fill();
      }
    };

    draw();

    return () => cancelAnimationFrame(animationId);
  }, [isDark, themeConfig]);

  return (
    <div className="flex items-center justify-center gap-3 opacity-60 hover:opacity-100 transition-opacity">
      <span className="text-xs uppercase tracking-widest font-bold opacity-70">Audio</span>
      <canvas ref={canvasRef} width={80} height={24} className="block" />
    </div>
  );
}
