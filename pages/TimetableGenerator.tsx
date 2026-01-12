
import React, { useState, useRef, useMemo } from 'react';
import ConstraintsForm from '../components/generator/ConstraintsForm';
import SubjectForm from '../components/generator/SubjectForm';
import TimetableTabs from '../components/generator/TimetableTabs';
import { useTimetableGenerator } from '../hooks/useTimetableGenerator';
import { Loader2, Sparkles, AlertCircle, Image as ImageIcon, ChevronLeft, BookmarkCheck, CheckCircle2, Eye, EyeOff, CalendarDays } from 'lucide-react';
import { SavedTimetable, TimetableEntry, LectureType } from '../types';
import { to12Hour } from '../utils/timetableGenerator'; 
import html2canvas from 'html2canvas';

interface TimetableGeneratorProps {
  initialData?: SavedTimetable | null;
  onClearData?: () => void;
}

const TimetableGenerator: React.FC<TimetableGeneratorProps> = ({ initialData, onClearData }) => {
  const { 
    isGenerating, 
    status,
    progress,
    error, 
    timetable, 
    constraints, 
    setConstraints, 
    subjects, 
    setSubjects, 
    generate,
    saveTimetable,
    setTimetable 
  } = useTimetableGenerator(initialData);

  const [hasSaved, setHasSaved] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showRoom, setShowRoom] = useState(true);
  const exportRef = useRef<HTMLDivElement>(null);

  const handleSave = () => {
    saveTimetable();
    setHasSaved(true);
    setTimeout(() => setHasSaved(false), 3000);
  };

  const handleBack = () => {
    setTimetable(null);
    if (onClearData) onClearData();
  };

  // --- CRUD Operations ---
  const handleEntryUpdate = (day: string, updatedEntry: TimetableEntry) => {
    if (!timetable) return;
    const newDays = timetable.days.map(d => {
      if (d.day === day) {
        return {
          ...d,
          entries: d.entries.map(e => e.id === updatedEntry.id ? updatedEntry : e).sort((a, b) => a.timeStart.localeCompare(b.timeStart))
        };
      }
      return d;
    });
    setTimetable({ ...timetable, days: newDays });
  };

  const handleEntryDelete = (day: string, entryId: string) => {
    if (!timetable) return;
    const newDays = timetable.days.map(d => {
      if (d.day === day) {
        return {
          ...d,
          entries: d.entries.filter(e => e.id !== entryId)
        };
      }
      return d;
    });
    setTimetable({ ...timetable, days: newDays });
  };

  const handleEntryAdd = (day: string, newEntry: TimetableEntry) => {
    if (!timetable) return;
    const newDays = timetable.days.map(d => {
      if (d.day === day) {
        const updatedEntries = [...d.entries, newEntry].sort((a, b) => a.timeStart.localeCompare(b.timeStart));
        return { ...d, entries: updatedEntries };
      }
      return d;
    });
    setTimetable({ ...timetable, days: newDays });
  };

  const handleExportImage = async () => {
    setIsExporting(true);
    // Reduced delay for faster UX
    setTimeout(async () => {
      if (exportRef.current) {
        try {
          // HUGE canvas for 4K quality. 4200px width ensures even 15min slots are wide (~100-150px)
          const canvas = await html2canvas(exportRef.current, {
            scale: 1, 
            backgroundColor: '#ffffff',
            logging: false,
            useCORS: true,
            width: 4200, 
            windowWidth: 4200,
            height: exportRef.current.scrollHeight
          });
          
          const link = document.createElement('a');
          const cleanName = (constraints.collegeName || 'timetable').replace(/[^a-z0-9]/gi, '_').toLowerCase();
          link.download = `${cleanName}_schedule_4k.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        } catch (err) {
          console.error("Export failed", err);
          alert("Failed to generate image. Please try again.");
        } finally {
          setIsExporting(false);
        }
      } else {
        setIsExporting(false);
      }
    }, 100);
  };

  // --- Grid Calculation Logic ---
  const gridDimensions = useMemo(() => {
    if (!timetable) return { startHour: 8, endHour: 17, hours: [] };

    let minHour = 24;
    let maxHour = 0;

    timetable.days.forEach(day => {
      day.entries.forEach(entry => {
        const startH = parseInt(entry.timeStart.split(':')[0]);
        const endH = parseInt(entry.timeEnd.split(':')[0]) + (parseInt(entry.timeEnd.split(':')[1]) > 0 ? 1 : 0);
        if (startH < minHour) minHour = startH;
        if (endH > maxHour) maxHour = endH;
      });
    });

    // Default to 8-3pm based on requirements if empty
    if (minHour === 24) minHour = 8;
    if (maxHour === 0) maxHour = 15;

    // Add buffer
    minHour = Math.max(0, minHour);
    maxHour = Math.min(24, maxHour); 

    const hours = [];
    for (let i = minHour; i < maxHour; i++) {
      hours.push(i);
    }

    return { startHour: minHour, endHour: maxHour, hours };
  }, [timetable]);

  const getPositionStyle = (timeStart: string, timeEnd: string) => {
    const startParts = timeStart.split(':').map(Number);
    const endParts = timeEnd.split(':').map(Number);
    
    const startMinutes = startParts[0] * 60 + startParts[1];
    const endMinutes = endParts[0] * 60 + endParts[1];
    
    const gridStartMinutes = gridDimensions.startHour * 60;
    const totalGridMinutes = (gridDimensions.endHour - gridDimensions.startHour) * 60;

    const left = ((startMinutes - gridStartMinutes) / totalGridMinutes) * 100;
    const width = ((endMinutes - startMinutes) / totalGridMinutes) * 100;

    return { left: `${left}%`, width: `${width}%` };
  };

  // Helper to group overlapping entries for a single time slot
  const groupConcurrentEntries = (entries: TimetableEntry[]) => {
    const groups: { [key: string]: TimetableEntry[] } = {};
    entries.forEach(entry => {
      const key = `${entry.timeStart}-${entry.timeEnd}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(entry);
    });
    return Object.values(groups);
  };

  // Helper for formatted time display
  const formatTimeHeader = (hour: number) => {
    const period = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return { time: `${displayHour}:00`, period };
  };

  if (isGenerating) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center p-8 space-y-12 animate-in fade-in duration-700">
        <div className="relative">
          <div className="w-32 h-32 rounded-[2.5rem] ai-gradient animate-spin-slow opacity-20 blur-xl absolute -inset-4"></div>
          <div className="relative w-24 h-24 rounded-[2rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center shadow-2xl">
            <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
          </div>
        </div>
        
        <div className="w-full max-w-md space-y-6">
          <div className="text-center space-y-2">
            <h3 className="text-3xl font-[900] text-slate-900 dark:text-white tracking-tighter">Architectural Synthesis</h3>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-bold uppercase tracking-widest">{status}</p>
          </div>
          
          <div className="relative h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
            <div 
              className="absolute top-0 left-0 h-full ai-gradient transition-all duration-700 ease-out shadow-lg shadow-indigo-500/30"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
          
          <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">
            <span>Neural Processing</span>
            <span className="text-xl italic">{progress}%</span>
          </div>
        </div>
        
        <p className="max-w-xs text-center text-slate-400 dark:text-slate-600 text-xs font-medium leading-relaxed">
          The ChronosAI Neural Engine is currently resolving room conflicts and batch rotations...
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-32">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-16 no-print">
        <div className="space-y-3">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Generate <span className="text-indigo-600">Schedule</span></h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Professional grade timetable construction with AI conflict resolution.</p>
        </div>
        
        <div className="flex flex-wrap gap-4">
          <button 
            onClick={() => generate(false)}
            disabled={isGenerating}
            className="px-6 py-4 rounded-2xl border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            Quick Draft
          </button>
          <button 
            onClick={() => generate(true)}
            disabled={isGenerating}
            className="px-10 py-4 rounded-2xl bg-indigo-600 text-white font-bold flex items-center gap-2 hover:bg-indigo-700 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-indigo-200 dark:shadow-none disabled:opacity-50"
          >
            <Sparkles className="w-5 h-5" />
            Generate AI Optimized
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-10 p-6 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-3xl flex items-center gap-4 text-rose-600 dark:text-rose-400 animate-in zoom-in-95 duration-300 no-print">
          <AlertCircle className="w-6 h-6 flex-shrink-0" />
          <p className="font-bold text-lg">{error}</p>
        </div>
      )}

      {!timetable ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start no-print">
          <ConstraintsForm constraints={constraints} setConstraints={setConstraints} />
          <SubjectForm 
            subjects={subjects} 
            setSubjects={setSubjects} 
            workingDays={constraints.workingDays} 
          />
        </div>
      ) : (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700">
          {/* Main Action Header */}
          <div className="flex flex-col sm:flex-row items-center justify-between bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 gap-6 shadow-sm">
            <div>
              <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">
                {constraints.collegeName || 'Institutional Timetable'}
              </h3>
              <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs mt-1">
                {constraints.department || 'Academic Division'}
              </p>
              <p className="print-only text-[10px] text-slate-400 font-black mt-4 uppercase tracking-[0.2em]">Generated via ChronosAI Engine • {new Date().toLocaleDateString()}</p>
            </div>
            <div className="flex flex-wrap gap-4 w-full sm:w-auto no-print">
              <button 
                onClick={() => setShowRoom(!showRoom)}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold transition-all border ${showRoom ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 border-transparent'}`}
                title={showRoom ? "Hide Venue Details" : "Show Venue Details"}
              >
                {showRoom ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                <span className="hidden lg:inline">{showRoom ? 'Venue On' : 'Venue Off'}</span>
              </button>

              <button 
                onClick={handleBack}
                disabled={isExporting}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-200 transition-colors disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" /> Edit Config
              </button>
              <button 
                onClick={handleSave}
                disabled={hasSaved || isExporting}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold transition-all border ${hasSaved ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 hover:bg-slate-50'} disabled:opacity-50`}
              >
                {hasSaved ? <CheckCircle2 className="w-4 h-4" /> : <BookmarkCheck className="w-4 h-4" />}
                {hasSaved ? 'Saved' : 'Save'}
              </button>
              <button 
                onClick={handleExportImage}
                disabled={isExporting}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-3 rounded-xl bg-indigo-600 text-white font-bold hover:bg-indigo-700 transition-all shadow-lg active:scale-95 group disabled:opacity-70 disabled:cursor-wait"
              >
                {isExporting ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />} 
                {isExporting ? 'Capturing...' : 'Export Image'}
              </button>
            </div>
          </div>
          
          {/* Desktop Interactive Tabs - Hidden in Print/Export mode */}
          <div className="no-print">
            <TimetableTabs 
              timetable={timetable} 
              onUpdateEntry={handleEntryUpdate}
              onDeleteEntry={handleEntryDelete}
              onAddEntry={handleEntryAdd}
              showRoom={showRoom}
            />
          </div>

          {/* --- HIGH RESOLUTION EXPORT CANVAS (4K PRESET) --- */}
          {/* Hidden from view but available for DOM capture. 
              Using specific width 4200px as requested for High DPI output. */}
          <div 
            className={`${isExporting ? 'fixed top-0 left-0 z-[-10] opacity-100' : 'hidden print:block'}`}
            style={{ width: '4200px', minHeight: '1200px' }}
          >
            <div ref={exportRef} className="bg-white w-[4200px] min-h-[1200px] p-[100px] font-sans text-[#1E1E28]">
                
                {/* 1. Header Design */}
                <div className="flex items-end justify-between mb-16 pb-12 border-b-[3px] border-[#E4E7EC]">
                    <div className="flex items-center gap-10">
                        <div className="w-32 h-32 bg-[#1E1E28] rounded-[2rem] flex items-center justify-center shadow-xl">
                            <CalendarDays className="w-16 h-16 text-white" />
                        </div>
                        <div>
                            <h1 className="text-[48px] font-bold text-[#1E1E28] leading-tight tracking-tight">
                                {constraints.collegeName || 'ACADEMIC INSTITUTE'}
                            </h1>
                            <div className="flex items-center gap-4 mt-3">
                                <span className="text-[28px] font-medium text-[#4F4F63]">
                                    {constraints.department || 'General Department'}
                                </span>
                                <span className="w-2 h-2 rounded-full bg-[#E4E7EC]"></span>
                                <span className="text-[28px] font-medium text-[#4F4F63]">
                                    Weekly Timetable
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className="text-[24px] font-normal text-[#4F4F63] flex items-center gap-3 mb-4">
                        <span>Generated on</span>
                        <span className="font-semibold text-[#1E1E28]">{new Date().toLocaleDateString()}</span>
                    </div>
                </div>

                {/* 2. Timetable Grid Container */}
                <div className="border-[3px] border-[#E4E7EC] rounded-[48px] overflow-hidden shadow-sm bg-white relative">
                    
                    {/* Time Slot Row (Top) */}
                    <div className="flex h-[120px] bg-white border-b-[3px] border-[#E4E7EC]">
                        {/* Empty Corner */}
                        <div className="w-[300px] shrink-0 border-r-[3px] border-[#E4E7EC] bg-white"></div>
                        
                        {/* Time Slots */}
                        <div className="flex-grow flex">
                             {gridDimensions.hours.map((hour) => {
                                 const { time, period } = formatTimeHeader(hour);
                                 return (
                                     <div 
                                        key={hour}
                                        className="flex-1 flex flex-col items-center justify-center border-r-[3px] border-[#E4E7EC] last:border-r-0"
                                     >
                                         <div className="flex items-baseline gap-2">
                                             <span className="text-[32px] font-bold text-[#1E1E28]">{time}</span>
                                             <span className="text-[18px] font-medium text-[#4F4F63] uppercase">{period}</span>
                                         </div>
                                     </div>
                                 );
                             })}
                        </div>
                    </div>

                    {/* Days Rows */}
                    {timetable.days.map((dayData) => (
                        <div key={dayData.day} className="flex min-h-[260px] border-b-[3px] border-[#E4E7EC] last:border-b-0">
                            
                            {/* Day Label (Left) */}
                            <div className="w-[300px] shrink-0 border-r-[3px] border-[#E4E7EC] flex items-center justify-center bg-white">
                                <span className="text-[32px] font-bold text-[#1E1E28] uppercase tracking-wide">
                                    {dayData.day.substring(0, 3)}
                                </span>
                            </div>

                            {/* Schedule Track */}
                            <div className="flex-grow relative bg-white">
                                {/* Vertical Grid Lines */}
                                {gridDimensions.hours.map((hour, idx) => (
                                   <div 
                                      key={hour}
                                      className="absolute top-0 bottom-0 border-r-[3px] border-[#E4E7EC] last:border-r-0 z-0"
                                      style={{ left: `${(idx / gridDimensions.hours.length) * 100}%` }}
                                   ></div>
                                ))}

                                {/* Entries */}
                                {groupConcurrentEntries(dayData.entries).map((group, gIdx) => {
                                    const firstEntry = group[0];
                                    const style = getPositionStyle(firstEntry.timeStart, firstEntry.timeEnd);
                                    
                                    return (
                                        <div 
                                            key={gIdx} 
                                            className="absolute top-0 bottom-0 p-[20px] z-10 flex gap-[20px]"
                                            style={style}
                                        >
                                            {group.map(entry => {
                                                const isTheory = entry.type === LectureType.THEORY;
                                                
                                                if (entry.isBreak) {
                                                    return (
                                                        <div 
                                                            key={entry.id}
                                                            className="flex-1 rounded-[32px] flex flex-col items-center justify-center relative overflow-hidden h-full border border-[#E4E7EC]"
                                                            style={{
                                                                backgroundColor: '#F1F5F9',
                                                                backgroundImage: 'linear-gradient(45deg, #E2E8F0 25%, transparent 25%, transparent 50%, #E2E8F0 50%, #E2E8F0 75%, transparent 75%, transparent)',
                                                                backgroundSize: '30px 30px'
                                                            }}
                                                        >
                                                            {/* Text scales relative to 4200px width. Break text wraps if needed. */}
                                                            <div className="bg-white/90 backdrop-blur-md px-6 py-3 rounded-2xl shadow-sm text-center">
                                                              <span className="block text-[24px] font-bold text-[#475569] mb-1 leading-tight">
                                                                {entry.subjectName || 'SHORT BREAK'}
                                                              </span>
                                                              <span className="block text-[18px] font-medium text-[#64748B]">
                                                                {to12Hour(entry.timeStart)} to {to12Hour(entry.timeEnd)}
                                                              </span>
                                                            </div>
                                                        </div>
                                                    );
                                                }

                                                return (
                                                    <div 
                                                        key={entry.id}
                                                        className="flex-1 rounded-[32px] p-[30px] flex flex-col justify-between relative overflow-hidden shadow-sm border border-[#E4E7EC]"
                                                        style={{
                                                            backgroundColor: isTheory ? '#EFF6FF' : '#FAF5FF',
                                                            borderLeftWidth: '12px',
                                                            borderLeftColor: isTheory ? '#3B82F6' : '#A855F7' // Blue for Theory, Purple for Practical
                                                        }}
                                                    >
                                                        <div>
                                                            <div className="flex justify-between items-start mb-4">
                                                              <span 
                                                                  className="inline-block text-[16px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg"
                                                                  style={{
                                                                      color: isTheory ? '#1D4ED8' : '#7E22CE',
                                                                      backgroundColor: 'rgba(255,255,255,0.8)'
                                                                  }}
                                                              >
                                                                  {entry.type}
                                                              </span>
                                                              <span className="text-[18px] font-bold text-[#64748B] bg-white/50 px-3 py-1 rounded-lg">
                                                                  {to12Hour(entry.timeStart)} - {to12Hour(entry.timeEnd)}
                                                              </span>
                                                            </div>
                                                            {/* No line clamp allowed - show full text */}
                                                            <h4 className="text-[24px] font-bold text-[#1E1E28] leading-tight mb-2">
                                                                {entry.subjectName}
                                                            </h4>
                                                        </div>
                                                        <div className="flex items-center gap-4 mt-auto">
                                                            <div className="flex items-center gap-2">
                                                              <span className="w-2 h-2 rounded-full bg-[#CBD5E1]"></span>
                                                              <span className="text-[18px] font-medium text-[#4F4F63]">
                                                                  Room {entry.room}
                                                              </span>
                                                            </div>
                                                            <span className="text-[#CBD5E1] text-[20px]">•</span>
                                                            <span className="text-[18px] font-medium text-[#4F4F63]">
                                                                {entry.teacher}
                                                            </span>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimetableGenerator;
