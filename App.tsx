
import React, { useState, useEffect } from 'react';
import Navbar from './components/generator/Navbar';
import Hero from './components/generator/Hero';
import TimetableGenerator from './pages/TimetableGenerator';
import Dashboard from './pages/Dashboard';
import { SavedTimetable } from './types';

export enum View {
  HOME = 'home',
  GENERATOR = 'generator',
  DASHBOARD = 'dashboard'
}

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<View>(View.HOME);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [selectedTimetable, setSelectedTimetable] = useState<SavedTimetable | null>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

  const handleNavigate = (view: View) => {
    // If navigating away from generator without explicitly loading a file, clear the selection
    if (view !== View.GENERATOR) {
      setSelectedTimetable(null);
    }
    setCurrentView(view);
  };

  const handleLoadTimetable = (timetable: SavedTimetable) => {
    setSelectedTimetable(timetable);
    setCurrentView(View.GENERATOR);
  };

  const renderView = () => {
    switch (currentView) {
      case View.HOME:
        return <Hero onStart={() => setCurrentView(View.GENERATOR)} />;
      case View.GENERATOR:
        return (
          <TimetableGenerator 
            initialData={selectedTimetable} 
            onClearData={() => setSelectedTimetable(null)}
          />
        );
      case View.DASHBOARD:
        return (
          <Dashboard 
            onNavigate={handleNavigate} 
            onLoad={handleLoadTimetable} 
          />
        );
      default:
        return <Hero onStart={() => setCurrentView(View.GENERATOR)} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col transition-colors duration-300 bg-slate-950 text-white">
      <Navbar 
        onNavigate={(view) => handleNavigate(view as View)} 
        currentView={currentView}
        isDarkMode={isDarkMode}
        toggleDarkMode={toggleDarkMode}
      />
      <main className="flex-grow pt-16">
        {renderView()}
      </main>
    </div>
  );
};

export default App;
