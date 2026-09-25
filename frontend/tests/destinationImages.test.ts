import { describe, it, expect } from 'vitest';
import { getDestinationCoverImage } from '@/lib/destinationImages';

describe('DestinationImages', () => {
  it('預設選單中的城市（巴黎、冰島、東京、京阪神、沖繩、首爾、曼谷、倫敦）應對應專屬圖片', () => {
    const parisImg = decodeURIComponent(getDestinationCoverImage('巴黎'));
    expect(parisImg).toMatch(/巴黎-0[12]\.jpg/);

    const icelandImg = decodeURIComponent(getDestinationCoverImage('冰島雷克雅維克'));
    expect(icelandImg).toMatch(/冰島-0[12]\.jpg/);

    const tokyoImg = decodeURIComponent(getDestinationCoverImage('東京'));
    expect(tokyoImg).toMatch(/東京-01\.avif|東京-02\.jpg/);

    const kansaiImg = decodeURIComponent(getDestinationCoverImage('京都與大阪'));
    expect(kansaiImg).toMatch(/京阪神-0[12]\.jpg/);

    const okinawaImg = decodeURIComponent(getDestinationCoverImage('沖繩'));
    expect(okinawaImg).toMatch(/沖繩-0[12]\.jpg/);

    const seoulImg = decodeURIComponent(getDestinationCoverImage('首爾'));
    expect(seoulImg).toMatch(/首爾-0[12]\.jpg/);

    const bangkokImg = decodeURIComponent(getDestinationCoverImage('曼谷'));
    expect(bangkokImg).toMatch(/曼谷-0[12]\.jpg/);

    const londonImg = decodeURIComponent(getDestinationCoverImage('倫敦'));
    expect(londonImg).toMatch(/倫敦-0[12]\.jpg/);
  });

  it('非預設選單中的城市應從預設三張照片（預設-01, 預設-02, 預設-03）中擇一顯示', () => {
    const customImg = decodeURIComponent(getDestinationCoverImage('北馬其頓'));
    expect(customImg).toMatch(/預設-0[123]\.png/);

    const customImg2 = decodeURIComponent(getDestinationCoverImage('重慶'));
    expect(customImg2).toMatch(/預設-0[123]\.png/);
  });

  it('傳入相同 id 種子時應產出穩定的圖片', () => {
    const img1 = getDestinationCoverImage('巴黎', 'test-seed-123');
    const img2 = getDestinationCoverImage('巴黎', 'test-seed-123');
    expect(img1).toBe(img2);
  });
});
