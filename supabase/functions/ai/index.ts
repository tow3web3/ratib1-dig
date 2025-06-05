import OpenAI from "npm:openai@4.28.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// Use environment variable for API key
const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");

// Add better error handling for missing API key
if (!OPENAI_API_KEY || !OPENAI_API_KEY.startsWith('sk-')) {
  throw new Error('Invalid or missing OpenAI API key. Please ensure OPENAI_API_KEY is set in your environment variables and starts with "sk-".');
}

const openai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      status: 204,
      headers: corsHeaders 
    });
  }

  try {
    const { type, content } = await req.json();
    
    if (!content && type === 'token') {
      throw new Error('Content is required for token generation');
    }
    
    let systemPrompt = '';
    let userPrompt = '';
    
    if (type === 'token') {
      systemPrompt = `You are a memecoin expert specializing in Solana tokens. Generate creative and memorable token names, symbols, and descriptions based on trending content. Follow these rules:
        - Names should be catchy and memorable, max 32 characters
        - Symbols should be 2-4 characters, all caps
        - Descriptions should be engaging and viral-worthy
        - Keep descriptions under 200 characters
        - Focus on meme culture and community engagement
        - Avoid offensive or inappropriate content
        - Consider the source platform (${content.type}) and author (${content.author}) when generating names
        - If the content is from social media, incorporate trending elements
        - If the content is from news sources, focus on current events angle
        - ALWAYS return valid JSON with name, symbol, and description fields`;

      userPrompt = `Generate a token name, symbol, and description based on this content:
        Title: ${content.title || 'N/A'}
        Description: ${content.description || 'N/A'}
        Source: ${content.type || 'N/A'}
        Author: ${content.author || 'N/A'}
        URL: ${content.url || 'N/A'}

        Consider these aspects when generating:
        1. The platform it's from (${content.type})
        2. The author's influence (${content.author})
        3. The current context and virality potential
        4. Any trending hashtags or keywords in the content`;
    } else if (type === 'advisor') {
      systemPrompt = `You are a crypto market analyst specializing in memecoin trends. Your task is to analyze token names and patterns to identify emerging trends. Follow these rules:
        - Focus on identifying patterns in token names and themes
        - Keep responses concise and engaging
        - Use emojis to make the response more engaging
        - Format responses as a single sentence
        - Highlight key trends or themes`;

      userPrompt = `Analyze current market trends and suggest potential token themes. Format your response as a single sentence starting with "🔥 Meta Alert:"`;
    } else {
      throw new Error('Invalid request type');
    }

    try {
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo-1106",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.8,
        max_tokens: 150
      });

      if (!completion.choices?.[0]?.message?.content) {
        throw new Error('No response from OpenAI');
      }

      const response = completion.choices[0].message.content;
      
      // Validate JSON response for token type
      if (type === 'token') {
        try {
          const parsed = JSON.parse(response);
          if (!parsed.name || !parsed.symbol || !parsed.description) {
            throw new Error('Missing required fields in response');
          }
          // Ensure symbol is uppercase and within length limits
          parsed.symbol = parsed.symbol.toUpperCase().slice(0, 4);
          // Ensure name is within length limit
          parsed.name = parsed.name.slice(0, 32);
          // Ensure description is within length limit
          parsed.description = parsed.description.slice(0, 200);
          
          return new Response(
            JSON.stringify(parsed),
            { 
              headers: { 
                'Content-Type': 'application/json',
                ...corsHeaders
              } 
            }
          );
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          throw new Error('Invalid response format from OpenAI');
        }
      }

      return new Response(
        response,
        { 
          headers: { 
            'Content-Type': 'application/json',
            ...corsHeaders
          } 
        }
      );
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      throw new Error('Failed to generate token details: ' + openaiError.message);
    }
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Failed to process request. Please try again.'
      }), 
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          ...corsHeaders
        }
      }
    );
  }
});