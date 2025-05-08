import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  Query,
  Res,
} from '@nestjs/common';
import axios from 'axios';
import { Response } from 'express';

@Controller('auth')
export class AuthController {
  private readonly clientId = process.env.FB_APP_ID;
  private readonly clientSecret = process.env.FB_APP_SECRET;
  private readonly redirectUri = process.env.FB_REDIRECT_URI;

  @Get('facebook')
  async handleFacebookCallback(
    @Query('code') code: string,
    @Res() res: Response,
  ) {
    if (!code) {
      return res.status(400).send('Missing code');
    }

    try {
      const tokenResponse = await axios.get(
        'https://graph.facebook.com/v18.0/oauth/access_token',
        {
          params: {
            client_id: this.clientId,
            redirect_uri: this.redirectUri,
            client_secret: this.clientSecret,
            code,
          },
        },
      );

      const accessToken = tokenResponse.data.access_token;

      // Optional: exchange for long-lived token
      const longTokenResponse = await axios.get(
        'https://graph.facebook.com/v18.0/oauth/access_token',
        {
          params: {
            grant_type: 'fb_exchange_token',
            client_id: this.clientId,
            client_secret: this.clientSecret,
            fb_exchange_token: accessToken,
          },
        },
      );

      const longLivedToken = longTokenResponse.data.access_token;

      // Save this token to your DB or .env manually for now
      console.log('Long-lived token:', longLivedToken);
      return res.send(
        'Token saved successfully. You can now use WhatsApp API.',
      );
    } catch (error) {
      console.error('OAuth error:', error?.response?.data || error);
      return res.status(500).send('OAuth failed');
    }
  }

  @Get()
  verifyWebhook(
    @Query('hub.mode') mode: string,
    @Query('hub.verify_token') token: string,
    @Query('hub.challenge') challenge: string,
  ): string {
    const VERIFY_TOKEN = 'pingo-verify';

    if (mode === 'subscribe' && token === VERIFY_TOKEN) {
      return challenge;
    }

    throw new HttpException('Forbidden', HttpStatus.FORBIDDEN);
  }
}
