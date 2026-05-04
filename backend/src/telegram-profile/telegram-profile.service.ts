import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import * as net from 'net';
import * as tls from 'tls';

export interface TelegramProfile {
  telegramId: number;
  firstName: string;
  lastName?: string;
  username?: string;
  bio?: string;
  photoUrl?: string;
  isPremium: boolean;
  languageCode?: string;
}

@Injectable()
export class TelegramProfileService {
  private readonly logger = new Logger(TelegramProfileService.name);
  private readonly botToken: string;
  private readonly redis: Redis | null = null;
  private readonly cachePrefix = 'tg_profile:';
  private readonly cacheTTL = 3600;
  private readonly inMemoryCache = new Map<string, { data: TelegramProfile; expiresAt: number }>();

  constructor(private configService: ConfigService) {
    this.botToken = this.configService.get('TELEGRAM_BOT_TOKEN', '');
    const redisHost = this.configService.get('REDIS_HOST');
    const redisPort = this.configService.get<number>('REDIS_PORT');

    if (redisHost && redisPort) {
      try {
        this.redis = new Redis({ host: redisHost, port: redisPort, lazyConnect: true });
        this.redis.on('error', () => {});
      } catch {
        this.logger.warn('Redis unavailable, using in-memory cache');
      }
    }
  }

  async lookupByUsername(username: string): Promise<TelegramProfile | null> {
    const normalizedUsername = username.replace('@', '').toLowerCase().trim();
    if (!normalizedUsername) return null;

    const cached = await this.getCached(normalizedUsername);
    if (cached) return cached;

    try {
      const chatRes = await this.fetchBotAPI(`/getChat?chat_id=@${normalizedUsername}`);
      if (!chatRes.ok || !chatRes.result || chatRes.result.type !== 'private') {
        return null;
      }

      const chat = chatRes.result;
      let photoUrl: string | undefined;

      if (chat.has_custom_photo) {
        const photosRes = await this.fetchBotAPI(
          `/getUserProfilePhotos?user_id=${chat.id}&limit=1`,
        );
        if (photosRes.ok && photosRes.result?.photos?.[0]) {
          const photo = photosRes.result.photos[0][photosRes.result.photos[0].length - 1];
          photoUrl = await this.getFileUrl(photo.file_id);
        }
      }

      const profile: TelegramProfile = {
        telegramId: chat.id,
        firstName: chat.first_name,
        lastName: chat.last_name,
        username: chat.username,
        bio: chat.bio || chat.description,
        photoUrl,
        isPremium: chat.is_premium || false,
        languageCode: chat.language_code,
      };

      await this.setCached(normalizedUsername, profile);
      return profile;
    } catch (error) {
      this.logger.error(`Failed to lookup username ${normalizedUsername}:`, error);
      return null;
    }
  }

  async lookupById(telegramId: number): Promise<TelegramProfile | null> {
    const cacheKey = `id:${telegramId}`;
    const cached = await this.getCached(cacheKey);
    if (cached) return cached;

    try {
      const chatRes = await this.fetchBotAPI(`/getChat?chat_id=${telegramId}`);
      if (!chatRes.ok || !chatRes.result) return null;

      const chat = chatRes.result;
      let photoUrl: string | undefined;

      if (chat.has_custom_photo) {
        const photosRes = await this.fetchBotAPI(
          `/getUserProfilePhotos?user_id=${chat.id}&limit=1`,
        );
        if (photosRes.ok && photosRes.result?.photos?.[0]) {
          const photo = photosRes.result.photos[0][photosRes.result.photos[0].length - 1];
          photoUrl = await this.getFileUrl(photo.file_id);
        }
      }

      const profile: TelegramProfile = {
        telegramId: chat.id,
        firstName: chat.first_name,
        lastName: chat.last_name,
        username: chat.username,
        bio: chat.bio || chat.description,
        photoUrl,
        isPremium: chat.is_premium || false,
        languageCode: chat.language_code,
      };

      await this.setCached(cacheKey, profile);
      if (chat.username) {
        await this.setCached(chat.username.toLowerCase(), profile);
      }
      return profile;
    } catch (error) {
      this.logger.error(`Failed to lookup telegramId ${telegramId}:`, error);
      return null;
    }
  }

  private async fetchBotAPI(path: string): Promise<any> {
    const socksHost = this.configService.get('SOCKS_PROXY_HOST');
    const socksPort = this.configService.get<number>('SOCKS_PROXY_PORT');

    const url = `https://api.telegram.org/bot${this.botToken}${path}`;

    if (socksHost && socksPort) {
      const response = await this.fetchViaSocks(url, socksHost, socksPort);
      return response;
    }

    const res = await fetch(url);
    return res.json();
  }

  private async fetchViaSocks(url: string, proxyHost: string, proxyPort: number): Promise<any> {
    const { hostname, pathname, search } = new URL(url);
    const fullPath = pathname + search;
    const port = 443;

    return new Promise((resolve, reject) => {
      const socket = net.createConnection({ host: proxyHost, port: proxyPort }, () => {
        const handshake = Buffer.from([0x05, 0x01, 0x00]);
        socket.write(handshake);
      });

      let stage = 0;
      const chunks: Buffer[] = [];

      socket.on('data', (data: Buffer) => {
        chunks.push(data);
        if (stage === 0) {
          if (data[1] === 0x00) {
            const isIp = net.isIP(hostname) !== 0;
            const connectReq = Buffer.concat([
              Buffer.from([0x05, 0x01, 0x00]),
              isIp
                ? Buffer.concat([
                    Buffer.from([0x01]),
                    net.isIP(hostname) === 4
                      ? Buffer.from(hostname.split('.').map(Number))
                      : Buffer.alloc(16),
                  ])
                : Buffer.concat([Buffer.from([0x03, hostname.length]), Buffer.from(hostname)]),
              Buffer.from([(port >> 8) & 0xff, port & 0xff]),
            ]);
            socket.write(connectReq);
            stage = 1;
          } else {
            socket.end();
            reject(new Error('SOCKS5 auth failed'));
          }
        } else if (stage === 1) {
          if (data[1] === 0x00) {
            const tlsSocket = tls.connect({ socket, servername: hostname }, () => {
              const httpReq = `GET ${fullPath} HTTP/1.1\r\nHost: ${hostname}\r\n\r\n`;
              tlsSocket.write(httpReq);
              stage = 2;
            });

            tlsSocket.on('data', (tlsData: Buffer) => {
              chunks.push(tlsData);
            });

            tlsSocket.on('end', () => {
              const full = Buffer.concat(chunks);
              const body = full.toString('utf8').split('\r\n\r\n')[1] || '{}';
              try {
                resolve(JSON.parse(body));
              } catch {
                resolve({ ok: false });
              }
              socket.end();
            });

            tlsSocket.on('error', reject);
          } else {
            socket.end();
            reject(new Error(`SOCKS5 connect failed: ${data[1]}`));
          }
        }
      });

      socket.on('error', reject);
      socket.setTimeout(10000, () => {
        socket.destroy();
        reject(new Error('SOCKS5 timeout'));
      });
    });
  }

  private async getFileUrl(fileId: string): Promise<string> {
    const res = await this.fetchBotAPI(`/getFile?file_id=${fileId}`);
    if (res.ok && res.result?.file_path) {
      return `https://api.telegram.org/file/bot${this.botToken}/${res.result.file_path}`;
    }
    return '';
  }

  private async getCached(key: string): Promise<TelegramProfile | null> {
    if (this.redis) {
      try {
        const cached = await this.redis.get(`${this.cachePrefix}${key}`);
        if (cached) return JSON.parse(cached);
      } catch {}
    }
    const mem = this.inMemoryCache.get(key);
    if (mem && mem.expiresAt > Date.now()) {
      return mem.data;
    }
    return null;
  }

  private async setCached(key: string, profile: TelegramProfile): Promise<void> {
    if (this.redis) {
      try {
        await this.redis.setex(`${this.cachePrefix}${key}`, this.cacheTTL, JSON.stringify(profile));
      } catch {}
    }
    this.inMemoryCache.set(key, { data: profile, expiresAt: Date.now() + this.cacheTTL * 1000 });
  }
}
