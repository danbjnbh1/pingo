import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GeminiService {
  async parseReminder(
    text: string,
  ): Promise<{ content: string; time: string } | null> {
    const prompt = `Parse the following message and return JSON with two fields:
{ "content": "what to remind", "time": "HH:MM" }
Text: "${text}"`;

    const url =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

    try {
      const response = await axios.post(
        url,
        {
          contents: [{ parts: [{ text: prompt }] }],
        },
        {
          headers: { 'Content-Type': 'application/json' },
          params: { key: process.env.GEMINI_API_KEY },
        },
      );

      const textResponse =
        response.data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!textResponse) {
        console.error('No response text from Gemini');
        return null;
      }

      try {
        const parsed = JSON.parse(textResponse);
        if (!parsed.content || !parsed.time) {
          console.error('Invalid response structure from Gemini:', parsed);
          return null;
        }
        return parsed;
      } catch (err) {
        console.error('Failed to parse Gemini response:', err.message);
        return null;
      }
    } catch (err) {
      console.error('Gemini parse error:', err.message);
      return null;
    }
  }
}
