// facebook-token-refresh.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SupabaseClient } from '@supabase/supabase-js';
import axios from 'axios';
import { SupabaseService } from 'src/shared/supabase.service';

@Injectable()
export class FacebookTokenRefreshCron {
  private readonly logger = new Logger(FacebookTokenRefreshCron.name);
  private readonly clientId = process.env.FB_APP_ID;
  private readonly clientSecret = process.env.FB_APP_SECRET;
  private supabase: SupabaseClient;

  constructor(private readonly supabaseService: SupabaseService) {
    this.supabase = supabaseService.getClient();
  }

  @Cron(CronExpression.EVERY_1ST_DAY_OF_MONTH_AT_NOON)
  async refreshToken() {
    this.logger.log('Refreshing token');

    const { data: tokenRecord, error: fetchError } = await this.supabase
      .from('tokens')
      .select('token')
      .eq('id', 'facebook')
      .single();

    if (fetchError || !tokenRecord) {
      this.logger.warn('Could not fetch token from database');
      return;
    }

    const currentToken = tokenRecord.token;

    try {
      const response = await axios.get(
        'https://graph.facebook.com/v18.0/oauth/access_token',
        {
          params: {
            grant_type: 'fb_exchange_token',
            client_id: this.clientId,
            client_secret: this.clientSecret,
            fb_exchange_token: currentToken,
          },
        },
      );

      const newToken = response.data.access_token;
      this.logger.log('Token refreshed successfully');

      const { error: updateError } = await this.supabase
        .from('tokens')
        .update({
          token: newToken,
          refreshed_at: new Date().toISOString(),
          expires_at: new Date(
            Date.now() + 60 * 24 * 60 * 60 * 1000, // 60 days
          ).toISOString(),
        })
        .eq('id', 'facebook');

      if (updateError) {
        this.logger.error('Failed to update token in database', updateError);
      } else {
        this.logger.log('Token updated in database');
      }
    } catch (error) {
      this.logger.error(
        'Failed to refresh token:',
        error?.response?.data || error,
      );
    }
  }
}
