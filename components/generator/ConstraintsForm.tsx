
import React, { useEffect } from 'react';
import { Constraints, TimetableBreak } from '../../types';
import { Globe, Building2, Clock, Plus, Trash2, Sparkles } from 'lucide-react';

interface ConstraintsFormProps {
  constraints: Constraints;
  setConstraints: React.Dispatch<React.SetStateAction<Constraints>>;
}

const ConstraintsForm: React.FC<ConstraintsFormProps> = ({ constraints, setConstraints }) => {
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Undefined'];

  const toggleDay = (day: string) => {
    const isAdding = !constraints.workingDays.includes(day);
    
    let newTimings = { ...constraints.dayTimings };
    
    // If adding a day that doesn't have timings yet, initialize it with defaults or copy from another day
    if (isAdding && !newTimings[day]) {
      newTimings[day] = { start: '08:00', end: '17:00' };
    }

    setConstraints(prev => ({
      ...prev,
      workingDays: isAdding 
        ? [...prev.workingDays, day] 
        : prev.workingDays.filter(d => d !== day),
      dayTimings: newTimings
    }));
  };

  const updateDayTiming = (day: string, field: 'start' | 'end', value: string) => {
    setConstraints(prev => ({
      ...prev,
      dayTimings: {
        ...prev.dayTimings,
        [day]: {
          ...prev.dayTimings[day],
          [field]: value
        }
      }
    }));
  };

  const applyPreset = (preset: string) => {
    let newDays: string[] = [];
    switch (preset) {
      case 'M-F':
        newDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        break;
      case 'M-S':
        newDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        break;
      case 'MWF':
        newDays = ['Monday', 'Wednesday', 'Friday'];
        break;
      case 'W-F':
        newDays = ['Wednesday', 'Thursday', 'Friday'];
        break;
      default:
        return;
    }
    
    // Ensure timings exist for new preset days
    const newTimings = { ...constraints.dayTimings };
    newDays.forEach(day => {
      if (!newTimings[day]) newTimings[day] = { start: '08:00', end: '17:00' };
    });

    setConstraints(prev => ({ ...prev, workingDays: newDays, dayTimings: newTimings }));
  };

  const addBreak = () => {
    const newBreak: TimetableBreak = {
      id: crypto.randomUUID(),
      label: 'New Break',
      duration: 15,
      afterLecture: (constraints.breaks.length > 0 ? Math.max(...constraints.breaks.map(b => b.afterLecture)) : 0) + 2
    };
    setConstraints({ ...constraints, breaks: [...constraints.breaks, newBreak] });
  };

  const removeBreak = (id: string) => {
    setConstraints({ ...constraints, breaks: constraints.breaks.filter(b => b.id !== id) });
  };

  const updateBreak = (id: string, field: keyof TimetableBreak, value: any) => {
    setConstraints({
      ...constraints,
      breaks: constraints.breaks.map(b => b.id === id ? { ...b, [field]: value } : b)
    });
  };

  const inputContainerClasses = "relative group";
  const inputIconClasses = "absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors";
  const inputClasses = "w-full pl-12 pr-4 py-3.5 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-2xl text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm";
  const labelClasses = "block text-sm font-bold text-slate-600 dark:text-slate-400 mb-2 ml-1 tracking-tight";

  return (
    <div className="bg-white/40 dark:bg-slate-900/20 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800/50 shadow-2xl shadow-indigo-500/5 space-y-8">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-2xl font-black flex items-center gap-3 text-slate-900 dark:text-white tracking-tighter">
          <span className="flex items-center justify-center w-10 h-10 rounded-2xl ai-gradient text-white shadow-lg shadow-indigo-500/20 text-lg font-black italic">1</span>
          Institution Profile
        </h3>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-1">
          <label className={labelClasses}>University / College Name</label>
          <div className={inputContainerClasses}>
            <Building2 className={inputIconClasses} />
            <input 
              type="text"
              className={inputClasses}
              placeholder="e.g. Stanford University"
              value={constraints.collegeName}
              onChange={(e) => setConstraints({...constraints, collegeName: e.target.value})}
            />
          </div>
        </div>
        
        <div className="space-y-1">
          <label className={labelClasses}>Academic Department</label>
          <div className={inputContainerClasses}>
            <Globe className={inputIconClasses} />
            <input 
              type="text"
              className={inputClasses}
              placeholder="e.g. Applied Computer Science"
              value={constraints.department}
              onChange={(e) => setConstraints({...constraints, department: e.target.value})}
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <label className={labelClasses}>Operating Days</label>
            <div className="flex flex-wrap gap-2 mb-2 sm:mb-0">
                {[
                    { label: 'Standard (M-F)', id: 'M-F' },
                    { label: 'Specific (W-F)', id: 'W-F' },
                    { label: 'Full (M-S)', id: 'M-S' },
                ].map(p => (
                    <button
                        key={p.id}
                        onClick={() => applyPreset(p.id)}
                        className="px-3 py-1.5 rounded-xl text-[10px] font-black bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors uppercase tracking-wider border border-indigo-100 dark:border-indigo-500/20"
                    >
                        {p.label}
                    </button>
                ))}
            </div>
        </div>
        
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {days.map(day => (
            <button
              key={day}
              onClick={() => toggleDay(day)}
              className={`py-3 rounded-2xl text-[10px] sm:text-xs font-black transition-all border ${
                constraints.workingDays.includes(day)
                ? 'bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-500/20 scale-105'
                : 'bg-white dark:bg-slate-900/80 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-500'
              }`}
            >
              {day === 'Undefined' ? 'Undefined' : day.substring(0, 3)}
            </button>
          ))}
        </div>
      </div>
      
      {/* Day-specific Timing Grid */}
      <div className="space-y-3">
        <label className={labelClasses}>Daily Schedule Hours</label>
        <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {constraints.workingDays.map(day => (
            <div key={day} className="flex items-center gap-4 bg-white dark:bg-slate-900/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
               <div className="w-24 text-xs font-black uppercase text-indigo-600 dark:text-indigo-400">{day}</div>
               <div className="flex-1 grid grid-cols-2 gap-3">
                 <div className="relative group">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      type="time" 
                      className="w-full pl-9 pr-2 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                      value={constraints.dayTimings[day]?.start || '08:00'}
                      onChange={(e) => updateDayTiming(day, 'start', e.target.value)}
                    />
                 </div>
                 <div className="relative group">
                    <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                    <input 
                      type="time" 
                      className="w-full pl-9 pr-2 py-2 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                      value={constraints.dayTimings[day]?.end || '17:00'}
                      onChange={(e) => updateDayTiming(day, 'end', e.target.value)}
                    />
                 </div>
               </div>
            </div>
          ))}
        </div>
      </div>

      {/* Advanced Rules Section */}
      <div className="space-y-2">
        <label className={labelClasses}>
          <span className="flex items-center gap-2">
             <Sparkles className="w-4 h-4 text-indigo-500" />
             Advanced Logic / Custom Constraints
          </span>
        </label>
        <div className="relative group">
          <textarea
            className={`${inputClasses} pl-4 h-32 resize-none`}
            placeholder={`e.g. Wednesday: Batch P in Lab 3D, Batch Q in Lab 08 simultaneously.
Friday: Theory until 12:15, then Practical sessions.`}
            value={constraints.customRules || ''}
            onChange={(e) => setConstraints({...constraints, customRules: e.target.value})}
          />
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed px-1">
          Paste specific curriculum rules, batch conflicts, or fixed time slots here. The AI will prioritize these instructions over general settings.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className={labelClasses}>Intermission Logic</label>
          <button 
            onClick={addBreak}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 px-3 py-1.5 rounded-xl transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Break
          </button>
        </div>
        
        <div className="space-y-3">
          {constraints.breaks.map((b) => (
            <div key={b.id} className="grid grid-cols-12 gap-3 items-center bg-slate-50 dark:bg-slate-900/40 p-4 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="col-span-4 space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Label</label>
                <input 
                  type="text" 
                  className="w-full bg-transparent border-none text-xs font-bold focus:ring-0 p-0"
                  value={b.label}
                  onChange={(e) => updateBreak(b.id, 'label', e.target.value)}
                />
              </div>
              <div className="col-span-3 space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">After Lec #</label>
                <input 
                  type="number" 
                  className="w-full bg-transparent border-none text-xs font-bold focus:ring-0 p-0"
                  value={b.afterLecture}
                  onChange={(e) => updateBreak(b.id, 'afterLecture', parseInt(e.target.value))}
                />
              </div>
              <div className="col-span-3 space-y-1">
                <label className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Dur (Min)</label>
                <input 
                  type="number" 
                  className="w-full bg-transparent border-none text-xs font-bold focus:ring-0 p-0"
                  value={b.duration}
                  onChange={(e) => updateBreak(b.id, 'duration', parseInt(e.target.value))}
                />
              </div>
              <div className="col-span-2 flex justify-end">
                <button 
                  onClick={() => removeBreak(b.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 dark:text-slate-700 dark:hover:text-rose-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {constraints.breaks.length === 0 && (
            <div className="text-center py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-2xl">
              No Breaks Defined
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConstraintsForm;
