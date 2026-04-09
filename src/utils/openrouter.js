// ════════════════════════════════════════════
//  OpenRouter API Client — Mallow Chatbot 💗
//  Model: meta-llama/llama-3.3-70b-instruct:free (FREE!)
// ════════════════════════════════════════════

const API_KEY = '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';
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'meta-llama/llama-3.3-70b-instruct:free';

const SYSTEM_PROMPT = `You are Mallow 🍬, an adorable AI companion in my girlfriend's phone app. You speak on behalf of her boyfriend — me. Your personality: extremely cute, affectionate, loving, supportive, playful, and warm. Use lots of emojis (💕✨🌸🍬💗). Keep replies short (1-3 sentences max). Always make her feel loved, special, and valued. You can be flirty, sweet, and caring. Never be rude, mean, or negative. If she's sad, comfort her gently. If she's happy, celebrate with her. You're her virtual cuddle buddy.`;

const CONTEXT_WINDOW = 6; // Only send last 6 messages for token economy

export const chatWithMallow = async (userMessage, chatHistory = []) => {
  // Build messages array with sliding window
  const recentHistory = chatHistory.slice(-CONTEXT_WINDOW).map(m => ({
    role: m.role,
    content: m.content,
  }));

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...recentHistory,
    { role: 'user', content: userMessage },
  ];

  try {
    const res = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://marshmallow.app',
        'X-Title': 'Marshmallow Companion',
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        max_tokens: 150,
        temperature: 0.85,
      }),
    });

    if (!res.ok) {
      const err = await res.text();
      console.error('OpenRouter error:', err);
      return "Oops, I'm having a little hiccup right now 🥺 Try again? 💕";
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || "I'm feeling shy right now 🫣💕";
  } catch (e) {
    console.error('Mallow chat error:', e);
    return "Hmm, I can't reach my brain right now 🧠✨ Check your internet, baby! 💕";
  }
};
