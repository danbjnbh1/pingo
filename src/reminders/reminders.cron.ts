import { Injectable } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { Cron } from '@nestjs/schedule';
import * as twilio from 'twilio';

@Injectable()
export class ReminderCron {
  private client;

  constructor(private readonly reminderService: RemindersService) {
    this.client = twilio(
      process.env.TWILIO_ACCOUNT_SID,
      process.env.TWILIO_AUTH_TOKEN,
    );
  }

  @Cron('*/1 * * * *')
  async handleCron() {
    const reminders = await this.reminderService.getRemindersForNow();
    for (const r of reminders) {
      await this.client.messages.create({
        from: process.env.TWILIO_PHONE,
        to: r.phone,
        body: `🔔 תזכורת: ${r.content}`,
      });
      await this.reminderService.markAsSent(r.id);
    }
  }
}
