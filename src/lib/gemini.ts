const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

// Debug logging
console.log('Gemini API Key loaded:', GEMINI_API_KEY ? 'Yes' : 'No');
console.log('Gemini API URL:', GEMINI_API_URL);

export interface GeminiResponse {
  candidates: Array<{
    content: {
      parts: Array<{
        text: string;
      }>;
    };
  }>;
  error?: {
    message: string;
    code: number;
  };
}

export const generateAIResponse = async (userInput: string): Promise<string> => {
  console.log('Generating AI response for:', userInput);
  console.log('API Key available:', !!GEMINI_API_KEY);
  
  if (!GEMINI_API_KEY) {
    console.error('Gemini API key not found');
    // Fallback responses based on user input
    const lowerInput = userInput.toLowerCase();
    if (lowerInput.includes('culture') || lowerInput.includes('fest')) {
      return "I found some cultural festivals for you! 🎭 Let me search our database...";
    } else if (lowerInput.includes('concert') || lowerInput.includes('music')) {
      return "Great! Let me find some concerts for you! 🎵";
    } else if (lowerInput.includes('sport') || lowerInput.includes('game')) {
      return "Awesome! Let me find some sports events for you! ⚽";
    } else if (lowerInput.includes('what') || lowerInput.includes('how') || lowerInput.includes('when')) {
      return "I'd be happy to help! Could you be more specific about what kind of events you're looking for? 🎪";
    } else {
      return "I can help you find events! What are you looking for? 🎪";
    }
  }

  try {
    console.log('Calling Gemini API...');
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-goog-api-key': GEMINI_API_KEY
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: `You are EventAI, a helpful assistant for finding events. User is looking for events: "${userInput}".

Generate a friendly, helpful response that:
1. Acknowledges their request
2. Shows enthusiasm
3. Keeps it under 2 sentences
4. Uses appropriate emojis
5. If they ask "what are" or similar questions, ask them to be more specific

Example responses:
- "I found some cultural festivals for you! 🎭 Let me search our database..."
- "Great! Let me find some concerts for you! 🎵"
- "I'd be happy to help! Could you be more specific about what kind of events you're looking for? 🎪"
- "Awesome! Let me find some sports events for you! ⚽"

Keep it natural and conversational. If the user's request is unclear, ask them to clarify.`
              }
            ]
          }
        ]
      })
    });

    console.log('Gemini API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error response:', errorText);
      throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
    }

    const data: GeminiResponse = await response.json();
    console.log('Gemini API response data:', data);
    
    // Check for API errors
    if (data.error) {
      console.error('Gemini API returned error:', data.error);
      throw new Error(`Gemini API error: ${data.error.message}`);
    }
    
    if (data.candidates && data.candidates.length > 0) {
      const aiResponse = data.candidates[0].content.parts[0].text;
      console.log('AI Response generated:', aiResponse);
      return aiResponse;
    } else {
      console.error('No candidates in Gemini response');
      throw new Error('No response from Gemini API');
    }
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Fallback responses based on user input
    const lowerInput = userInput.toLowerCase();
    if (lowerInput.includes('culture') || lowerInput.includes('fest')) {
      return "I found some cultural festivals for you! 🎭 Let me search our database...";
    } else if (lowerInput.includes('concert') || lowerInput.includes('music')) {
      return "Great! Let me find some concerts for you! 🎵";
    } else if (lowerInput.includes('sport') || lowerInput.includes('game')) {
      return "Awesome! Let me find some sports events for you! ⚽";
    } else if (lowerInput.includes('what') || lowerInput.includes('how') || lowerInput.includes('when')) {
      return "I'd be happy to help! Could you be more specific about what kind of events you're looking for? 🎪";
    } else {
      return "I can help you find events! What are you looking for? 🎪";
    }
  }
};
