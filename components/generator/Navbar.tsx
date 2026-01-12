
import React from 'react';
import { Calendar, LayoutDashboard, Wand2, Moon, Sun, Sparkles } from 'lucide-react';

interface NavbarProps {
  onNavigate: (view: string) => void;
  currentView: string;
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentView, isDarkMode, toggleDarkMode }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 glass border-b border-slate-200 dark:border-slate-800 z-[100] h-20 px-6 md:px-12 flex items-center justify-between transition-all duration-500">
      <div 
        className="flex items-center gap-3 cursor-pointer group"
        onClick={() => onNavigate('home')}
      >
        <div className="ai-gradient p-2.5 rounded-2xl group-hover:rotate-12 transition-all shadow-lg shadow-indigo-500/20">
          <Calendar className="text-white w-6 h-6" />
        </div>
        <div className="flex flex-col -space-y-1">
          <span className="font-[900] text-2xl tracking-tighter dark:text-white group-hover:text-indigo-600 transition-colors">
            Chronos<span className="text-indigo-600 dark:text-indigo-400">AI</span>
          </span>
          <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">Academic Intelligence</span>
        </div>
      </div>

      <div className="flex items-center gap-4 md:gap-8">
        <div className="flex items-center bg-slate-100 dark:bg-slate-900 p-1.5 rounded-2xl border border-slate-200/50 dark:border-slate-800/50">
          <button 
            onClick={() => onNavigate('generator')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${currentView === 'generator' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xl shadow-slate-200/50 dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden md:inline uppercase tracking-widest">Generate</span>
          </button>
          <button 
            onClick={() => onNavigate('dashboard')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-black transition-all ${currentView === 'dashboard' ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xl shadow-slate-200/50 dark:shadow-none' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            <span className="hidden md:inline uppercase tracking-widest">Library</span>
          </button>
        </div>

        <div className="h-8 w-px bg-slate-200 dark:bg-slate-800 hidden md:block"></div>

        <button 
          onClick={toggleDarkMode}
          className="p-3.5 rounded-2xl bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:border-indigo-500 hover:text-indigo-500 transition-all shadow-lg shadow-slate-100 dark:shadow-none active:scale-90"
          aria-label="Toggle Atmosphere"
        >
          {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
