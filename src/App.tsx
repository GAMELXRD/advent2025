
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { CalendarGrid } from './components/CalendarGrid';
import { DayView } from './components/DayView';
import { AdminPanel } from './components/AdminPanel';
import { getDayContent } from './content';


// Extend the Window interface to satisfy TypeScript
declare global {
  interface Window {
    openAdmin: () => void;
  }
}

const HIDDEN_MESSAGES = [
  "Спасибо, что вы со мной!",
  "Космического настроения! 🪐",
  "Хьюстон, у нас все отлично! 🛸",
  "С наступающим 2026 годом! 🎄",
  "Не забудьте проверить уровень топлива! ☕️",
  "Все системы работают нормально! 🤖",
  "Держим связь, не теряемся в чате! 📡",
  "Космический вайб в полном разгаре! 🔥",
  "Спасибо за сигналы поддержки! 📶",
  "Полетим на Марс вместе? 🔴",
  "Сделано с 💖 gamelxrd (1.12.2025)",
  "Жанне привет! сосал?",
  "aniv_bobiv - настоящий человек.",
  "Стримера зовут Джек! Скеллингтон Джек 👻",
  "Надо составить тир-лист новогодних блюд!",
  "Ты дома один?",
  "КИРРРРРРЮЮЮ ЧААААН!",
  "Никто не просил этого, а стример сделал 😁",
  "Он ебанутый, мир ебанутый — ты тоже ебанутый, потому что продолжаешь нажимать.",
  "Следи за космосом, там много Чужих...",
  "СТРИМЕР ВЕРНИ БАЛЛЫ!",
  "🎬 Сейчас мы ничего не смотрим."
];

const App: React.FC = () => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [clickedDay, setClickedDay] = useState<number | null>(null);
  const [whiteoutOpacity, setWhiteoutOpacity] = useState(0);
  const [flashColor, setFlashColor] = useState('rgba(255,255,255,1)');
  
  // Header Interaction State
  const [headerMessage, setHeaderMessage] = useState<string | null>(null);
  const [isMessageVisible, setIsMessageVisible] = useState(false);
  const messageTimeoutRef = useRef<any>(null);
  
  // Animation Locking State
  const [isAnimating, setIsAnimating] = useState(false);
  // Ref for synchronous blocking (prevents race conditions)
  const isAnimatingRef = useRef(false);
  
  // Admin Mode State
  const [isAdminMode, setIsAdminMode] = useState(false);

  
  // Expose Admin Trigger to Console
  useEffect(() => {
    window.openAdmin = () => {
      setIsAdminMode(true);
      console.log('%c ⚙️ Admin Panel Activated ', 'background: #9333ea; color: #fff; padding: 4px; border-radius: 4px; font-weight: bold;');
    };

    // Cleanup
    return () => {
      // @ts-ignore
      delete window.openAdmin;
    };
  }, []);

  // Memoize star generation
  const stars = useMemo(() => {
    return Array.from({ length: 70 }).map((_, i) => ({
      id: i,
      size: Math.random() > 0.8 ? 3 : 2,
      top: Math.random() * 100,
      left: Math.random() * 100,
      delay: Math.random() * 5,
      opacity: Math.random() * 0.5 + 0.3
    }));
  }, []);

  // Color mapping for presets to hex/rgba for the flash effect
  const getColorFromPreset = (preset: string): string => {
    const map: Record<string, string> = {
      default: '#f8fafc', // slate-50
      amber: '#fcd34d',   // amber-300
      red: '#f87171',     // red-400
      green: '#34d399',   // emerald-400
      blue: '#60a5fa',    // blue-400
      cyan: '#22d3ee',    // cyan-400
      purple: '#c084fc',  // purple-400
      pink: '#f472b6',    // pink-400
    };
    return map[preset] || '#fcd34d';
  };

  const handleDaySelect = (day: number) => {
    // Prevent multiple clicks immediately
    if (isAnimatingRef.current) return;
    
    isAnimatingRef.current = true;
    setIsAnimating(true);

    // Get content to determine color
    const content = getDayContent(day);
    const colorSetting = content.customColor;
    
    // Fix: Default to the 'default' preset (white/slate) instead of amber
    let finalColor = getColorFromPreset('default'); 

    if (colorSetting) {
      if (colorSetting.startsWith('#')) {
        finalColor = colorSetting;
      } else {
        finalColor = getColorFromPreset(colorSetting);
      }
    } else {
      // Legacy Fallback logic if no custom color is saved
      if (day === 10) finalColor = '#f87171'; // Red
      else if (day === 20) finalColor = '#c084fc'; // Purple
      // Day 1 usually has customColor set in content.ts defaults, so it won't reach here
    }

    setFlashColor(finalColor);
    setClickedDay(day);

    setTimeout(() => {
      setWhiteoutOpacity(1);
    }, 600);

    setTimeout(() => {
      setSelectedDay(day);
      setClickedDay(null); 
    }, 2200);

    setTimeout(() => {
      setWhiteoutOpacity(0);
      setIsAnimating(false);
      isAnimatingRef.current = false;
    }, 2500);
  };

  const handleBack = () => {
    setSelectedDay(null);
  };

  const handleHeaderClick = () => {
    // Clear any existing timeout to prevent race conditions
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }

    const randomMsg = HIDDEN_MESSAGES[Math.floor(Math.random() * HIDDEN_MESSAGES.length)];
    setHeaderMessage(randomMsg);
    setIsMessageVisible(true);

    // Calculate duration: ~600ms per word, but minimum 3 seconds (3000ms)
    const wordCount = randomMsg.split(' ').length;
    const duration = Math.max(3000, wordCount * 600);

    messageTimeoutRef.current = setTimeout(() => {
      setIsMessageVisible(false);
    }, duration);
  };

  return (
    <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center overflow-hidden relative text-white font-sans selection:bg-purple-500 selection:text-white">
      
      {/* Cosmic Background Effects */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-purple-900/20 via-slate-950 to-black"></div>
        
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute bg-white animate-star-twinkle"
            style={{
              top: `${star.top}%`,
              left: `${star.left}%`,
              width: `${star.size}px`,
              height: `${star.size}px`,
              animationDelay: `${star.delay}s`,
              opacity: star.opacity
            }}
          />
        ))}
      </div>

      {/* Interaction Shield: Blocks all clicks during animation */}
      {isAnimating && <div className="fixed inset-0 z-[9999] cursor-wait" />}

      {/* Light Flood Overlay - Removed mix-blend-hard-light for solid opacity */}
      <div 
        className={`absolute inset-0 z-50 transition-all ease-in-out ${whiteoutOpacity > 0 ? 'pointer-events-auto' : 'pointer-events-none'}`}
        style={{ 
          backgroundColor: flashColor,
          opacity: whiteoutOpacity, 
          transitionDuration: whiteoutOpacity === 1 ? '1600ms' : '1000ms' 
        }}
      />

      {/* Admin Toggle Button (Top Right) */}
      {/* <button 
        onClick={() => setIsAdminMode(!isAdminMode)}
        className="absolute top-4 right-4 z-40 opacity-30 hover:opacity-100 transition-opacity p-2 text-white"
        title="Admin Settings"
      >
        ⚙️
      </button> */}

      {/* Content Container */}
      <main className="relative z-10 flex flex-col items-center w-full h-full py-8">
        
        {isAdminMode ? (
          <div className="w-full h-full flex items-center justify-center px-4 animate-grid-pop">
            <AdminPanel onClose={() => setIsAdminMode(false)} />
          </div>
        ) : !selectedDay ? (
          <>
            {/* Header */}
            <header className="mb-0 md:mb-0 text-center px-4 transition-opacity duration-500 animate-slide-down flex flex-col items-center gap-2 min-h-[120px] justify-center">
              <h1 
                onClick={handleHeaderClick}
                className="font-pixel text-4xl md:text-6xl font-bold leading-relaxed text-transparent bg-clip-text bg-gradient-to-r from-purple-300 via-blue-200 to-purple-300 drop-shadow-[0_0_15px_rgba(168,85,247,0.5)] uppercase tracking-widest cursor-pointer select-none hover:scale-105 active:scale-95 transition-transform duration-200"
              >
                Адвент <br className="block sm:hidden" /> Ивент
              </h1>
              
              <div className={`h-8 text-sm md:text-lg font-mono text-purple-300/80 transition-all duration-700 ease-in-out ${isMessageVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                {headerMessage || "..."}
              </div>
            </header>

            {/* The Calendar Grid Area */}
            <div className="flex-grow w-[95%] md:w-[85%] max-w-[1400px] flex items-center justify-center transition-all duration-1000 ease-in">
              <CalendarGrid 
                onDaySelect={handleDaySelect} 
                clickedDay={clickedDay}
                locked={isAnimating}
              />
            </div>
          </>
        ) : (
          /* The Inner Content View */
          <div className="w-full max-w-5xl px-4 animate-[fadeIn_1s_ease-out]">
            <DayView key={selectedDay} day={selectedDay} onBack={handleBack} />
          </div>
        )}
        
      </main>
    </div>
  );
};

export default App;
