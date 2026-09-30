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
      setShareUrl(`${origin}${basePath}/share?token=${shareToken}`);
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
    <div className="atrip-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <div className="atrip-modal-panel" role="dialog" aria-modal="true" aria-labelledby="share-modal-title">
        <button
          type="button"
          onClick={onClose}
          className="atrip-icon-button absolute right-atrip-4 top-atrip-4 bg-atrip-surface-subtle text-atrip-text-secondary"
          aria-label="關閉分享視窗"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-3">
          <div className="atrip-icon-wiggle flex h-11 w-11 shrink-0 items-center justify-center rounded-atrip-lg bg-atrip-selection-background text-atrip-selection-foreground">
            <Share2 size={20} />
          </div>
          <div>
            <h3 id="share-modal-title" className="text-atrip-title font-bold text-atrip-text-primary">分享專屬行程</h3>
            <p className="text-atrip-caption text-atrip-text-secondary">邀請旅伴查看每日安排與移動路線</p>
          </div>
        </div>

        <div className="flex items-start gap-atrip-2 rounded-atrip-lg bg-atrip-selection-background p-atrip-3">
          <ShieldCheck size={18} className="mt-0.5 shrink-0 text-atrip-selection-foreground" />
          <div className="text-atrip-caption leading-relaxed text-atrip-selection-foreground">
            <span className="font-bold">去識別化安全保護：</span>
            已自動隱藏您的個資與預算，同行親友只能瀏覽景點、時間與移動動線。
          </div>
        </div>

        <div className="rounded-atrip-lg border border-atrip-border-subtle bg-atrip-surface-subtle p-atrip-3">
          <span className="text-atrip-micro font-bold uppercase tracking-wider text-atrip-brand-logo-ai">
            📍 {destination}
          </span>
          <p className="mt-0.5 truncate text-atrip-caption font-bold text-atrip-text-primary">
            {tripTitle}
          </p>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="share-url-input" className="flex items-center justify-between text-atrip-caption font-bold text-atrip-text-primary">
            <span>專屬分享連結</span>
            {isPublishing && <span className="animate-pulse text-atrip-micro font-normal text-atrip-text-secondary motion-reduce:animate-none">同步公開狀態中...</span>}
          </label>
          <div className="flex items-center gap-2">
            <input
              id="share-url-input"
              type="text"
              readOnly
              value={shareUrl}
              className="atrip-focus min-h-atrip-input min-w-0 flex-1 select-all rounded-atrip-md border border-atrip-border-default bg-atrip-surface-subtle px-atrip-3 text-atrip-caption text-atrip-text-primary"
            />
            <button
              type="button"
              onClick={handleCopyLink}
              className={`atrip-focus flex min-h-atrip-input shrink-0 items-center gap-atrip-1 rounded-atrip-md px-atrip-3 text-atrip-caption font-bold ${
                copied ? 'bg-atrip-selection-background text-atrip-selection-foreground' : 'bg-atrip-action-primary text-atrip-action-on-primary'
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? '已複製' : '複製'}</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-atrip-2 border-t border-atrip-border-subtle pt-atrip-3">
          <a
            href={shareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="atrip-compact-secondary min-h-atrip-control rounded-atrip-md"
          >
            <ExternalLink size={14} />
            <span>預覽分享頁</span>
          </a>
          <button
            type="button"
            onClick={handleNativeShare}
            className="atrip-compact-primary min-h-atrip-control rounded-atrip-md"
          >
            <Sparkles size={14} />
            <span>快速分享</span>
          </button>
        </div>
      </div>
    </div>
  );
};
