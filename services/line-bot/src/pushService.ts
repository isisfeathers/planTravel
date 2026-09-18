import { Router, Request, Response } from 'express';

export const pushRouter = Router();

/**
 * Builds the Itinerary Ready Flex Message according to TRACK0-04 specs.
 */
export function getItineraryReadyFlex(
  itineraryId: string,
  tripTitle: string,
  destination: string,
  totalDays: number,
  tags: string[]
) {
  const liffId = process.env.LINE_LIFF_ID || 'mock-liff-id';
  
  // Base bubble structure matching Designer 2's flex_message_itinerary_ready.json
  const bubble: any = {
    "type": "bubble",
    "size": "mega",
    "header": {
      "type": "box",
      "layout": "vertical",
      "backgroundColor": "#347FA3",
      "paddingAll": "18px",
      "contents": [
        {
          "type": "text",
          "text": "🎉 您的專屬自由行已規劃就緒！",
          "color": "#FFFFFF",
          "weight": "bold",
          "size": "lg",
          "wrap": true
        }
      ]
    },
    "hero": {
      "type": "image",
      "url": "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?auto=format&fit=crop&w=1000&q=80", // beautiful travel cover image
      "size": "full",
      "aspectRatio": "20:13",
      "aspectMode": "cover",
      "action": {
        "type": "uri",
        "label": "查看專屬行程",
        "uri": `https://liff.line.me/${liffId}/canvas/${itineraryId}`
      }
    },
    "body": {
      "type": "box",
      "layout": "vertical",
      "paddingAll": "20px",
      "spacing": "md",
      "contents": [
        {
          "type": "text",
          "text": tripTitle || `${destination} 自由行`,
          "color": "#1F2937",
          "weight": "bold",
          "size": "xl",
          "wrap": true,
          "maxLines": 2
        },
        {
          "type": "box",
          "layout": "horizontal",
          "spacing": "sm",
          "contents": [
            {
              "type": "text",
              "text": `📍 ${destination}`,
              "color": "#4B5563",
              "size": "sm",
              "flex": 1
            },
            {
              "type": "text",
              "text": `🗓 ${totalDays} 天 ${totalDays > 1 ? `${totalDays - 1} 夜` : ''}`,
              "color": "#4B5563",
              "size": "sm",
              "align": "end",
              "flex": 1
            }
          ]
        },
        {
          "type": "separator",
          "color": "#E5E7EB",
          "margin": "sm"
        },
        // Tags box (body.contents[3])
        {
          "type": "box",
          "layout": "horizontal",
          "spacing": "sm",
          "contents": []
        },
        {
          "type": "text",
          "text": "從街區散步到交通安排，Atrip 已替你整理好每天的旅行節奏。",
          "color": "#6B7280",
          "size": "sm",
          "wrap": true,
          "lineSpacing": "4px"
        }
      ]
    },
    "footer": {
      "type": "box",
      "layout": "vertical",
      "paddingStart": "20px",
      "paddingEnd": "20px",
      "paddingTop": "0px",
      "paddingBottom": "20px",
      "contents": [
        {
          "type": "button",
          "style": "primary",
          "height": "sm",
          "color": "#347FA3",
          "action": {
            "type": "uri",
            "label": "開啟 Atrip 專屬行程",
            "uri": `https://liff.line.me/${liffId}/canvas/${itineraryId}`
          }
        }
      ]
    },
    "styles": {
      "footer": {
        "separator": false
      }
    }
  };

  // Dynamically populate tags
  const tagList = tags && tags.length > 0 ? tags : ["在地老饕", "大眾運輸"];
  const colorSchemes = [
    { bg: "#E7EFE8", text: "#58745B" }, // green
    { bg: "#E8F2F7", text: "#347FA3" }, // blue
    { bg: "#FDF2E9", text: "#B05C1D" }  // orange/warm
  ];

  bubble.body.contents[3].contents = tagList.slice(0, 3).map((tag, idx) => {
    const scheme = colorSchemes[idx % colorSchemes.length];
    return {
      "type": "box",
      "layout": "vertical",
      "backgroundColor": scheme.bg,
      "cornerRadius": "16px",
      "paddingStart": "12px",
      "paddingEnd": "12px",
      "paddingTop": "6px",
      "paddingBottom": "6px",
      "contents": [
        {
          "type": "text",
          "text": `#${tag}`,
          "color": scheme.text,
          "size": "xs",
          "weight": "bold",
          "align": "center"
        }
      ]
    };
  });

  return {
    "type": "flex",
    "altText": "您的 Atrip 專屬自由行已規劃完成！",
    "contents": bubble
  };
}

/**
 * Builds the Error / Retry Flex Message according to TRACK0-04 specs.
 */
export function getErrorRetryFlex(itineraryId: string) {
  const liffId = process.env.LINE_LIFF_ID || 'mock-liff-id';
  
  return {
    "type": "flex",
    "altText": "Atrip 行程產生失敗，請點選重新規劃。",
    "contents": {
      "type": "bubble",
      "size": "mega",
      "header": {
        "type": "box",
        "layout": "vertical",
        "backgroundColor": "#347FA3",
        "paddingAll": "18px",
        "contents": [
          {
            "type": "text",
            "text": "旅程暫時迷路了",
            "color": "#FFFFFF",
            "weight": "bold",
            "size": "lg",
            "wrap": true
          }
        ]
      },
      "body": {
        "type": "box",
        "layout": "vertical",
        "paddingAll": "20px",
        "spacing": "md",
        "contents": [
          {
            "type": "text",
            "text": "🧭",
            "size": "3xl",
            "align": "center"
          },
          {
            "type": "text",
            "text": "這次沒有順利產生行程",
            "color": "#1F2937",
            "weight": "bold",
            "size": "xl",
            "align": "center",
            "wrap": true
          },
          {
            "type": "text",
            "text": "可能是網路或服務暫時忙碌，原本的旅行偏好已保留，不需要重新填寫。",
            "color": "#6B7280",
            "size": "sm",
            "align": "center",
            "wrap": true,
            "lineSpacing": "4px"
          },
          {
            "type": "box",
            "layout": "vertical",
            "backgroundColor": "#E7EFE8",
            "cornerRadius": "12px",
            "paddingAll": "12px",
            "contents": [
              {
                "type": "text",
                "text": "你的設定與進度都還在，稍後再試即可。",
                "color": "#58745B",
                "size": "sm",
                "weight": "bold",
                "align": "center",
                "wrap": true
              }
            ]
          }
        ]
      },
      "footer": {
        "type": "box",
        "layout": "vertical",
        "spacing": "sm",
        "paddingStart": "20px",
        "paddingEnd": "20px",
        "paddingTop": "0px",
        "paddingBottom": "20px",
        "contents": [
          {
            "type": "button",
            "style": "primary",
            "height": "sm",
            "color": "#6F8F72",
            "action": {
              "type": "postback",
              "label": "重新產生行程",
              "data": `action=retry_itinerary&itinerary_id=${itineraryId}`,
              "displayText": "請幫我重新產生行程"
            }
          },
          {
            "type": "button",
            "style": "link",
            "height": "sm",
            "color": "#347FA3",
            "action": {
              "type": "uri",
              "label": "返回我的行程",
              "uri": `https://liff.line.me/${liffId}/dashboard`
            }
          }
        ]
      }
    }
  };
}

/**
 * POST /api/v1/line/push
 * Microservice endpoint to push dynamic Flex bubble cards to users.
 */
pushRouter.post('/push', async (req: Request, res: Response) => {
  const { line_user_id, itinerary_id, trip_title, destination, total_days, tags, status } = req.body;

  // Validate request
  if (!line_user_id || !itinerary_id) {
    return res.status(400).json({ error: 'Missing line_user_id or itinerary_id in payload.' });
  }

  const isFailed = status === 'failed';
  const flexMessage = isFailed
    ? getErrorRetryFlex(itinerary_id)
    : getItineraryReadyFlex(
        itinerary_id,
        trip_title,
        destination || '目的地',
        Number(total_days) || 5,
        tags || []
      );

  console.log(`[LINE Push] Preparing to push to user ${line_user_id} for itinerary ${itinerary_id} (Status: ${status || 'completed'})`);

  const accessToken = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const isConfigured = accessToken && accessToken !== 'your_line_channel_access_token_here';

  if (!isConfigured) {
    console.log('[LINE Push] [MOCK MODE] Messaging API not configured. Simulating successful push response.');
    return res.status(200).json({
      success: true,
      mode: 'mock',
      message: 'LINE_CHANNEL_ACCESS_TOKEN not configured. Returned simulated Flex Message payload.',
      data: flexMessage
    });
  }

  try {
    const response = await fetch('https://api.line.me/v2/bot/message/push', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        to: line_user_id,
        messages: [flexMessage]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[LINE Push] Failed to push to LINE. Status: ${response.status}, Error: ${errorText}`);
      return res.status(500).json({ error: 'LINE API rejected push request.', details: errorText });
    }

    console.log(`[LINE Push] Flex Message pushed successfully to ${line_user_id}.`);
    return res.status(200).json({ success: true, message: 'Flex Message pushed successfully.' });

  } catch (err: any) {
    console.error('[LINE Push] Uncaught error during push operation:', err);
    return res.status(500).json({ error: 'Unexpected server error during push.', details: err.message });
  }
});
