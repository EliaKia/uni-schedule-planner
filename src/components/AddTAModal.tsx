import React, { useState, useEffect, useMemo } from 'react';
import {
  DayOfWeek,
  ScheduleCombination,
  SessionRecurrence,
  TASession,
} from '../types';
import { COURSES } from '../data/coursesData';
import { ALL_DAYS, checkTAConflictWithCombination } from '../utils/scheduleCalculator';
import {
  X,
  BookOpen,
  Clock,
  Calendar,
  User,
  MapPin,
  Layers,
  Check,
  PlusCircle,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface AddTAModalProps {
  isOpen: boolean;
  onClose: () => void;
  validCombinations: ScheduleCombination[]; // The 12 valid combinations (with current TA sessions merged)
  activeValidStateNumber: number; // 1 to 12
  taSessions: TASession[];
  onAddTASession: (newTA: TASession) => void;
  onRemoveTASession: (id: string) => void;
  initialDay?: DayOfWeek;
  initialStartHour?: number;
}

const TIME_SLOTS = [
  { startHour: 8, endHour: 10, label: '08:00 تا 10:00' },
  { startHour: 10, endHour: 12, label: '10:00 تا 12:00' },
  { startHour: 12, endHour: 14, label: '12:00 تا 14:00' },
  { startHour: 14, endHour: 16, label: '14:00 تا 16:00' },
  { startHour: 16, endHour: 18, label: '16:00 تا 18:00' },
  { startHour: 18, endHour: 20, label: '18:00 تا 20:00' },
];

const RECURRENCE_OPTIONS: { value: SessionRecurrence; label: string; desc: string }[] = [
  { value: 'ثابت', label: 'هر هفته (ثابت)', desc: 'برگزاری منظم در تمام هفته‌ها' },
  { value: 'فرد', label: 'هفته فرد', desc: 'برگزاری یک‌هفته‌درمیان (فرد)' },
  { value: 'زوج', label: 'هفته زوج', desc: 'برگزاری یک‌هفته‌درمیان (زوج)' },
];

export const AddTAModal: React.FC<AddTAModalProps> = ({
  isOpen,
  onClose,
  validCombinations,
  activeValidStateNumber,
  taSessions,
  onAddTASession,
  onRemoveTASession,
  initialDay,
  initialStartHour,
}) => {
  const [selectedCourseId, setSelectedCourseId] = useState<number>(COURSES[0].id);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('شنبه');
  const [selectedStartHour, setSelectedStartHour] = useState<number>(12);
  const [recurrence, setRecurrence] = useState<SessionRecurrence>('ثابت');
  const [instructor, setInstructor] = useState<string>('');
  const [room, setRoom] = useState<string>('');
  const [selectedStateIds, setSelectedStateIds] = useState<number[]>([activeValidStateNumber]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Sync initial values when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialDay) setSelectedDay(initialDay);
      if (initialStartHour) setSelectedStartHour(initialStartHour);
      setSelectedStateIds([activeValidStateNumber || 1]);
      setErrorMessage(null);
      setSuccessBanner(null);
    }
  }, [isOpen, initialDay, initialStartHour, activeValidStateNumber]);

  // Reset success banner when user changes day/time/course to add another TA
  const handleSelectCourse = (courseId: number) => {
    setSelectedCourseId(courseId);
    setSuccessBanner(null);
    setErrorMessage(null);
  };

  const handleSelectDay = (day: DayOfWeek) => {
    setSelectedDay(day);
    setSuccessBanner(null);
    setErrorMessage(null);
    if (selectedStateIds.length === 0) {
      setSelectedStateIds([activeValidStateNumber || 1]);
    }
  };

  const handleSelectTime = (startHour: number) => {
    setSelectedStartHour(startHour);
    setSuccessBanner(null);
    setErrorMessage(null);
    if (selectedStateIds.length === 0) {
      setSelectedStateIds([activeValidStateNumber || 1]);
    }
  };

  // Evaluate conflict status for all 12 states for the chosen day/time/recurrence
  const statesConflictMap = useMemo(() => {
    const map = new Map<
      number,
      { hasConflict: boolean; conflictingCourses: string[]; alreadyHasSameCourseTA: boolean }
    >();
    const selectedCourse = COURSES.find((c) => c.id === selectedCourseId);

    validCombinations.forEach((comb, idx) => {
      const stateNum = idx + 1;
      // Exclude TA sessions of the SAME course at the exact same slot from being treated as an unknown conflict
      const alreadyHasSameCourseTA = comb.sessions.some(
        (s) =>
          s.isTA &&
          s.courseName === selectedCourse?.name &&
          s.day === selectedDay &&
          s.startHour === selectedStartHour
      );

      const filteredComb: ScheduleCombination = {
        ...comb,
        sessions: comb.sessions.filter(
          (s) =>
            !(
              s.isTA &&
              s.courseName === selectedCourse?.name &&
              s.day === selectedDay &&
              s.startHour === selectedStartHour
            )
        ),
      };

      const result = checkTAConflictWithCombination(
        filteredComb,
        selectedDay,
        selectedStartHour,
        selectedStartHour + 2,
        recurrence
      );
      map.set(stateNum, { ...result, alreadyHasSameCourseTA });
    });
    return map;
  }, [validCombinations, selectedCourseId, selectedDay, selectedStartHour, recurrence]);

  const conflictFreeStateIds = useMemo(() => {
    const freeIds: number[] = [];
    statesConflictMap.forEach((val, stateNum) => {
      if (!val.hasConflict) {
        freeIds.push(stateNum);
      }
    });
    return freeIds;
  }, [statesConflictMap]);

  if (!isOpen) return null;

  const toggleStateSelection = (stateNum: number) => {
    setErrorMessage(null);
    setSelectedStateIds((prev) =>
      prev.includes(stateNum) ? prev.filter((id) => id !== stateNum) : [...prev, stateNum].sort((a, b) => a - b)
    );
  };

  const handleSelectConflictFreeStates = () => {
    setErrorMessage(null);
    setSelectedStateIds(conflictFreeStateIds);
  };

  const handleSelectAllStates = () => {
    setErrorMessage(null);
    setSelectedStateIds(validCombinations.map((_, idx) => idx + 1));
  };

  const handleSelectCurrentStateOnly = () => {
    setErrorMessage(null);
    setSelectedStateIds([activeValidStateNumber]);
  };

  const handleClearStates = () => {
    setErrorMessage(null);
    setSelectedStateIds([]);
  };

  // Check if any currently selected state has a conflict
  const selectedStatesWithConflict = selectedStateIds.filter(
    (id) => statesConflictMap.get(id)?.hasConflict
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessBanner(null);

    if (!selectedCourseId) {
      setErrorMessage('لطفاً درس مربوط به کلاس حل تمرین را انتخاب کنید.');
      return;
    }

    if (selectedStateIds.length === 0) {
      setErrorMessage('لطفاً حداقل یکی از حالات ۱۲گانه را برای اعمال این کلاس حل تمرین انتخاب کنید.');
      return;
    }

    const course = COURSES.find((c) => c.id === selectedCourseId);
    if (!course) return;

    const newTASession: TASession = {
      id: `ta-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      courseId: course.id,
      courseName: course.name,
      day: selectedDay,
      startHour: selectedStartHour,
      endHour: selectedStartHour + 2,
      recurrence,
      instructor: instructor.trim() || undefined,
      room: room.trim() || undefined,
      appliedStateIds: [...selectedStateIds].sort((a, b) => a - b),
    };

    onAddTASession(newTASession);
    setInstructor('');
    setRoom('');
    setSelectedStateIds([]);
    setSuccessBanner(
      `کلاس حل تمرین «${course.name}» (${selectedDay} ساعت ${selectedStartHour}:00 تا ${
        selectedStartHour + 2
      }:00) با موفقیت به ${selectedStateIds.length} حالت اضافه شد.`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300 shrink-0">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black">
                افزودن و مدیریت کلاس‌های حل تمرین (TA)
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                کلاس حل تمرین هر درس را با زمان دلخواه به حالت‌های انتخابی خود اضافه کنید
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            aria-label="بستن"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50/50">
          {/* Required Fields Note */}
          <div className="flex items-center justify-between bg-white px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-600">
            <span>
              موارد ستاره‌دار (<span className="text-rose-600 font-black text-sm">*</span>) اجباری هستند و سایر فیلدها اختیاری می‌باشند.
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              <Sparkles className="w-3.5 h-3.5" />
              بررسی هوشمند تداخل فعال است
            </span>
          </div>

          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successBanner && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successBanner}</span>
              </div>
              <button
                type="button"
                onClick={() => setSuccessBanner(null)}
                className="text-emerald-700 hover:text-emerald-950 text-xs underline cursor-pointer shrink-0"
              >
                بستن پیام
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Step 1: Course Selection (Required) */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <label className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-slate-800">
                <BookOpen className="w-4 h-4 text-emerald-600" />
                <span>۱. این کلاس حل تمرین مربوط به کدام درس است؟</span>
                <span className="text-rose-600 font-black text-base leading-none" title="اجباری">*</span>
              </label>
              <p className="text-[11px] text-slate-500">
                فارغ از کد گروه یا استاد درس اصلی، فقط عنوان درس را انتخاب کنید:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {COURSES.map((course) => {
                  const isSelected = selectedCourseId === course.id;
                  return (
                    <button
                      key={course.id}
                      type="button"
                      onClick={() => handleSelectCourse(course.id)}
                      className={`p-3 rounded-xl border text-right transition-all cursor-pointer flex items-center justify-between gap-2 ${
                        isSelected
                          ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-200'
                          : 'bg-slate-50/80 text-slate-800 border-slate-200 hover:bg-emerald-50/50 hover:border-emerald-300'
                      }`}
                    >
                      <span className="text-xs font-extrabold leading-snug">{course.name}</span>
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 border ${
                          isSelected
                            ? 'bg-white text-emerald-700 border-white'
                            : 'border-slate-300 bg-white'
                        }`}
                      >
                        {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Day, Time Slot, and Recurrence (Required) */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-4">
              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-slate-800">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>۲. زمان برگزاری کلاس حل تمرین</span>
                <span className="text-rose-600 font-black text-base leading-none" title="اجباری">*</span>
              </div>

              {/* Day of week */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  روز هفته <span className="text-rose-600 font-black">*</span>
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {ALL_DAYS.map((day) => {
                    const isSelected = selectedDay === day;
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleSelectDay(day)}
                        className={`py-2 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        <Calendar className="w-3.5 h-3.5 opacity-75" />
                        <span>{day}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2-hour Time Slot */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-700">
                  ساعت ارائه (بازه ۲ ساعته) <span className="text-rose-600 font-black">*</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const isSelected = selectedStartHour === slot.startHour;
                    return (
                      <button
                        key={slot.startHour}
                        type="button"
                        onClick={() => handleSelectTime(slot.startHour)}
                        className={`py-2.5 px-3 rounded-lg text-xs font-bold border transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                          isSelected
                            ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs ring-2 ring-emerald-200'
                            : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-emerald-50/50 hover:border-emerald-300'
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 opacity-80" />
                        <span>ساعت {slot.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Recurrence (ثابت / فرد / زوج) */}
              <div className="space-y-2 pt-1">
                <label className="block text-xs font-bold text-slate-700">
                  نحوه تکرار هفتگی <span className="text-rose-600 font-black">*</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {RECURRENCE_OPTIONS.map((opt) => {
                    const isSelected = recurrence === opt.value;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setRecurrence(opt.value)}
                        className={`p-2.5 rounded-lg border text-right transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-blue-500 text-blue-950 ring-1 ring-blue-400'
                            : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        <div className="text-xs font-extrabold flex items-center justify-between">
                          <span>{opt.label}</span>
                          {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 stroke-[3]" />}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-0.5">{opt.desc}</div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Step 3: Optional Details (Instructor & Room) */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs sm:text-sm font-black text-slate-800">
                  ۳. مشخصات تکمیلی (استاد حل تمرین و شماره کلاس)
                </span>
                <span className="text-[11px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                  اختیاری
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>نام استاد یا مدرس حل تمرین (اختیاری):</span>
                  </label>
                  <input
                    type="text"
                    value={instructor}
                    onChange={(e) => setInstructor(e.target.value)}
                    placeholder="مثلاً: مهندس رضایی / تدریس‌یار"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none text-xs text-slate-800 placeholder:text-slate-400 transition-colors"
                  />
                </div>

                <div>
                  <label className="flex items-center gap-1 text-xs font-bold text-slate-700 mb-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>شماره کلاس (اختیاری):</span>
                  </label>
                  <input
                    type="text"
                    value={room}
                    onChange={(e) => setRoom(e.target.value)}
                    placeholder="مثلاً: C36 یا 35-C"
                    dir="ltr"
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-slate-50 focus:bg-white focus:border-emerald-500 focus:outline-none text-xs text-slate-800 placeholder:text-slate-400 text-right transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Which of the 12 States to Apply To (Required) */}
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-slate-800">
                  <Layers className="w-4 h-4 text-emerald-600" />
                  <span>۴. اعمال روی کدام یک از حالات ۱۲گانه؟</span>
                  <span className="text-rose-600 font-black text-base leading-none" title="اجباری">*</span>
                </label>

                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full self-start sm:self-auto">
                  {selectedStateIds.length} حالت انتخاب شده
                </span>
              </div>

              <p className="text-[11px] text-slate-500">
                سیستم به‌طور خودکار بررسی کرده که در روز <strong>{selectedDay}</strong> ساعت{' '}
                <strong>
                  {selectedStartHour}:00 تا {selectedStartHour + 2}:00
                </strong>{' '}
                کدام یک از ۱۲ حالت زمان خالی دارند:
              </p>

              {/* Quick selection toolbar */}
              <div className="flex flex-wrap items-center gap-1.5 pb-1">
                <button
                  type="button"
                  onClick={handleSelectConflictFreeStates}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  انتخاب همه حالت‌های آزاد در این ساعت ({conflictFreeStateIds.length} حالت)
                </button>
                <button
                  type="button"
                  onClick={handleSelectCurrentStateOnly}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  فقط حالت فعلی (حالت {activeValidStateNumber})
                </button>
                <button
                  type="button"
                  onClick={handleSelectAllStates}
                  className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  انتخاب همه ۱۲ حالت
                </button>
                <button
                  type="button"
                  onClick={handleClearStates}
                  className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-rose-50 text-rose-600 border border-rose-200 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  پاک‌کردن انتخاب
                </button>
              </div>

              {/* Grid of 12 States */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {validCombinations.map((comb, idx) => {
                  const stateNum = idx + 1;
                  const isSelected = selectedStateIds.includes(stateNum);
                  const conflictInfo = statesConflictMap.get(stateNum);
                  const hasConflict = conflictInfo?.hasConflict ?? false;

                  return (
                    <button
                      key={comb.id}
                      type="button"
                      onClick={() => toggleStateSelection(stateNum)}
                      className={`p-2.5 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                        isSelected
                          ? hasConflict
                            ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-200 text-amber-950'
                            : 'bg-emerald-600 border-emerald-700 text-white shadow-xs ring-2 ring-emerald-200'
                          : hasConflict
                          ? 'bg-rose-50/40 border-rose-200 text-slate-600 hover:bg-rose-50'
                          : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-emerald-50/40 hover:border-emerald-300'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-xs font-black">
                          حالت {stateNum}
                          {stateNum === activeValidStateNumber && (
                            <span
                              className={`mr-1 text-[10px] px-1 rounded ${
                                isSelected && !hasConflict
                                  ? 'bg-emerald-800 text-emerald-100'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              فعلی
                            </span>
                          )}
                        </span>

                        <div
                          className={`w-4 h-4 rounded flex items-center justify-center border ${
                            isSelected
                              ? hasConflict
                                ? 'bg-amber-600 border-amber-600 text-white'
                                : 'bg-white border-white text-emerald-700'
                              : 'border-slate-300 bg-white'
                          }`}
                        >
                          {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                      </div>

                      <div className="text-[10px] leading-tight mt-0.5">
                        {conflictInfo?.alreadyHasSameCourseTA ? (
                          <span
                            className={`font-semibold block truncate ${
                              isSelected ? 'text-emerald-100' : 'text-emerald-700'
                            }`}
                          >
                            ✓ حل تمرین این درس ثبت شد
                          </span>
                        ) : hasConflict ? (
                          <span
                            className={`font-semibold block truncate ${
                              isSelected ? 'text-amber-800' : 'text-rose-600'
                            }`}
                            title={`تداخل با: ${conflictInfo?.conflictingCourses.join('، ')}`}
                          >
                            ⚠️ تداخل: {conflictInfo?.conflictingCourses[0]}
                          </span>
                        ) : (
                          <span
                            className={`font-medium ${
                              isSelected ? 'text-emerald-100' : 'text-emerald-700'
                            }`}
                          >
                            ✓ ساعت خالی (بدون تداخل)
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Warning if user selected states that have conflict */}
              {selectedStatesWithConflict.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      توجه: در حالت‌های{' '}
                      <strong>{selectedStatesWithConflict.join('، ')}</strong> در این ساعت کلاس دیگری وجود دارد و همزمان نمایش داده خواهد شد.
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setSelectedStateIds((prev) =>
                        prev.filter((id) => !selectedStatesWithConflict.includes(id))
                      )
                    }
                    className="px-2.5 py-1 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-bold text-[11px] shrink-0 cursor-pointer self-end sm:self-auto"
                  >
                    حذف حالت‌های دارای تداخل
                  </button>
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-700 text-xs sm:text-sm font-bold transition-colors cursor-pointer"
              >
                بستن پنجره
              </button>
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-black shadow-sm transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>افزودن کلاس حل تمرین به برنامه</span>
              </button>
            </div>
          </form>

          {/* List of Already Added TA Sessions */}
          {taSessions.length > 0 && (
            <div className="pt-4 border-t border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs sm:text-sm font-black text-slate-800">
                  کلاس‌های حل تمرین اضافه‌شده توسط شما ({taSessions.length} مورد):
                </h3>
              </div>

              <div className="space-y-2">
                {taSessions.map((ta) => (
                  <div
                    key={ta.id}
                    className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-600 text-white font-bold text-[11px]">
                          حل تمرین
                        </span>
                        <span className="font-black text-slate-900 text-sm">{ta.courseName}</span>
                        <span className="text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">
                          {ta.day} ساعت {ta.startHour}:00 تا {ta.endHour}:00 ({ta.recurrence === 'ثابت' ? 'هر هفته' : `هفته ${ta.recurrence}`})
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-slate-600 text-[11px]">
                        <span>
                          مدرس: <strong>{ta.instructor || 'تعیین‌نشده'}</strong>
                        </span>
                        <span>
                          کلاس: <strong>{ta.room || 'تعیین‌نشده'}</strong>
                        </span>
                        <span>
                          اعمال‌شده روی:{' '}
                          <strong className="text-emerald-800">
                            {ta.appliedStateIds.length === 12
                              ? 'همه ۱۲ حالت'
                              : `حالت‌های ${ta.appliedStateIds.join('، ')}`}
                          </strong>
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => onRemoveTASession(ta.id)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 border border-rose-200 font-bold text-xs transition-colors cursor-pointer self-end sm:self-center shrink-0"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>حذف</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
