
import React from 'react';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface HeroProps {
  onStart: () => void;
}

const Hero: React.FC<HeroProps> = ({ onStart }) => {
  return (
    <div className="relative overflow-hidden bg-[#f8fafc] dark:bg-[#020617] transition-colors duration-500">
      {/* Decorative Blur Elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 dark:bg-indigo-600/5 rounded-full blur-[150px] animate-pulse-slow"></div>
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-fuchsia-500/10 dark:bg-fuchsia-600/5 rounded-full blur-[150px] animate-pulse-slow"></div>

      <div className="relative max-w-5xl mx-auto px-6 sm:px-8 lg:px-12 py-24 lg:py-32 flex flex-col items-center text-center gap-10">
        <div className="space-y-8 z-10">
          <div className="inline-flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-5 py-2.5 rounded-full shadow-xl shadow-slate-200/50 dark:shadow-none animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="ai-gradient p-1 rounded-full">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-black tracking-widest text-indigo-600 dark:text-indigo-400 uppercase italic">ChronosAI v2.0</span>
          </div>
          
          <div className="space-y-6">
            <h1 className="text-6xl lg:text-8xl font-[900] text-slate-950 dark:text-white leading-[0.95] tracking-[-0.04em] animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Master Time.<br/>
              <span className="text-transparent bg-clip-text ai-gradient">Design Future.</span>
            </h1>
            <p className="text-xl text-slate-500 dark:text-slate-400 font-medium leading-relaxed max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
              Eliminate administrative friction with ChronosAI's Gemini-powered neural scheduling. Build complex institutional logic with dynamic batch management and real-time editing.
            </p>
          </div>

          <div className="pt-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-400">
            <button 
              onClick={onStart}
              className="group relative ai-gradient text-white px-12 py-6 rounded-3xl font-[900] text-2xl hover:scale-[1.05] active:scale-95 transition-all shadow-2xl shadow-indigo-500/20 tracking-tighter"
            >
              <div className="flex items-center gap-3">
                Initialize Engine
                <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 pt-12 animate-in fade-in duration-1000 delay-700">
            {['Neural Conflict Resolving', 'Batch Load Balancing', 'Smart Lab Mapping', 'Atomic Break Logic'].map((feat) => (
              <div key={feat} className="flex flex-col items-center space-y-3 group">
                <div className="bg-indigo-50 dark:bg-indigo-500/10 w-12 h-12 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                </div>
                <p className="text-[10px] font-black text-slate-900 dark:text-slate-400 uppercase tracking-[0.15em] leading-tight max-w-[120px]">{feat}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;
