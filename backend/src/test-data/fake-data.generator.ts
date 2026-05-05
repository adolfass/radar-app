import { Injectable } from '@nestjs/common';
import { EncryptionService } from '../encryption/encryption.service';
import * as path from 'path';
import * as fs from 'fs';

interface TemplateData {
  firstNames: string[];
  lastNames: string[];
  usernames: string[];
}

interface BioData {
  bios: string[];
}

interface AnchorData {
  anchors: string[];
}

interface CompanyData {
  companies: string[];
}

interface FakeContact {
  userId: number;
  contactId: string;
  businessName: string;
  resources: string;
  personalData: string;
  circle: string;
  archetype: string;
  aiSuggestedRole: string;
  privateMeta: string;
  lastInteraction: Date;
  isActive: boolean;
}

const CIRCLES = ['support', 'productivity', 'development'];
const CIRCLE_WEIGHTS = [0.05, 0.25, 0.70];
const ROLES = ['connector', 'bridge', 'gatekeeper', 'condensator'];
const ARCHETYPES = ['peach', 'pomegranate', 'apple'];

const RESOURCE_IMPACTS = ['charge', 'drain', 'neutral'];
const STRENGTH_SOURCES = [
  'рекомендация от коллеги',
  'общее мероприятие',
  'холодный поиск',
  'реферал',
  'конференция',
  'совместный проект',
];

@Injectable()
export class FakeDataGenerator {
  private templates: TemplateData;
  private bios: BioData;
  private anchors: AnchorData;
  private companies: CompanyData;

  constructor(private encryption: EncryptionService) {
    const tmplDir = path.join(__dirname, 'templates');
    this.templates = JSON.parse(fs.readFileSync(path.join(tmplDir, 'names.ru.json'), 'utf-8'));
    this.bios = JSON.parse(fs.readFileSync(path.join(tmplDir, 'bios.ru.json'), 'utf-8'));
    this.anchors = JSON.parse(fs.readFileSync(path.join(tmplDir, 'anchors.ru.json'), 'utf-8'));
    this.companies = JSON.parse(fs.readFileSync(path.join(tmplDir, 'companies.ru.json'), 'utf-8'));
  }

  generate(userId: number, count: number): FakeContact[] {
    const contacts: FakeContact[] = [];

    for (let i = 0; i < count; i++) {
      const circle = this.weightedRandom(CIRCLES, CIRCLE_WEIGHTS);
      const archetype = this.randomItem(ARCHETYPES);
      const role = this.randomItem(ROLES);

      const firstName = this.randomItem(this.templates.firstNames);
      const lastName = this.randomItem(this.templates.lastNames);
      const username = this.randomItem(this.templates.usernames) + '_' + i;

      const bio = this.randomItem(this.bios.bios);
      const company = this.randomItem(this.companies.companies);
      const anchorCount = Math.floor(Math.random() * 4);
      const an = Array.from({ length: anchorCount }, () => this.randomItem(this.anchors.anchors));

      const phone = this.generatePhone();
      const email = this.generateEmail(firstName, lastName);

      const privateMetaObj = {
        dangerous: Math.random() < 0.15,
        interesting: Math.random() < 0.70,
        complex: Math.random() < 0.30,
        anchors: an,
        strengthSource: this.randomItem(STRENGTH_SOURCES),
        resourceImpact: this.randomItem(RESOURCE_IMPACTS),
        isTest: true,
        valence: this.weightedRandom(['positive', 'negative', 'neutral'], [0.7, 0.1, 0.2]),
        trustBalance: Math.floor(Math.random() * 201) - 100,
      };

      const daysAgo = Math.floor(Math.random() * 365);
      const lastInteraction = new Date(Date.now() - daysAgo * 86400000);
      const isActive = Math.random() < 0.85;

      const personalData = {
        fullName: firstName + ' ' + lastName,
        phone,
        email,
        username: '@' + username,
        position: this.randomItem(this.bios.bios),
      };

      const resources = {
        telegram: username,
        email,
        website: 'https://' + company.toLowerCase().replace(/\s+/g, '') + '.ru',
      };

      contacts.push({
        userId,
        contactId: 'test_' + userId + '_' + i + '_' + Date.now(),
        businessName: company,
        resources: JSON.stringify(resources),
        personalData: JSON.stringify(personalData),
        circle,
        archetype,
        aiSuggestedRole: role,
        privateMeta: this.encryption.encryptJSON(privateMetaObj),
        lastInteraction,
        isActive,
      });
    }

    return contacts;
  }

  private randomItem<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private weightedRandom<T>(items: T[], weights: number[]): T {
    const total = weights.reduce((a, b) => a + b, 0);
    let r = Math.random() * total;
    for (let i = 0; i < items.length; i++) {
      if (r < weights[i]) return items[i];
      r -= weights[i];
    }
    return items[items.length - 1];
  }

  private generatePhone(): string {
    const prefix = '+7';
    const operator = ['900', '901', '902', '903', '904', '905', '906', '909', '910', '915', '916', '925', '926', '927', '977', '985'][Math.floor(Math.random() * 16)];
    const num = String(Math.floor(Math.random() * 10000000)).padStart(7, '0');
    return prefix + operator + num;
  }

  private generateEmail(first: string, last: string): string {
    const domains = ['mail.ru', 'gmail.com', 'yandex.ru', 'inbox.ru', 'bk.ru', 'list.ru'];
    const f = first.toLowerCase();
    const l = last.toLowerCase();
    const patterns = [
      f + '.' + l,
      f[0] + '.' + l,
      f + l[0],
      f + '_' + l,
      f + '.' + l + Math.floor(Math.random() * 100),
    ];
    return patterns[Math.floor(Math.random() * patterns.length)] + '@' + this.randomItem(domains);
  }
}
