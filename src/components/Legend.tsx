import React from 'react';
import { Info } from 'lucide-react';

export const Legend: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-3.5 sm:p-4 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs sm:text-sm">
        <div className="flex items-center gap-2 text-slate-700 font-bold">
          <span className="w-2 h-2 rounded-full bg-slate-400"></span>
          <span>راهنمای رنگ‌بندی جلسات:</span>
        </div>

        <div className="flex items-center flex-wrap gap-2 sm:gap-4">
          {/* Blue: Fixed / Every week */}
          <div className="flex items-center gap-2 bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-lg text-blue-900 font-medium">
            <span className="w-3 h-3 rounded-md bg-blue-600 shadow-xs"></span>
            <span>جلسه ثابت / هر هفته (آبی)</span>
          </div>

          {/* Orange: Odd week */}
          <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-amber-900 font-medium">
            <span className="w-3 h-3 rounded-md bg-amber-600 shadow-xs"></span>
            <span>جلسه هفته‌درمیان / هفته فرد (نارنجی)</span>
          </div>

          {/* Purple: Even week */}
          <div className="flex items-center gap-2 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-lg text-purple-900 font-medium">
            <span className="w-3 h-3 rounded-md bg-purple-600 shadow-xs"></span>
            <span>جلسه هفته‌درمیان / هفته زوج (بنفش)</span>
          </div>

          {/* Emerald: TA / Problem Solving */}
          <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg text-emerald-900 font-medium">
            <span className="w-3 h-3 rounded-md bg-emerald-600 shadow-xs"></span>
            <span>کلاس حل تمرین (سبز زمردی)</span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-200">
          <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span>کلاس‌های همزمان فرد و زوج در هفته‌های متناوب برگزار شده و تداخل ندارند.</span>
        </div>
      </div>
    </div>
  );
};
