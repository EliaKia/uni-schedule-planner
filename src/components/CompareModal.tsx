import React, { useState } from 'react';
import { ScheduleCombination } from '../types';
import { X, Check, Columns2, Sparkles, CalendarDays, User, ArrowRight } from 'lucide-react';

interface CompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  validCombinations: ScheduleCombination[];
  activeCombinationIndex: number; // 0-based
  onSelectState: (index: number) => void;
}

export const CompareModal: React.FC<CompareModalProps> = ({
  isOpen,
  onClose,
  validCombinations,
  activeCombinationIndex,
  onSelectState,
}) => {
  // We can compare 2 or 3 states. By default, pick activeCombination and another one (e.g. active and next, or 0 and 1)
  const defaultSelected = [
    activeCombinationIndex,
    activeCombinationIndex === 0 ? 1 : 0,
  ].filter((idx) => idx < validCombinations.length);

  const [selectedIndices, setSelectedIndices] = useState<number[]>(defaultSelected);

  if (!isOpen) return null;

  const handleToggleState = (idx: number) => {
    if (selectedIndices.includes(idx)) {
      if (selectedIndices.length > 2) {
        setSelectedIndices(selectedIndices.filter((i) => i !== idx));
      }
    } else {
      if (selectedIndices.length < 3) {
        setSelectedIndices([...selectedIndices, idx]);
      } else {
        // replace last
        setSelectedIndices([selectedIndices[0], selectedIndices[1], idx]);
      }
    }
  };

  const comparedCombinations = selectedIndices.map((idx) => ({
    index: idx,
    comb: validCombinations[idx],
  }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-5xl my-auto overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/40 flex items-center justify-center text-blue-300">
              <Columns2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black">
                  مقایسه تطبیقی حالت‌های برنامه هفتگی
                </h3>
                <span className="text-xs bg-blue-500/20 text-blue-300 border border-blue-400/30 px-2 py-0.5 rounded-full font-bold">
                  {selectedIndices.length} حالت در حال مقایسه
                </span>
              </div>
              <p className="text-xs text-slate-400">
                بررسی تفاوت اساتید، روزهای حضور، روزهای تعطیل و فشردگی جلسات در کنار یکدیگر
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* State Selector Chips */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-700 ml-2">
            انتخاب ۲ یا ۳ حالت برای مقایسه:
          </span>
          {validCombinations.map((c, idx) => {
            const isSelected = selectedIndices.includes(idx);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => handleToggleState(idx)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-blue-600 text-white border-blue-700 shadow-xs ring-2 ring-blue-200'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                <span>حالت {idx + 1}</span>
              </button>
            );
          })}
        </div>

        {/* Comparative Grid */}
        <div className="p-4 sm:p-6 overflow-x-auto">
          <div
            className="grid gap-4 min-w-[700px]"
            style={{
              gridTemplateColumns: `repeat(${comparedCombinations.length}, minmax(0, 1fr))`,
            }}
          >
            {comparedCombinations.map(({ index, comb }) => {
              const isCurrent = index === activeCombinationIndex;
              return (
                <div
                  key={comb.id}
                  className={`border rounded-2xl p-4 flex flex-col justify-between transition-all ${
                    isCurrent
                      ? 'border-blue-500 bg-blue-50/30 ring-2 ring-blue-100'
                      : 'border-slate-200 bg-white'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-200">
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-black text-slate-800">
                            حالت شماره {index + 1}
                          </h4>
                          {isCurrent && (
                            <span className="text-[10px] font-extrabold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                              در حال نمایش
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">
                          ترکیب کد #{comb.combinationIndex}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          onSelectState(index);
                          onClose();
                        }}
                        className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-1 cursor-pointer"
                      >
                        <span>مشاهده جدول</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Stats Highlights */}
                    <div className="space-y-2 mb-4">
                      {/* Attendance Days */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5 text-blue-600" />
                          <span>روزهای حضور ({comb.activeDays.length} روز):</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {comb.activeDays.map((day) => (
                            <span
                              key={day}
                              className="px-2 py-0.5 bg-blue-100/70 text-blue-800 rounded font-semibold text-[11px]"
                            >
                              {day}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Free Days */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                        <div className="font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                          <span>روزهای تعطیل / کاملاً آزاد:</span>
                        </div>
                        {comb.freeDays.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {comb.freeDays.map((day) => (
                              <span
                                key={day}
                                className="px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded font-bold text-[11px]"
                              >
                                {day} (تعطیل)
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px]">بدون روز تعطیل کامل</span>
                        )}
                      </div>

                      {/* 8 AM Class status */}
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
                        <span className="font-bold text-slate-700">کلاس ۸ صبح:</span>
                        {comb.hasMorningClass8am ? (
                          <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded font-bold text-[11px]">
                            دارد (شروع ۰۸:۰۰)
                          </span>
                        ) : (
                          <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold text-[11px]">
                            ندارد (آغاز از ۱۰:۰۰)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Courses & Instructors List */}
                    <div className="space-y-1.5 pt-2 border-t border-slate-200">
                      <div className="text-xs font-black text-slate-800 mb-1 flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-slate-500" />
                        <span>اساتید دروس در این حالت:</span>
                      </div>
                      {comb.selectedGroups.map((g) => (
                        <div
                          key={g.courseId}
                          className="p-2 rounded-lg bg-slate-50/80 border border-slate-200 text-[11px] flex items-center justify-between"
                        >
                          <div>
                            <div className="font-bold text-slate-800">{g.courseName}</div>
                            <div className="text-slate-500">گروه {g.groupId}</div>
                          </div>
                          <div className="font-extrabold text-indigo-700 text-left">
                            {g.instructor}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom selection button */}
                  <div className="mt-4 pt-3 border-t border-slate-200">
                    <button
                      onClick={() => {
                        onSelectState(index);
                        onClose();
                      }}
                      className="w-full py-2 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 text-xs font-bold transition-all cursor-pointer text-center"
                    >
                      انتخاب این برنامه برای صفحه اصلی
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">
            می‌توانید با کلیک روی هر دکمه، آن حالت را مستقیماً در جدول اصلی مشاهده و دانلود نمایید.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold text-xs rounded-xl transition-colors cursor-pointer"
          >
            بستن پنجره
          </button>
        </div>
      </div>
    </div>
  );
};
