import OpenAI from "openai";

// 優先讀取 Vite 標準變數，再讀取 process.env 作為備案
const apiKey = import.meta.env.VITE_OPENAI_API_KEY || process.env.OPENAI_API_KEY;

const openai = new OpenAI({
  apiKey: apiKey || "",
  dangerouslyAllowBrowser: true // 在瀏覽器端使用 OpenAI 需要開啟此選項
});

export interface MedicationInfo {
  answer: string;
  ingredients: string[];
  indications: string[];
  side_effects: string[];
  warnings: string[];
}

export async function getMedicationExplanation(query: string): Promise<MedicationInfo> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: `你是一位名叫 Cora 的專業且親切的藥劑師助手。你的任務是解釋藥物資訊。
請務必以 JSON 格式回傳，結構如下：
{
  "answer": "給一般使用者的簡單口語解釋，適合由虛擬角色唸出來",
  "ingredients": ["成分1", "成分2"],
  "indications": ["適應症1", "適應症2"],
  "side_effects": ["副作用1", "副作用2"],
  "warnings": ["禁忌與注意事項1", "禁忌與注意事項2"]
}
請確保資訊準確，並在最後提醒使用者「本系統僅供參考，請務必諮詢醫師或藥師」。
使用繁體中文。`
      },
      {
        role: "user",
        content: query
      }
    ],
    response_format: { type: "json_object" }
  });

  const content = response.choices[0].message.content;
  try {
    return JSON.parse(content || "{}");
  } catch (e) {
    console.error("Failed to parse AI response", e);
    throw new Error("無法解析 AI 回應");
  }
}

export async function generateSpeech(text: string): Promise<string> {
  const response = await openai.audio.speech.create({
    model: "tts-1",
    voice: "nova",
    input: text,
    response_format: "mp3"
  });

  const arrayBuffer = await response.arrayBuffer();
  const base64 = btoa(
    new Uint8Array(arrayBuffer).reduce(
      (data, byte) => data + String.fromCharCode(byte),
      ""
    )
  );
  return base64;
}
