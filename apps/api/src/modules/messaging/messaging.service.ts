import { Injectable, Logger } from '@nestjs/common';
import { AppConfigService } from '../../config/app-config.service';

export type OtpPurpose = 'EMAIL_VERIFY' | 'PHONE_VERIFY' | 'PASSWORD_RESET';

export interface OtpMessage {
  channel: 'email' | 'sms';
  to: string;
  code: string;
  purpose: OtpPurpose;
  language: string;
  expiresInMinutes: number;
}

const subjects: Record<OtpPurpose, Record<string, string>> = {
  EMAIL_VERIFY: { en: 'Verify your GYMOVA email', so: 'Xaqiiji emailkaaga GYMOVA' },
  PHONE_VERIFY: { en: 'Your GYMOVA verification code', so: 'Koodhka xaqiijinta GYMOVA' },
  PASSWORD_RESET: { en: 'Reset your GYMOVA password', so: 'Dib u deji erayga sirta GYMOVA' },
};

/**
 * Outbound email/SMS. The `console` provider (development) writes messages to the log instead of sending them;
 * it never logs codes in production. Real SMTP/SMS providers plug in here without changing callers.
 */
@Injectable()
export class MessagingService {
  private readonly logger = new Logger(MessagingService.name);

  constructor(private readonly config: AppConfigService) {}

  async sendOtp(message: OtpMessage): Promise<void> {
    const provider = message.channel === 'email' ? this.config.messaging.emailProvider : this.config.messaging.smsProvider;
    const subject = subjects[message.purpose][message.language] ?? subjects[message.purpose].en;

    if (provider === 'console') {
      if (this.config.isProduction) {
        this.logger.warn(`No ${message.channel} provider configured in production; "${subject}" was not delivered.`);
        return;
      }
      this.logger.log(
        `[${message.channel.toUpperCase()} → ${message.to}] ${subject}: code ${message.code} (expires in ${message.expiresInMinutes} min)`,
      );
      return;
    }

    this.logger.error(`Messaging provider "${provider}" is not implemented; "${subject}" was not delivered.`);
  }
}
