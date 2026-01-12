
export enum LectureType {
  THEORY = 'Theory',
  PRACTICAL = 'Practical'
}

export type Batch = 'X' | 'Y' | 'P' | 'Q' | 'A' | 'B';

export interface Subject {
  id: string;
  name: string;
  teacher: string;
  type: LectureType;
  batches: Batch[];
  weeklyHours: number;
  assignedRoom?: string;
  day?: string; // specific day assignment
}

export interface TimetableBreak {
  id: string;
  label: string;
  duration: number;
  afterLecture: number;
}

export interface TimetableEntry {
  id: string;
  timeStart: string;
  timeEnd: string;
  subjectName: string;
  teacher: string;
  room: string;
  type: LectureType;
  batches: Batch[];
  isBreak: boolean;
  breakLabel?: string;
}

export interface DaySchedule {
  day: string;
  entries: TimetableEntry[];
}

export interface TimetableData {
  days: DaySchedule[];
}

export interface Constraints {
  collegeName: string;
  department: string;
  workingDays: string[];
  // Replaced global start/end with per-day configuration
  dayTimings: Record<string, { start: string; end: string }>; 
  breaks: TimetableBreak[];
  customRules?: string; 
}

export interface SavedTimetable {
  id: string;
  data: TimetableData;
  constraints: Constraints;
  subjects: Subject[];
  timestamp: number;
}
