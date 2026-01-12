
import { TimetableEntry, LectureType, DaySchedule, TimetableBreak } from '../types';

export const to12Hour = (time24: string): string => {
  if (!time24) return '';
  const [hours, minutes] = time24.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hours12 = hours % 12 || 12;
  return `${hours12}:${minutes.toString().padStart(2, '0')} ${period}`;
};

export const calculateTimeSlots = (start: string, end: string, breaks: TimetableBreak[]): { slots: { start: string, end: string, isBreak: boolean, label?: string }[] } => {
  const parseTime = (t: string) => {
    const [h, m] = t.split(':').map(Number);
    return h * 60 + m;
  };

  const formatTime = (totalMinutes: number) => {
    const h = Math.floor(totalMinutes / 60) % 24;
    const m = totalMinutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const startTimeMinutes = parseTime(start);
  const endTimeMinutes = parseTime(end);

  let currentMinutes = startTimeMinutes;
  let lectureCount = 0;
  const slots: any[] = [];

  // Sort breaks by when they occur
  const sortedBreaks = [...breaks].sort((a, b) => a.afterLecture - b.afterLecture);

  while (currentMinutes < endTimeMinutes) {
    // Default duration is 60 minutes as per requested logic (8-9, 9-10, etc.)
    let currentBlockDuration = 60;

    // Ensure we don't exceed end time
    if (currentMinutes + currentBlockDuration > endTimeMinutes) {
      currentBlockDuration = endTimeMinutes - currentMinutes;
    }
    
    if (currentBlockDuration <= 0) break;

    // Add Lecture Slot
    const slotStart = formatTime(currentMinutes);
    currentMinutes += currentBlockDuration;
    const slotEnd = formatTime(currentMinutes);
    lectureCount++;

    slots.push({
      start: slotStart,
      end: slotEnd,
      isBreak: false
    });

    // Check for Break
    const scheduledBreak = sortedBreaks.find(b => b.afterLecture === lectureCount);
    
    if (scheduledBreak && currentMinutes + scheduledBreak.duration <= endTimeMinutes) {
      const bStart = formatTime(currentMinutes);
      currentMinutes += scheduledBreak.duration;
      const bEnd = formatTime(currentMinutes);
      
      slots.push({
        start: bStart,
        end: bEnd,
        isBreak: true,
        label: scheduledBreak.label
      });
    }
  }

  return { slots };
};

export const generateMockSchedule = (
  days: string[], 
  subjects: any[], 
  globalStart: string, 
  globalEnd: string, 
  breaks: TimetableBreak[],
  dayTimings?: Record<string, { start: string; end: string }>
): DaySchedule[] => {
  
  return days.map(day => {
    // Determine start/end time for specific day, fallback to global
    const dayStart = dayTimings?.[day]?.start || globalStart;
    const dayEnd = dayTimings?.[day]?.end || globalEnd;

    const { slots } = calculateTimeSlots(dayStart, dayEnd, breaks);
    const dayEntries: TimetableEntry[] = [];
    let subjectIdx = Math.floor(Math.random() * subjects.length);

    slots.forEach((slot, idx) => {
      if (slot.isBreak) {
        dayEntries.push({
          id: crypto.randomUUID(),
          timeStart: slot.start,
          timeEnd: slot.end,
          subjectName: slot.label || 'Break',
          teacher: '-',
          room: '-',
          type: LectureType.THEORY,
          batches: [],
          isBreak: true
        });
      } else {
        const sub = subjects[subjectIdx % (subjects.length || 1)];
        // Determine type based on duration or random if standard slot
        const duration = (parseInt(slot.end.split(':')[0]) * 60 + parseInt(slot.end.split(':')[1])) - 
                         (parseInt(slot.start.split(':')[0]) * 60 + parseInt(slot.start.split(':')[1]));
                         
        const type = duration >= 120 ? LectureType.PRACTICAL : (sub?.type || LectureType.THEORY);
        const room = sub?.assignedRoom || (type === LectureType.PRACTICAL ? 'Lab-A' : 'LH-101');

        dayEntries.push({
          id: crypto.randomUUID(),
          timeStart: slot.start,
          timeEnd: slot.end,
          subjectName: sub?.name || (type === LectureType.PRACTICAL ? 'Practical Session' : 'Theory Lecture'),
          teacher: sub?.teacher || 'Faculty',
          room: room,
          type: type,
          batches: sub?.batches || [],
          isBreak: false
        });
        subjectIdx++;
      }
    });

    return { day, entries: dayEntries };
  });
};
