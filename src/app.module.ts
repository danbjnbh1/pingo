// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { RemindersModule } from './reminders/reminders.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }), // Loads .env
    ScheduleModule.forRoot(), // Enables cron jobs
    RemindersModule,
  ],
})
export class AppModule {}
