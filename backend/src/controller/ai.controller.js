import axios from 'axios';
import { asyncHandler } from '../utils/AsyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { ApiError } from '../utils/ApiError.js';

const generateAIResponse = asyncHandler(async (req, res) => {
    const { message, history = [] } = req.body;
    
    if (!message) {
        throw new ApiError(400, "Message is required");
    }

    try {
        const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
        const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

        // Build conversation context
        const contents = history.slice(-10).map(msg => ({
            role: msg.isAIMessage ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));
        
        // Add current message
        contents.push({
            role: 'user',
            parts: [{ text: message }]
        });

        const response = await axios.post(
            GEMINI_API_URL,
            { contents },
            {
                headers: {
                    'Content-Type': 'application/json',
                    'X-goog-api-key': GEMINI_API_KEY
                }
            }
        );

        const aiResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        
        if (!aiResponse) {
            throw new ApiError(500, "Invalid response from AI service");
        }

        return res
            .status(200)
            .json(new ApiResponse(200, { response: aiResponse }, "AI response generated successfully"));
            
    } catch (error) {
        console.error('AI Service Error:', error);
        
        if (error.response?.status === 401) {
            throw new ApiError(401, "AI service authentication failed");
        } else if (error.response?.status === 429) {
            throw new ApiError(429, "Rate limit exceeded. Please try again later");
        }
        
        throw new ApiError(500, "Failed to generate AI response");
    }
});

export { generateAIResponse };