import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Telegraf, Context } from 'telegraf';
import { Agent } from 'https';
import * as net from 'net';

class SocksAgent extends Agent {
  private proxyHost: string;
  private proxyPort: number;

  constructor(proxyHost: string, proxyPort: number) {
    super();
    this.proxyHost = proxyHost;
    this.proxyPort = proxyPort;
  }

  createConnection(options: any, callback: any): any {
    const socket = net.createConnection({
      host: this.proxyHost,
      port: this.proxyPort,
    });

    socket.on('connect', () => {
      const host = options.host || options.hostname;
      const port = options.port;

      const handshake = Buffer.from([
        0x05, // SOCKS5 version
        0x01, // 1 auth method
        0x00, // no auth
      ]);
      socket.write(handshake);
    });

    let stage = 0;
    socket.on('data', (data: Buffer) => {
      if (stage === 0) {
        if (data[1] === 0x00) {
          const host = options.host || options.hostname;
          const port = options.port;
          const isIp = net.isIP(host) !== 0;

          const connectReq = Buffer.concat([
            Buffer.from([0x05, 0x01, 0x00]),
            isIp
              ? Buffer.concat([
                  Buffer.from([0x01]),
                  net.isIP(host) === 4
                    ? Buffer.from(host.split('.').map(Number))
                    : Buffer.alloc(16),
                ])
              : Buffer.concat([
                  Buffer.from([0x03, host.length]),
                  Buffer.from(host),
                ]),
            Buffer.from([(port >> 8) & 0xff, port & 0xff]),
          ]);
          socket.write(connectReq);
          stage = 1;
        } else {
          callback(new Error('SOCKS5 auth failed'));
        }
      } else if (stage === 1) {
        if (data[1] === 0x00) {
          callback(null, socket);
        } else {
          callback(new Error(`SOCKS5 connect failed: ${data[1]}`));
        }
      }
    });

    socket.on('error', callback);
  }
}

@Injectable()
export class TelegramService extends Telegraf<Context> implements OnModuleInit {
  private webhookUrl: string;

  constructor(private configService: ConfigService) {
    const token = configService.get('TELEGRAM_BOT_TOKEN');
    const socksHost = configService.get('SOCKS_PROXY_HOST');
    const socksPort = configService.get<number>('SOCKS_PROXY_PORT');

    const options: any = {};
    if (socksHost && socksPort) {
      options.telegram = {
        agent: new SocksAgent(socksHost, socksPort),
      };
    }

    super(token || '', options);

    this.webhookUrl = this.configService.get('TELEGRAM_WEBHOOK_URL') || '';
  }

  async onModuleInit() {
    const token = this.configService.get('TELEGRAM_BOT_TOKEN');
    if (!token) {
      console.warn('Telegram bot token not configured');
      return;
    }

    this.setupBot();

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
                      this.configService.get('FRONTEND_URL') || 'https://radar.strateg.space',
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
