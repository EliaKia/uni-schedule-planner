import React from 'react';
import { ScheduleCombination } from '../types';
import { BookOpen, Calendar, Clock, MapPin, User, GraduationCap } from 'lucide-react';

interface SelectedGroupsDetailsProps {
  combination: ScheduleCombination;
}

export const SelectedGroupsDetails: React.FC<SelectedGroupsDetailsProps> = ({ combination }) => {
  // Group sessions by course
  const coursesMap = new Map<number, typeof combination.sessions>();
  combination.sessions.forEach((session) => {
    if (!coursesMap.has(session.courseId)) {
      coursesMap.set(session.courseId, []);
    }
    coursesMap.get(session.courseId)!.push(session);
  });

  const taSessionsCount = combination.sessions.filter((s) => s.isTA).length;

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
      <div className="flex items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-blue-600" />
          <h3 className="font-extrabold text-slate-800 text-base sm:text-lg">
            مشخصات کامل دروس انتخاب‌شده در این حالت
          </h3>
        </div>
        <span className="text-xs bg-slate-100 text-slate-600 font-semibold px-2.5 py-1 rounded-full border border-slate-200">
          ۵ درس، ۱۰ جلسه اصلی
          {taSessionsCount > 0 && ` + ${taSessionsCount} جلسه حل تمرین`}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from(coursesMap.entries()).map(([courseId, sessions]) => {
          const mainSessions = sessions.filter((s) => !s.isTA);
          const taSessions = sessions.filter((s) => s.isTA);
          const firstSession = mainSessions[0];
          const secondSession = mainSessions[1];

          if (!firstSession) return null;

          return (
            <div
              key={courseId}
              className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-extrabold text-slate-900 text-sm">{firstSession.courseName}</h4>
                  <span className="px-2 py-0.5 rounded bg-blue-600 text-white font-black text-xs shrink-0 shadow-2xs">
                    گروه {firstSession.groupId}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-xs text-slate-600 mb-3">
                  <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>استاد: {firstSession.instructor}</span>
                </div>

                {/* Sessions list */}
                <div className="space-y-2 text-xs">
                  {/* Session 1 */}
                  <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-700">جلسه اول:</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                          firstSession.recurrence === 'ثابت'
                            ? 'bg-blue-100 text-blue-800'
                            : firstSession.recurrence === 'فرد'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}
                      >
                        {firstSession.recurrence === 'ثابت'
                          ? 'هر هفته (ثابت)'
                          : `هفته ${firstSession.recurrence}`}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        {firstSession.day}
                      </span>
                      <span className="flex items-center gap-1 font-semibold">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {firstSession.startHour}:00 تا {firstSession.endHour}:00
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      کلاس: {firstSession.room}
                    </div>
                  </div>

                  {/* Session 2 */}
                  {secondSession && (
                    <div className="bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-slate-700">جلسه دوم:</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                            secondSession.recurrence === 'ثابت'
                              ? 'bg-blue-100 text-blue-800'
                              : secondSession.recurrence === 'فرد'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {secondSession.recurrence === 'ثابت'
                            ? 'هر هفته (ثابت)'
                            : `هفته ${secondSession.recurrence}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          {secondSession.day}
                        </span>
                        <span className="flex items-center gap-1 font-semibold">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {secondSession.startHour}:00 تا {secondSession.endHour}:00
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        کلاس: {secondSession.room}
                      </div>
                    </div>
                  )}

                  {/* TA Sessions for this course */}
                  {taSessions.map((ta) => (
                    <div
                      key={ta.id}
                      className="bg-emerald-50/90 p-2.5 rounded-lg border border-emerald-300 shadow-2xs"
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-black text-emerald-900 flex items-center gap-1">
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                          <span>کلاس حل تمرین:</span>
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full font-bold bg-emerald-600 text-white">
                          {ta.recurrence === 'ثابت' ? 'هر هفته (ثابت)' : `هفته ${ta.recurrence}`}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-900">
                        <span className="flex items-center gap-1 font-medium">
                          <Calendar className="w-3 h-3 text-emerald-600" />
                          {ta.day}
                        </span>
                        <span className="flex items-center gap-1 font-bold">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          {ta.startHour}:00 تا {ta.endHour}:00
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-emerald-800 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-emerald-600" />
                          کلاس: {ta.room}
                        </span>
                        {ta.instructor && ta.instructor !== 'تعیین‌نشده' && (
                          <span>مدرس: {ta.instructor}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

