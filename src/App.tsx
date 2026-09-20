import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { calculateAllCombinations, filterCombinations } from './utils/scheduleCalculator';
import { ScheduleFilterState } from './types';
import { Header } from './components/Header';
import { Legend } from './components/Legend';
import { NavigationControls } from './components/NavigationControls';
import { Timetable } from './components/Timetable';
import { SelectedGroupsDetails } from './components/SelectedGroupsDetails';
import { ConflictAuditModal } from './components/ConflictAuditModal';
import { FilterPanel } from './components/FilterPanel';
import { CompareModal } from './components/CompareModal';
import { RotateCcw, SearchX } from 'lucide-react';

export default function App() {
  // Pre-calculate all combinations (all 16 combinations, partitioned into valid and invalid)
  const { allCombinations, validCombinations, invalidCombinations } = useMemo(() => {
    return calculateAllCombinations();
  }, []);

  // Filter state (course instructors preferences + free slots)
  const [filterState, setFilterState] = useState<ScheduleFilterState>({
    courseInstructors: {},
    freeSlotsRequired: [],
  });

  // Filtered valid combinations
  const displayedCombinations = useMemo(() => {
    return filterCombinations(validCombinations, filterState);
  }, [validCombinations, filterState]);

  // Active state index within displayedCombinations (0-based)
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isAuditModalOpen, setIsAuditModalOpen] = useState<boolean>(false);
  const [isCompareModalOpen, setIsCompareModalOpen] = useState<boolean>(false);

  // Keep currentIndex in bounds when filters change
  useEffect(() => {
    if (currentIndex >= displayedCombinations.length) {
      setCurrentIndex(0);
    }
  }, [displayedCombinations.length, currentIndex]);

  const totalDisplayed = displayedCombinations.length;
  const currentCombination = displayedCombinations[currentIndex] || displayedCombinations[0];

  const hasActiveFilters =
    Object.values(filterState.courseInstructors).some((inst) => Boolean(inst)) ||
    filterState.freeSlotsRequired.length > 0;

  const handleResetFilters = () => {
    setFilterState({
      courseInstructors: {},
      freeSlotsRequired: [],
    });
    setCurrentIndex(0);
  };

  // Navigation handlers
  const handleNext = useCallback(() => {
    setCurrentIndex((prev) => (prev < totalDisplayed - 1 ? prev + 1 : prev));
  }, [totalDisplayed]);

  const handlePrev = useCallback(() => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
  }, []);

  const handleSelectIndex = useCallback((index: number) => {
    if (index >= 0 && index < totalDisplayed) {
      setCurrentIndex(index);
    }
  }, [totalDisplayed]);

  // Handler when a state is selected from CompareModal
  const handleSelectFromCompare = useCallback(
    (validIndex: number) => {
      const targetComb = validCombinations[validIndex];
      if (!targetComb) return;

      // Check if it exists in displayedCombinations
      const inDisplayedIdx = displayedCombinations.findIndex((c) => c.id === targetComb.id);
      if (inDisplayedIdx !== -1) {
        setCurrentIndex(inDisplayedIdx);
      } else {
        // Reset filters so the selected state is visible
        handleResetFilters();
        const rawIdx = validCombinations.findIndex((c) => c.id === targetComb.id);
        if (rawIdx !== -1) {
          setCurrentIndex(rawIdx);
        }
      }
    },
    [validCombinations, displayedCombinations]
  );

  // Keyboard navigation support: ArrowRight and ArrowLeft
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (isAuditModalOpen || isCompareModalOpen) {
        return;
      }

      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, isAuditModalOpen, isCompareModalOpen]);

  // Find 0-based index of current combination in the full validCombinations list for comparison reference
  const currentValidIndex = currentCombination
    ? validCombinations.findIndex((c) => c.id === currentCombination.id)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-slate-900 pb-16">
      {/* Header */}
      <Header
        totalCombinations={allCombinations.length}
        validCombinationsCount={validCombinations.length}
        invalidCombinationsCount={invalidCombinations.length}
        onOpenAudit={() => setIsAuditModalOpen(true)}
      />

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 space-y-5 flex-1">
        {/* Color Legend */}
        <Legend />

        {/* Smart Filters Panel */}
        <FilterPanel
          filterState={filterState}
          onFilterChange={setFilterState}
          filteredCount={displayedCombinations.length}
          totalValidCount={validCombinations.length}
          onResetFilters={handleResetFilters}
        />

        {/* When no combinations match the applied filters */}
        {totalDisplayed === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-8 text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <SearchX className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-800 mb-1">
                هیچ حالتی مطابق فیلترهای انتخابی شما یافت نشد!
              </h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                ترکیب اساتید یا بازه‌های زمانی خالی انتخاب‌شده با حالت‌های بدون تداخل همخوانی ندارد.
                می‌توانید با پاک کردن فیلترها دوباره تمام ۱۲ حالت معتبر را مشاهده کنید.
              </p>
            </div>
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>پاک‌کردن فیلترها و نمایش همه حالت‌ها</span>
            </button>
          </div>
        ) : (
          <>
            {/* State Controls (حالت 1 / N, Download Image, Compare, Prev/Next) */}
            {currentCombination && (
              <NavigationControls
                currentIndex={currentIndex}
                totalCount={totalDisplayed}
                currentCombination={currentCombination}
                onNext={handleNext}
                onPrev={handlePrev}
                onSelectIndex={handleSelectIndex}
                onOpenCompare={() => setIsCompareModalOpen(true)}
                isFiltered={hasActiveFilters}
              />
            )}

            {/* Timetable Table (Weekly Schedule with Export container) */}
            {currentCombination && (
              <div className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <h2 className="text-base font-extrabold text-slate-800">
                    جدول هفتگی — برنامه شماره {currentIndex + 1}
                    {hasActiveFilters && (
                      <span className="text-xs font-normal text-slate-500 mr-2">
                        (کد اصلی ترکیب: #{currentCombination.combinationIndex})
                      </span>
                    )}
                  </h2>
                  <span className="text-xs text-slate-500 font-medium">
                    (در نمایشگرهای کوچک می‌توانید جدول را افقی اسکرول کنید؛ ستون ساعت ثابت می‌ماند)
                  </span>
                </div>
                <Timetable
                  combination={currentCombination}
                  stateNumber={currentCombination.combinationIndex}
                />
              </div>
            )}

            {/* Details for current selected course groups */}
            {currentCombination && (
              <SelectedGroupsDetails combination={currentCombination} />
            )}
          </>
        )}
      </main>

      {/* Side-by-Side Comparison Modal */}
      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        validCombinations={validCombinations}
        activeCombinationIndex={currentValidIndex}
        onSelectState={handleSelectFromCompare}
      />

      {/* Conflict Audit Modal for transparency on all 16 states */}
      <ConflictAuditModal
        isOpen={isAuditModalOpen}
        onClose={() => setIsAuditModalOpen(false)}
        allCombinations={allCombinations}
        validCombinations={validCombinations}
        invalidCombinations={invalidCombinations}
      />
    </div>
  );
}

