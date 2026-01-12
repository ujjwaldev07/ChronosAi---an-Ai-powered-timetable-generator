
import { useState, useCallback, useEffect } from 'react';
import { Constraints, Subject, TimetableData, SavedTimetable, LectureType } from '../types';
import { generateAITimetable } from '../services/geminiService';
import { generateMockSchedule } from '../utils/timetableGenerator';

const STORAGE_KEY = 'saved_timetables';

export const useTimetableGenerator = (initialData?: SavedTimetable | null) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [progress, setProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);
  const [timetable, setTimetable] = useState<TimetableData | null>(null);

  const [constraints, setConstraints] = useState<Constraints>({
    collegeName: 'Chronos Tech Institute',
    department: 'Computer Science',
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
    dayTimings: {
      'Monday': { start: '08:00', end: '14:45' },
      'Tuesday': { start: '08:00', end: '14:45' },
      'Wednesday': { start: '08:00', end: '14:45' },
      'Thursday': { start: '08:00', end: '14:45' },
      'Friday': { start: '08:00', end: '14:45' }
    },
    breaks: [
      { id: '1', label: 'Short Break', duration: 15, afterLecture: 2 }, // 10:00 - 10:15 (After 8-9 and 9-10)
      { id: '2', label: 'Lunch Break', duration: 30, afterLecture: 4 }  // 12:15 - 12:45 (After 10:15-11:15 and 11:15-12:15)
    ],
    customRules: `Standard Weekly Schedule:
1. 08:00 - 09:00: Lecture
2. 09:00 - 10:00: Lecture
3. 10:00 - 10:15: Short Break
4. 10:15 - 11:15: Lecture
5. 11:15 - 12:15: Lecture
6. 12:15 - 12:45: Lunch Break
7. 12:45 - 01:45: Lecture
8. 01:45 - 02:45: Lecture`
  });

  // Default subjects removed as per request to reduce user burden
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Load initial data if provided (Edit Mode)
  useEffect(() => {
    if (initialData) {
      setTimetable(initialData.data);
      setConstraints(initialData.constraints);
      setSubjects(initialData.subjects);
    }
  }, [initialData]);

  const parseAIError = (err: any): string => {
    const msg = err?.message || "";
    const lowerMsg = msg.toLowerCase();

    if (lowerMsg.includes('api_key') || lowerMsg.includes('401') || lowerMsg.includes('403')) {
      return "Authentication failed: Your API key is invalid or lacks permission. Please verify your environment settings.";
    }
    
    if (lowerMsg.includes('quota') || lowerMsg.includes('429') || lowerMsg.includes('rate limit')) {
      return "System capacity reached: Too many requests at once. Please wait 60 seconds and try again.";
    }

    if (lowerMsg.includes('safety') || lowerMsg.includes('finish_reason_safety') || lowerMsg.includes('blocked')) {
      return "Policy restriction: The content was flagged by AI safety filters. Ensure subject names and descriptions are professional.";
    }

    if (lowerMsg.includes('overloaded') || lowerMsg.includes('503') || lowerMsg.includes('server error') || lowerMsg.includes('500')) {
      return "Neural Engine Busy: The AI model is currently overloaded. Retrying in a few moments often resolves this.";
    }

    if (lowerMsg.includes('json') || lowerMsg.includes('parse')) {
      return "Formatting Error: The AI generated a malformed schedule. Retrying should fix the alignment.";
    }

    if (lowerMsg.includes('network') || lowerMsg.includes('fetch') || lowerMsg.includes('internet')) {
      return "Connectivity issue: Please check your internet connection and try again.";
    }

    return `Scheduling Failure: ${msg || "An unexpected error occurred within the neural engine."}`;
  };

  const generate = async (useAI: boolean = true) => {
    if (subjects.length === 0 && useAI) {
      setError("Data Input Error: Please add at least one subject to generate a curriculum.");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setProgress(10); // Start immediately
    setStatus('Initializing Engine...');

    try {
      if (useAI) {
        // High-speed progress simulation
        const steps = [
          { msg: 'Processing...', prog: 30 },
          { msg: 'Optimizing...', prog: 60 },
          { msg: 'Finalizing...', prog: 85 }
        ];

        let stepIdx = 0;
        const progressInterval = setInterval(() => {
          if (stepIdx < steps.length) {
            setStatus(steps[stepIdx].msg);
            setProgress(steps[stepIdx].prog);
            stepIdx++;
          }
        }, 120); // Much faster tick (was 500ms)

        try {
          const result = await generateAITimetable(constraints, subjects);
          clearInterval(progressInterval); // Clear immediately on success
          setProgress(100);
          setStatus('Done');
          setTimetable(result);
        } catch (e) {
            clearInterval(progressInterval);
            throw e;
        }
      } else {
        setStatus('Drafting...');
        setProgress(60);
        await new Promise(resolve => setTimeout(resolve, 50)); // Almost instant (was 800ms)
        
        // Mock Subject list if empty to ensure the draft looks good immediately
        const mockSubjects = subjects.length > 0 ? subjects : [
           { name: 'Advanced Algorithms', teacher: 'Dr. Smith', type: LectureType.THEORY },
           { name: 'Database Systems', teacher: 'Prof. Johnson', type: LectureType.PRACTICAL },
           { name: 'System Design', teacher: 'Dr. Brown', type: LectureType.THEORY },
           { name: 'Cloud Computing', teacher: 'Prof. Davis', type: LectureType.PRACTICAL }
        ];

        const result = generateMockSchedule(
          constraints.workingDays, 
          mockSubjects, 
          '08:00', 
          '14:45', 
          constraints.breaks, 
          constraints.dayTimings
        );
        setProgress(100);
        setTimetable({ days: result });
      }
    } catch (err: any) {
      console.error("Timetable generation error:", err);
      setError(parseAIError(err));
    } finally {
      setIsGenerating(false);
      setStatus('');
    }
  };

  const saveTimetable = useCallback(() => {
    if (!timetable) return;

    const saved: SavedTimetable = {
      id: crypto.randomUUID(),
      data: timetable,
      constraints,
      subjects,
      timestamp: Date.now()
    };

    const existingJson = localStorage.getItem(STORAGE_KEY);
    const existing: SavedTimetable[] = existingJson ? JSON.parse(existingJson) : [];
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify([saved, ...existing]));
    return saved;
  }, [timetable, constraints, subjects]);

  const loadTimetable = useCallback((saved: SavedTimetable) => {
    setTimetable(saved.data);
    setConstraints(saved.constraints);
    setSubjects(saved.subjects);
  }, []);

  return {
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
    loadTimetable,
    setTimetable
  };
};
