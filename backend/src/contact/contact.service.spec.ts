import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ContactService } from './contact.service';
import { PrismaService } from '../prisma/prisma.service';
import { ReferralService } from '../referral/referral.service';
import { EncryptionService } from '../encryption/encryption.service';

describe('ContactService', () => {
  let service: ContactService;

  const mockPrisma = {
    contact: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    businessCard: {
      findUnique: jest.fn(),
    },
  };

  const mockReferralService = {
    processReferral: jest.fn(),
  };

  const mockEncryptionService = {
    encryptJSON: jest.fn((obj) => `encrypted_${JSON.stringify(obj)}`),
    decryptJSON: jest.fn((str) => {
      if (typeof str === 'string' && str.startsWith('encrypted_')) {
        return JSON.parse(str.replace('encrypted_', ''));
      }
      return str;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: ReferralService, useValue: mockReferralService },
        { provide: EncryptionService, useValue: mockEncryptionService },
      ],
    }).compile();

    service = module.get<ContactService>(ContactService);
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all contacts for a user', async () => {
      const contacts = [
        { id: 1, userId: 1, businessName: 'Contact A', privateMeta: null },
        { id: 2, userId: 1, businessName: 'Contact B', privateMeta: null },
      ];
      mockPrisma.contact.findMany.mockResolvedValue(contacts);

      const result = await service.findAll(1);

      expect(result).toHaveLength(2);
      expect(mockPrisma.contact.findMany).toHaveBeenCalledWith({
        where: { userId: 1 },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should filter by search term', async () => {
      mockPrisma.contact.findMany.mockResolvedValue([]);

      await service.findAll(1, 'Test');

      expect(mockPrisma.contact.findMany).toHaveBeenCalledWith({
        where: {
          userId: 1,
          OR: [
            { businessName: { contains: 'Test', mode: 'insensitive' } },
            { personalData: { contains: 'Test', mode: 'insensitive' } },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });
    });

    it('should decrypt privateMeta for each contact', async () => {
      const contacts = [
        { id: 1, userId: 1, businessName: 'Contact A', privateMeta: 'encrypted_{"оис":"Опасен"}' },
      ];
      mockPrisma.contact.findMany.mockResolvedValue(contacts);

      const result = await service.findAll(1);

      expect(result[0].privateMeta).toEqual({ оис: 'Опасен' });
    });
  });

  describe('findOne', () => {
    it('should return a contact when found', async () => {
      const contact = { id: 1, userId: 1, businessName: 'Test', privateMeta: null };
      mockPrisma.contact.findUnique.mockResolvedValue(contact);

      const result = await service.findOne(1, 1);

      expect(result.businessName).toBe('Test');
    });

    it('should throw NotFoundException for wrong userId', async () => {
      mockPrisma.contact.findUnique.mockResolvedValue({ id: 1, userId: 2 });

      await expect(service.findOne(1, 1)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException for missing contact', async () => {
      mockPrisma.contact.findUnique.mockResolvedValue(null);

      await expect(service.findOne(999, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('addByRef', () => {
    it('should create a new contact from business card', async () => {
      const businessCard = {
        contactId: 'bc1',
        businessName: 'Test Corp',
        resources: '{"website":"https://test.com"}',
        personalData: '{"fullName":"John Doe"}',
      };
      const newContact = {
        id: 1,
        userId: 1,
        contactId: 'bc1',
        businessName: 'Test Corp',
        privateMeta: null,
      };

      mockPrisma.businessCard.findUnique.mockResolvedValue(businessCard);
      mockPrisma.contact.findUnique.mockResolvedValue(null);
      mockPrisma.contact.create.mockResolvedValue(newContact);

      const result = await service.addByRef(1, { contactId: 'bc1' });

      expect(result.businessName).toBe('Test Corp');
      expect(mockPrisma.contact.create).toHaveBeenCalledWith({
        data: {
          userId: 1,
          contactId: 'bc1',
          businessName: 'Test Corp',
          resources: '{"website":"https://test.com"}',
          personalData: '{"fullName":"John Doe"}',
          privateMeta: null,
        },
      });
    });

    it('should return existing contact if already added', async () => {
      const existing = { id: 1, userId: 1, businessName: 'Existing', privateMeta: null };

      mockPrisma.businessCard.findUnique.mockResolvedValue({ contactId: 'bc1' });
      mockPrisma.contact.findUnique.mockResolvedValue(existing);

      const result = await service.addByRef(1, { contactId: 'bc1' });

      expect(result.message).toBe('Contact already exists');
    });

    it('should throw NotFoundException for missing business card', async () => {
      mockPrisma.businessCard.findUnique.mockResolvedValue(null);

      await expect(service.addByRef(1, { contactId: 'missing' })).rejects.toThrow(NotFoundException);
    });

    it('should process referral if refUserId provided', async () => {
      mockPrisma.businessCard.findUnique.mockResolvedValue({ contactId: 'bc1', businessName: 'Test' });
      mockPrisma.contact.findUnique.mockResolvedValue(null);
      mockPrisma.contact.create.mockResolvedValue({ id: 1, userId: 1, contactId: 'bc1', privateMeta: null });

      await service.addByRef(1, { contactId: 'bc1', refUserId: '42' });

      expect(mockReferralService.processReferral).toHaveBeenCalledWith(1, 42, 'contact_added');
    });

    it('should encrypt privateMeta when provided', async () => {
      mockPrisma.businessCard.findUnique.mockResolvedValue({ contactId: 'bc1', businessName: 'Test' });
      mockPrisma.contact.findUnique.mockResolvedValue(null);
      mockPrisma.contact.create.mockResolvedValue({ id: 1, userId: 1, contactId: 'bc1', privateMeta: 'encrypted_{"оис":"Опасен"}' });

      await service.addByRef(1, { contactId: 'bc1', privateMeta: { оис: 'Опасен' } });

      expect(mockEncryptionService.encryptJSON).toHaveBeenCalledWith({ оис: 'Опасен' });
    });
  });

  describe('updatePrivateMeta', () => {
    it('should update and return decrypted privateMeta', async () => {
      const contact = { id: 1, userId: 1, privateMeta: 'encrypted_{"оис":"Интересен"}' };

      mockPrisma.contact.findUnique.mockResolvedValue({ id: 1, userId: 1 });
      mockPrisma.contact.update.mockResolvedValue(contact);

      const result = await service.updatePrivateMeta(1, 1, { оис: 'Интересен' });

      expect(result.privateMeta).toEqual({ оис: 'Интересен' });
    });

    it('should throw NotFoundException for wrong userId', async () => {
      mockPrisma.contact.findUnique.mockResolvedValue({ id: 1, userId: 2 });

      await expect(service.updatePrivateMeta(1, 1, {})).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete a contact', async () => {
      mockPrisma.contact.findUnique.mockResolvedValue({ id: 1, userId: 1 });
      mockPrisma.contact.delete.mockResolvedValue({});

      const result = await service.remove(1, 1);

      expect(result.message).toBe('Contact removed');
      expect(mockPrisma.contact.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it('should throw NotFoundException for wrong userId', async () => {
      mockPrisma.contact.findUnique.mockResolvedValue({ id: 1, userId: 2 });

      await expect(service.remove(1, 1)).rejects.toThrow(NotFoundException);
    });
  });

  describe('exportVCard', () => {
    it('should generate vCard with contact data', async () => {
      const contact = {
        id: 1,
        userId: 1,
        businessName: 'Test Corp',
        personalData: '{"fullName":"John Doe","phone":"+1234567890","email":"john@test.com","position":"CEO"}',
        resources: '{"website":"https://test.com"}',
      };

      mockPrisma.contact.findUnique.mockResolvedValue(contact);

      const result = await service.exportVCard(1, 1);

      expect(result.vcard).toContain('BEGIN:VCARD');
      expect(result.vcard).toContain('FN:John Doe');
      expect(result.vcard).toContain('TEL:+1234567890');
      expect(result.vcard).toContain('EMAIL:john@test.com');
      expect(result.vcard).toContain('TITLE:CEO');
      expect(result.vcard).toContain('ORG:Test Corp');
      expect(result.vcard).toContain('URL:https://test.com');
      expect(result.vcard).toContain('END:VCARD');
      expect(result.filename).toBe('Test Corp.vcf');
    });

    it('should handle contact with minimal data', async () => {
      const contact = {
        id: 1,
        userId: 1,
        businessName: null,
        personalData: '{}',
        resources: '{}',
      };

      mockPrisma.contact.findUnique.mockResolvedValue(contact);

      const result = await service.exportVCard(1, 1);

      expect(result.vcard).toContain('FN:Contact');
      expect(result.filename).toBe('contact.vcf');
    });
  });
});
