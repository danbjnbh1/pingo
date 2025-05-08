import { Injectable } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ReminderCron {
  constructor(private readonly reminderService: RemindersService) {}

  @Cron('*/1 * * * *') // every minute
  async handleCron() {
    console.log('Running reminder dispatch cron');

    const reminders = await this.reminderService.getRemindersForNow();
    for (const reminder of reminders) {
      try {
        await this.reminderService.sendWhatsAppMessage(
          reminder.phone,
          `תזכורת: ${reminder.content}`,
        );
        await this.reminderService.markAsSent(reminder.id);

        console.log(`Reminder sent to ${reminder.phone}: ${reminder.content}`);
      } catch (error) {
        console.error(`Failed to send reminder to ${reminder.phone}`, error);
      }
    }
  }
}
