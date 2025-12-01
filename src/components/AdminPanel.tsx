
import React, { useState, useEffect, useRef } from 'react';
import { DayContent, getDayContent, saveDayContent } from '../content';

interface AdminPanelProps {
  onClose: () => void;
}

const AVAILABLE_COLORS = [
  { id: 'default', label: 'Серый', bg: 'bg-slate-500' },
  { id: 'amber', label: 'Золото', bg: 'bg-amber-500' },
  { id: 'red', label: 'Красный', bg: 'bg-red-600' },
  { id: 'green', label: 'Зеленый', bg: 'bg-emerald-500' },
  { id: 'blue', label: 'Синий', bg: 'bg-blue-500' },
  { id: 'cyan', label: 'Циан', bg: 'bg-cyan-400' },
  { id: 'purple', label: 'Фиол.', bg: 'bg-purple-500' },
  { id: 'pink', label: 'Розовый', bg: 'bg-pink-500' },
];

export const AdminPanel: React.FC<AdminPanelProps> = ({ onClose }) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [formData, setFormData] = useState<DayContent | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load data when day changes
  useEffect(() => {
    const data = getDayContent(selectedDay);
    setFormData(JSON.parse(JSON.stringify(data))); // Deep copy to avoid mutation issues
    setIsSaved(false);
    if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
  }, [selectedDay]);

  const handleSave = () => {
    if (formData) {
      saveDayContent(selectedDay, formData);
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    }
  };

  const handleExport = () => {
    if (formData) {
      const jsonString = JSON.stringify(formData, null, 2);
      navigator.clipboard.writeText(jsonString).then(() => {
        alert("JSON скопирован! \n\nВставьте этот текст в файл `content.tsx` внутри объекта `defaultDaysData`, чтобы сохранить изменения в коде навсегда.");
      }).catch(err => {
         console.error("Failed to copy", err);
         alert("Не удалось скопировать автоматически. Смотрите консоль.");
      });
    }
  };

  // Helper for functional state updates to prevent race conditions
  const updateField = (field: keyof DayContent, value: any) => {
    setFormData(prev => {
      if (!prev) return null;
      return { ...prev, [field]: value };
    });
    setIsSaved(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Simple check for size (approx 1MB limit to be safe with localStorage)
    if (file.size > 1000000) {
      alert("Файл слишком большой! Пожалуйста, используйте изображение менее 1 МБ.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      // Update both fields atomically
      setFormData(prev => {
        if (!prev) return null;
        return {
          ...prev,
          imageBase64: reader.result as string,
          imageUrl: '' // Clear URL if uploading a file
        };
      });
      setIsSaved(false);
    };
    reader.readAsDataURL(file);
  };

  const clearImage = () => {
    setFormData(prev => {
      if (!prev) return null;
      return { ...prev, imageBase64: undefined, imageUrl: '' };
    });
    setIsSaved(false);
    if(fileInputRef.current) fileInputRef.current.value = "";
  };

  const updateTodo = (id: number, text: string) => {
    setFormData(prev => {
      if (!prev) return null;
      const newTodos = prev.todos.map(t => t.id === id ? { ...t, text } : t);
      return { ...prev, todos: newTodos };
    });
    setIsSaved(false);
  };

  const addTodo = () => {
    setFormData(prev => {
      if (!prev) return null;
      const newId = Math.max(0, ...prev.todos.map(t => t.id)) + 1;
      return {
        ...prev,
        todos: [...prev.todos, { id: newId, text: "Новая задача", done: false }]
      };
    });
    setIsSaved(false);
  };

  const removeTodo = (id: number) => {
    setFormData(prev => {
      if (!prev) return null;
      return {
        ...prev,
        todos: prev.todos.filter(t => t.id !== id)
      };
    });
    setIsSaved(false);
  };

  if (!formData) return <div className="text-white">Loading...</div>;

  return (
    <div className="w-full max-w-6xl h-[85vh] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex overflow-hidden font-inter">
      
      {/* Sidebar: Day Selector */}
      <div className="w-24 md:w-64 bg-slate-950 border-r border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-800">
          <h2 className="text-purple-400 font-bold text-lg hidden md:block">Admin Panel</h2>
          <h2 className="text-purple-400 font-bold text-lg md:hidden">Adm</h2>
        </div>
        <div className="flex-1 overflow-y-auto p-2 md:p-4 grid grid-cols-1 md:grid-cols-3 gap-2 content-start">
          {Array.from({ length: 24 }, (_, i) => i + 1).map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`
                p-2 md:py-3 rounded text-xs md:text-sm font-bold transition-all
                ${selectedDay === day 
                  ? 'bg-purple-600 text-white shadow-[0_0_10px_rgba(147,51,234,0.5)]' 
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-white'}
              `}
            >
              {day}
            </button>
          ))}
        </div>
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={onClose}
            className="w-full py-2 bg-slate-800 hover:bg-red-900/50 text-slate-300 hover:text-red-200 rounded transition-colors text-sm font-bold"
          >
            Выйти
          </button>
        </div>
      </div>

      {/* Main Editor Area */}
      <div className="flex-1 bg-slate-900 flex flex-col h-full overflow-hidden">
        
        {/* Toolbar */}
        <div className="h-16 border-b border-slate-800 flex items-center justify-between px-6 bg-slate-900/50 backdrop-blur-sm z-10">
          <h3 className="text-xl text-white font-bold">Редактирование Дня #{selectedDay}</h3>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handleExport}
              className="px-4 py-2 rounded text-sm font-bold text-purple-300 border border-purple-500/30 hover:bg-purple-500/10 transition-all"
              title="Скопировать JSON для вставки в код content.tsx"
            >
              Копировать JSON
            </button>

            <button
              onClick={handleSave}
              className={`
                px-6 py-2 rounded font-bold text-white transition-all flex items-center gap-2
                ${isSaved ? 'bg-green-600' : 'bg-purple-600 hover:bg-purple-500'}
              `}
            >
              {isSaved ? 'Сохранено ✓' : 'Сохранить'}
            </button>
          </div>
        </div>

        {/* Scrollable Form */}
        <div className="flex-1 overflow-y-auto p-6 md:p-10">
          <div className="max-w-3xl mx-auto space-y-8">
            
            {/* Top Controls: Toggles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Toggle 1: Force Open */}
              <div className="flex items-center gap-4 p-4 bg-slate-950/50 border border-slate-800 rounded-lg">
                 <div className="flex items-center h-5">
                   <input
                     id="forceOpen"
                     type="checkbox"
                     checked={formData.forceOpen || false}
                     onChange={(e) => updateField('forceOpen', e.target.checked)}
                     className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer"
                   />
                 </div>
                 <div className="text-sm">
                   <label htmlFor="forceOpen" className="font-bold text-white cursor-pointer select-none">Статус: Открыто</label>
                   <p className="text-slate-400 text-xs">Визуально открытая дверца</p>
                 </div>
              </div>

               {/* Toggle 2: Spoiler / Hidden */}
               <div className="flex items-center gap-4 p-4 bg-slate-950/50 border border-slate-800 rounded-lg">
                 <div className="flex items-center h-5">
                   <input
                     id="hiddenContent"
                     type="checkbox"
                     checked={formData.hidden || false}
                     onChange={(e) => updateField('hidden', e.target.checked)}
                     className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 focus:ring-2 cursor-pointer"
                   />
                 </div>
                 <div className="text-sm">
                   <label htmlFor="hiddenContent" className="font-bold text-white cursor-pointer select-none">Спойлер (Блок)</label>
                   <p className="text-slate-400 text-xs">Скрыть картинку "шумной" анимацией (нельзя открыть)</p>
                 </div>
              </div>

            </div>

            {/* Color Picker */}
            <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-lg space-y-2">
                 <div className="flex justify-between items-center mb-2">
                    <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Цвет свечения</label>
                    <span className="text-xs text-slate-500 font-mono">
                       {formData.customColor ? formData.customColor : 'Default'}
                    </span>
                 </div>
                 
                 <div className="flex flex-wrap gap-2 items-center">
                   {AVAILABLE_COLORS.map(color => (
                     <button
                       key={color.id}
                       onClick={() => updateField('customColor', color.id === 'default' ? undefined : color.id)}
                       className={`
                         w-8 h-8 rounded-full border-2 transition-all shadow-lg
                         ${color.bg}
                         ${(formData.customColor === color.id) || (!formData.customColor && color.id === 'default')
                           ? 'border-white scale-110 ring-2 ring-white/20' 
                           : 'border-transparent opacity-60 hover:opacity-100 hover:scale-105'}
                       `}
                       title={color.label}
                     />
                   ))}

                   {/* Divider */}
                   <div className="w-px h-8 bg-slate-700 mx-1"></div>

                   {/* Custom Color Picker */}
                   <div className="relative group flex items-center gap-2">
                      <div className="relative w-10 h-10">
                         <input
                           type="color"
                           value={formData.customColor?.startsWith('#') ? formData.customColor : '#ffffff'}
                           onChange={(e) => updateField('customColor', e.target.value)}
                           className="absolute inset-0 opacity-0 cursor-pointer w-full h-full z-10"
                           title="Выбрать произвольный цвет"
                         />
                         <div 
                            className={`
                              w-10 h-10 rounded-full border-2 flex items-center justify-center bg-slate-800 transition-all overflow-hidden
                              ${formData.customColor?.startsWith('#') ? 'border-white ring-2 ring-white/20' : 'border-slate-600 group-hover:border-slate-400'}
                            `}
                            style={{ backgroundColor: formData.customColor?.startsWith('#') ? formData.customColor : undefined }}
                         >
                            {!formData.customColor?.startsWith('#') && (
                               <span className="text-[10px] text-slate-400 font-bold">HEX</span>
                            )}
                         </div>
                      </div>
                   </div>

                 </div>
              </div>

            {/* Title Input */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Заголовок (опционально)</label>
              <input 
                type="text" 
                value={formData.title || ''}
                onChange={(e) => updateField('title', e.target.value)}
                placeholder={`День ${selectedDay}`}
                className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-purple-500 focus:outline-none transition-colors"
              />
            </div>

            {/* Image Settings */}
             <div className="space-y-4 p-4 bg-slate-950 rounded border border-slate-800">
              <label className="text-xs uppercase tracking-wider text-purple-400 font-bold flex items-center gap-2">
                <span>🖼️ Изображение дня</span>
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Column 1: Input Controls */}
                <div className="space-y-4">
                   
                   {/* Option A: URL */}
                   <div className="space-y-1">
                      <span className="text-xs text-slate-500 font-bold">Вариант 1: Ссылка на картинку</span>
                      <input 
                        type="text" 
                        value={formData.imageUrl || ''}
                        onChange={(e) => {
                          // Atomically update URL and clear Base64
                          setFormData(prev => {
                            if (!prev) return null;
                            return {
                              ...prev,
                              imageUrl: e.target.value,
                              imageBase64: undefined
                            };
                          });
                          setIsSaved(false);
                        }}
                        placeholder="https://example.com/image.jpg"
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-xs text-white focus:border-purple-500 focus:outline-none"
                      />
                   </div>

                   <div className="text-center text-slate-600 text-xs font-bold">- ИЛИ -</div>

                   {/* Option B: Upload */}
                   <div className="space-y-1">
                      <span className="text-xs text-slate-500 font-bold">Вариант 2: Загрузить файл (макс 1МБ)</span>
                      <input 
                        ref={fileInputRef}
                        type="file" 
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-purple-300 hover:file:bg-slate-700"
                      />
                   </div>

                   {/* Clear Button */}
                   {(formData.imageUrl || formData.imageBase64) && (
                     <button 
                       onClick={clearImage}
                       className="text-xs text-red-400 hover:text-red-300 underline pt-2"
                     >
                       Удалить картинку и вернуть стандартную
                     </button>
                   )}
                </div>

                {/* Column 2: Preview */}
                <div className="flex items-center justify-center bg-slate-900 border border-slate-700 rounded overflow-hidden aspect-video relative group">
                  {formData.imageBase64 ? (
                    <img src={formData.imageBase64} className="w-full h-full object-cover" alt="Preview" />
                  ) : formData.imageUrl ? (
                    <img src={formData.imageUrl} className="w-full h-full object-cover" alt="Preview" onError={(e) => (e.target as HTMLImageElement).style.display = 'none'}/>
                  ) : (
                    <div className="text-slate-600 text-xs">Нет картинки</div>
                  )}
                  {formData.hidden && (
                    <div className="absolute inset-0 bg-slate-950/80 flex items-center justify-center text-purple-300 text-xs font-bold border-2 border-dashed border-purple-500/50">
                        Скрыто (Спойлер)
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-bold transition-opacity pointer-events-none">
                    Предпросмотр
                  </div>
                </div>
              </div>
            </div>

            {/* Description Input */}
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Описание</label>
              <textarea 
                value={typeof formData.description === 'string' ? formData.description : ''}
                onChange={(e) => updateField('description', e.target.value)}
                placeholder="Введите текст истории..."
                rows={6}
                className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-purple-500 focus:outline-none transition-colors leading-relaxed"
              />
            </div>

            {/* Links Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Ссылка на стрим</label>
                <input 
                  type="text" 
                  value={formData.streamLink || ''}
                  onChange={(e) => updateField('streamLink', e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-purple-500 focus:outline-none transition-colors text-sm"
                />
              </div>
              <div className="space-y-2">
                 <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Ссылка на клип</label>
                <input 
                  type="text" 
                  value={formData.clipLink || ''}
                  onChange={(e) => updateField('clipLink', e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-slate-950 border border-slate-700 rounded p-3 text-white focus:border-purple-500 focus:outline-none transition-colors text-sm"
                />
              </div>
            </div>

            {/* Todos Section */}
            <div className="space-y-4 pt-4 border-t border-slate-800">
               <div className="flex items-center justify-between">
                  <label className="text-xs uppercase tracking-wider text-slate-500 font-bold">Список задач (To-Do)</label>
                  <button 
                    onClick={addTodo}
                    className="text-xs bg-slate-800 hover:bg-slate-700 text-purple-300 px-3 py-1 rounded transition-colors"
                  >
                    + Добавить
                  </button>
               </div>
               
               <div className="space-y-3">
                 {formData.todos.map((todo, index) => (
                   <div key={todo.id} className="flex items-center gap-3">
                     <span className="text-slate-600 text-xs font-mono w-4">{index + 1}.</span>
                     <input 
                        type="text" 
                        value={todo.text}
                        onChange={(e) => updateTodo(todo.id, e.target.value)}
                        className="flex-1 bg-slate-950 border border-slate-700 rounded p-2 text-sm text-white focus:border-purple-500 focus:outline-none"
                     />
                     <button 
                        onClick={() => removeTodo(todo.id)}
                        className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-red-500 hover:bg-slate-800 rounded transition-colors"
                        title="Удалить"
                     >
                       ×
                     </button>
                   </div>
                 ))}
                 {formData.todos.length === 0 && (
                   <div className="text-slate-600 text-sm italic p-4 text-center border border-slate-800 border-dashed rounded">
                     Нет задач. Добавьте первую!
                   </div>
                 )}
               </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};
