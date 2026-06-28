import { NextResponse } from "next/server";

const DASHSCOPE_URL = `${process.env.DASHSCOPE_BASE_URL || "https://dashscope.aliyuncs.com/api/v1"}/services/aigc/text-generation/generation`;
const MODEL = "qwen-plus";

interface DashScopeResponse {
  output?: {
    choices?: Array<{
      message?: { content?: string };
    }>;
  };
}

interface SuggestResult {
  suggestion: string;
  xpReward: number;
  coinReward: number;
}

function buildPrompt(title: string, description?: string | null, category?: string | null): string {
  return `你是一个青少年习惯养成系统的AI助手，帮助家长为孩子制定目标和奖励方案。

家长输入的目标：${title}
${description ? `详细描述：${description}` : ""}
${category ? `分类：${category}` : ""}

请分析这个目标，返回JSON格式的建议，包含以下字段：
1. "suggestion": 一段中文建议，告诉家长该给孩子什么奖励合适（具体到物品或活动），以及为什么这个奖励合适。要结合孩子的心理特点，语气亲切。50-100字。
2. "xpReward": 数字，这个目标应该给多少经验值（XP）。参考：简单日常任务10-15，中等难度20-30，重大挑战40-60。
3. "coinReward": 数字，这个目标应该给多少BP币（可用于兑换奖励）。参考：简单任务0-2，中等3-5，重大挑战8-15。

只返回JSON，不要多余的文字。`;
}

async function callDashScope(prompt: string): Promise<string | null> {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(DASHSCOPE_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        input: {
          messages: [
            { role: "system", content: "你是一个青少年激励专家，擅长为家长提供合适的奖励建议。请以JSON格式回复。" },
            { role: "user", content: prompt },
          ],
        },
        parameters: {
          result_format: "message",
          temperature: 0.8,
          max_tokens: 512,
        },
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("DashScope API error:", res.status, errBody);
      return null;
    }

    const data: DashScopeResponse = await res.json();
    return data?.output?.choices?.[0]?.message?.content || null;
  } catch (err) {
    console.error("DashScope call failed:", err);
    return null;
  }
}

function parseResult(raw: string): SuggestResult | null {
  // Try to extract JSON from the response (it might be wrapped in markdown code blocks)
  const jsonMatch = raw.match(/\{[\s\S]*\}/);
  const jsonStr = jsonMatch?.[0] || raw;

  try {
    const parsed = JSON.parse(jsonStr);
    return {
      suggestion: parsed.suggestion || parsed.reward_suggestion || "可以跟孩子聊聊他最近想要什么，把奖励和他的兴趣结合起来效果最好！",
      xpReward: typeof parsed.xpReward === "number" ? parsed.xpReward : 15,
      coinReward: typeof parsed.coinReward === "number" ? parsed.coinReward : 3,
    };
  } catch {
    // If JSON parsing fails, extract what we can from the raw text
    const xpMatch = raw.match(/xpReward[^0-9]*(\d+)/i);
    const coinMatch = raw.match(/coinReward[^0-9]*(\d+)/i);
    return {
      suggestion: raw.replace(/[{}"\[\]]/g, "").substring(0, 200),
      xpReward: xpMatch ? parseInt(xpMatch[1]) : 15,
      coinReward: coinMatch ? parseInt(coinMatch[1]) : 3,
    };
  }
}

function fallbackSuggest(title: string, category?: string | null): SuggestResult {
  // Keyword-based fallback when AI is unavailable
  const kw = title.toLowerCase();
  if (kw.includes("考试") || kw.includes("成绩") || kw.includes("分")) {
    return { suggestion: "🎯 学习类目标！建议给一个大奖励来激励孩子努力。推荐：去游乐园、买一套乐高、或者一次家庭聚餐选餐厅的权利。", xpReward: 50, coinReward: 10 };
  }
  if (kw.includes("阅读") || kw.includes("读书") || kw.includes("看书") || kw.includes("绘本")) {
    return { suggestion: "📚 阅读好习惯！坚持每天阅读，可以奖励一本新书或者延长睡前故事时间。如果连续一周都做到了，周末可以去图书馆选一本自己喜欢的书。", xpReward: 15, coinReward: 3 };
  }
  if (kw.includes("家务") || kw.includes("打扫") || kw.includes("整理") || kw.includes("洗碗")) {
    return { suggestion: "🧹 家务小帮手！完成后可以奖励周末多玩30分钟游戏，或者选一部想看的电影全家一起看。", xpReward: 10, coinReward: 2 };
  }
  if (kw.includes("运动") || kw.includes("跑步") || kw.includes("锻炼") || kw.includes("跳绳")) {
    return { suggestion: "💪 运动健康！坚持运动可以奖励新的运动装备（跳绳、球拍等），或者带他去吃喜欢的健康餐。", xpReward: 20, coinReward: 3 };
  }
  if (kw.includes("早起") || kw.includes("起床") || kw.includes("作息")) {
    return { suggestion: "⏰ 早起好习惯！连续一周早起可以奖励一顿特别的早餐，或者周末可以晚睡一次。", xpReward: 10, coinReward: 1 };
  }
  if (category === "STUDY") {
    return { suggestion: "📖 学习进步！建议奖励：学习用品、去书店选一本书、或者一次科技馆之旅。", xpReward: 30, coinReward: 5 };
  }
  if (category === "CHORE") {
    return { suggestion: "🧹 家务劳动！奖励建议：延长游戏时间15分钟、选一个周末活动。", xpReward: 10, coinReward: 2 };
  }
  return { suggestion: "🎁 可以根据孩子的兴趣爱好来定奖励。问问孩子最近想要什么，把奖励和他的兴趣结合起来效果最好！", xpReward: 15, coinReward: 2 };
}

export async function POST(req: Request) {
  try {
    const { title, description, category } = await req.json();
    if (!title) {
      return NextResponse.json({ error: "缺少目标标题" }, { status: 400 });
    }

    const prompt = buildPrompt(title, description, category);
    const aiRaw = await callDashScope(prompt);

    if (aiRaw) {
      const result = parseResult(aiRaw);
      return NextResponse.json(result);
    }

    // AI unavailable — fallback to keyword matching
    const fallback = fallbackSuggest(title, category);
    return NextResponse.json({
      ...fallback,
      suggestion: `${fallback.suggestion}\n\n💡 提示：已在 .env 中配置 DASHSCOPE_API_KEY 后即可启用 AI 智能建议。`,
    });
  } catch (err) {
    console.error("Suggest error:", err);
    return NextResponse.json({ error: "建议生成失败" }, { status: 500 });
  }
}
