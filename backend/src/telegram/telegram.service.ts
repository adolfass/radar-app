import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Context } from 'telegraf';

@Injectable()
export class TelegramService extends Telegraf<Context> implements OnModuleInit {
  private webhookUrl: string;

  constructor(private configService: ConfigService) {
    const token = configService.get('TELEGRAM_BOT_TOKEN');
    super(token || '');
    this.webhookUrl = this.configService.get('TELEGRAM_WEBHOOK_URL') || '';
  }

  async onModuleInit() {
    const token = this.configService.get('TELEGRAM_BOT_TOKEN');
    if (!token) {
      console.warn('Telegram bot token not configured');
      return;
    }

    this.setupBot();

    // Устанавливаем webhook асинхронно без блокировки
    const nodeEnv = this.configService.get('NODE_ENV');
    if (nodeEnv === 'production' && this.webhookUrl) {
      this.telegram
        .setWebhook(`${this.webhookUrl}/webhook`)
        .then(() => console.log('Telegram webhook set:', `${this.webhookUrl}/webhook`))
        .catch((err) => console.error('Failed to set webhook:', err));
    }
  }

  private setupBot() {
    this.command('start', async (ctx: any) => {
      await ctx.reply(
        '👋 Добро пожаловать в Radar Bot!\n\n' +
          '📇 Создавайте цифровые визитки\n' +
          '🤝 Обменивайтесь контактами через QR-коды\n' +
          '📅 Участвуйте в деловых событиях\n' +
          '💰 Зарабатывайте баллы в реферальной программе\n\n' +
          'Нажмите кнопку ниже, чтобы начать:',
        {
          reply_markup: {
            inline_keyboard: [
              [
                {
                  text: '🚀 Открыть приложение',
                  web_app: {
                    url:
                      this.configService.get('FRONTEND_URL') || 'https://radar.zazvezdu.online',
                  },
                },
              ],
            ],
          },
        },
      );
    });

    this.telegram
      .setMyCommands([{ command: 'start', description: '🚀 Запустить приложение' }])
      .catch(() => {});
  }
}
