
import React, { useState, useEffect } from 'react';
import { Subject, LectureType, Batch } from '../../types';
import { Plus, Trash2, Users, BookOpen, GraduationCap, Zap, Home, CalendarCheck, Calendar } from 'lucide-react';

interface SubjectFormProps {
  subjects: Subject[];
  setSubjects: React.Dispatch<React.SetStateAction<Subject[]>>;
  workingDays: string[];
}

const SubjectForm: React.FC<SubjectFormProps> = ({ subjects, setSubjects, workingDays }) => {
  const theoryRooms = ['618', '619', '620', 'LH-101', 'LH-102'];
  const labRooms = ['Lab 12', 'Lab 13', 'Lab 12-13', 'Lab 8', 'Lab 9', 'Lab 10', 'Hardware Lab'];
  const availableBatches: Batch[] = ['X', 'Y', 'P', 'Q', 'A', 'B'];

  // Ensure there is always an active day selected
  const [activeDay, setActiveDay] = useState<string>(workingDays[0] || 'Monday');

  // Update active day if workingDays change and current active is invalid
  useEffect(() => {
    if (!workingDays.includes(activeDay)) {
      setActiveDay(workingDays[0] || 'Monday');
    }
  }, [workingDays]);

  const [newSubject, setNewSubject] = useState<Partial<Subject>>({
    name: '',
    teacher: '',
    type: LectureType.THEORY,
    batches: [], 
    weeklyHours: 4,
    assignedRoom: '618'
  });

  const [isCustomRoom, setIsCustomRoom] = useState(false);
  const [customRoomValue, setCustomRoomValue] = useState('');

  // Reset room selection and batch availability when modality changes
  useEffect(() => {
    setNewSubject(prev => {
      const isTheory = prev.type === LectureType.THEORY;
      let updatedRoom = prev.assignedRoom;
      if (!isCustomRoom) {
        updatedRoom = isTheory ? theoryRooms[0] : labRooms[0];
      }
      // REMOVED DEFAULT BATCH SELECTION: Now defaults to empty [] instead of ['A', 'B']
      const updatedBatches: Batch[] = isTheory 
        ? [] 
        : (prev.batches && prev.batches.length > 0 ? prev.batches : []);

      return {
        ...prev,
        assignedRoom: updatedRoom,
        batches: updatedBatches
      };
    });
  }, [newSubject.type]);

  const addSubject = () => {
    if (!newSubject.name || !newSubject.teacher) return;
    
    const finalRoom = isCustomRoom ? customRoomValue : newSubject.assignedRoom;
    if (!finalRoom) return;

    const subjectToAdd: Subject = {
      id: crypto.randomUUID(),
      name: newSubject.name!,
      teacher: newSubject.teacher!,
      type: newSubject.type || LectureType.THEORY,
      batches: newSubject.batches || [],
      weeklyHours: 4, 
      assignedRoom: finalRoom,
      day: activeDay // Bind subject to the currently selected day
    };

    setSubjects([...subjects, subjectToAdd]);
    
    // Reset form
    const defaultType = LectureType.THEORY;
    setNewSubject({
      name: '',
      teacher: '',
      type: defaultType,
      batches: [],
      weeklyHours: 4,
      assignedRoom: theoryRooms[0]
    });
    setIsCustomRoom(false);
    setCustomRoomValue('');
  };

  const removeSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const toggleBatch = (batch: Batch) => {
    if (newSubject.type === LectureType.THEORY) return;
    const current = newSubject.batches || [];
    const updated = current.includes(batch)
      ? current.filter(b => b !== batch)
      : [...current, batch];
    setNewSubject({ ...newSubject, batches: updated });
  };

  // Filter subjects for display based on active day
  const currentDaySubjects = subjects.filter(s => s.day === activeDay);

  const inputClasses = "w-full px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all shadow-sm";
  const labelClasses = "text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] mb-1.5 block ml-1";
  const currentRoomOptions = newSubject.type === LectureType.THEORY ? theoryRooms : labRooms;
  const isTheorySession = newSubject.type === LectureType.THEORY;

  return (
    <div className="bg-white/40 dark:bg-slate-900/20 backdrop-blur-sm p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800/50 shadow-2xl shadow-indigo-500/5 space-y-8">
      
      <div className="space-y-4">
        <h3 className="text-2xl font-black flex items-center gap-3 text-slate-900 dark:text-white tracking-tighter">
          <span className="flex items-center justify-center w-10 h-10 rounded-2xl ai-gradient text-white shadow-lg shadow-indigo-500/20 text-lg font-black italic">2</span>
          Core Curriculum
        </h3>
        
        {/* Day Selector Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
          {workingDays.map(day => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-2 ${
                activeDay === day 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/25 scale-105' 
                : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:border-indigo-300'
              }`}
            >
              {activeDay === day && <CalendarCheck className="w-3 h-3" />}
              {day}
              <span className={`ml-1 px-1.5 py-0.5 rounded-md text-[9px] ${activeDay === day ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                {subjects.filter(s => s.day === day).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="bg-slate-50/50 dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 space-y-6 relative overflow-hidden">
         {/* Day Watermark */}
        <div className="absolute top-4 right-4 text-6xl font-black text-slate-200 dark:text-slate-800 opacity-50 pointer-events-none uppercase tracking-tighter z-0">
          {activeDay}
        </div>
        
        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className={labelClasses}>Course Title / Subject</label>
            <input 
              type="text" 
              placeholder="e.g. Artificial Intelligence"
              className={inputClasses}
              value={newSubject.name}
              onChange={(e) => setNewSubject({...newSubject, name: e.target.value})}
            />
          </div>
          <div className="space-y-1">
            <label className={labelClasses}>Faculty Member / Professor</label>
            <input 
              type="text" 
              placeholder="e.g. Dr. John McCarthy"
              className={inputClasses}
              value={newSubject.teacher}
              onChange={(e) => setNewSubject({...newSubject, teacher: e.target.value})}
            />
          </div>
        </div>

        <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-1">
            <label className={labelClasses}>Lecture Type</label>
            <select 
              className={inputClasses}
              value={newSubject.type}
              onChange={(e) => setNewSubject({...newSubject, type: e.target.value as LectureType})}
            >
              <option value={LectureType.THEORY}>Theory Lecture</option>
              <option value={LectureType.PRACTICAL}>Lab Practical</option>
            </select>
          </div>

          <div className="space-y-1">
            <label className={labelClasses}>Venue / Location</label>
            {!isCustomRoom ? (
              <select 
                className={inputClasses}
                value={newSubject.assignedRoom}
                onChange={(e) => {
                  if (e.target.value === 'NEW') {
                    setIsCustomRoom(true);
                  } else {
                    setNewSubject({...newSubject, assignedRoom: e.target.value});
                  }
                }}
              >
                {currentRoomOptions.map(room => (
                  <option key={room} value={room}>{room}</option>
                ))}
                <option value="NEW">+ Custom Venue</option>
              </select>
            ) : (
              <div className="relative">
                <input 
                  type="text"
                  placeholder="Enter venue code"
                  className={inputClasses}
                  value={customRoomValue}
                  onChange={(e) => setCustomRoomValue(e.target.value)}
                  autoFocus
                />
                <button 
                  onClick={() => setIsCustomRoom(false)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-black text-indigo-500 hover:text-indigo-600 uppercase"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          <div className={`space-y-1 transition-all duration-300 ${isTheorySession ? 'opacity-40 grayscale pointer-events-none' : 'opacity-100'}`}>
            <label className={labelClasses}>
              Student Batches 
              {isTheorySession && <span className="ml-2 text-rose-500 normal-case tracking-normal font-bold opacity-100">(Combined)</span>}
            </label>
            <div className="flex flex-wrap gap-1">
              {availableBatches.map(batch => (
                <button
                  key={batch}
                  onClick={() => toggleBatch(batch)}
                  disabled={isTheorySession}
                  className={`w-8 h-8 rounded-lg text-[10px] font-black border transition-all ${
                    newSubject.batches?.includes(batch)
                    ? 'bg-indigo-600 text-white border-transparent scale-110 shadow-lg shadow-indigo-500/20'
                    : 'bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {batch}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={addSubject}
          className="relative z-10 w-full ai-gradient text-white py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.01] active:scale-[0.98] transition-all shadow-xl shadow-indigo-500/10 tracking-widest uppercase"
        >
          <Plus className="w-5 h-5" /> Add Course to {activeDay}
        </button>
      </div>

      <div className="space-y-2">
         <div className="flex justify-between items-center px-2">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
              {activeDay}'s Load: {currentDaySubjects.length} Items
            </span>
         </div>
         <div className="space-y-4 max-h-[420px] overflow-y-auto pr-3 custom-scrollbar">
          {currentDaySubjects.map(subject => (
            <div key={subject.id} className="group relative flex items-center justify-between p-5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl hover:border-indigo-400 dark:hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all animate-in slide-in-from-right-4 duration-300">
              <div className="flex items-center gap-5">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${subject.type === LectureType.THEORY ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600' : 'bg-fuchsia-50 dark:bg-fuchsia-500/10 text-fuchsia-600'}`}>
                  {subject.type === LectureType.THEORY ? <BookOpen className="w-6 h-6" /> : <GraduationCap className="w-6 h-6" />}
                </div>
                <div className="space-y-0.5">
                  <h4 className="font-black text-slate-900 dark:text-white tracking-tight text-lg">{subject.name}</h4>
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    <span>{subject.teacher}</span>
                    <span className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full"></span>
                    <Home className="w-3 h-3" />
                    <span>{subject.assignedRoom}</span>
                  </div>
                  <div className="flex gap-1.5 mt-2">
                    {subject.batches.length > 0 ? subject.batches.map(b => (
                      <span key={b} className="text-[9px] bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-md font-black border border-slate-100 dark:border-slate-700 uppercase">{b}</span>
                    )) : (
                      <span className="text-[9px] text-slate-400 italic font-medium px-1">Entire Class</span>
                    )}
                  </div>
                </div>
              </div>
              <button 
                onClick={() => removeSubject(subject.id)}
                className="text-slate-300 hover:text-rose-500 dark:text-slate-700 dark:hover:text-rose-400 transition-all p-3 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-2xl"
                aria-label="Remove entry"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          {currentDaySubjects.length === 0 && (
            <div className="text-center py-20 border-4 border-dashed border-slate-50 dark:border-slate-900 rounded-[3rem] transition-colors">
              <Calendar className="w-14 h-14 text-slate-100 dark:text-slate-800 mx-auto mb-6 animate-pulse-slow" />
              <p className="text-slate-400 dark:text-slate-600 font-black uppercase tracking-[0.2em] text-xs">No modules for {activeDay}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SubjectForm;
