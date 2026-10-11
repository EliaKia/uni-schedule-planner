import React, { useState } from 'react';
import { toPng } from 'html-to-image';
import { Download, Loader2, ImageDown, Check } from 'lucide-react';

interface DownloadImageButtonProps {
  targetElementId: string;
  stateNumber: number;
}

export const DownloadImageButton: React.FC<DownloadImageButtonProps> = ({
  targetElementId,
  stateNumber,
}) => {
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  const [downloadSuccess, setDownloadSuccess] = useState<boolean>(false);

  const handleDownload = async () => {
    const element = document.getElementById(targetElementId);
    if (!element) {
      alert('خطا در یافتن بخش جدول برای تولید عکس');
      return;
    }

    let offscreenWrapper: HTMLDivElement | null = null;

    try {
      setIsDownloading(true);
      setDownloadSuccess(false);

      // Create an off-screen desktop-width wrapper so mobile devices capture the full table
      // without horizontal scroll clipping or sticky column overlap.
      offscreenWrapper = document.createElement('div');
      offscreenWrapper.dir = 'rtl';
      offscreenWrapper.style.position = 'fixed';
      offscreenWrapper.style.top = '0';
      offscreenWrapper.style.left = '-9999px';
      offscreenWrapper.style.width = '1240px';
      offscreenWrapper.style.backgroundColor = '#ffffff';
      offscreenWrapper.style.zIndex = '-100';
      offscreenWrapper.style.pointerEvents = 'none';

      const clone = element.cloneNode(true) as HTMLElement;
      clone.style.width = '1240px';
      clone.style.maxWidth = 'none';
      clone.style.overflow = 'visible';
      clone.style.borderRadius = '0px';
      clone.style.padding = '16px';
      clone.style.backgroundColor = '#ffffff';

      // Remove horizontal overflow clipping on the scrollable table wrapper inside the clone
      const scrollableDivs = clone.querySelectorAll<HTMLElement>('.overflow-x-auto, .overflow-hidden');
      scrollableDivs.forEach((div) => {
        div.style.overflow = 'visible';
        div.style.maxWidth = 'none';
      });

      // Ensure sticky columns render cleanly in their normal table flow during full-width export
      const stickyEls = clone.querySelectorAll<HTMLElement>('.sticky');
      stickyEls.forEach((el) => {
        el.style.position = 'static';
      });

      // Ensure dual class cards inside slots always render side-by-side (2 columns) like desktop
      const dualGrids = clone.querySelectorAll<HTMLElement>('.grid-cols-1.sm\\:grid-cols-2');
      dualGrids.forEach((grid) => {
        grid.style.gridTemplateColumns = 'repeat(2, minmax(0, 1fr))';
      });

      offscreenWrapper.appendChild(clone);
      document.body.appendChild(offscreenWrapper);

      // Wait briefly for fonts and layout in the cloned node
      await new Promise((res) => setTimeout(res, 150));

      const exportWidth = clone.scrollWidth || 1240;
      const exportHeight = clone.scrollHeight;

      const dataUrl = await toPng(clone, {
        cacheBust: true,
        width: exportWidth,
        height: exportHeight,
        canvasWidth: exportWidth * 2,
        canvasHeight: exportHeight * 2,
        pixelRatio: 2, // High resolution for crisp text
        backgroundColor: '#ffffff',
      });

      const link = document.createElement('a');
      link.download = `برنامه_هفتگی_دانشگاه_حالت_${stateNumber}.png`;
      link.href = dataUrl;
      link.click();

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to generate image:', err);
      alert('متاسفانه در تولید تصویر خطایی رخ داد. لطفاً مجدداً امتحان کنید.');
    } finally {
      if (offscreenWrapper && offscreenWrapper.parentNode) {
        offscreenWrapper.parentNode.removeChild(offscreenWrapper);
      }
      setIsDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleDownload}
      disabled={isDownloading}
      className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-extrabold transition-all shadow-xs cursor-pointer border ${
        downloadSuccess
          ? 'bg-emerald-600 text-white border-emerald-700'
          : isDownloading
          ? 'bg-slate-100 text-slate-500 border-slate-300 cursor-wait'
          : 'bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white border-indigo-700 hover:shadow-sm'
      }`}
      title="دانلود تصویر باکیفیت جدول هفتگی برای ذخیره در گالری گوشی یا اشتراک‌گذاری"
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>در حال آماده‌سازی تصویر...</span>
        </>
      ) : downloadSuccess ? (
        <>
          <Check className="w-4 h-4 stroke-[3]" />
          <span>تصویر با موفقیت دانلود شد!</span>
        </>
      ) : (
        <>
          <ImageDown className="w-4 h-4" />
          <span>دانلود عکس برنامه (PNG)</span>
        </>
      )}
    </button>
  );
};
