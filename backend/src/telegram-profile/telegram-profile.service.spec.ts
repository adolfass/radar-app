import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { TelegramProfileService, TelegramProfile } from './telegram-profile.service';

describe('TelegramProfileService', () => {
  let service: TelegramProfileService;
  let configService: ConfigService;

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue?: string) => {
      const config: Record<string, string> = {
        TELEGRAM_BOT_TOKEN: 'test_token',
        REDIS_HOST: '',
        REDIS_PORT: '6380',
        SOCKS_PROXY_HOST: '',
        SOCKS_PROXY_PORT: '',
      };
      return config[key] ?? defaultValue ?? '';
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TelegramProfileService, { provide: ConfigService, useValue: mockConfigService }],
    }).compile();

    service = module.get<TelegramProfileService>(TelegramProfileService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('lookupByUsername', () => {
    it('should return null for empty username', async () => {
      const result = await service.lookupByUsername('');
      expect(result).toBeNull();
    });

    it('should return null for username with only @', async () => {
      const result = await service.lookupByUsername('@');
      expect(result).toBeNull();
    });

    it('should normalize username by removing @', async () => {
      const fetchSpy = jest.spyOn(service as any, 'fetchBotAPI').mockResolvedValue({ ok: false });
      await service.lookupByUsername('@testuser');
      expect(fetchSpy).toHaveBeenCalledWith('/getChat?chat_id=@testuser');
    });

    it('should return profile when user is found', async () => {
      jest
        .spyOn(service as any, 'fetchBotAPI')
        .mockResolvedValueOnce({
          ok: true,
          result: {
            id: 123456,
            first_name: 'Test',
            last_name: 'User',
            username: 'testuser',
            type: 'private',
            is_premium: true,
            language_code: 'en',
          },
        })
        .mockResolvedValueOnce({
          ok: true,
          result: {
            photos: [[{ file_id: 'photo123' }]],
          },
        });

      jest.spyOn(service as any, 'getFileUrl').mockResolvedValue('https://file.url/photo.jpg');

      const result = await service.lookupByUsername('testuser');

      expect(result).not.toBeNull();
      expect(result?.telegramId).toBe(123456);
      expect(result?.firstName).toBe('Test');
      expect(result?.lastName).toBe('User');
      expect(result?.username).toBe('testuser');
      expect(result?.isPremium).toBe(true);
    });

    it('should return null when user is not found', async () => {
      jest.spyOn(service as any, 'fetchBotAPI').mockResolvedValue({ ok: false });

      const result = await service.lookupByUsername('nonexistent');
      expect(result).toBeNull();
    });

    it('should return null for group/channel chat types', async () => {
      jest.spyOn(service as any, 'fetchBotAPI').mockResolvedValue({
        ok: true,
        result: {
          id: 123,
          type: 'supergroup',
          title: 'Test Group',
        },
      });

      const result = await service.lookupByUsername('testgroup');
      expect(result).toBeNull();
    });
  });

  describe('lookupById', () => {
    it('should return profile when user is found by ID', async () => {
      jest
        .spyOn(service as any, 'fetchBotAPI')
        .mockResolvedValueOnce({
          ok: true,
          result: {
            id: 789,
            first_name: 'ById',
            username: 'byiduser',
            type: 'private',
            is_premium: false,
          },
        })
        .mockResolvedValueOnce({ ok: true, result: { photos: [] } });

      const result = await service.lookupById(789);

      expect(result).not.toBeNull();
      expect(result?.telegramId).toBe(789);
      expect(result?.firstName).toBe('ById');
    });

    it('should return null when user is not found by ID', async () => {
      jest.spyOn(service as any, 'fetchBotAPI').mockResolvedValue({ ok: false });

      const result = await service.lookupById(999999);
      expect(result).toBeNull();
    });
  });

  describe('caching', () => {
    it('should use in-memory cache for repeated lookups', async () => {
      const fetchSpy = jest.spyOn(service as any, 'fetchBotAPI').mockResolvedValue({
        ok: true,
        result: {
          id: 111,
          first_name: 'Cached',
          type: 'private',
        },
      });

      await service.lookupByUsername('cacheduser');
      await service.lookupByUsername('cacheduser');
      await service.lookupByUsername('cacheduser');

      expect(fetchSpy).toHaveBeenCalledTimes(1);
    });
  });
});
