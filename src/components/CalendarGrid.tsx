
import React from 'react';
import { AdventCube } from './AdventCube';
import { getDayContent } from '../content';

interface CalendarGridProps {
  onDaySelect: (day: number) => void;
  clickedDay: number | null;
  locked: boolean;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({ onDaySelect, clickedDay, locked }) => {
  // Create an array of 24 days
  // Rows 1-3: 7 items each (21 total)
  // Row 4: 3 items (22, 23, 24)
  const days = Array.from({ length: 24 }, (_, i) => i + 1);

  return (
    <div className="w-full h-full grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 auto-rows-min gap-x-2 md:gap-x-3 lg:gap-x-4 gap-y-6 md:gap-y-8 p-4">
      {days.map((day, index) => {
        const content = getDayContent(day);
        // Check if day is forced open via admin panel
        const isRevealed = content.forceOpen || false;
        const isThisDayClicked = clickedDay === day;

        return (
          <div 
            key={day} 
            className={`
              w-full h-full min-h-[80px] flex items-center justify-center animate-grid-pop
              ${locked && !isThisDayClicked ? 'pointer-events-none' : ''} 
            `}
            style={{ 
              // Stagger animation: each item appears 50ms after the previous one
              animationDelay: `${index * 50}ms` 
            }}
          >
            <div className="w-[85%]">
              <AdventCube 
                day={day} 
                onClick={() => !locked && onDaySelect(day)} 
                isOpen={isThisDayClicked}
                isRevealed={isRevealed}
                customColor={content.customColor}
                isLocked={locked}
              />
            </div>
          </div>
        );
      })}

      {/* Extra Button 1: Twitch / Stream (Spans 2 columns) */}
      <div 
        className={`
          col-span-2 w-full h-full min-h-[80px] flex items-center justify-center animate-grid-pop
          ${locked ? 'pointer-events-none opacity-50 transition-opacity duration-500' : ''}
        `}
        style={{ animationDelay: `${24 * 50}ms` }}
      >
        <div className="w-[90%] h-full">
          <a 
            href="https://www.twitch.tv/gamelxrd"
            target="_blank"
            rel="noopener noreferrer"
            className="relative block w-full aspect-[2.5/1] md:aspect-auto md:h-full rounded-xl bg-[#9146FF]/10 border border-[#9146FF]/40 hover:border-[#9146FF] transition-all duration-300 flex flex-row items-center justify-center gap-3 md:gap-4 group hover:shadow-[0_0_20px_rgba(145,70,255,0.4)] overflow-hidden backdrop-blur-sm px-2 md:px-4"
          >
              <div className="absolute inset-0 bg-gradient-to-r from-[#9146FF]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-3xl md:text-4xl relative z-10 drop-shadow-[0_0_8px_rgba(145,70,255,0.6)] group-hover:scale-110 transition-transform duration-300">👾</span>
              <span className="text-[10px] md:text-sm font-bold text-purple-200 uppercase tracking-widest relative z-10 text-left leading-tight">Смотреть<br/>стрим</span>
          </a>
        </div>
      </div>

      {/* Extra Button 2: Donate / Support (Spans 2 columns) */}
      <div 
        className={`
          col-span-2 w-full h-full min-h-[80px] flex items-center justify-center animate-grid-pop
          ${locked ? 'pointer-events-none opacity-50 transition-opacity duration-500' : ''}
        `}
        style={{ animationDelay: `${25 * 50}ms` }}
      >
        <div className="w-[90%] h-full">
          <a 
            href="https://donatty.com/gamelxrd"
            target="_blank"
            rel="noopener noreferrer"
            className="relative block w-full aspect-[2.5/1] md:aspect-auto md:h-full rounded-xl bg-gradient-to-br from-purple-900/20 to-pink-600/10 border border-pink-500/30 hover:border-pink-400 transition-all duration-300 flex flex-row items-center justify-center gap-3 md:gap-4 group hover:shadow-[0_0_20px_rgba(236,72,153,0.4)] overflow-hidden backdrop-blur-sm px-2 md:px-4"
          >
               <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
               <span className="text-3xl md:text-4xl relative z-10 drop-shadow-[0_0_8px_rgba(236,72,153,0.6)] group-hover:scale-110 transition-transform duration-300">💎</span>
               <span className="text-[10px] md:text-sm font-bold text-pink-200 uppercase tracking-widest relative z-10 text-left">Поддержать</span>
          </a>
        </div>
      </div>

    </div>
  );
};
