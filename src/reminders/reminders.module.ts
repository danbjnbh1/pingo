import { Module } from '@nestjs/common';
import { ReminderController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import { GeminiService } from './gemini.service';
import { ReminderCron } from './reminders.cron';
import { AuthController } from './auth.controller';
import { FacebookTokenRefreshCron } from './facebook-refresh-token.cron';
import { SharedModule } from 'src/shared/shared.module';

@Module({
  imports: [SharedModule],
  controllers: [ReminderController, AuthController],
  providers: [
    RemindersService,
    ReminderCron,
    FacebookTokenRefreshCron,
    GeminiService,
  ],
})
export class RemindersModule {}
