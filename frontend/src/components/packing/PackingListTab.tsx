import React, { useState } from 'react';
import { usePackingListStore } from '@/stores/usePackingListStore';
import { PackingItem } from '@/types/itinerary';

const CATEGORY_MAP: Record<PackingItem['category'], { label: string; icon: string }> = {
  essentials: { label: '重要證件與金流', icon: '🛂' },
  clothing: { label: '季節衣物與配件', icon: '👔' },
  electronics: { label: '3C 數位與充電設備', icon: '🔌' },
  toiletries: { label: '隨身常備藥與盥洗', icon: '🧴' },
};

interface PackingListTabProps {
  destination?: string;
  totalDays?: number;
  startDate?: string;
}

export const PackingListTab: React.FC<PackingListTabProps> = ({
  destination = '旅遊目的地',
  totalDays = 3,
  startDate,
}) => {
  const { items, isSaving, saveStatusText, toggleItem, addItem, deleteItem, regenerateForDestination } = usePackingListStore();
  const [newItemName, setNewItemName] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<PackingItem['category']>('essentials');

  // 計算打包進度
  const totalCount = items.length;
  const checkedCount = items.filter((i) => i.is_checked).length;
  const progressPercent = totalCount > 0 ? Math.round((checkedCount / totalCount) * 100) : 0;

  const handleAddNewItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    addItem(selectedCategory, newItemName);
    setNewItemName('');
  };

  const categories: PackingItem['category'][] = ['essentials', 'clothing', 'electronics', 'toiletries'];

  const monthText = startDate ? `${new Date(startDate).getMonth() + 1} 月` : '當季';
  const nights = Math.max(1, totalDays - 1);

  return (
    <div className="flex flex-col gap-atrip-5">
      {/* 頂部 AI 定制行程提示橫幅 */}
      <div className="flex flex-col items-start justify-between gap-atrip-4 rounded-atrip-xl bg-atrip-brand-logo-trp p-atrip-4 text-white sm:flex-row sm:items-center sm:p-atrip-5">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="rounded-atrip-full bg-atrip-action-primary px-atrip-2 py-atrip-1 text-[10px] font-semibold text-atrip-action-on-primary">
              AI 智能行前打包顧問
            </span>
            <span className="text-atrip-caption font-semibold text-white">
              {destination} · {totalDays} 天 {nights} 夜 · {monthText}氣候
            </span>
          </div>
          <h3 className="mt-atrip-2 text-atrip-h2 text-white">
            已依據「{destination}」之簽證法規、電壓插座、當地幣別與季節氣候生成專屬清單
          </h3>
          <p className="mt-atrip-1 text-atrip-caption text-white">
            換洗衣物已配合 {totalDays} 天 {nights} 夜計算，並精確提供當地交通與常備藥品防護建議。
          </p>
        </div>
        <button
          type="button"
          onClick={() => regenerateForDestination(destination, totalDays, startDate)}
          className="atrip-focus inline-flex min-h-11 w-full shrink-0 items-center justify-center gap-atrip-2 rounded-atrip-full border border-white/50 px-atrip-3 text-atrip-caption font-semibold text-white sm:w-auto"
        >
          <span>✨ 重新依目的地生成</span>
        </button>
      </div>

      {/* 頂部進度條卡片 */}
      <div className="flex flex-col gap-atrip-3 rounded-atrip-xl border border-atrip-border-subtle bg-atrip-surface-card p-atrip-4 sm:p-atrip-5">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900">行前打包進度</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              已完成 {checkedCount} / {totalCount} 項 ({progressPercent}%)
            </p>
          </div>
          <span className="rounded-atrip-sm bg-atrip-tag-background px-atrip-tag-x py-atrip-tag-y text-atrip-caption font-semibold text-atrip-tag-foreground">
            {isSaving ? '同步中...' : saveStatusText}
          </span>
        </div>

        <div className="h-2.5 w-full overflow-hidden rounded-atrip-full bg-atrip-surface-subtle" role="progressbar" aria-label="行李打包進度" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="h-full rounded-atrip-full bg-atrip-action-primary transition-[width] duration-300 ease-out motion-reduce:transition-none"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 新增自訂物品區塊 */}
      <form onSubmit={handleAddNewItem} className="flex flex-col gap-atrip-2 rounded-atrip-xl border border-atrip-border-subtle bg-atrip-surface-card p-atrip-4 sm:flex-row">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as PackingItem['category'])}
          className="atrip-focus min-h-atrip-input rounded-atrip-md border border-atrip-border-subtle bg-atrip-surface-subtle px-atrip-3 text-atrip-body font-semibold text-atrip-text-primary"
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {CATEGORY_MAP[cat].icon} {CATEGORY_MAP[cat].label}
            </option>
          ))}
        </select>

        <input
          type="text"
          placeholder="＋ 新增個人自訂打包物品..."
          value={newItemName}
          onChange={(e) => setNewItemName(e.target.value)}
          className="atrip-input flex-1"
        />

        <button
          type="submit"
          className="atrip-compact-primary px-atrip-5"
        >
          新增物品
        </button>
      </form>

      {/* 四大分類清單 */}
      <div className="grid grid-cols-1 gap-atrip-4 md:grid-cols-2">
        {categories.map((cat) => {
          const categoryItems = items.filter((i) => i.category === cat);
          const meta = CATEGORY_MAP[cat];

          return (
            <div key={cat} className="flex flex-col gap-atrip-3 rounded-atrip-xl border border-atrip-border-subtle bg-atrip-surface-card p-atrip-4 sm:p-atrip-5">
              <div className="flex items-center gap-atrip-2 border-b border-atrip-border-subtle pb-atrip-2">
                <span className="text-xl">{meta.icon}</span>
                <h4 className="text-sm font-bold text-slate-900">{meta.label}</h4>
                <span className="ml-auto text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-500">
                  {categoryItems.filter((i) => i.is_checked).length}/{categoryItems.length}
                </span>
              </div>

              {categoryItems.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">此類別尚無項目</p>
              ) : (
                <ul className="flex flex-col gap-2">
                  {categoryItems.map((item) => (
                    <li
                      key={item.id}
                    className="group flex min-h-11 items-start justify-between gap-atrip-3 rounded-atrip-md p-atrip-2 transition-colors"
                    >
                      <label className="flex items-start gap-3 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={item.is_checked}
                          onChange={() => toggleItem(item.id)}
                          className="mt-0.5 h-5 w-5 rounded border-atrip-border-subtle text-atrip-selection-foreground focus:ring-atrip-focus-ring"
                        />
                        <div>
                          <p
                            className={`text-sm font-medium transition-all ${
                              item.is_checked
                                ? 'line-through text-slate-400'
                                : 'text-slate-800'
                            }`}
                          >
                            {item.item_name}
                          </p>
                          {item.notes && (
                            <p className="text-xs text-slate-400 mt-0.5">{item.notes}</p>
                          )}
                        </div>
                      </label>

                      {/* 刪除自訂按鈕 */}
                      <button
                        type="button"
                        onClick={() => deleteItem(item.id)}
                        className="atrip-focus grid h-11 w-11 shrink-0 place-items-center rounded-atrip-full text-atrip-text-secondary sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100"
                        aria-label={`刪除${item.item_name}`}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
