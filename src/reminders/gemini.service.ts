import { Injectable } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GeminiService {
  async parseReminder(
    text: string,
  ): Promise<{ content: string; time: string } | null> {
    const now = new Date().toISOString();

    const prompt = `Now is ${now}.
    Parse the following Hebrew message and return JSON with two fields:
    { "content": "what to remind", "time": "YYYY-MM-DDTHH:MM:SSZ" }
    
    Use ISO 8601 format for time, including seconds and timezone.
    Use the same language of the message to the content field.
    Text: "${text}"`;

    const url =
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

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
        const cleaned = textResponse.replace(/```json|```/g, '').trim();

        try {
          const parsed = JSON.parse(cleaned);

          if (!parsed.content || parsed.time === undefined) {
            console.error('Invalid structure:', parsed);
            return null;
          }

          return parsed;
        } catch (err) {
          console.error('Failed to parse Gemini response:', err.message);
          return null;
        }
      } catch (err) {
        console.error('Failed to parse Gemini response:', err.message);
        return null;
      }
    } catch (err) {
      console.error('Gemini parse error:', err);
      return null;
    }
  }
}
