
import React, { useState } from 'react';
import { TimetableData, LectureType, TimetableEntry, Batch } from '../../types';
import { User, Home, BookOpen, Coffee, Zap, Layers, Pencil, Trash2, Plus, X, Save, Split, Clock, MoreHorizontal } from 'lucide-react';
import { to12Hour } from '../../utils/timetableGenerator';

interface TimetableTabsProps {
  timetable: TimetableData;
  onUpdateEntry: (day: string, entry: TimetableEntry) => void;
  onDeleteEntry: (day: string, entryId: string) => void;
  onAddEntry: (day: string, entry: TimetableEntry) => void;
  showRoom: boolean;
}

const TimetableTabs: React.FC<TimetableTabsProps> = ({ timetable, onUpdateEntry, onDeleteEntry, onAddEntry, showRoom }) => {
  const [activeDay, setActiveDay] = useState(timetable.days[0]?.day || '');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<TimetableEntry | null>(null);
  
  // Default new entry template
  const defaultEntry: TimetableEntry = {
    id: '',
    timeStart: '09:00',
    timeEnd: '10:00',
    subjectName: '',
    teacher: '',
    room: '',
    type: LectureType.THEORY,
    batches: [],
    isBreak: false
  };

  const [modalForm, setModalForm] = useState<TimetableEntry>(defaultEntry);

  const currentSchedule = timetable.days.find(d => d.day === activeDay);

  const openAddModal = () => {
    setEditingEntry(null);
    setModalForm({ ...defaultEntry, id: crypto.randomUUID() });
    setIsModalOpen(true);
  };

  const openEditModal = (entry: TimetableEntry) => {
    setEditingEntry(entry);
    setModalForm({ ...entry });
    setIsModalOpen(true);
  };

  const handleModalSave = () => {
    if (!modalForm.timeStart || !modalForm.timeEnd || !modalForm.subjectName) return;

    if (editingEntry) {
      onUpdateEntry(activeDay, modalForm);
    } else {
      onAddEntry(activeDay, modalForm);
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Delete this session?")) {
      onDeleteEntry(activeDay, id);
    }
  };

  const toggleBatch = (batch: Batch) => {
    setModalForm(prev => ({
      ...prev,
      batches: prev.batches.includes(batch) 
        ? prev.batches.filter(b => b !== batch) 
        : [...prev.batches, batch]
    }));
  };

  // Group entries by time to detect concurrency
  const groupedEntries: { [key: string]: TimetableEntry[] } = {};
  currentSchedule?.entries.forEach(entry => {
    const key = `${entry.timeStart}-${entry.timeEnd}`;
    if (!groupedEntries[key]) groupedEntries[key] = [];
    groupedEntries[key].push(entry);
  });

  const sortedTimeKeys = Object.keys(groupedEntries).sort((a, b) => a.localeCompare(b));

  const inputClasses = "w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none transition-all";
  const labelClasses = "text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1 block";

  return (
    <div className="space-y-8 pb-20 relative">
      {/* Day Selector */}
      <div className="flex flex-wrap gap-2.5 bg-white/50 dark:bg-slate-900/50 p-2 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 overflow-x-auto no-scrollbar shadow-inner sticky top-24 z-30 backdrop-blur-md">
        {timetable.days.map(d => (
          <button
            key={d.day}
            onClick={() => setActiveDay(d.day)}
            className={`flex-1 min-w-[120px] px-6 py-4 rounded-[2rem] text-[10px] sm:text-xs font-black tracking-[0.2em] uppercase transition-all duration-300 ${
              activeDay === d.day
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 scale-[1.02]'
              : 'text-slate-400 dark:text-slate-600 hover:text-slate-800 dark:hover:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'
            }`}
          >
            {d.day}
          </button>
        ))}
      </div>

      {/* Schedule Timeline */}
      <div className="relative pl-6 sm:pl-10 space-y-10 before:absolute before:left-[9px] sm:before:left-[19px] before:top-4 before:bottom-0 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-slate-200 before:to-transparent dark:before:via-slate-800">
        {sortedTimeKeys.map((timeKey) => {
          const entries = groupedEntries[timeKey];
          const isConcurrent = entries.length > 1;

          return (
            <div key={timeKey} className="relative animate-in slide-in-from-bottom-4 duration-500">
              {/* Timeline Node */}
              <div className="absolute -left-[30px] sm:-left-[40px] top-0 flex flex-col items-center">
                 <div className="w-5 h-5 rounded-full border-[3px] border-white dark:border-slate-900 bg-indigo-500 shadow-md z-10"></div>
              </div>

              {/* Time Label */}
              <div className="flex items-center gap-3 mb-4 -mt-1">
                 <span className="text-sm font-black text-slate-500 dark:text-slate-400 font-mono tracking-tight bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                    {to12Hour(entries[0].timeStart)}
                 </span>
                 <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
                 {isConcurrent && (
                   <span className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-full border border-amber-100 dark:border-amber-800/50">
                     <Split className="w-3 h-3" /> Concurrent
                   </span>
                 )}
              </div>

              <div className={`grid ${isConcurrent ? 'grid-cols-1 lg:grid-cols-2 gap-4' : 'grid-cols-1'}`}>
                {entries.map((entry) => (
                   <div 
                   key={entry.id}
                   className={`group relative overflow-hidden rounded-[2rem] transition-all duration-300 ${
                     entry.isBreak 
                     ? 'bg-slate-50 dark:bg-slate-900/50 border-2 border-dashed border-slate-200 dark:border-slate-800 p-6' 
                     : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 hover:border-indigo-500/30'
                   }`}
                 >
                   {/* Card Background Decoration */}
                   {!entry.isBreak && (
                      <div className={`absolute -right-6 -top-6 w-32 h-32 bg-gradient-to-br ${entry.type === LectureType.THEORY ? 'from-indigo-500/10' : 'from-fuchsia-500/10'} to-transparent rounded-full blur-2xl -z-0 pointer-events-none transition-opacity group-hover:opacity-75`}></div>
                   )}

                   <div className="relative z-10">
                      {/* Header */}
                      <div className="flex justify-between items-start gap-4 mb-6">
                         <div className="space-y-2">
                            {entry.isBreak ? (
                               <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 text-xs font-black uppercase tracking-widest">
                                  <Coffee className="w-3.5 h-3.5" /> Intermission
                               </div>
                            ) : (
                               <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest ${
                                  entry.type === LectureType.THEORY 
                                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400' 
                                  : 'bg-fuchsia-50 dark:bg-fuchsia-900/20 text-fuchsia-600 dark:text-fuchsia-400'
                               }`}>
                                  {entry.type === LectureType.THEORY ? <BookOpen className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                                  {entry.type}
                               </div>
                            )}
                            <h3 className={`text-xl font-black leading-tight ${entry.isBreak ? 'text-slate-400 dark:text-slate-500 italic' : 'text-slate-900 dark:text-white'}`}>
                               {entry.subjectName}
                            </h3>
                         </div>

                         <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => openEditModal(entry)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 dark:hover:bg-slate-700 rounded-xl transition-colors" title="Edit Session">
                               <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDelete(entry.id)} className="p-2 bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-slate-700 rounded-xl transition-colors" title="Remove Session">
                               <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                      </div>

                      {/* Details Grid */}
                      {!entry.isBreak && (
                        <div className="grid grid-cols-2 gap-3">
                           {/* Time - Expands if Room is hidden */}
                           <div className={`${showRoom ? 'col-span-1' : 'col-span-2'} bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl flex flex-col justify-center`}>
                              <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Duration</span>
                              <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 text-xs">
                                 <Clock className="w-3.5 h-3.5 text-indigo-500" />
                                 {to12Hour(entry.timeStart)} - {to12Hour(entry.timeEnd)}
                              </div>
                           </div>
                           
                           {/* Room - Conditional Rendering */}
                           {showRoom && (
                             <div className="col-span-1 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl flex flex-col justify-center">
                                <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Venue</span>
                                <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 text-xs truncate">
                                   <Home className="w-3.5 h-3.5 text-indigo-500" />
                                   {entry.room}
                                </div>
                             </div>
                           )}

                           {/* Instructor & Batches */}
                           <div className="col-span-2 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl flex items-center justify-between gap-4">
                              <div className="flex flex-col">
                                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Faculty</span>
                                 <div className="flex items-center gap-1.5 font-bold text-slate-700 dark:text-slate-300 text-xs truncate">
                                    <User className="w-3.5 h-3.5 text-indigo-500" />
                                    {entry.teacher}
                                 </div>
                              </div>
                              <div className="flex flex-col items-end">
                                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider mb-1">Batches</span>
                                 <div className="flex gap-1">
                                    {entry.batches.length > 0 ? entry.batches.map(b => (
                                       <span key={b} className="px-1.5 py-0.5 bg-white dark:bg-slate-700 rounded text-[10px] font-black text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-600">
                                          {b}
                                       </span>
                                    )) : <span className="text-[10px] font-bold text-slate-400">All</span>}
                                 </div>
                              </div>
                           </div>
                        </div>
                      )}
                      
                      {entry.isBreak && (
                         <div className="flex items-center gap-2 text-xs font-bold text-slate-400 mt-2">
                            <Clock className="w-3.5 h-3.5" />
                            {to12Hour(entry.timeStart)} - {to12Hour(entry.timeEnd)}
                         </div>
                      )}
                   </div>
                 </div>
                ))}
              </div>
            </div>
          );
        })}

        {/* Add Button at the end of timeline */}
        <div className="relative pt-6">
           <div className="absolute -left-[30px] sm:-left-[40px] top-9 flex flex-col items-center">
              <div className="w-3 h-3 rounded-full bg-slate-300 dark:bg-slate-700"></div>
           </div>
           <button 
             onClick={openAddModal}
             className="w-full py-5 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-[2rem] text-slate-400 dark:text-slate-500 font-bold flex items-center justify-center gap-2 hover:border-indigo-500 hover:text-indigo-500 hover:bg-indigo-50/50 dark:hover:bg-indigo-900/10 transition-all group"
           >
             <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
             Add New Session to {activeDay}
           </button>
        </div>
      </div>

      {/* Edit/Create Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity" onClick={() => setIsModalOpen(false)}></div>
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[2rem] p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <div>
                 <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                   {editingEntry ? 'Edit Session' : 'New Session'}
                 </h3>
                 <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                    {activeDay} Schedule
                 </p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-5 max-h-[70vh] overflow-y-auto pr-2 custom-scrollbar">
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <label className={labelClasses}>Start Time</label>
                   <input 
                     type="time" 
                     className={inputClasses}
                     value={modalForm.timeStart}
                     onChange={e => setModalForm({...modalForm, timeStart: e.target.value})}
                   />
                 </div>
                 <div className="space-y-1">
                   <label className={labelClasses}>End Time</label>
                   <input 
                     type="time" 
                     className={inputClasses}
                     value={modalForm.timeEnd}
                     onChange={e => setModalForm({...modalForm, timeEnd: e.target.value})}
                   />
                 </div>
               </div>

               <div className="space-y-1">
                 <label className={labelClasses}>Subject / Event Name</label>
                 <input 
                   type="text" 
                   className={inputClasses}
                   placeholder="e.g. Machine Learning"
                   value={modalForm.subjectName}
                   onChange={e => setModalForm({...modalForm, subjectName: e.target.value})}
                 />
               </div>

               <div className="flex items-center gap-4 py-2">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${modalForm.isBreak ? 'bg-indigo-600 border-indigo-600' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>
                       {modalForm.isBreak && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <input 
                      type="checkbox"
                      className="hidden"
                      checked={modalForm.isBreak}
                      onChange={e => setModalForm({...modalForm, isBreak: e.target.checked})}
                    />
                    <span className="text-sm font-bold text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 transition-colors">Mark as Break / Intermission</span>
                  </label>
               </div>

               {!modalForm.isBreak && (
                 <>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className={labelClasses}>Type</label>
                      <select 
                        className={inputClasses}
                        value={modalForm.type}
                        onChange={e => setModalForm({...modalForm, type: e.target.value as LectureType})}
                      >
                        <option value={LectureType.THEORY}>Lecture</option>
                        <option value={LectureType.PRACTICAL}>Practical</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className={labelClasses}>Room</label>
                      <input 
                        type="text" 
                        className={inputClasses}
                        value={modalForm.room}
                        onChange={e => setModalForm({...modalForm, room: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className={labelClasses}>Teacher</label>
                    <input 
                      type="text" 
                      className={inputClasses}
                      value={modalForm.teacher}
                      onChange={e => setModalForm({...modalForm, teacher: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className={labelClasses}>Batches</label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {(['A', 'B', 'P', 'Q', 'X', 'Y'] as Batch[]).map(batch => (
                        <button
                          key={batch}
                          onClick={() => toggleBatch(batch)}
                          className={`w-9 h-9 rounded-xl text-xs font-black border transition-all ${
                            modalForm.batches.includes(batch)
                            ? 'bg-indigo-600 text-white border-transparent shadow-lg shadow-indigo-500/20'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                          }`}
                        >
                          {batch}
                        </button>
                      ))}
                    </div>
                  </div>
                 </>
               )}
            </div>

            <button 
              onClick={handleModalSave}
              className="w-full mt-8 ai-gradient text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-90 hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-indigo-500/20"
            >
              <Save className="w-5 h-5" />
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// CheckCircle2 was missing in imports for the checkbox fix
function CheckCircle2(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg 
      {...props} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="3" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export default TimetableTabs;
