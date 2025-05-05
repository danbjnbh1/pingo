import { Controller, Post, Body, Header } from '@nestjs/common';
import { RemindersService } from './reminders.service';
import { GeminiService } from './gemini.service';
import { twiml } from 'twilio';

@Controller('whatsapp')
export class ReminderController {
  constructor(
    private readonly remindersService: RemindersService,
    private readonly geminiService: GeminiService,
  ) {}

  @Post()
  @Header('Content-Type', 'text/xml') // Nest יוסיף את הכותרת בעצמו
  async receiveMessage(@Body() body: any): Promise<string> {
    const msg = body.Body;
    const from = body.From;
    const twimlResponse = new twiml.MessagingResponse();

    const parsed = await this.geminiService.parseReminder(msg);

    if (!parsed || !parsed.time || !parsed.content) {
      twimlResponse.message(
        'לא הצלחתי להבין את ההודעה. נסה: תזכיר לי לקנות חלב ב-18:30',
      );
    } else {
      await this.remindersService.addReminder(
        from,
        parsed.content,
        parsed.time,
      );
      twimlResponse.message(`תזכורת ל־${parsed.time} נשמרה ✅`);
    }

    return twimlResponse.toString();
  }
}
