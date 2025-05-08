import { Controller, Post, Body } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { GeminiService } from './gemini.service';

@Controller('whatsapp')
export class ReminderController {
  constructor(
    private readonly remindersService: RemindersService,
    private readonly geminiService: GeminiService,
  ) {}

  @Post()
  async receiveMessage(@Body() body: any): Promise<string> {
    console.log('Received message');
    return this.remindersService.processIncomingMessage(body);
  }
}
