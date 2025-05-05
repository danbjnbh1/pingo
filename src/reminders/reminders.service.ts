import { Injectable } from '@nestjs/common';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

@Injectable()
export class RemindersService {
  async addReminder(phone: string, content: string, time: string) {
    await supabase.from('reminders').insert([{ phone, content, time }]);
  }

  async getRemindersForNow(): Promise<any[]> {
    const now = new Date();
    const timeNow = now.toTimeString().slice(0, 5);
    const { data } = await supabase
      .from('reminders')
      .select('*')
      .eq('time', timeNow)
      .eq('sent', false);
    return data || [];
  }

  async markAsSent(id: string) {
    await supabase.from('reminders').update({ sent: true }).eq('id', id);
  }
}
