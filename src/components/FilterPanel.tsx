import React, { useState } from 'react';
import { DayOfWeek, ScheduleFilterState } from '../types';
import { ALL_DAYS } from '../utils/scheduleCalculator';
import { COURSES } from '../data/coursesData';
import {
  SlidersHorizontal,
  GraduationCap,
  Clock,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Check,
  BookOpen,
} from 'lucide-react';

interface FilterPanelProps {
  filterState: ScheduleFilterState;
  onFilterChange: (newFilter: ScheduleFilterState) => void;
  filteredCount: number;
  totalValidCount: number;
  onResetFilters: () => void;
}

const TIME_INTERVALS = [
  { startHour: 8, label: '08:00 تا 10:00' },
  { startHour: 10, label: '10:00 تا 12:00' },
  { startHour: 12, label: '12:00 تا 14:00' },
  { startHour: 14, label: '14:00 تا 16:00' },
  { startHour: 16, label: '16:00 تا 18:00' },
  { startHour: 18, label: '18:00 تا 20:00' },
];

export const FilterPanel: React.FC<FilterPanelProps> = ({
  filterState,
  onFilterChange,
  filteredCount,
  totalValidCount,
  onResetFilters,
}) => {
  const [isOpen, setIsOpen] = useState<boolean>(false);

  // Count active professor selections (where preference is not empty)
  const activeInstructorFiltersCount = Object.values(filterState.courseInstructors).filter(
    (inst) => Boolean(inst)
  ).length;

  const hasActiveFilters =
    activeInstructorFiltersCount > 0 || filterState.freeSlotsRequired.length > 0;

  // Set preferred instructor for a specific course
  const handleSelectCourseInstructor = (courseId: number, instructorName: string) => {
    onFilterChange({
      ...filterState,
      courseInstructors: {
        ...filterState.courseInstructors,
        [courseId]: instructorName, // empty string means "any professor"
      },
    });
  };

  // Toggle free slot required
  const handleToggleFreeSlot = (day: DayOfWeek, startHour: number) => {
    const exists = filterState.freeSlotsRequired.some(
      (slot) => slot.day === day && slot.startHour === startHour
    );

    const newSlots = exists
      ? filterState.freeSlotsRequired.filter(
          (slot) => !(slot.day === day && slot.startHour === startHour)
        )
      : [...filterState.freeSlotsRequired, { day, startHour }];

    onFilterChange({
      ...filterState,
      freeSlotsRequired: newSlots,
    });
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden transition-all">
      {/* Header bar / Toggle Button */}
      <div className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-slate-50/70 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 flex items-center justify-center shadow-2xs">
            <SlidersHorizontal className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm sm:text-base font-black text-slate-800">
                فیلترهای هوشمند انتخاب واحد
              </h3>
              {hasActiveFilters && (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-600 text-white shadow-xs">
                  <Sparkles className="w-3 h-3" />
                  <span>فیلتر فعال</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              انتخاب استاد مشخص برای هر درس به‌تفکیک و تعیین بازه‌های ۲ ساعته‌ای که باید خالی باشند
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
          {hasActiveFilters && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>پاک‌کردن فیلترها</span>
            </button>
          )}

          <div className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-bold">
            <span>نتیجه:</span>
            <span className={filteredCount === 0 ? 'text-rose-600' : 'text-blue-600'}>
              {filteredCount} حالت
            </span>
            <span className="text-slate-400 font-normal">از {totalValidCount}</span>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-200/80 hover:bg-slate-300 text-slate-700 text-xs font-bold transition-colors cursor-pointer"
          >
            <span>{isOpen ? 'بستن پنل' : 'تنظیم فیلترها'}</span>
            {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expandable Filter Content */}
      {isOpen && (
        <div className="p-5 space-y-6">
          {/* 1. Preferred Professor per Course */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-800">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                <span>۱. انتخاب استاد دلخواه برای هر درس:</span>
              </label>
              {activeInstructorFiltersCount > 0 && (
                <span className="text-xs text-indigo-600 font-bold bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  {activeInstructorFiltersCount} درس با استاد اختصاصی
                </span>
              )}
            </div>

            {/* Course rows */}
            <div className="space-y-3">
              {COURSES.map((course) => {
                const currentInstructor = filterState.courseInstructors[course.id] || '';
                // Extract unique instructors for this course
                const instructorOptions = Array.from(
                  new Set(course.groups.map((g) => g.instructor))
                );

                return (
                  <div
                    key={course.id}
                    className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 flex flex-col lg:flex-row lg:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 min-w-[200px]">
                      <div className="w-7 h-7 rounded-lg bg-blue-100/70 border border-blue-200 text-blue-800 flex items-center justify-center shrink-0">
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-800">
                          {course.name}
                        </h4>
                        <span className="text-[11px] text-slate-500">
                          {instructorOptions.length > 1
                            ? `${instructorOptions.length} استاد ارائه‌دهنده`
                            : 'تک استاد'}
                        </span>
                      </div>
                    </div>

                    {/* Instructor Pills for this Course */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      {/* "Any professor" option */}
                      <button
                        type="button"
                        onClick={() => handleSelectCourseInstructor(course.id, '')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                          currentInstructor === ''
                            ? 'bg-slate-800 text-white border-slate-900 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        همه اساتید
                      </button>

                      {/* Specific instructor options */}
                      {course.groups.map((group) => {
                        const isSelected = currentInstructor === group.instructor;
                        return (
                          <button
                            key={group.groupId}
                            type="button"
                            onClick={() =>
                              handleSelectCourseInstructor(
                                course.id,
                                isSelected ? '' : group.instructor
                              )
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                              isSelected
                                ? 'bg-indigo-600 text-white border-indigo-700 shadow-xs ring-2 ring-indigo-200'
                                : 'bg-white text-slate-700 border-slate-200 hover:bg-indigo-50 hover:border-indigo-300'
                            }`}
                          >
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            <span>{group.instructor}</span>
                            <span
                              className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                                isSelected
                                  ? 'bg-indigo-700 text-indigo-100'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              گروه {group.groupId}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Block Free 2-Hour Time Slots Filter */}
          <div className="pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-2 text-xs sm:text-sm font-black text-slate-800">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>۲. انتخاب روز و بازه ۲ ساعته که حتماً باید خالی باشد:</span>
              </label>
              {filterState.freeSlotsRequired.length > 0 && (
                <span className="text-xs text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  {filterState.freeSlotsRequired.length} بازه زمانی مسدود/خالی
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mb-3">
              روی هر ساعت و روزی که می‌خواهید هیچ کلاسی در آن نباشد کلیک کنید (مثلاً شنبه 08:00 تا 10:00):
            </p>

            {/* Matrix of Days and Time intervals */}
            <div className="overflow-x-auto scrollbar-custom border border-slate-200 rounded-xl bg-slate-50/50 p-2">
              <div className="min-w-[550px] grid grid-cols-6 gap-1.5 text-center text-xs">
                {/* Header row: Days */}
                <div className="font-bold text-slate-500 py-1">ساعت / روز</div>
                {ALL_DAYS.map((day) => (
                  <div
                    key={day}
                    className="font-extrabold text-slate-800 py-1 bg-white rounded-md border border-slate-200"
                  >
                    {day}
                  </div>
                ))}

                {/* Rows for intervals */}
                {TIME_INTERVALS.map((interval) => (
                  <React.Fragment key={interval.startHour}>
                    <div className="font-semibold text-slate-600 flex items-center justify-center py-1 text-[11px]">
                      {interval.label}
                    </div>
                    {ALL_DAYS.map((day) => {
                      const isFreeRequired = filterState.freeSlotsRequired.some(
                        (slot) => slot.day === day && slot.startHour === interval.startHour
                      );
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => handleToggleFreeSlot(day, interval.startHour)}
                          className={`py-2 px-1 rounded-lg text-xs font-bold transition-all border cursor-pointer flex items-center justify-center ${
                            isFreeRequired
                              ? 'bg-amber-600 text-white border-amber-700 shadow-xs'
                              : 'bg-white text-slate-600 border-slate-200 hover:bg-amber-50/70 hover:border-amber-300'
                          }`}
                          title={`کلیک کنید تا این بازه خالی بماند: ${day} ساعت ${interval.label}`}
                        >
                          {isFreeRequired ? 'باید خالی باشد' : 'آزاد'}
                        </button>
                      );
                    })}
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
