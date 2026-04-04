import React, { createContext, useState, useCallback } from 'react';

export const MascotContext = createContext();

const JOKES = [
  "Why did the marshmallow go to school? To get a little toasty! 🔥",
  "What do you call a sad marshmallow? A mellow marsh. 😢",
  "Why did the cloud break up with the rain? It needed space! ☁️",
  "You + me = the sweetest combination since cocoa and marshmallows 🍫",
  "I tried to think of a joke but I melted 🫠",
  "What's softer than a cloud? You. Obviously. 💕",
  "I'd tell you a chemistry joke but I know I'd get a reaction 💕",
  "Why are you so cute? Scientists are still studying this. 🔬",
  "Knock knock. Who's there? Definitely someone who loves you 💌",
  "I googled 'most beautiful person' and my screen just showed me a mirror. That counts, right? 🪞",
  "Why did the coffee file a police report? It got mugged! ☕",
  "What did one wall say to the other? I'll meet you at the corner! 🧱",
  "I was going to tell a time-traveling joke, but you didn't like it. ⏱️",
  "Why do bees have sticky hair? Because they use honeycombs! 🐝",
  "I made a pencil with two erasers. It was pointless! ✏️",
  "What do you call a magic dog? A labracadabrador! 🪄🐕",
  "Why did the cookie go to the hospital? Because he felt crummy! 🍪",
];

const LOVING = [
  "You're literally the cutest person alive. Don't even try to argue with me 💕",
  "I made this whole app because I wanted you to feel loved every time you open your phone 🍬",
  "You deserve the softest, most magical life. I hope this feels like a tiny piece of that ☁️",
  "Just so you know — thinking about you is my favorite thing to do all day 🌸",
  "You make everything better just by existing. That's not an exaggeration. That's science. 💫",
  "I wish I could hug you right now but I hope this little mascot helps 🤗",
  "You are my favorite notification, my favorite distraction, my favorite everything 💌",
  "This app has no ads because you deserve a space that's only yours — pure and sweet, like you 🍬",
  "I love you more than words, but I tried to put it in code. Here we are 🖥️💕",
  "Whoever gets to see your smile today is having the best day of their life ✨",
  "You're my favorite person in the entire universe. And I've thought about this a lot. 🌌",
  "Good morning, you absolute ray of sunshine 🌞",
  "You are doing so well. I see you. I'm proud of you. 💕",
  "One day you'll look back and realize how amazing you were this whole time 🌸",
  "The world is genuinely better because you're in it. I mean this with my whole heart 💗",
  "If I had to choose between breathing and loving you, I'd use my last breath to say I love you 🥺💕",
  "You are the best thing that ever happened to me, and I'll never stop reminding you 💫",
  "Whenever I look at you, I just think... how did I get so lucky? 🥰",
  "I just dropped by to say you're the most gorgeous human in the room. Always. ✨",
  "You have my whole heart, today, tomorrow, and forever ❤️",
  "I fall for you a little bit more every single day 🥹💕"
];

const MOTIVATION = [
  "You've got this. You always do 💪",
  "One task at a time, one step at a time, one breath at a time 🌸",
  "You're allowed to take breaks. Rest is part of the process ☁️",
  "Look how far you've already come. I'm so proud of you 🎀",
  "Hard things don't last forever. But you do 💕",
  "Drink some water, take a breath, and remember how capable you are 💧",
  "You don't have to be perfect. You just have to try. And you always do 🌟",
  "Even the tiniest step forward is still moving forward ✨",
  "Today doesn't have to be your best day. It just has to be today 🍬",
  "Your future self is already proud of what you're doing right now 🌸",
  "Don't worry about being perfect right now. Just focus on being you. You're enough. 💖",
  "Take a deep breath. You're exactly where you need to be. 🌬️",
  "Everything you need to succeed is already inside you. Let it shine! ✨",
  "Small progress is still progress. Be gentle with yourself today 💕",
  "If no one has told you today, I believe in you completely! 🌟"
];

// All possible emotes for the mascot images
const EMOTES = ['happy', 'excited', 'loving', 'playful', 'proud', 'sad', 'sleepy', 'thinking'];

// Map categories to possible emotes (weighted randomness)
const CATEGORY_EMOTES = {
  jokes: ['playful', 'excited', 'happy', 'playful'],
  loving: ['loving', 'loving', 'happy', 'excited'],
  motivation: ['proud', 'excited', 'happy', 'proud'],
  greeting: ['happy', 'excited', 'loving'],
  thinking: ['thinking', 'thinking', 'playful'],
  sleepy: ['sleepy', 'sleepy', 'thinking'],
  sad: ['sad', 'sad', 'thinking'],
};

const getTimeGreeting = () => {
  const h = new Date().getHours();
  if (h < 5) return { text: "You're up late! Get some rest soon, okay? 🌙", emote: 'sleepy' };
  if (h < 9) return { text: "Good morning, sunshine! Ready to make today amazing? ☀️", emote: 'happy' };
  if (h < 12) return { text: "Hey! Hope your morning is going great 🌸", emote: 'excited' };
  if (h < 15) return { text: "Good afternoon! You're doing so well today 💕", emote: 'proud' };
  if (h < 18) return { text: "Hey there! Almost evening, take a little break 🍬", emote: 'playful' };
  if (h < 21) return { text: "Good evening! Time to wind down and relax 🌅", emote: 'loving' };
  return { text: "It's getting late! Don't forget to take care of yourself 🌙", emote: 'sleepy' };
};

export const MascotProvider = ({ children }) => {
  const greeting = getTimeGreeting();
  const [currentEmote, setCurrentEmote] = useState(greeting.emote);
  const [currentMessage, setCurrentMessage] = useState(greeting.text);
  const [isMessageVisible, setMessageVisible] = useState(true);

  const getRandomMessage = (category) => {
    let pool = [];
    if (category === 'jokes') pool = JOKES;
    else if (category === 'loving') pool = LOVING;
    else if (category === 'motivation') pool = MOTIVATION;
    else pool = [...LOVING, ...MOTIVATION];

    return pool[Math.floor(Math.random() * pool.length)];
  };

  const pickEmoteForCategory = (category) => {
    const emotes = CATEGORY_EMOTES[category] || EMOTES;
    return emotes[Math.floor(Math.random() * emotes.length)];
  };

  const [timerId, setTimerId] = useState(null);
  
  const triggerMessage = useCallback((text, emote = 'happy') => {
    if (timerId) clearTimeout(timerId);
    
    setCurrentMessage(text);
    setCurrentEmote(emote);
    setMessageVisible(true);

    const newTimer = setTimeout(() => {
      setMessageVisible(false);
    }, 7000);
    setTimerId(newTimer);
  }, [timerId]);

  const triggerRandom = useCallback((category) => {
    const text = getRandomMessage(category);
    const emote = pickEmoteForCategory(category);
    triggerMessage(text, emote);
  }, [triggerMessage]);

  return (
    <MascotContext.Provider value={{
      currentEmote, setCurrentEmote,
      currentMessage, setCurrentMessage,
      isMessageVisible, setMessageVisible,
      triggerMessage, triggerRandom,
      EMOTES,
    }}>
      {children}
    </MascotContext.Provider>
  );
};
