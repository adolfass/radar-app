import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: JwtService;
  let configService: ConfigService;

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get<JwtService>(JwtService);
    configService = module.get<ConfigService>(ConfigService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('validateUser', () => {
    const validInitData = (hash: string) =>
      `user=%7B%22id%22%3A12345%7D&query_id=test&hash=${hash}`;

    const createValidHash = (botToken: string, initData: string) => {
      const urlParams = new URLSearchParams(initData);
      urlParams.delete('hash');

      const sortedParams = Array.from(urlParams.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

      const dataCheckString = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
      return crypto.createHmac('sha256', dataCheckString).update(sortedParams).digest('hex');
    };

    it('should validate user and return token', async () => {
      const botToken = 'test:bot_token';
      const initData = 'user=%7B%22id%22%3A12345%2C%22first_name%22%3A%22Test%22%7D&query_id=test';
      const hash = createValidHash(botToken, initData);
      const fullInitData = `${initData}&hash=${hash}`;

      mockConfigService.get.mockReturnValue(botToken);
      mockPrisma.user.findUnique.mockResolvedValue({
        id: 1,
        telegramId: BigInt(12345),
        username: null,
        firstName: 'Test',
        lastName: null,
        isOrganizer: false,
        balance: 0,
      });
      mockJwtService.signAsync.mockResolvedValue('jwt-token');

      const result = await service.validateUser({ initData: fullInitData });

      expect(result).toEqual({
        user: {
          id: 1,
          telegramId: '12345',
          username: null,
          firstName: 'Test',
          lastName: null,
          isOrganizer: false,
          balance: 0,
        },
        token: 'jwt-token',
      });
    });

    it('should create new user if not found', async () => {
      const botToken = 'test:bot_token';
      const initData = 'user=%7B%22id%22%3A12345%2C%22first_name%22%3A%22Test%22%7D&query_id=test';
      const hash = createValidHash(botToken, initData);
      const fullInitData = `${initData}&hash=${hash}`;

      mockConfigService.get.mockReturnValue(botToken);
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        id: 2,
        telegramId: BigInt(12345),
        username: null,
        firstName: 'Test',
        lastName: null,
        isOrganizer: false,
        balance: 0,
      });
      mockJwtService.signAsync.mockResolvedValue('jwt-token');

      await service.validateUser({ initData: fullInitData });

      expect(mockPrisma.user.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          telegramId: BigInt(12345),
          firstName: 'Test',
        }),
      });
    });

    it('should throw error on invalid hash', async () => {
      mockConfigService.get.mockReturnValue('test:bot_token');

      await expect(
        service.validateUser({ initData: 'user=%7B%22id%22%3A12345%7D&hash=invalid' }),
      ).rejects.toThrow('Invalid Telegram data');
    });

    it('should throw error when bot token is missing', async () => {
      mockConfigService.get.mockReturnValue(null);

      await expect(
        service.validateUser({ initData: 'user=%7B%22id%22%3A12345%7D&hash=test' }),
      ).rejects.toThrow('Invalid Telegram data');
    });

    it('should throw error when no user data in initData', async () => {
      const botToken = 'test:bot_token';
      const initData = 'query_id=test';
      const hash = createValidHash(botToken, initData);
      const fullInitData = `${initData}&hash=${hash}`;

      mockConfigService.get.mockReturnValue(botToken);

      await expect(service.validateUser({ initData: fullInitData })).rejects.toThrow(
        'No user data in initData',
      );
    });
  });

  describe('generateToken', () => {
    it('should generate JWT with userId', async () => {
      mockJwtService.signAsync.mockResolvedValue('test-jwt');

      const token = await (service as any).generateToken(42);

      expect(token).toBe('test-jwt');
      expect(mockJwtService.signAsync).toHaveBeenCalledWith({ userId: 42 });
    });
  });
});
