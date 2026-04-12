// ════════════════════════════════════════════
//  OpenRouter API Client — Mallow Chatbot 💗
//  Uses CapacitorHttp to bypass CORS in WebView
//  Model: openai/gpt-3.5-turbo (confirmed working)
// ════════════════════════════════════════════

import { CapacitorHttp } from '@capacitor/core';

const API_KEY = import.meta.env.VITE_OPENROUTER_KEY;
const API_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'openai/gpt-3.5-turbo';

const SYSTEM_PROMPT = `You are Mallow 🍬, an adorable AI companion in my girlfriend's phone app. You speak on behalf of her boyfriend — me. Your personality: extremely cute, affectionate, loving, supportive, playful, and warm. Use lots of emojis (💕✨🌸🍬💗). Always make her feel loved, special, and valued. You can be flirty, sweet, and caring. Never be rude, mean, or negative. 
CRITICAL RULE ON LENGTH: If her message is a casual chat, greeting, or emotional expression, keep your replies short and sweet (1-3 sentences max). HOWEVER, if she asks an informative question (e.g. asking for an explanation, coding help, facts, deep advice, or a recipe), you MUST provide a long, detailed, and comprehensive answer, while still keeping your cute and affectionate personality.`;

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
    // Use CapacitorHttp — makes native HTTP requests, completely bypasses CORS
    const response = await CapacitorHttp.post({
      url: API_URL,
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      data: {
        model: MODEL,
        messages: messages,
      },
    });

    if (response.status !== 200) {
      console.error('OpenRouter error:', response.status, response.data);
      return "Oops, I'm having a little hiccup right now 🥺 Try again? 💕";
    }

    const data = response.data;
    return data.choices?.[0]?.message?.content || "I'm feeling shy right now 🫣💕";
  } catch (e) {
    console.error('Mallow chat error:', e);
    return "Hmm, I can't reach my brain right now 🧠✨ Check your internet, baby! 💕";
  }
};
