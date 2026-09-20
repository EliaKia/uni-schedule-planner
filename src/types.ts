export type DayOfWeek = 'شنبه' | 'یکشنبه' | 'دوشنبه' | 'سه‌شنبه' | 'چهارشنبه';

export type SessionRecurrence = 'ثابت' | 'فرد' | 'زوج';

export interface ClassSession {
  id: string;
  courseId: number;
  courseName: string;
  groupId: number;
  instructor: string;
  room: string;
  day: DayOfWeek;
  startHour: number; // e.g. 8, 10, 12, 14, 16, 18
  endHour: number;   // e.g. 10, 12, 14, 16, 18, 20
  durationMinutes: number; // 120
  recurrence: SessionRecurrence; // 'ثابت' (هر هفته), 'فرد' (هفته فرد), 'زوج' (هفته زوج)
  sessionTitle: string; // جلسه اول / جلسه دوم
}

export interface CourseGroup {
  groupId: number;
  instructor: string;
  sessions: ClassSession[];
}

export interface Course {
  id: number;
  name: string;
  groups: CourseGroup[];
}

export interface ScheduleCombination {
  id: number;
  combinationIndex: number;
  selectedGroups: {
    courseId: number;
    courseName: string;
    groupId: number;
    instructor: string;
  }[];
  sessions: ClassSession[];
  hasConflict: boolean;
  conflictDetails?: string[];
  activeDays: DayOfWeek[];
  freeDays: DayOfWeek[];
  hasMorningClass8am: boolean;
  instructors: string[];
}

export interface ScheduleFilterState {
  // Mapping courseId to preferred instructor name (empty string or undefined = all instructors)
  courseInstructors: Record<number, string>;
  freeSlotsRequired: { day: DayOfWeek; startHour: number }[]; // slots that MUST be empty
}

