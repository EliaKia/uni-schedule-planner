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

    try {
      setIsDownloading(true);
      setDownloadSuccess(false);

      // Brief delay to ensure any layout renders
      await new Promise((res) => setTimeout(res, 100));

      const dataUrl = await toPng(element, {
        cacheBust: true,
        pixelRatio: 2, // High resolution for crisp text
        backgroundColor: '#ffffff',
        style: {
          borderRadius: '0px',
        },
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
