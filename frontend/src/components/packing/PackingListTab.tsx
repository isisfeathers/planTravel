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
    <div className="flex flex-col gap-5">
      {/* 頂部 AI 定制行程提示橫幅 */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-brand-primary text-slate-900">
              AI 智能行前打包顧問
            </span>
            <span className="text-xs text-indigo-200 font-bold">
              {destination} · {totalDays} 天 {nights} 夜 · {monthText}氣候
            </span>
          </div>
          <h3 className="text-sm sm:text-base font-black text-white mt-1">
            已依據「{destination}」之簽證法規、電壓插座、當地幣別與季節氣候生成專屬清單
          </h3>
          <p className="text-xs text-slate-300 mt-0.5">
            換洗衣物已配合 {totalDays} 天 {nights} 夜計算，並精確提供當地交通與常備藥品防護建議。
          </p>
        </div>
        <button
          type="button"
          onClick={() => regenerateForDestination(destination, totalDays, startDate)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/15 hover:bg-white/25 text-white text-xs font-bold transition-all shrink-0 cursor-pointer"
        >
          <span>✨ 重新依目的地生成</span>
        </button>
      </div>

      {/* 頂部進度條卡片 */}
      <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-3">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-base font-bold text-slate-900">行前打包進度</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              已完成 {checkedCount} / {totalCount} 項 ({progressPercent}%)
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            {isSaving ? '同步中...' : saveStatusText}
          </span>
        </div>

        <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-brand-primary h-full rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* 新增自訂物品區塊 */}
      <form onSubmit={handleAddNewItem} className="p-4 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col sm:flex-row gap-2">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value as PackingItem['category'])}
          className="px-3 py-2 text-xs font-semibold rounded-xl bg-slate-50 border border-slate-200 text-slate-700 focus:outline-none"
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
          className="flex-1 px-4 py-2 text-sm rounded-xl bg-slate-50 border border-slate-200 focus:bg-white focus:outline-none focus:border-brand-primary"
        />

        <button
          type="submit"
          className="px-5 py-2 rounded-xl bg-brand-primary text-white text-xs font-bold shadow-sm hover:opacity-90 active:scale-95 transition-all"
        >
          新增物品
        </button>
      </form>

      {/* 四大分類清單 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {categories.map((cat) => {
          const categoryItems = items.filter((i) => i.category === cat);
          const meta = CATEGORY_MAP[cat];

          return (
            <div key={cat} className="p-5 rounded-2xl bg-white border border-slate-200 shadow-sm flex flex-col gap-3">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
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
                      className="group flex items-start justify-between gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                    >
                      <label className="flex items-start gap-3 cursor-pointer flex-1">
                        <input
                          type="checkbox"
                          checked={item.is_checked}
                          onChange={() => toggleItem(item.id)}
                          className="mt-0.5 w-4 h-4 rounded border-slate-300 text-brand-primary focus:ring-brand-primary"
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
                        className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-1 text-xs transition-opacity"
                        aria-label="刪除"
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