'use client';

import React, { useState, useEffect } from 'react';
import { X, Copy, Check, ExternalLink, Share2, ShieldCheck, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  itineraryId: string;
  shareToken: string;
  tripTitle?: string;
  destination?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  itineraryId,
  shareToken,
  tripTitle = '我的自訂行程',
  destination = '旅遊目的地',
}) => {
  const [copied, setCopied] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (!isOpen) return;

    if (typeof window !== 'undefined') {
      const origin = window.location.origin;
      const pathname = window.location.pathname;
      const basePath = pathname.includes('/planTravel') ? '/planTravel' : '';
      setShareUrl(`${origin}${basePath}/share/${shareToken}/`);
    }

    const ensurePublic = async () => {
      try {
        setIsPublishing(true);
        await supabase
          .from('itineraries')
          .update({ is_public: true })
          .eq('id', itineraryId);
      } catch (err) {
        console.warn('公開狀態同步提示:', err);
      } finally {
        setIsPublishing(false);
      }
    };

    if (itineraryId) ensurePublic();
  }, [isOpen, itineraryId, shareToken]);

  if (!isOpen) return null;

  const handleCopyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
    }
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share && shareUrl) {
      try {
        await navigator.share({
          title: `Atrip 行程分享：${tripTitle}`,
          text: `來看看我用 Atrip 規劃的 ${destination} 自由行！`,
          url: shareUrl,
        });
      } catch {}
    } else {
      handleCopyLink();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
      <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-slate-100 flex flex-col gap-4 relative">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-brand-primary/15 flex items-center justify-center text-brand-primary shrink-0">
            <Share2 size={20} />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">分享專屬行程</h3>
            <p className="text-xs text-slate-500">邀請旅伴瀏覽或複製行程</p>
          </div>
        </div>

        <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3 flex items-start gap-2.5">
          <ShieldCheck size={18} className="text-emerald-600 shrink-0 mt-0.5" />
          <div className="text-[11px] leading-relaxed text-emerald-800">
            <span className="font-bold">去識別化安全保護：</span>
            已自動隱藏您的個資與預算，同行親友可查看每日景點動線並一鍵複製（Fork）。
          </div>
        </div>

        <div className="rounded-2xl bg-slate-50 p-3 border border-slate-200/70">
          <span className="text-[10px] font-bold text-brand-primary uppercase tracking-wider">
            📍 {destination}
          </span>
          <p className="text-xs font-bold text-slate-800 truncate mt-0.5">
            {tripTitle}
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="share-url-input" className="text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>專屬分享連結</span>
            {isPublishing && <span className="text-[10px] text-amber-600 font-normal animate-pulse">同步公開狀態中...</span>}
          </label>
          <div className="flex items-center gap-2">
            <input
              id="share-url-input"
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-100 border border-slate-200 text-slate-700 font-mono select-all"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shrink-0 ${
                copied ? 'bg-emerald-600 text-white' : 'bg-brand-primary text-slate-900'
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? '已複製' : '複製'}</span>
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 py-2 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <ExternalLink size={14} />
            <span>預覽分享頁</span>
          </a>
          <button
            type="button"
            onClick={handleNativeShare}
            className="flex-1 py-2 px-3 rounded-xl bg-brand-primary/15 hover:bg-brand-primary/25 text-brand-primary text-xs font-bold flex items-center justify-center gap-1.5"
          >
            <Sparkles size={14} />
            <span>快速分享</span>
          </button>
        </div>
      </div>
    </div>
  );
};
