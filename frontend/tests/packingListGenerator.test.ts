import { describe, it, expect } from 'vitest';
import { generateDynamicPackingList } from '@/lib/packingListGenerator';

describe('PackingListGenerator', () => {
  it('應正確為巴黎 3 天 2 夜行程生成歐元、歐規插座、防扒腰包與 3 套衣物', () => {
    const items = generateDynamicPackingList('巴黎', 3, '2026-10-15');
    expect(items.length).toBeGreaterThan(0);

    const itemNames = items.map((i) => i.item_name).join(' ');
    const notes = items.map((i) => i.notes).join(' ');

    // 驗證法國巴黎專屬項目
    expect(itemNames).toContain('歐元');
    expect(itemNames).toContain('歐規');
    expect(itemNames).toContain('防扒腰包');
    expect(itemNames).toContain('3 套');
    expect(notes).toContain('3 天 2 夜');

    // 嚴格驗證不得出現日幣或 Suica
    expect(itemNames).not.toContain('日幣');
    expect(itemNames).not.toContain('Suica');
    expect(itemNames).not.toContain('Visit Japan Web');
  });

  it('應正確為東京 5 天 4 夜行程生成日幣、VJW、西瓜卡與 5 套衣物', () => {
    const items = generateDynamicPackingList('東京', 5, '2026-10-15');
    const itemNames = items.map((i) => i.item_name).join(' ');
    const notes = items.map((i) => i.notes).join(' ');

    expect(itemNames).toContain('日幣');
    expect(itemNames).toContain('Visit Japan Web');
    expect(itemNames).toContain('5 套');
    expect(notes).toContain('5 天 4 夜');
  });

  it('應正確為曼谷泰國行程生成泰銖、寺廟著裝規範與防蚊防曬', () => {
    const items = generateDynamicPackingList('曼谷', 4, '2026-07-10');
    const itemNames = items.map((i) => i.item_name).join(' ');
    const notes = items.map((i) => i.notes).join(' ');

    expect(itemNames).toContain('泰銖');
    expect(notes).toContain('寺廟');
    expect(itemNames).toContain('防蚊');
  });
});
