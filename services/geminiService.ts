
import { GoogleGenAI, Type } from "@google/genai";
import { Constraints, Subject, TimetableData } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateAITimetable = async (constraints: Constraints, subjects: Subject[]): Promise<TimetableData> => {
  // Enhanced break prompt to handle generic offsets or specific instructions
  const breakPrompt = constraints.breaks.map(b => `- ${b.label}: ${b.duration} mins after lecture ${b.afterLecture}`).join('\n');

  // Build a string that describes the specific operating hours for each day
  const dailyTimings = constraints.workingDays.map(day => {
    const timing = constraints.dayTimings[day] || { start: '08:00', end: '15:00' };
    return `- ${day}: ${timing.start} to ${timing.end}`;
  }).join('\n');

  // Condensed inventory list for token efficiency
  const daySpecificAllocation = constraints.workingDays.map(day => {
    const daySubjects = subjects.filter(s => s.day === day);
    if (daySubjects.length === 0) return `Day: ${day} [Use Custom Logic]`;
    
    // Condensed line item
    const subjectList = daySubjects.map(s => 
       `- ${s.name} (${s.type}, ${s.assignedRoom}, ${s.batches.length ? s.batches.join('') : 'All'})`
    ).join('\n');

    return `Day: ${day} INV:\n${subjectList}`;
  }).join('\n');

  const prompt = `
    Generate Weekly Timetable JSON.
    Days: ${constraints.workingDays.join(', ')}.
    College: ${constraints.collegeName}
    Hours:
    ${dailyTimings}
    
    CUSTOM LOGIC (PRIORITY 1):
    ${constraints.customRules || "None"}

    INVENTORY (PRIORITY 2):
    ${daySpecificAllocation}

    RULES:
    1. Exec Custom Logic exactly.
    2. Parallel batches = separate entries.
    3. Practical=2hr, Theory=1hr.
    4. Output strictly valid JSON.
  `;

  // Using gemini-3-flash-preview for lowest latency and high instruction following capability
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: prompt,
    config: {
      temperature: 0.2, // Low temperature for faster, deterministic output
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          days: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                day: { type: Type.STRING },
                entries: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      id: { type: Type.STRING },
                      timeStart: { type: Type.STRING },
                      timeEnd: { type: Type.STRING },
                      subjectName: { type: Type.STRING },
                      teacher: { type: Type.STRING },
                      room: { type: Type.STRING },
                      type: { type: Type.STRING },
                      batches: { type: Type.ARRAY, items: { type: Type.STRING } },
                      isBreak: { type: Type.BOOLEAN },
                      breakLabel: { type: Type.STRING }
                    },
                    required: ["timeStart", "timeEnd", "subjectName", "room", "isBreak"]
                  }
                }
              },
              required: ["day", "entries"]
            }
          }
        },
        required: ["days"]
      }
    }
  });

  try {
    const data = JSON.parse(response.text || '{}');
    return data as TimetableData;
  } catch (e) {
    console.error("Failed to parse Gemini response", e);
    throw new Error("AI generation failed to produce valid JSON.");
  }
};
