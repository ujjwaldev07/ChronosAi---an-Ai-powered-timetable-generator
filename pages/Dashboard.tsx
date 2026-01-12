
import React, { useState, useEffect } from 'react';
import { Archive, Plus, Trash2, Calendar, Users, ArrowUpRight, FolderOpen } from 'lucide-react';
import { SavedTimetable } from '../types';
import { View } from '../App';

const STORAGE_KEY = 'saved_timetables';

interface DashboardProps {
  onNavigate: (view: View) => void;
  onLoad: (timetable: SavedTimetable) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, onLoad }) => {
  const [savedLists, setSavedLists] = useState<SavedTimetable[]>([]);

  useEffect(() => {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      setSavedLists(JSON.parse(data));
    }
  }, []);

  const deleteTimetable = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this timetable? This action cannot be undone.')) {
      const updated = savedLists.filter(item => item.id !== id);
      setSavedLists(updated);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    }
  };

  const formatDate = (ts: number) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(new Date(ts));
  };

  return (
    <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 pb-32">
      <div className="flex items-center justify-between mb-16">
        <div className="space-y-2">
          <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">Saved <span className="text-indigo-600">Archives</span></h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage and export your previously generated schedules.</p>
        </div>
        <button 
          onClick={() => onNavigate(View.GENERATOR)}
          className="group ai-gradient text-white px-6 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-indigo-500/20 hover:scale-105 transition-transform"
        >
          <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
          Create New
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savedLists.map((item) => (
          <div 
            key={item.id}
            onClick={() => onLoad(item)}
            className="group cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] p-6 hover:border-indigo-500 dark:hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 dark:bg-indigo-900/10 rounded-bl-[4rem] -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
            
            <div className="relative space-y-6">
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                  <Archive className="w-6 h-6" />
                </div>
                <button 
                  onClick={(e) => deleteTimetable(e, item.id)}
                  className="p-2 text-slate-300 hover:text-rose-500 transition-colors z-10"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white leading-tight mb-1 line-clamp-1">
                  {item.constraints.collegeName || 'Untitled Institution'}
                </h3>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-500">
                  {item.constraints.department || 'General Department'}
                </p>
              </div>

              <div className="flex flex-col gap-2 pt-2">
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  <span>Modified {formatDate(item.timestamp)}</span>
                </div>
                <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                  <Users className="w-4 h-4 text-indigo-500" />
                  <span>{item.subjects.length} Subjects Configured</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-sm font-black group-hover:translate-x-2 transition-transform">
                Open Schedule <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </div>
        ))}

        {savedLists.length === 0 && (
          <div className="col-span-full py-20 flex flex-col items-center justify-center text-center border-4 border-dashed border-slate-100 dark:border-slate-800 rounded-[3rem]">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-900 rounded-full flex items-center justify-center mb-6">
              <FolderOpen className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No Archives Found</h3>
            <p className="text-slate-500 max-w-sm mx-auto mb-8">Generate your first AI-powered timetable to start building your collection.</p>
            <button 
              onClick={() => onNavigate(View.GENERATOR)}
              className="text-indigo-600 font-bold hover:underline"
            >
              Start Generation Now
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
