import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  calculateAllCombinations,
  filterCombinations,
  mergeTASessionsWithCombinations,
} from './utils/scheduleCalculator';
import { DayOfWeek, ScheduleFilterState, TASession } from './types';
import { Header } from './components/Header';
import { Legend } from './components/Legend';
import { NavigationControls } from './components/NavigationControls';
import { Timetable } from './components/Timetable';
import { SelectedGroupsDetails } from './components/SelectedGroupsDetails';
import { ConflictAuditModal } from './components/ConflictAuditModal';
import { FilterPanel } from './components/FilterPanel';
import { CompareModal } from './components/CompareModal';
import { AddTAModal } from './components/AddTAModal';
import { RotateCcw, SearchX } from 'lucide-react';

const TA_STORAGE_KEY = 'uni_schedule_ta_sessions_v1';

export default function App() {
  // Pre-calculate all combinations (all 16 combinations, partitioned into valid and invalid)
  const { allCombinations, validCombinations: baseValidCombinations, invalidCombinations } = useMemo(() => {
    return calculateAllCombinations();
  }, []);

  // User-added TA (Problem Solving) sessions persisted in localStorage
  const [taSessions, setTaSessions] = useState<TASession[]>(() => {
    try {
      const saved = localStorage.getItem(TA_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(TA_STORAGE_KEY, JSON.stringify(taSessions));
    } catch {
      // ignore storage errors
    }
  }, [taSessions]);

  // Valid combinations with user TA sessions merged in
  const validCombinations = useMemo(() => {
    return mergeTASessionsWithCombinations(baseValidCombinations, taSessions);
  }, [baseValidCombinations, taSessions]);

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
  const [isAddTAModalOpen, setIsAddTAModalOpen] = useState<boolean>(false);
  const [quickAddSlot, setQuickAddSlot] = useState<{ day?: DayOfWeek; startHour?: number }>({});

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

  // TA Session handlers
  const handleAddTASession = useCallback((newTA: TASession) => {
    setTaSessions((prev) => {
      const existingIdx = prev.findIndex(
        (ta) =>
          ta.courseId === newTA.courseId &&
          ta.day === newTA.day &&
          ta.startHour === newTA.startHour
      );
      if (existingIdx !== -1) {
        const updated = [...prev];
        const mergedStates = Array.from(
          new Set([...updated[existingIdx].appliedStateIds, ...newTA.appliedStateIds])
        ).sort((a, b) => a - b);
        updated[existingIdx] = {
          ...newTA,
          id: updated[existingIdx].id,
          appliedStateIds: mergedStates,
        };
        return updated;
      }
      return [...prev, newTA];
    });
  }, []);

  const handleRemoveTASession = useCallback((id: string) => {
    setTaSessions((prev) => prev.filter((ta) => ta.id !== id));
  }, []);

  const handleOpenAddTAModal = useCallback((day?: DayOfWeek, startHour?: number) => {
    setQuickAddSlot({ day, startHour });
    setIsAddTAModalOpen(true);
  }, []);

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
      if (isAuditModalOpen || isCompareModalOpen || isAddTAModalOpen) {
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
  }, [handleNext, handlePrev, isAuditModalOpen, isCompareModalOpen, isAddTAModalOpen]);

  // Find 0-based index of current combination in the full validCombinations list (0..11)
  const currentValidIndex = currentCombination
    ? validCombinations.findIndex((c) => c.id === currentCombination.id)
    : 0;
  const activeValidStateNumber = currentValidIndex >= 0 ? currentValidIndex + 1 : 1;

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
            {/* State Controls (حالت 1 / N, Add TA, Download Image, Compare, Prev/Next) */}
            {currentCombination && (
              <NavigationControls
                currentIndex={currentIndex}
                totalCount={totalDisplayed}
                currentCombination={currentCombination}
                onNext={handleNext}
                onPrev={handlePrev}
                onSelectIndex={handleSelectIndex}
                onOpenCompare={() => setIsCompareModalOpen(true)}
                onOpenAddTA={() => handleOpenAddTAModal()}
                taSessionsCount={taSessions.length}
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
                        (حالت اصلی: {activeValidStateNumber} از ۱۲)
                      </span>
                    )}
                  </h2>
                  <span className="text-xs text-slate-500 font-medium">
                    (در نمایشگرهای کوچک می‌توانید جدول را افقی اسکرول کنید؛ ستون ساعت ثابت می‌ماند)
                  </span>
                </div>
                <Timetable
                  combination={currentCombination}
                  stateNumber={activeValidStateNumber}
                  onQuickAddTA={(day, startHour) => handleOpenAddTAModal(day, startHour)}
                  onRemoveTASession={handleRemoveTASession}
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

      {/* Add & Manage TA Classes Modal */}
      <AddTAModal
        isOpen={isAddTAModalOpen}
        onClose={() => setIsAddTAModalOpen(false)}
        validCombinations={validCombinations}
        activeValidStateNumber={activeValidStateNumber}
        taSessions={taSessions}
        onAddTASession={handleAddTASession}
        onRemoveTASession={handleRemoveTASession}
        initialDay={quickAddSlot.day}
        initialStartHour={quickAddSlot.startHour}
      />

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


