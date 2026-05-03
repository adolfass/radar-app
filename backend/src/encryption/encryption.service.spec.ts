import { Test, TestingModule } from '@nestjs/testing';
import { EncryptionService } from './encryption.service';

describe('EncryptionService', () => {
  let service: EncryptionService;

  beforeAll(() => {
    process.env.ENCRYPTION_KEY = '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EncryptionService],
    }).compile();

    service = module.get<EncryptionService>(EncryptionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('encrypt/decrypt', () => {
    it('should encrypt and decrypt a string', () => {
      const plaintext = 'Hello, World!';
      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should produce different ciphertext for same plaintext', () => {
      const plaintext = 'Secret message';
      const encrypted1 = service.encrypt(plaintext);
      const encrypted2 = service.encrypt(plaintext);

      expect(encrypted1).not.toBe(encrypted2);
    });

    it('should handle empty string', () => {
      const plaintext = '';
      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should handle unicode characters', () => {
      const plaintext = 'Привет мир! 🌍';
      const encrypted = service.encrypt(plaintext);
      const decrypted = service.decrypt(encrypted);

      expect(decrypted).toBe(plaintext);
    });

    it('should throw on invalid ciphertext format', () => {
      expect(() => service.decrypt('invalid')).toThrow('Invalid encrypted data format');
    });

    it('should throw on tampered ciphertext', () => {
      const plaintext = 'Secret';
      const encrypted = service.encrypt(plaintext);
      const [iv, tag, data] = encrypted.split(':');
      // Tamper with the authTag to invalidate the authentication
      const tamperedTag = tag[0] === 'a' ? 'b' + tag.slice(1) : 'a' + tag.slice(1);
      const tampered = `${iv}:${tamperedTag}:${data}`;

      expect(() => service.decrypt(tampered)).toThrow();
    });
  });

  describe('encryptJSON/decryptJSON', () => {
    it('should encrypt and decrypt a JSON object', () => {
      const obj = { оис: 'Опасен', tag: 'important' };
      const encrypted = service.encryptJSON(obj);
      const decrypted = service.decryptJSON(encrypted);

      expect(decrypted).toEqual(obj);
    });

    it('should handle nested objects', () => {
      const obj = {
        оис: { опасен: true, интересен: false },
        notes: 'Complex data',
      };
      const encrypted = service.encryptJSON(obj);
      const decrypted = service.decryptJSON(encrypted);

      expect(decrypted).toEqual(obj);
    });

    it('should handle arrays', () => {
      const obj = { tags: ['Опасен', 'Интересен', 'Сложен'] };
      const encrypted = service.encryptJSON(obj);
      const decrypted = service.decryptJSON(encrypted);

      expect(decrypted).toEqual(obj);
    });

    it('should throw on invalid JSON ciphertext', () => {
      const encrypted = service.encrypt('not-json');
      expect(() => service.decryptJSON(encrypted)).toThrow();
    });
  });
});
