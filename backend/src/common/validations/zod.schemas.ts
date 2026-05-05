import { z } from 'zod';

// Enums
export const ContactCircleSchema = z.enum(['support', 'productivity', 'development']);
export const ContactRoleSchema = z.enum(['connector', 'bridge', 'gatekeeper', 'condensator']);
export const ArchetypeSchema = z.enum(['peach', 'pomegranate', 'apple']);
export const MeetingTypeSchema = z.enum(['call', 'meeting', 'coffee', 'event']);
export const TrustTypeSchema = z.enum(['trust', 'distrust']);
export const SubscriptionPlanSchema = z.enum([
  'free',
  'trial',
  'premium_monthly',
  'premium_yearly',
]);
export const RitualTypeSchema = z.enum(['inventory', 'review', 'cleanup']);

// Auth
export const AuthDtoSchema = z.object({
  initData: z.string().min(1),
});

// Contact
export const CreateContactSchema = z.object({
  contactId: z.string().min(1),
  businessName: z.string().optional(),
  circle: ContactCircleSchema.optional(),
  archetype: ArchetypeSchema.optional(),
  personalData: z.record(z.string(), z.unknown()).optional(),
  resources: z.record(z.string(), z.unknown()).optional(),
});

export const UpdateContactSchema = z.object({
  businessName: z.string().optional(),
  circle: ContactCircleSchema.optional(),
  archetype: ArchetypeSchema.optional(),
  personalData: z.record(z.string(), z.unknown()).optional(),
  resources: z.record(z.string(), z.unknown()).optional(),
  tags: z.array(z.string()).optional(),
  notes: z.string().optional(),
});

export const AddContactByRefSchema = z.object({
  referralCode: z.string().min(1),
  name: z.string().optional(),
  businessName: z.string().optional(),
});

export const PrivateMetaSchema = z.record(z.string(), z.unknown());

// Trust
export const AdjustTrustSchema = z.object({
  delta: z.number().min(-100).max(100),
  reason: z.string().optional(),
  type: TrustTypeSchema.optional(),
});

export const LogTrustSchema = z.object({
  contactId: z.number(),
  delta: z.number().min(-100).max(100),
  reason: z.string().optional(),
  type: TrustTypeSchema.optional(),
});

// Meeting
export const CreateMeetingSchema = z.object({
  contactId: z.number(),
  title: z.string().min(1).max(200),
  scheduledAt: z.string().datetime(),
  type: MeetingTypeSchema.optional(),
  notes: z.string().optional(),
});

export const UpdateMeetingSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  scheduledAt: z.string().datetime().optional(),
  type: MeetingTypeSchema.optional(),
  notes: z.string().optional(),
  completed: z.boolean().optional(),
});

// Event
export const CreateEventSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().optional(),
  date: z.string().datetime(),
  location: z.string().optional(),
  maxParticipants: z.number().min(2).max(1000).optional(),
});

export const UpdateEventSchema = z.object({
  name: z.string().min(1).max(200).optional(),
  description: z.string().optional(),
  date: z.string().datetime().optional(),
  location: z.string().optional(),
  maxParticipants: z.number().min(2).max(1000).optional(),
});

// BQG
export const BqgGoalSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  roles: z.array(z.string()),
});

export const CreateBqgSchema = z.object({
  quarter: z.number().min(1).max(4),
  year: z.number().min(2020).max(2100),
  goals: z.array(BqgGoalSchema),
  roles: z.record(z.string(), z.array(z.string())),
});

export const UpdateBqgSchema = z.object({
  goals: z.array(BqgGoalSchema).optional(),
  roles: z.record(z.string(), z.array(z.string())).optional(),
  isActive: z.boolean().optional(),
});

// Business Card
export const CreateBusinessCardSchema = z.object({
  name: z.string().min(1).max(100),
  title: z.string().optional(),
  company: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  telegram: z.string().optional(),
  socialLinks: z.record(z.string(), z.string()).optional(),
});

export const UpdateBusinessCardSchema = CreateBusinessCardSchema.partial();

// Ritual
export const CompleteRitualSchema = z.object({
  type: RitualTypeSchema,
  notes: z.string().optional(),
  archivedContacts: z.array(z.number()).optional(),
  newRoles: z.record(z.string(), z.array(z.string())).optional(),
});

// Subscription
export const UpgradeSubscriptionSchema = z.object({
  plan: SubscriptionPlanSchema,
});

export const StartTrialSchema = z.object({
  plan: SubscriptionPlanSchema.optional(),
});

// Referral
export const CreateReferralSchema = z.object({
  referrerId: z.number(),
});

// Trust log
export const TrustLogSchema = z.object({
  contactId: z.number(),
  delta: z.number(),
  reason: z.string().optional(),
  type: TrustTypeSchema.optional(),
});

// Types
export type ContactCircle = z.infer<typeof ContactCircleSchema>;
export type ContactRole = z.infer<typeof ContactRoleSchema>;
export type AuthDto = z.infer<typeof AuthDtoSchema>;
export type CreateContact = z.infer<typeof CreateContactSchema>;
export type UpdateContact = z.infer<typeof UpdateContactSchema>;
export type TrustAdjust = z.infer<typeof AdjustTrustSchema>;
export type Meeting = z.infer<typeof CreateMeetingSchema>;
export type Event = z.infer<typeof CreateEventSchema>;
export type Bqg = z.infer<typeof CreateBqgSchema>;
export type BusinessCard = z.infer<typeof CreateBusinessCardSchema>;
