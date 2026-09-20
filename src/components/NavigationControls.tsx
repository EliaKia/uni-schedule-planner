import React from 'react';
import { ChevronRight, ChevronLeft, CalendarCheck, Columns2 } from 'lucide-react';
import { ScheduleCombination } from '../types';
import { DownloadImageButton } from './DownloadImageButton';

interface NavigationControlsProps {
  currentIndex: number; // 0-based
  totalCount: number;
  currentCombination: ScheduleCombination;
  onNext: () => void;
  onPrev: () => void;
  onSelectIndex: (index: number) => void;
  onOpenCompare: () => void;
  isFiltered?: boolean;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  currentIndex,
  totalCount,
  currentCombination,
  onNext,
  onPrev,
  onSelectIndex,
  onOpenCompare,
  isFiltered = false,
}) => {
  const currentDisplayNumber = currentIndex + 1;

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-4">
      {/* Top bar: State title, Action buttons, Prev/Next buttons */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-blue-50 text-blue-900 border border-blue-200 px-3.5 py-1.5 rounded-lg shadow-2xs">
            <CalendarCheck className="w-4 h-4 text-blue-600" />
            <span className="font-bold text-base sm:text-lg">
              حالت {currentDisplayNumber} از {totalCount}
            </span>
          </div>

          {isFiltered && (
            <span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-1 rounded-md">
              (مطابق فیلترهای انتخابی شما)
            </span>
          )}

          <span className="text-xs text-slate-500 hidden xl:inline">
            (جابه‌جایی با کلیدهای جهت‌نما <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-700 text-[10px]">←</kbd> و <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-300 rounded text-slate-700 text-[10px]">→</kbd>)
          </span>
        </div>

        {/* Action Buttons: Download PNG, Compare, Prev/Next */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto justify-start lg:justify-end">
          {/* Download Image Button */}
          <DownloadImageButton
            targetElementId="timetable-export-container"
            stateNumber={currentDisplayNumber}
          />

          {/* Compare Button */}
          <button
            type="button"
            onClick={onOpenCompare}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs sm:text-sm font-bold bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 shadow-xs transition-all cursor-pointer"
            title="مقایسه این حالت با سایر حالت‌های بدون تداخل"
          >
            <Columns2 className="w-4 h-4 text-blue-600" />
            <span>مقایسه حالت‌ها</span>
          </button>

          {/* Navigation Prev/Next */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={onPrev}
              disabled={currentIndex === 0}
              className={`flex items-center justify-center gap-1 px-3 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer border ${
                currentIndex === 0
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50 active:bg-slate-100'
              }`}
            >
              <span>← قبل</span>
            </button>

            <button
              type="button"
              onClick={onNext}
              disabled={currentIndex === totalCount - 1}
              className={`flex items-center justify-center gap-1 px-3.5 py-2 rounded-xl font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer border ${
                currentIndex === totalCount - 1
                  ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                  : 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 active:bg-blue-800'
              }`}
            >
              <span>بعد →</span>
            </button>
          </div>
        </div>
      </div>

      {/* Selected Groups Pills for Active State */}
      <div className="pt-2 border-t border-slate-100">
        <div className="flex items-center gap-2 text-xs font-bold text-slate-600 mb-2">
          <span>گروه‌های انتخاب‌شده در این حالت:</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {currentCombination.selectedGroups.map((group) => (
            <div
              key={group.courseId}
              className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-200 text-xs"
            >
              <div className="truncate pl-1">
                <span className="font-semibold text-slate-800 block truncate">{group.courseName}</span>
                <span className="text-slate-500 text-[11px] truncate block">{group.instructor}</span>
              </div>
              <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-800 font-bold shrink-0 text-xs border border-blue-200">
                گروه {group.groupId}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Quick State Selector Buttons */}
      <div className="pt-2 border-t border-slate-100 flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-custom">
        <span className="text-xs font-medium text-slate-400 shrink-0 ml-1">انتخاب مستقیم:</span>
        {Array.from({ length: totalCount }).map((_, idx) => {
          const isActive = idx === currentIndex;
          return (
            <button
              key={idx}
              onClick={() => onSelectIndex(idx)}
              className={`h-8 min-w-8 px-2 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center justify-center shrink-0 border ${
                isActive
                  ? 'bg-blue-600 text-white border-blue-700 shadow-xs ring-2 ring-blue-300 ring-offset-1'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
};
