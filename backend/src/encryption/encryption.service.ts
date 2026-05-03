import { Injectable, Logger } from '@nestjs/common';
import { randomBytes, createCipheriv, createDecipheriv } from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly key: Buffer;
  private readonly algorithm = 'aes-256-gcm';
  private readonly ivLength = 16;
  private readonly authTagLength = 16;

  constructor() {
    const keyHex = process.env.ENCRYPTION_KEY;
    if (!keyHex) {
      throw new Error('ENCRYPTION_KEY environment variable is required');
    }
    this.key = Buffer.from(keyHex, 'hex');
    if (this.key.length !== 32) {
      throw new Error('ENCRYPTION_KEY must be 32 bytes (64 hex characters)');
    }
  }

  encrypt(plaintext: string): string {
    const iv = randomBytes(this.ivLength);
    const cipher = createCipheriv(this.algorithm, this.key, iv, {
      authTagLength: this.authTagLength,
    });

    let encrypted = cipher.update(plaintext, 'utf8', 'base64');
    encrypted += cipher.final('base64');
    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encrypted (all base64)
    return `${iv.toString('base64')}:${authTag.toString('base64')}:${encrypted}`;
  }

  decrypt(ciphertext: string): string {
    const parts = ciphertext.split(':');
    if (parts.length !== 3) {
      throw new Error('Invalid encrypted data format');
    }

    const [ivBase64, authTagBase64, encrypted] = parts;
    if (!ivBase64 || !authTagBase64) {
      throw new Error('Invalid encrypted data format');
    }

    const iv = Buffer.from(ivBase64, 'base64');
    const authTag = Buffer.from(authTagBase64, 'base64');

    const decipher = createDecipheriv(this.algorithm, this.key, iv, {
      authTagLength: this.authTagLength,
    });
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'base64', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  encryptJSON(obj: Record<string, unknown>): string {
    return this.encrypt(JSON.stringify(obj));
  }

  decryptJSON<T = Record<string, unknown>>(ciphertext: string): T {
    const decrypted = this.decrypt(ciphertext);
    return JSON.parse(decrypted) as T;
  }
}
