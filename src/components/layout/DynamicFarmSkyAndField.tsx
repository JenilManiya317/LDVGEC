import React, { useEffect, useRef } from 'react';

export const DynamicFarmSkyAndField: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      initGrass();
      initParticles();
    };

    window.addEventListener('resize', handleResize);

    // Dynamic floating pollen / wind particles drifting with breeze
    interface Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      swayOffset: number;
      swaySpeed: number;
    }

    let particles: Particle[] = [];
    const initParticles = () => {
      particles = [];
      const count = Math.floor(width / 25);
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 2.2 + 0.8,
          speedX: Math.random() * 1.2 + 0.6, // Drift to right
          speedY: (Math.random() - 0.5) * 0.4,
          opacity: Math.random() * 0.6 + 0.2,
          swayOffset: Math.random() * Math.PI * 2,
          swaySpeed: Math.random() * 0.02 + 0.01
        });
      }
    };

    // Grass stalks for the foreground waving in the wind
    interface GrassBlade {
      x: number;
      baseY: number;
      height: number;
      width: number;
      bendAngle: number;
      speed: number;
      phase: number;
      color: string;
      highlightColor: string;
    }

    let blades: GrassBlade[] = [];
    const initGrass = () => {
      blades = [];
      // Foreground grass along bottom 35%
      const grassStartY = height * 0.68;
      const bladeCount = Math.floor(width / 4.5);
      const greenTones = [
        'rgba(86, 172, 52, 0.75)',
        'rgba(112, 195, 65, 0.85)',
        'rgba(65, 145, 38, 0.7)',
        'rgba(142, 218, 80, 0.8)',
        'rgba(168, 226, 96, 0.6)',
        'rgba(48, 120, 28, 0.85)'
      ];
      const highlightTones = [
        'rgba(215, 255, 130, 0.8)',
        'rgba(240, 255, 170, 0.9)',
        'rgba(180, 240, 100, 0.75)',
        'rgba(255, 255, 190, 0.85)'
      ];

      for (let i = 0; i < bladeCount; i++) {
        const x = (i / bladeCount) * width + (Math.random() * 6 - 3);
        const bladeH = Math.random() * (height * 0.26) + height * 0.12;
        const bladeW = Math.random() * 3.5 + 2;
        const color = greenTones[Math.floor(Math.random() * greenTones.length)];
        const highlightColor = highlightTones[Math.floor(Math.random() * highlightTones.length)];

        blades.push({
          x,
          baseY: height + 10,
          height: bladeH,
          width: bladeW,
          bendAngle: 0,
          speed: Math.random() * 0.025 + 0.015,
          phase: (x / width) * 8 + Math.random() * 2,
          color,
          highlightColor
        });
      }
    };

    initParticles();
    initGrass();

    let time = 0;

    const render = () => {
      time += 0.025;
      ctx.clearRect(0, 0, width, height);

      // 1. Wind Gust simulation across field
      const globalWind = Math.sin(time * 0.6) * 0.25 + Math.sin(time * 1.4) * 0.15 + 0.5; // Always blowing to the right

      // 2. Draw Wind Waves over the middle grass area (organic wind ripples)
      const fieldTop = height * 0.48;
      const fieldHeight = height * 0.52;
      const rippleGradient = ctx.createLinearGradient(0, fieldTop, 0, height);
      rippleGradient.addColorStop(0, 'rgba(120, 220, 70, 0)');
      rippleGradient.addColorStop(0.3, 'rgba(180, 255, 120, 0.07)');
      rippleGradient.addColorStop(0.7, 'rgba(230, 255, 160, 0.09)');
      rippleGradient.addColorStop(1, 'rgba(100, 200, 50, 0)');

      // Draw rolling wind bands
      ctx.save();
      for (let w = 0; w < 3; w++) {
        const waveX = ((time * (35 + w * 18)) % (width + 600)) - 300;
        const waveGrad = ctx.createRadialGradient(
          waveX,
          fieldTop + fieldHeight * 0.5,
          20,
          waveX,
          fieldTop + fieldHeight * 0.5,
          260
        );
        waveGrad.addColorStop(0, 'rgba(255, 255, 200, 0.14)');
        waveGrad.addColorStop(0.5, 'rgba(160, 255, 100, 0.08)');
        waveGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

        ctx.fillStyle = waveGrad;
        ctx.beginPath();
        ctx.ellipse(
          waveX,
          fieldTop + (fieldHeight * (0.3 + w * 0.25)),
          340,
          70,
          0.12,
          0,
          Math.PI * 2
        );
        ctx.fill();
      }
      ctx.restore();

      // 3. Draw Foreground Waving Grass Stalks
      ctx.save();
      for (let i = 0; i < blades.length; i++) {
        const blade = blades[i];
        // Dynamic sway driven by sine waves + localized wind wave
        const windRipple = Math.sin(time * 2 + blade.phase) * 0.35 + globalWind * 0.65;
        const tipX = blade.x + windRipple * (blade.height * 0.42);
        const tipY = blade.baseY - blade.height + Math.abs(windRipple) * 8;
        const controlX = blade.x + windRipple * (blade.height * 0.18);
        const controlY = blade.baseY - blade.height * 0.55;

        // Blade stalk
        ctx.beginPath();
        ctx.moveTo(blade.x - blade.width * 0.5, blade.baseY);
        ctx.quadraticCurveTo(controlX, controlY, tipX, tipY);
        ctx.quadraticCurveTo(controlX + blade.width * 0.3, controlY, blade.x + blade.width * 0.5, blade.baseY);
        ctx.closePath();

        ctx.fillStyle = blade.color;
        ctx.fill();

        // Tip sun highlight
        ctx.beginPath();
        ctx.moveTo(controlX, controlY);
        ctx.lineTo(tipX, tipY);
        ctx.strokeStyle = blade.highlightColor;
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }
      ctx.restore();

      // 4. Draw Floating Wind Spores & Pollen drifting left to right
      ctx.save();
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.speedX * (globalWind * 1.3 + 0.5);
        p.y += p.speedY + Math.sin(time * 2 + p.swayOffset) * 0.6;

        if (p.x > width + 20) {
          p.x = -20;
          p.y = Math.random() * height;
        }
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 230, ${p.opacity * (0.7 + Math.sin(time * 3 + p.swayOffset) * 0.3)})`;
        ctx.shadowColor = 'rgba(255, 255, 200, 0.6)';
        ctx.shadowBlur = 4;
        ctx.fill();
      }
      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* 1. High-Resolution Base Sunny Field Image with subtle breathing zoom */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-1000"
        style={{
          backgroundImage: `url('/farm-background.png')`,
          backgroundAttachment: 'fixed',
          backgroundPosition: 'center 40%',
          filter: 'brightness(0.97) contrast(1.04) saturate(1.1)'
        }}
      />

      {/* 2. Realistic Dynamic Moving Clouds Layers drifting left to right across the sky */}
      {/* Cloud Layer 1 - Deep soft clouds (Slow Drift ~120s) */}
      <div className="absolute top-0 left-0 w-[300vw] h-[45vh] overflow-hidden pointer-events-none opacity-40 animate-clouds-slow">
        <svg viewBox="0 0 2400 600" className="w-full h-full preserve-3d" fill="none">
          <path
            d="M200,220 Q280,120 400,160 Q520,100 640,170 Q760,110 880,180 Q960,130 1080,210 Q1200,150 1320,230 Q1440,160 1560,240 Q1680,170 1800,230 Q1920,150 2040,240 L2400,320 L0,320 Z"
            fill="url(#cloudGrad1)"
            filter="blur(16px)"
          />
          <defs>
            <linearGradient id="cloudGrad1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.8" />
              <stop offset="70%" stopColor="#dbeafe" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#bae6fd" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Cloud Layer 2 - Fluffy Cumulus Clouds drifting across the sky (~70s) */}
      <div className="absolute top-[2vh] left-[-50vw] w-[300vw] h-[40vh] overflow-hidden pointer-events-none opacity-55 animate-clouds-medium">
        <svg viewBox="0 0 2400 500" className="w-full h-full" fill="none">
          {/* Cloud Group A */}
          <g filter="blur(10px)">
            <ellipse cx="320" cy="180" rx="140" ry="70" fill="url(#cumulusGrad)" />
            <ellipse cx="440" cy="150" rx="160" ry="90" fill="url(#cumulusGrad)" />
            <ellipse cx="560" cy="180" rx="130" ry="65" fill="url(#cumulusGrad)" />
            <ellipse cx="450" cy="200" rx="220" ry="60" fill="url(#cumulusGrad)" />

            <ellipse cx="1120" cy="190" rx="170" ry="80" fill="url(#cumulusGrad)" />
            <ellipse cx="1260" cy="160" rx="180" ry="95" fill="url(#cumulusGrad)" />
            <ellipse cx="1400" cy="190" rx="150" ry="75" fill="url(#cumulusGrad)" />

            <ellipse cx="1920" cy="170" rx="150" ry="75" fill="url(#cumulusGrad)" />
            <ellipse cx="2060" cy="140" rx="170" ry="90" fill="url(#cumulusGrad)" />
            <ellipse cx="2200" cy="170" rx="140" ry="70" fill="url(#cumulusGrad)" />
          </g>
          <defs>
            <linearGradient id="cumulusGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
              <stop offset="60%" stopColor="#e0f2fe" stopOpacity="0.75" />
              <stop offset="100%" stopColor="#94a3b8" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Cloud Layer 3 - Light Wispy Cirrus clouds (~45s) */}
      <div className="absolute top-[8vh] left-[-80vw] w-[300vw] h-[35vh] overflow-hidden pointer-events-none opacity-40 animate-clouds-fast">
        <svg viewBox="0 0 2400 400" className="w-full h-full" fill="none">
          <g filter="blur(8px)">
            <ellipse cx="680" cy="120" rx="110" ry="45" fill="#ffffff" />
            <ellipse cx="760" cy="105" rx="130" ry="55" fill="#ffffff" />
            <ellipse cx="850" cy="120" rx="100" ry="40" fill="#ffffff" />

            <ellipse cx="1580" cy="130" rx="120" ry="50" fill="#ffffff" />
            <ellipse cx="1670" cy="110" rx="140" ry="60" fill="#ffffff" />
            <ellipse cx="1780" cy="130" rx="110" ry="45" fill="#ffffff" />
          </g>
        </svg>
      </div>

      {/* 3. Radiant Pulsing Sun Flare matching the sun position in the picture */}
      <div className="absolute top-[18%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[320px] h-[320px] rounded-full pointer-events-none">
        {/* Core radiant glow */}
        <div className="w-full h-full rounded-full bg-radial from-amber-100/40 via-yellow-300/15 to-transparent blur-2xl animate-pulse-glow" />
        {/* Sunbeam burst effect */}
        <div
          className="absolute inset-[-40px] rounded-full bg-radial from-white/30 via-amber-200/10 to-transparent blur-3xl"
          style={{ animation: 'spin 40s linear infinite' }}
        />
      </div>

      {/* 4. Canvas-based dynamic waving grass stalks, wind waves & floating pollen */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10"
      />

      {/* 5. Sheer transparent contrast scrim to ensure 100% crystal-clear readability for white text */}
      <div
        className="absolute inset-0 pointer-events-none z-20"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(3, 14, 9, 0.12) 0%, rgba(6, 24, 16, 0.32) 65%, rgba(2, 10, 7, 0.55) 100%)',
        }}
      />
    </div>
  );
};
