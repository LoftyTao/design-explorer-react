import React, { useEffect, useRef } from 'react';
import { BarChart3 } from 'lucide-react';

const COLOR_PALETTES = {
  originalLadybug: [
    [75, 107, 169], [115, 147, 202], [170, 200, 247], [193, 213, 208],
    [245, 239, 103], [252, 230, 74], [239, 156, 21], [234, 123, 0],
    [234, 74, 0], [234, 38, 0]
  ],
};

const SplashScreen = ({ visible, onAnimationComplete }) => {
  const canvasRef = useRef(null);
  const requestRef = useRef();
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const bugs = [];
    const colors = COLOR_PALETTES.originalLadybug.map(c => `rgb(${c.join(',')})`);
    const numBugs = 60;

    class Bug {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.size = Math.random() * 2 + 2;
        this.color = colors[Math.floor(Math.random() * colors.length)];
        this.angle = Math.random() * Math.PI * 2;
        this.turnSpeed = (Math.random() - 0.5) * 0.1;
      }

      update() {
        this.angle += (Math.random() - 0.5) * 0.1 + this.turnSpeed;
        this.vx += Math.cos(this.angle) * 0.1;
        this.vy += Math.sin(this.angle) * 0.1;

        const speed = Math.hypot(this.vx, this.vy);
        if (speed > 3) {
          this.vx = (this.vx / speed) * 3;
          this.vy = (this.vy / speed) * 3;
        }

        this.x += this.vx;
        this.y += this.vy;

        if (this.x < -10) this.x = width + 10;
        if (this.x > width + 10) this.x = -10;
        if (this.y < -10) this.y = height + 10;
        if (this.y > height + 10) this.y = -10;
      }

      draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.beginPath();
        const flutter = Math.sin(Date.now() * 0.02 + this.x) * 0.5;
        ctx.arc(this.x, this.y, this.size + flutter, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (let i = 0; i < numBugs; i++) {
      bugs.push(new Bug());
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      bugs.forEach(bug => {
        bug.update();
        bug.draw(ctx);
      });
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };
    window.addEventListener('resize', handleResize);

    const timer = setTimeout(() => {
        if (onAnimationComplete) onAnimationComplete();
    }, 3500);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(requestRef.current);
      clearTimeout(timer);
    };
  }, [onAnimationComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 bg-zinc-50 flex items-center justify-center transition-opacity duration-1000 ease-in-out pointer-events-none ${visible ? 'opacity-100' : 'opacity-0'}`}
      style={{ pointerEvents: visible ? 'auto' : 'none' }}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      <div className="relative z-10 text-center flex flex-col items-center gap-4 animate-pulse">
        <div className="p-4 bg-white/80 backdrop-blur-sm rounded-full shadow-lg border border-zinc-100">
           <BarChart3 size={48} className="text-zinc-800" strokeWidth={1.5} />
        </div>
        <div>
            <h1 className="text-3xl font-light tracking-[0.2em] text-zinc-800 uppercase">Design Explorer</h1>
            <p className="text-xs text-zinc-400 font-mono mt-2 tracking-widest">Data & Image Synthesis Tool</p>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;