import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { SocksClient } from 'socks';
import * as https from 'https';

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
      return this.fetchViaSocks(url, socksHost, socksPort);
    }

    const res = await fetch(url);
    return res.json();
  }

  private async fetchViaSocks(url: string, proxyHost: string, proxyPort: number): Promise<any> {
    const { hostname, pathname, search } = new URL(url);
    const fullPath = pathname + search;

    try {
      const info = await SocksClient.createConnection({
        command: 'connect',
        destination: {
          host: hostname,
          port: 443,
        },
        proxy: {
          ipaddress: proxyHost,
          port: Number(proxyPort),
          type: 5,
        },
        timeout: 10000,
      });

      return new Promise((resolve, reject) => {
        const options: https.RequestOptions = {
          servername: hostname,
          host: hostname,
          path: fullPath,
          method: 'GET',
          rejectUnauthorized: false,
        };
        (options as any).socket = info.socket;

        const req = https.request(options, (res) => {
          let data = '';
          res.on('data', (chunk) => {
            data += chunk.toString('utf8');
          });
          res.on('end', () => {
            try {
              resolve(JSON.parse(data));
            } catch {
              resolve({ ok: false });
            }
            info.socket.end();
          });
        });
        req.on('error', (e) => {
          reject(e);
          info.socket.end();
        });
        req.setTimeout(10000, () => {
          reject(new Error('SOCKS5 timeout'));
          req.destroy();
        });
        req.end();
      });
    } catch (error) {
      this.logger.error('SOCKS5 connection error:', error);
      throw error;
    }
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
