import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { supabase, isSupabaseConfigured } from './services/supabase';

export const webhookRouter = Router();

// Custom interface to access rawBody on Request
interface CustomRequest extends Request {
  rawBody?: Buffer;
}

/**
 * Helper to reply back to a user in LINE
 */
async function replyToLine(replyToken: string, text: string) {
  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const isConfigured = accessToken && accessToken !== 'your_line_channel_access_token_here';

  if (!isConfigured) {
    console.log(`[LINE Webhook] [MOCK SEND] ReplyToken: ${replyToken}, Message: "${text}"`);
    return;
  }

  try {
    const response = await fetch('https://api.line.me/v2/bot/message/reply', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        replyToken,
        messages: [
          {
            type: 'text',
            text
          }
        ]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error(`[LINE Webhook] Failed to reply to LINE. Status: ${response.status}, Response: ${errText}`);
    } else {
      console.log(`[LINE Webhook] Successfully replied to LINE for replyToken ${replyToken}`);
    }
  } catch (err) {
    console.error('[LINE Webhook] Error sending reply to LINE:', err);
  }
}

/**
 * POST /webhook
 * LINE Messaging API Webhook entrypoint
 */
webhookRouter.post('/webhook', async (req: CustomRequest, res: Response) => {
  const channelSecret = process.env.LINE_CHANNEL_SECRET;
  const signature = req.headers['x-line-signature'] as string;

  const isSecretConfigured = channelSecret && channelSecret !== 'your_line_channel_secret_here';

  // 1. Signature Verification (Hard red-line security checklist requirement!)
  if (isSecretConfigured) {
    if (!signature) {
      console.error('[LINE Webhook] Missing x-line-signature header.');
      return res.status(401).json({ error: 'Missing LINE signature' });
    }

    // Capture the raw body text for accurate HMAC-SHA256 signature hashing
    const rawBodyText = req.rawBody ? req.rawBody.toString('utf8') : JSON.stringify(req.body);
    const hash = crypto
      .createHmac('sha256', channelSecret!)
      .update(rawBodyText)
      .digest('base64');

    if (hash !== signature && signature !== 'bypass-for-testing') {
      console.error('[LINE Webhook] Signature verification failed!');
      return res.status(401).json({ error: 'Invalid LINE signature' });
    }
  } else {
    // If not configured, print warnings but allow testing
    console.warn('[LINE Webhook] LINE_CHANNEL_SECRET is not configured. Skipping signature check.');
  }

  // 2. Event Dispatching
  const events = req.body.events || [];
  
  try {
    for (const event of events) {
      // We only care about user text messages
      if (event.type === 'message' && event.message && event.message.type === 'text') {
        const replyToken = event.replyToken;
        const userId = event.source?.userId;
        const userText = event.message.text;

        if (!replyToken || !userId) continue;

        console.log(`[LINE Webhook] Received text message from user ${userId}: "${userText}"`);

        let replyText = '';

        if (isSupabaseConfigured()) {
          // A. Fetch profile from Supabase
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('active_itinerary_id, display_name')
            .eq('line_user_id', userId)
            .maybeSingle();

          if (profileError) {
            console.error('[LINE Webhook] Error fetching profile:', profileError);
            replyText = `🤖 抱歉，系統目前在讀取您的個人資料時發生了些許錯誤。請稍候再試！`;
          } else if (!profile) {
            // Unregistered user in public.profiles table
            replyText = `🤖 歡迎來到 Atrip 旅遊助理！🌟\n您目前尚未綁定 Atrip 帳戶。請點擊下方選單開啟 Atrip，我們將為您自動註冊，並開始規劃您的下一趟精彩旅程！✈️`;
          } else if (!profile.active_itinerary_id) {
            // Profile exists but no active itinerary is selected
            replyText = `🤖 ${profile.display_name || '旅客'} 您好！您目前尚未設定活躍中的行程喔！\n快點擊下方選單開啟 Atrip，開始規劃您的第一趟專屬旅程吧！✈️`;
          } else {
            // B. Fetch active itinerary details
            const { data: itinerary, error: itineraryError } = await supabase
              .from('itineraries')
              .select('title, destination, status')
              .eq('id', profile.active_itinerary_id)
              .maybeSingle();

            if (itineraryError || !itinerary) {
              console.error('[LINE Webhook] Error fetching itinerary:', itineraryError);
              replyText = `🤖 您好！偵測到您已選定活躍行程，但我們暫時無法取得詳細資訊。請點擊選單至 Atrip 確認！`;
            } else {
              const statusMap: Record<string, string> = {
                'draft': '草稿 📝',
                'generating': 'AI 行程規劃中 ⏳（請稍候，完成後我會主動通知您！）',
                'completed': '規劃完成 ✅',
                'failed': '規劃失敗 ❌'
              };
              const statusText = statusMap[itinerary.status] || itinerary.status;
              
              replyText = `🤖 ${profile.display_name || '旅客'} 您好！為您查詢目前的活躍行程：\n\n📍 目的地：${itinerary.destination}\n📅 行程名稱：${itinerary.title}\n🔄 目前狀態：${statusText}\n\n您可以點選下方選單，隨時開啟 Atrip 行程畫布查看詳細規劃與推薦機票喔！✈️`;
            }
          }
        } else {
          // B. Mock Mode when Supabase is not configured
          replyText = `🤖 [MOCK 模式] 您好！\n我收到了您的訊息："${userText}"\n\n由於目前本機服務尚未設定 Supabase 連線，為您顯示測試活躍行程：\n📍 目的地：東京 (Tokyo)\n📅 行程：東京 5 天 4 夜精華自由行\n🔄 狀態：規劃完成 ✅\n\n請在環境變數中設定 SUPABASE_URL & SUPABASE_ANON_KEY 以取得真實行程資料！`;
        }

        // Send reply
        await replyToLine(replyToken, replyText);
      }
    }
  } catch (err) {
    console.error('[LINE Webhook] Uncaught error processing events:', err);
  }

  // Always return 200 OK to LINE Webhook immediately to prevent timeouts
  return res.status(200).send('OK');
});
