import { Module } from '@nestjs/common';
import { ReminderController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import { GeminiService } from './gemini.service';
import { ReminderCron } from './reminders.cron';

@Module({
  controllers: [ReminderController],
  providers: [RemindersService, ReminderCron, GeminiService],
})
export class RemindersModule {}
