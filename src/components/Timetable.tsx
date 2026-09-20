import React from 'react';
import { DayOfWeek, ClassSession, ScheduleCombination } from '../types';
import { Clock, MapPin, User, Layers, CalendarRange } from 'lucide-react';

interface TimetableProps {
  combination: ScheduleCombination;
  stateNumber?: number;
}

const DAYS: DayOfWeek[] = ['شنبه', 'یکشنبه', 'دوشنبه', 'سه‌شنبه', 'چهارشنبه'];

interface TimeSlot {
  startHour: number;
  endHour: number;
  label: string;
  timeRange: string;
}

const TIME_SLOTS: TimeSlot[] = [
  { startHour: 8, endHour: 10, label: '08:00', timeRange: '08:00 تا 10:00' },
  { startHour: 10, endHour: 12, label: '10:00', timeRange: '10:00 تا 12:00' },
  { startHour: 12, endHour: 14, label: '12:00', timeRange: '12:00 تا 14:00' },
  { startHour: 14, endHour: 16, label: '14:00', timeRange: '14:00 تا 16:00' },
  { startHour: 16, endHour: 18, label: '16:00', timeRange: '16:00 تا 18:00' },
  { startHour: 18, endHour: 20, label: '18:00', timeRange: '18:00 تا 20:00' },
];

export const Timetable: React.FC<TimetableProps> = ({ combination, stateNumber = 1 }) => {
  // Helper to get sessions in a specific day and time slot
  const getSessionsForSlot = (day: DayOfWeek, slot: TimeSlot): ClassSession[] => {
    return combination.sessions.filter(
      (s) => s.day === day && s.startHour === slot.startHour && s.endHour === slot.endHour
    );
  };

  return (
    <div
      id="timetable-export-container"
      className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden p-1 sm:p-2"
    >
      {/* Visual Title Card for Image Export */}
      <div className="p-3 sm:p-4 bg-slate-900 text-white rounded-xl mb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm">
            {stateNumber}
          </div>
          <div>
            <h3 className="font-extrabold text-sm sm:text-base">
              برنامه هفتگی انتخاب واحد — حالت شماره {stateNumber}
            </h3>
            <p className="text-[11px] text-slate-400">
              ترکیب دروس بدون هیچ‌گونه تداخل زمانی (شامل تفکیک جلسات هفته‌های زوج و فرد)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-[11px] font-bold self-start sm:self-center">
          <span className="flex items-center gap-1 bg-blue-900/60 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
            ثابت (هر هفته)
          </span>
          <span className="flex items-center gap-1 bg-amber-900/60 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded">
            <span className="w-2 h-2 rounded-full bg-amber-400 inline-block"></span>
            هفته فرد
          </span>
          <span className="flex items-center gap-1 bg-purple-900/60 text-purple-300 border border-purple-400/30 px-2 py-0.5 rounded">
            <span className="w-2 h-2 rounded-full bg-purple-400 inline-block"></span>
            هفته زوج
          </span>
        </div>
      </div>

      {/* Scrollable Container with horizontal scroll and fixed hour column */}
      <div className="overflow-x-auto scrollbar-custom relative rounded-xl border border-slate-200">
        <table className="w-full min-w-[920px] border-collapse text-right">
          <thead>
            <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 text-sm font-bold">
              {/* Sticky Right Column Header: Time / Days */}
              <th
                className="sticky right-0 z-30 bg-slate-100 border-l border-slate-300 px-4 py-3.5 w-28 text-center text-xs font-black text-slate-600 uppercase tracking-wider shadow-xs"
                style={{ minWidth: '110px' }}
              >
                ساعت / روز
              </th>

              {/* Day Columns */}
              {DAYS.map((day) => (
                <th
                  key={day}
                  className="px-4 py-3.5 text-center font-extrabold text-sm sm:text-base border-l border-slate-200 text-slate-800 last:border-l-0"
                >
                  <div className="flex flex-col items-center justify-center">
                    <span>{day}</span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {TIME_SLOTS.map((slot, slotIndex) => {
              const isLastSlot = slotIndex === TIME_SLOTS.length - 1;

              return (
                <tr key={slot.startHour} className="group hover:bg-slate-50/40 transition-colors">
                  {/* Sticky Time Column */}
                  <td
                    className="sticky right-0 z-20 bg-slate-50 border-l border-slate-300 p-2 sm:p-3 text-center align-middle shadow-xs"
                    style={{ minWidth: '110px' }}
                  >
                    <div className="flex flex-col items-center justify-between h-full py-2">
                      <div className="flex items-center gap-1 text-slate-800 font-extrabold text-sm sm:text-base">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>{slot.label}</span>
                      </div>
                      <div className="w-6 h-px bg-slate-300 my-1"></div>
                      <div className="text-xs text-slate-500 font-semibold">{slot.timeRange}</div>
                      {isLastSlot && (
                        <div className="mt-4 pt-2 border-t border-slate-200 text-slate-700 font-black text-xs bg-slate-200/70 rounded px-1.5 py-0.5">
                          پایان: 20:00
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Day Cells for this slot */}
                  {DAYS.map((day) => {
                    const sessions = getSessionsForSlot(day, slot);

                    return (
                      <td
                        key={day}
                        className="p-2 border-l border-slate-200 last:border-l-0 align-top min-h-[155px] h-[155px] relative"
                      >
                        {sessions.length === 0 ? (
                          <div className="w-full h-full min-h-[140px] rounded-xl border border-dashed border-slate-200/80 bg-slate-50/30 flex items-center justify-center">
                            <span className="text-slate-300 text-xs font-light select-none">—</span>
                          </div>
                        ) : sessions.length === 1 ? (
                          // Single Class Card (2 hours height)
                          <SingleClassCard session={sessions[0]} slot={slot} />
                        ) : (
                          // Dual Class Card: Two alternating classes (e.g. فرد and زوج) in the same slot!
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 h-full min-h-[140px]">
                            {sessions.map((session) => (
                              <DualClassCard key={session.id} session={session} slot={slot} />
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>

          {/* Bottom Footer Row with 20:00 final hour indicator */}
          <tfoot>
            <tr className="bg-slate-100/80 border-t-2 border-slate-300 text-xs text-slate-600">
              <td
                className="sticky right-0 z-20 bg-slate-200/90 border-l border-slate-300 px-3 py-2 text-center font-black text-slate-800"
                style={{ minWidth: '110px' }}
              >
                20:00
              </td>
              <td colSpan={5} className="px-4 py-2 text-slate-500 font-medium text-center">
                پایان برنامه‌های درسی روزانه در ساعت ۲۰:۰۰
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
};

// Component for a standard single session card
interface CardProps {
  session: ClassSession;
  slot: TimeSlot;
}

const SingleClassCard: React.FC<CardProps> = ({ session, slot }) => {
  // Determine color styling based on recurrence
  const isFixed = session.recurrence === 'ثابت';
  const isOdd = session.recurrence === 'فرد';
  const isEven = session.recurrence === 'زوج';

  const themeStyles = isFixed
    ? {
        bg: 'bg-blue-50/90',
        border: 'border-blue-400 hover:border-blue-500',
        badgeBg: 'bg-blue-600 text-white',
        badgeLabel: 'هر هفته (ثابت)',
        textHeader: 'text-blue-950',
        subText: 'text-blue-900',
        metaText: 'text-blue-700',
        tagBg: 'bg-blue-100 text-blue-800 border-blue-200',
      }
    : isOdd
    ? {
        bg: 'bg-amber-50/90',
        border: 'border-amber-400 hover:border-amber-500',
        badgeBg: 'bg-amber-600 text-white',
        badgeLabel: 'هفته فرد (هفته‌درمیان)',
        textHeader: 'text-amber-950',
        subText: 'text-amber-900',
        metaText: 'text-amber-700',
        tagBg: 'bg-amber-100 text-amber-800 border-amber-200',
      }
    : {
        bg: 'bg-purple-50/90',
        border: 'border-purple-400 hover:border-purple-500',
        badgeBg: 'bg-purple-600 text-white',
        badgeLabel: 'هفته زوج (هفته‌درمیان)',
        textHeader: 'text-purple-950',
        subText: 'text-purple-900',
        metaText: 'text-purple-700',
        tagBg: 'bg-purple-100 text-purple-800 border-purple-200',
      };

  return (
    <div
      className={`w-full h-full min-h-[140px] rounded-xl border-2 ${themeStyles.border} ${themeStyles.bg} p-2.5 flex flex-col justify-between shadow-xs transition-all hover:shadow-md relative overflow-hidden`}
    >
      {/* Top: Recurrence Badge and Hour */}
      <div>
        <div className="flex items-center justify-between gap-1.5 mb-1.5">
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full ${themeStyles.badgeBg} shadow-xs`}
          >
            <CalendarRange className="w-3 h-3" />
            <span>{themeStyles.badgeLabel}</span>
          </span>

          <span className={`text-[11px] font-extrabold ${themeStyles.metaText}`}>
            {slot.timeRange}
          </span>
        </div>

        {/* Course Name */}
        <h4 className={`text-sm sm:text-base font-black ${themeStyles.textHeader} leading-tight mb-1`}>
          {session.courseName}
        </h4>

        {/* Group and Instructor */}
        <div className="space-y-0.5 text-xs">
          <div className="flex items-center gap-1 text-slate-700 font-semibold">
            <Layers className="w-3 h-3 text-slate-500 shrink-0" />
            <span>گروه {session.groupId}</span>
          </div>

          <div className="flex items-center gap-1 text-slate-600">
            <User className="w-3 h-3 text-slate-400 shrink-0" />
            <span>استاد: {session.instructor}</span>
          </div>
        </div>
      </div>

      {/* Bottom info: Room */}
      <div className="pt-1.5 mt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
        <div className="flex items-center gap-1 text-slate-600 font-medium">
          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
          <span>کلاس: {session.room}</span>
        </div>
        <span className="text-[10px] text-slate-500">{session.durationMinutes} دقیقه</span>
      </div>
    </div>
  );
};

// Component for when two classes occur at the same slot (Odd week and Even week)
const DualClassCard: React.FC<CardProps> = ({ session, slot }) => {
  const isOdd = session.recurrence === 'فرد';

  const themeStyles = isOdd
    ? {
        bg: 'bg-amber-50',
        border: 'border-amber-400',
        badgeBg: 'bg-amber-600 text-white',
        badgeLabel: 'هفته فرد',
        headerText: 'text-amber-950',
      }
    : {
        bg: 'bg-purple-50',
        border: 'border-purple-400',
        badgeBg: 'bg-purple-600 text-white',
        badgeLabel: 'هفته زوج',
        headerText: 'text-purple-950',
      };

  return (
    <div
      className={`h-full min-h-[140px] rounded-xl border-2 ${themeStyles.border} ${themeStyles.bg} p-2 flex flex-col justify-between shadow-xs text-xs relative`}
    >
      <div>
        <div className="flex items-center justify-between gap-1 mb-1">
          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${themeStyles.badgeBg}`}>
            {themeStyles.badgeLabel}
          </span>
          <span className="text-[10px] font-bold text-slate-600">{slot.timeRange}</span>
        </div>

        <h5 className={`font-black ${themeStyles.headerText} text-xs leading-snug mb-1`}>
          {session.courseName}
        </h5>

        <div className="text-[11px] text-slate-700 font-semibold">گروه {session.groupId}</div>
        <div className="text-[10px] text-slate-600 truncate">استاد: {session.instructor}</div>
      </div>

      <div className="pt-1 mt-1 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-500">
        <span>کلاس: {session.room}</span>
        <span>هفته‌درمیان</span>
      </div>
    </div>
  );
};
