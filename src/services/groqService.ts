import { ChatSession, ChatMessage, Salon } from '../types';

// Load initial chats from localStorage
export const loadChatHistory = (): ChatSession[] => {
  const data = localStorage.getItem('jalwaa_chat_history');
  if (data) {
    try {
      return JSON.parse(data);
    } catch {
      return [];
    }
  }
  return [];
};

// Save chats to localStorage
export const saveChatHistory = (sessions: ChatSession[]) => {
  localStorage.setItem('jalwaa_chat_history', JSON.stringify(sessions));
};

export const groqService = {
  getAIRecommendation: async (
    chatHistory: { role: 'user' | 'assistant'; content: string }[],
    base64Image?: string,
    salonsContext?: Salon[]
  ): Promise<{ text: string; recommendedSalons?: Salon[] }> => {
    
    // Prepare the message history payload (last 5 messages for token optimization)
    const recentHistory = chatHistory.slice(-5).map(m => ({
      role: m.role,
      content: m.content
    }));

    // Inject active Mumbai salons context into the prompt so Groq knows what exists!
    const contextText = salonsContext && salonsContext.length > 0
      ? `Here are real premium salons currently available in Mumbai for your matching reference:\n` +
        salonsContext.map(s => `- "${s.name}" in ${s.address.split(',')[1] || 'Mumbai'} (Rating: ${s.rating}, Top services: ${s.services.map(sr => sr.name).slice(0, 2).join(', ')}).`).join('\n')
      : "Standard premium Mumbai salons (BBlunt, JCB Juhu, Envi, Truefitt & Hill) are available.";

    const systemPrompt = `
You are the elite Jalwaa AI Style Expert and Salon Matcher for Mumbai, India.
Your goal is to provide exceptional, professional beauty, hair, skin, and grooming consultation.

RULES:
1. Always suggest specific, real Mumbai salons (e.g. BBlunt Bandra, JCB Juhu, Envi Andheri, Truefitt & Hill Colaba) and specific named services when matching user needs.
2. Maintain a highly professional, polite, and reassuring tone.
3. Keep responses clean, elegant, and strictly under 3 to 4 sentences. Be highly specific!
4. Analyze style, hair types, skin tones, face shapes, and suggest dynamic pricing ranges (Budget vs Premium).
5. If analyzing an image (like face shape or skin glow), give specific style tips (e.g., layered lob, soft balayage).

SALON MATCHING CONTEXT:
${contextText}
`;

    try {
      const response = await fetch('/api/groq/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: recentHistory,
          base64Image: base64Image || undefined,
          systemPrompt
        })
      });

      if (!response.ok) {
        throw new Error('Groq network service failed');
      }

      const resData = await response.json();
      
      // Attempt to intelligently parse or match salon objects from the text response
      let matchedSalons: Salon[] = [];
      if (salonsContext && salonsContext.length > 0) {
        matchedSalons = salonsContext.filter(s => {
          const namePart = s.name.toLowerCase().split(' ')[0];
          return resData.text.toLowerCase().includes(namePart) || resData.text.toLowerCase().includes(s.name.toLowerCase());
        });
      }

      return {
        text: resData.text,
        recommendedSalons: matchedSalons.length > 0 ? matchedSalons.slice(0, 2) : undefined
      };
    } catch (error) {
      console.error("Error calling Groq service:", error);
      return {
        text: "I apologize, but my style server is currently offline or the Groq key is missing. For a premium style experience, I highly recommend booking a 'Classic Haircut' or 'Balayage' at BBlunt Salon & Academy in Bandra West, or scheduling a relaxing facial ritual at Jean-Claude Biguine in Juhu!",
        recommendedSalons: salonsContext ? salonsContext.slice(0, 1) : undefined
      };
    }
  }
};
