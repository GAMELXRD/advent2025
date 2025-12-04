
import React, { useState, useEffect } from 'react';
import { getDayContent, DefaultVisual, TodoItem, ClipItem } from '../content';

interface DayViewProps {
  day: number;
  onBack: () => void;
}

export const DayView: React.FC<DayViewProps> = ({ day, onBack }) => {
  // Load content for this specific day from our config file
  const content = getDayContent(day);
  const storageKey = `cosmic_advent_day_${day}_todos`;

  // Initialize State with LocalStorage Merge Logic
  const [todos, setTodos] = useState<TodoItem[]>(() => {
    try {
      // 1. Get the base list from config (Source of Truth for Text & IDs)
      const baseTodos = content.todos;
      
      // 2. Try to retrieve saved progress from LocalStorage
      const savedData = localStorage.getItem(storageKey);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData) as { id: number; done: boolean }[];
        
        // 3. Merge: Map over base config, applying saved 'done' status where IDs match
        return baseTodos.map(baseItem => {
          const savedItem = parsedData.find(p => p.id === baseItem.id);
          // If found in storage, use storage 'done' status. Otherwise use default.
          return savedItem ? { ...baseItem, done: savedItem.done } : baseItem;
        });
      }
      
      // If no local storage, return default config
      return baseTodos;
    } catch (error) {
      console.warn("Failed to load todos from localStorage:", error);
      return content.todos;
    }
  });
  
  // NOTE: 'hidden' means strictly hidden (spoiler mode), not openable by click.
  const isHidden = content.hidden;

  const toggleTodo = (id: number) => {
    const newTodos = todos.map(t => t.id === id ? { ...t, done: !t.done } : t);
    setTodos(newTodos);

    // Save progress to LocalStorage
    // We only save ID and Status to keep the storage lightweight and avoid overwriting text updates from Admin
    try {
      const stateToSave = newTodos.map(t => ({ id: t.id, done: t.done }));
      localStorage.setItem(storageKey, JSON.stringify(stateToSave));
    } catch (error) {
      console.error("Failed to save todos:", error);
    }
  };

  // Logic to determine what to render in the visual box
  const renderVisualContent = () => {
    if (content.imageBase64) {
      return (
        <img 
          src={content.imageBase64} 
          alt={`Day ${day}`} 
          className="w-full h-full object-cover animate-[fadeIn_0.5s_ease-out]"
        />
      );
    }
    if (content.imageUrl) {
      return (
        <img 
          src={content.imageUrl} 
          alt={`Day ${day}`} 
          className="w-full h-full object-cover animate-[fadeIn_0.5s_ease-out]"
          onError={(e) => {
            // Fallback if link is broken
            (e.target as HTMLImageElement).style.display = 'none';
          }}
        />
      );
    }
    if (content.imageComponent) {
      return content.imageComponent;
    }
    return <DefaultVisual />;
  };

  // NORMALIZE CLIPS
  // We want a unified array of clips, whether they come from the new 'clips' array or the old 'clipLink' string
  const activeClips: ClipItem[] = [];
  
  // 1. Add new style clips
  if (content.clips && content.clips.length > 0) {
    activeClips.push(...content.clips);
  } 
  // 2. Add legacy clip if no new clips exist AND it's not empty/hash
  else if (content.clipLink && content.clipLink !== '#') {
    activeClips.push({
      id: 'legacy-clip',
      url: content.clipLink,
      label: 'Клип дня'
    });
  }

  // SVG Noise Pattern Data URI
  const noisePattern = `data:image/svg+xml;charset=utf-8,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E`;

  return (
    <div className="bg-slate-900/80 border-2 border-purple-500/30 backdrop-blur-md p-6 md:p-10 rounded-xl shadow-[0_0_50px_rgba(147,51,234,0.15)] flex flex-col gap-8 relative overflow-hidden min-h-[600px]">
      
      {/* Back Button */}
      <button 
        onClick={onBack}
        className="absolute top-4 right-4 z-20 text-slate-400 hover:text-white uppercase text-[0.6rem] md:text-xs tracking-widest border border-slate-700 hover:border-purple-400 px-3 py-2 rounded transition-all font-bold font-sans"
      >
        ← Назад
      </button>

      {/* Header */}
      <header className="border-b-2 border-purple-500/20 pb-4 mr-16 mt-2">
        <h2 className="text-3xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-amber-500 uppercase tracking-wide drop-shadow-sm font-sans leading-relaxed py-2">
          {content.title || `День ${day}`}
        </h2>
      </header>

      <div className="flex flex-col md:flex-row gap-8">
        
        {/* Left Column: Visual & To-Do List */}
        <div className="flex-1 flex flex-col gap-6">
          
          {/* Procedural Cosmic Art / Image Placeholder with Spoiler Curtain */}
          <div className="w-full aspect-video bg-slate-950 rounded border border-slate-700 relative overflow-hidden group shadow-lg shrink-0">
            
            {/* The Actual Content - Wrapped for Blur */}
            <div className={`w-full h-full transition-all duration-500 ${isHidden ? 'blur scale-110 opacity-60' : ''}`}>
                {renderVisualContent()}
            </div>

            {/* The Spoiler Overlay (Telegram Style) */}
            {isHidden && (
              <div 
                className="absolute inset-0 z-30 bg-slate-900/50 flex items-center justify-center overflow-hidden select-none cursor-default"
              >
                  {/* Animated Noise Layer */}
                  <div 
                    className="absolute inset-0 w-full h-full opacity-50 animate-noise"
                    style={{
                      backgroundImage: `url("${noisePattern}")`,
                      backgroundRepeat: 'repeat',
                      filter: 'contrast(170%) brightness(150%)',
                    }}
                  />
                  
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 w-[50%] h-full bg-gradient-to-r from-transparent via-white/10 to-transparent blur-xl animate-shimmer" />

                  {/* Icon (Optional) */}
                  <div className="relative z-10 opacity-60 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] flex flex-col items-center gap-2">
                     <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="1" y1="1" x2="23" y2="23"></line>
                        <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55"></path>
                        <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39"></path>
                        <path d="M10.71 5.05A16 16 0 0 1 22.58 9"></path>
                        <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88"></path>
                        <path d="M8.53 16.11a6 6 0 0 1 6.95 0"></path>
                        <line x1="12" y1="20" x2="12.01" y2="20"></line>
                     </svg>
                     <span className="text-[10px] md:text-xs font-bold uppercase tracking-[0.2em] text-slate-300">Signal Lost</span>
                  </div>
              </div>
            )}
          </div>

          {/* To-Do List */}
          <div className="bg-slate-950/50 p-4 rounded border border-slate-800 h-fit">
            <h3 className="text-sm md:text-base font-bold text-purple-300 uppercase border-b border-purple-500/20 pb-2 mb-2 tracking-wider font-sans">
              Миссия на сегодня:
            </h3>
            
            <ul className="space-y-3 font-sans">
              {todos.map(todo => (
                <li 
                  key={todo.id} 
                  className="flex items-center gap-3 cursor-pointer group"
                  onClick={() => toggleTodo(todo.id)}
                >
                  <div className={`
                    w-5 h-5 border-2 flex items-center justify-center transition-colors flex-shrink-0 rounded-sm
                    ${todo.done ? 'bg-green-500 border-green-500' : 'bg-transparent border-slate-600 group-hover:border-purple-400'}
                  `}>
                    {todo.done && <span className="text-black text-[10px] font-bold">✓</span>}
                  </div>
                  <span className={`
                    text-sm md:text-base transition-all leading-relaxed font-medium
                    ${todo.done ? 'text-slate-500 line-through' : 'text-slate-200 group-hover:text-purple-200'}
                  `}>
                    {todo.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Description & Links */}
        <div className="flex-1 flex flex-col gap-6">
          
          <div className="text-lg leading-8 text-slate-300 text-justify font-normal tracking-wide font-sans">
            {content.description}
          </div>

          <div className="flex flex-col gap-4 font-sans">
              {/* Stream Recording Link */}
              <a 
                href={content.streamLink} 
                className={`block p-4 border border-dashed border-slate-700 rounded transition-colors bg-slate-900/30 group ${!content.streamLink || content.streamLink === '#' ? 'opacity-50 cursor-not-allowed' : 'hover:border-red-500/50'}`}
                target='_blank'
              >
                 <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center group-hover:bg-red-500/20 transition-colors">
                       <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-red-400 border-b-[6px] border-b-transparent ml-1"></div>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-bold">Запись</span>
                      <span className="text-sm md:text-base text-slate-200 group-hover:text-red-300 transition-colors font-bold">Смотреть стрим #{day}</span>
                    </div>
                 </div>
              </a>

              {/* Multiple Clip Buttons */}
              {activeClips.length > 0 ? (
                <div className="grid grid-cols-1 gap-3">
                  {activeClips.map((clip) => (
                    <a 
                      key={clip.id}
                      href={clip.url} 
                      className={`block p-4 border border-dashed border-slate-700 rounded transition-colors bg-slate-900/30 group ${!clip.url || clip.url === '#' ? 'opacity-50 cursor-not-allowed' : 'hover:border-blue-500/50'}`}
                      target='_blank'
                    >
                      <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors shrink-0">
                            <span className="text-lg">🎬</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-[10px] md:text-xs text-slate-400 uppercase tracking-wider font-bold">Хайлайт</span>
                            <span className="text-sm md:text-base text-slate-200 group-hover:text-blue-300 transition-colors font-bold">{clip.label}</span>
                          </div>
                      </div>
                    </a>
                  ))}
                </div>
              ) : (
                /* Empty state spacer or fallback if needed */
                null
              )}
          </div>
        </div>

      </div>

      {/* Date Footer */}
      <div className="absolute bottom-3 right-5 opacity-50 text-sm md:text-base font-mono tracking-widest text-slate-400">
        {day < 10 ? `0${day}` : day}.12.2025
      </div>
    </div>
  );
};
