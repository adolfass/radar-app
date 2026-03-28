import { Injectable, OnModuleInit, INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Context } from 'telegraf';
import { message } from 'telegraf/filters';

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
    
    // Set webhook in production
    const nodeEnv = this.configService.get('NODE_ENV');
    if (nodeEnv === 'production' && this.webhookUrl) {
      try {
        await this.telegram.setWebhook(`${this.webhookUrl}/webhook`);
        console.log('Telegram webhook set:', `${this.webhookUrl}/webhook`);
      } catch (error) {
        console.error('Failed to set webhook:', error);
      }
    }
  }

  private setupBot() {
    // Start command
    this.command('start', async (ctx) => {
      const startParam = (ctx as any).startParam;
      
      await ctx.reply(
        '👋 Добро пожаловать в Vizitka Bot!\n\n' +
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
                  web_app: { url: this.configService.get('FRONTEND_URL') || 'https://vizitka.zazvezdu.online' },
                },
              ],
            ],
          },
        },
      );
    });

    // Set main menu
    this.telegram.setMyCommands([
      { command: 'start', description: '🚀 Запустить приложение' },
    ]).catch(err => console.error('Failed to set commands:', err));

    this.telegram.setMyDescription('Vizitka - цифровые визитки для делового нетворкинга')
      .catch(err => console.error('Failed to set description:', err));
  }

  async sendMessage(userId: number, message: string, replyMarkup?: any) {
    try {
      await this.telegram.sendMessage(userId, message, {
        reply_markup: replyMarkup,
        parse_mode: 'HTML',
      });
    } catch (error) {
      console.error(`Failed to send message to user ${userId}:`, error);
    }
  }
}
