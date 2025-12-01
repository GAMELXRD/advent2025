
import React, { useMemo } from 'react';

interface AdventCubeProps {
  day: number;
  onClick: () => void;
  isOpen: boolean;
  isRevealed?: boolean;
  customColor?: string; // Can be a preset name (e.g., 'red') OR a hex code (e.g., '#ff0000')
  isLocked?: boolean; // New prop to disable hover effects during global animation
}

// Theme definition type
interface Theme {
  glowShadow: string; // The outer glow/contour
  border: string;     // Border color on hover
  rayColor: string;   // Color of light rays
  openBg: string;     // The bright interior background
  openShadow: string; // Intense glow when fully open
  textColor: string;  // Number color
}

// Predefined themes mapped by color name
const THEMES: Record<string, Theme> = {
  default: {
    glowShadow: 'shadow-[0_0_20px_5px_rgba(255,255,255,0.15)]',
    border: 'group-hover:border-slate-400',
    rayColor: 'bg-white/40',
    openBg: 'bg-gradient-to-br from-slate-100 to-slate-300',
    openShadow: 'shadow-[0_0_60px_20px_rgba(255,255,255,0.5)]',
    textColor: 'text-slate-400 group-hover:text-slate-200'
  },
  amber: {
    glowShadow: 'shadow-[0_0_20px_5px_rgba(245,158,11,0.3)]',
    border: 'group-hover:border-amber-400/60',
    rayColor: 'bg-amber-200/50',
    openBg: 'bg-gradient-to-br from-amber-100 to-amber-300',
    openShadow: 'shadow-[0_0_60px_20px_rgba(245,158,11,0.7)]',
    textColor: 'text-amber-400 group-hover:text-amber-200'
  },
  red: {
    glowShadow: 'shadow-[0_0_20px_5px_rgba(239,68,68,0.3)]',
    border: 'group-hover:border-red-400/60',
    rayColor: 'bg-red-200/50',
    openBg: 'bg-gradient-to-br from-red-100 to-red-300',
    openShadow: 'shadow-[0_0_60px_20px_rgba(239,68,68,0.7)]',
    textColor: 'text-red-400 group-hover:text-red-200'
  },
  green: {
    glowShadow: 'shadow-[0_0_20px_5px_rgba(16,185,129,0.3)]',
    border: 'group-hover:border-emerald-400/60',
    rayColor: 'bg-emerald-200/50',
    openBg: 'bg-gradient-to-br from-emerald-100 to-emerald-300',
    openShadow: 'shadow-[0_0_60px_20px_rgba(16,185,129,0.7)]',
    textColor: 'text-emerald-400 group-hover:text-emerald-200'
  },
  blue: {
    glowShadow: 'shadow-[0_0_20px_5px_rgba(59,130,246,0.3)]',
    border: 'group-hover:border-blue-400/60',
    rayColor: 'bg-blue-200/50',
    openBg: 'bg-gradient-to-br from-blue-100 to-blue-300',
    openShadow: 'shadow-[0_0_60px_20px_rgba(59,130,246,0.7)]',
    textColor: 'text-blue-400 group-hover:text-blue-200'
  },
  cyan: {
    glowShadow: 'shadow-[0_0_20px_5px_rgba(34,211,238,0.3)]',
    border: 'group-hover:border-cyan-400/60',
    rayColor: 'bg-cyan-200/50',
    openBg: 'bg-gradient-to-br from-cyan-100 to-cyan-300',
    openShadow: 'shadow-[0_0_60px_20px_rgba(34,211,238,0.7)]',
    textColor: 'text-cyan-400 group-hover:text-cyan-200'
  },
  purple: {
    glowShadow: 'shadow-[0_0_20px_5px_rgba(168,85,247,0.3)]',
    border: 'group-hover:border-purple-400/60',
    rayColor: 'bg-purple-200/50',
    openBg: 'bg-gradient-to-br from-purple-100 to-purple-300',
    openShadow: 'shadow-[0_0_60px_20px_rgba(168,85,247,0.7)]',
    textColor: 'text-purple-400 group-hover:text-purple-200'
  },
  pink: {
    glowShadow: 'shadow-[0_0_20px_5px_rgba(236,72,153,0.3)]',
    border: 'group-hover:border-pink-400/60',
    rayColor: 'bg-pink-200/50',
    openBg: 'bg-gradient-to-br from-pink-100 to-pink-300',
    openShadow: 'shadow-[0_0_60px_20px_rgba(236,72,153,0.7)]',
    textColor: 'text-pink-400 group-hover:text-pink-200'
  },
};

// Helper to convert HEX to RGB object
const hexToRgb = (hex: string) => {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
  hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
};

export const AdventCube: React.FC<AdventCubeProps> = ({ 
  day, 
  onClick, 
  isOpen, 
  isRevealed = false, 
  customColor,
  isLocked = false
}) => {

  const { colors, cssVars } = useMemo(() => {
    // 1. Check for Dynamic HEX Color
    if (customColor && customColor.startsWith('#')) {
      const rgb = hexToRgb(customColor);
      if (rgb) {
        const { r, g, b } = rgb;
        // Calculate variations for bright interior
        const lr = Math.round(r + (255 - r) * 0.8);
        const lg = Math.round(g + (255 - g) * 0.8);
        const lb = Math.round(b + (255 - b) * 0.8);

        return {
          colors: {
            glowShadow: 'shadow-[0_0_20px_5px_rgba(var(--ac-r),var(--ac-g),var(--ac-b),0.3)]',
            border: 'group-hover:border-[rgba(var(--ac-r),var(--ac-g),var(--ac-b),0.7)]',
            rayColor: 'bg-[rgba(var(--ac-lr),var(--ac-lg),var(--ac-lb),0.6)]',
            openBg: 'bg-[linear-gradient(135deg,rgba(var(--ac-lr),var(--ac-lg),var(--ac-lb),1),rgba(255,255,255,1))]',
            openShadow: 'shadow-[0_0_60px_20px_rgba(var(--ac-r),var(--ac-g),var(--ac-b),0.7)]',
            textColor: 'text-[rgba(var(--ac-lr),var(--ac-lg),var(--ac-lb),1)] group-hover:text-[rgba(var(--ac-r),var(--ac-g),var(--ac-b),0.5)]'
          } as Theme,
          cssVars: {
            '--ac-r': r,
            '--ac-g': g,
            '--ac-b': b,
            '--ac-lr': lr,
            '--ac-lg': lg,
            '--ac-lb': lb,
          } as React.CSSProperties
        };
      }
    }

    // 2. Check for Preset Name
    let theme = THEMES['default'];
    if (customColor && THEMES[customColor]) {
      theme = THEMES[customColor];
    } else {
       // Legacy Fallbacks
       if (day === 10) theme = THEMES['red'];
       if (day === 20) theme = THEMES['purple'];
    }

    return { colors: theme, cssVars: {} as React.CSSProperties };
  }, [day, customColor]);

  return (
    <div 
      // REMOVED 'group' class when isLocked is true. This instantly kills hover effects on children.
      className={`relative w-full aspect-square perspective-1000 ${!isLocked ? 'group' : ''} ${isOpen || isLocked ? 'cursor-default' : 'cursor-pointer'}`}
      onClick={!isOpen && !isLocked ? onClick : undefined}
      style={cssVars}
    >
      
      {/* 
        1. OUTER GLOW (The contour)
      */}
      <div className={`
        absolute inset-0 rounded-xl transition-all duration-500
        ${isOpen ? 'opacity-100 ' + colors.openShadow : 'opacity-0 ' + (isLocked ? '' : 'group-hover:opacity-100 ') + colors.glowShadow}
      `} />

      {/* 
        2. INTERIOR (The Light Source)
        - Behind the door.
        - BRIGHT background.
      */}
      <div className={`
        absolute inset-[1px] rounded-[11px] flex items-center justify-center overflow-hidden
        ${colors.openBg}
        shadow-[inset_0_0_20px_rgba(0,0,0,0.2)]
      `}>
         {/* Light Rays */}
         <div className={`
            absolute inset-0 transition-opacity duration-500
            ${isOpen ? 'opacity-100' : 'opacity-0 ' + (isLocked ? '' : 'group-hover:opacity-100')}
         `}>
             <div className={`absolute w-[200%] h-[40px] ${colors.rayColor} blur-xl rotate-45 animate-pulse`} style={{top: '20%', left: '-50%'}} />
             <div className={`absolute w-[200%] h-[40px] ${colors.rayColor} blur-xl -rotate-45 animate-pulse delay-100`} style={{top: '60%', left: '-50%'}} />
         </div>
      </div>

      {/* 
        3. DOOR (The Front Face)
        - Handles rotation.
        - Modern borders, gradient surface.
        - Contains Particles (OUTSIDE surface).
      */}
      <div className={`
        absolute inset-0 z-20 
        bg-slate-950 
        border border-slate-800 ${isLocked ? '' : colors.border}
        rounded-xl
        flex items-center justify-center
        origin-left transition-transform duration-700 ease-[cubic-bezier(0.3,1.2,0.2,1)]
        shadow-lg backdrop-blur-sm
        ${isOpen 
           ? '[transform:rotateY(-115deg)]' 
           : (isLocked ? '' : 'group-hover:[transform:rotateY(-35deg)]')
        }
      `}>
         {/* Door Surface Texture (Glassy Modern Look) */}
         <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 via-transparent to-black/40 pointer-events-none" />
         
         {/* Particles: Floating ON the door surface for revealed cells */}
         {isRevealed && (
           <div className="absolute inset-0 z-10 pointer-events-none overflow-hidden rounded-xl">
              {Array.from({ length: 20 }).map((_, i) => (
                 <div 
                   key={i}
                   className="absolute bg-white/90 rounded-full animate-snow-fall shadow-[0_0_2px_rgba(255,255,255,0.8)]"
                   style={{
                     width: Math.random() > 0.5 ? '3px' : '3px',
                     height: Math.random() > 0.5 ? '3px' : '3px',
                     left: Math.random() * 100 + '%',
                     top: '-10%', // Start slightly above visible area
                     opacity: 0,
                     animationDelay: Math.random() * 2 + 's',
                     animationDuration: Math.random() * 2 + 2 + 's' // 2-4 seconds fall time
                   }}
                 />
              ))}
           </div>
         )}

         {/* Number */}
         <span className={`
            relative z-40 text-3xl md:text-4xl font-bold transition-colors duration-300 font-sans
            ${isRevealed ? colors.textColor : 'text-slate-200 ' + (isLocked ? '' : 'group-hover:text-white')}
            drop-shadow-md
         `}>
            {day}
         </span>
      </div>
    </div>
  );
};
