import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import { SupabaseService } from 'src/shared/supabase.service';
import { GeminiService } from './gemini.service';

@Injectable()
export class RemindersService {
  private supabase: SupabaseClient;
  private readonly apiUrl = 'https://graph.facebook.com/v18.0';
  private readonly FB_WHATSAPP_PHONE_ID = process.env.FB_WHATSAPP_PHONE_ID;
  private readonly FB_LONG_LIVED_TOKEN = process.env.FB_LONG_LIVED_TOKEN;

  constructor(
    readonly supabaseService: SupabaseService,
    private readonly geminiService: GeminiService,
  ) {
    this.supabase = supabaseService.getClient();
  }

  async sendWhatsAppMessage(to: string, text: string): Promise<void> {
    try {
      await axios.post(
        `${this.apiUrl}/${this.FB_WHATSAPP_PHONE_ID}/messages`,
        {
          messaging_product: 'whatsapp',
          to: to.startsWith('+') ? to.replace('+', '') : to,
          type: 'text',
          text: { body: text },
        },
        {
          headers: {
            Authorization: `Bearer ${this.FB_LONG_LIVED_TOKEN}`,
            'Content-Type': 'application/json',
          },
        },
      );
    } catch (error) {
      console.error(
        'Failed to send WhatsApp message:',
        error?.response?.data || error,
      );
      throw new HttpException(
        'Failed to send WhatsApp message',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async addReminder(phone: string, content: string, time: string) {
    await this.supabase.from('reminders').insert([{ phone, content, time }]);
    console.log('Added reminder');
  }

  async getRemindersForNow(): Promise<any[]> {
    const now = new Date();
    now.setSeconds(60, 0);
    const isoNow = now.toISOString();

    const { data } = await this.supabase
      .from('reminders')
      .select('*')
      .eq('sent', false)
      .lte('time', isoNow);
    return data || [];
  }

  async markAsSent(id: string) {
    await this.supabase.from('reminders').update({ sent: true }).eq('id', id);
  }

  async processIncomingMessage(body: any): Promise<string> {
    const entry = body?.entry?.[0];
    const changes = entry?.changes?.[0];
    const message = changes?.value?.messages?.[0];

    if (!message || !message.text?.body) {
      return 'EVENT_RECEIVED';
    }

    const msg = message.text.body;
    const from = message.from;

    const parsed = await this.geminiService.parseReminder(msg);

    if (!parsed || !parsed.time || !parsed.content) {
      await this.sendWhatsAppMessage(
        from,
        'לא הצלחתי להבין את ההודעה. נסה: תזכיר לי לקנות חלב ב-18:30',
      );
    } else {
      const humanReadableTime = new Date(parsed.time).toLocaleString('he-IL', {
        dateStyle: 'full',
        timeStyle: 'short',
        timeZone: 'Asia/Jerusalem',
      });

      await this.addReminder(from, parsed.content, parsed.time);
      await this.sendWhatsAppMessage(
        from,
        `תזכורת ל־${humanReadableTime} נשמרה ✅`,
      );
    }

    return 'EVENT_RECEIVED';
  }
}
