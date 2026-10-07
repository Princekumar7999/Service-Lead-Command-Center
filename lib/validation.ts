import { z } from 'zod';

export const JOB_STATUSES = [
  'NEW',
  'NEEDS_QUOTE',
  'QUOTE_SENT',
  'WAITING_ON_YES',
  'SCHEDULED',
  'COMPLETED',
  'LOST',
] as const;

export const JOB_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

export const LEAD_SOURCES = ['PHONE', 'WEBSITE', 'TEXT', 'REFERRAL', 'REPEAT'] as const;

export const ACTIVITY_TYPES = [
  'LEAD_CREATED',
  'QUOTE_SENT',
  'CUSTOMER_CONTACTED',
  'STATUS_CHANGED',
  'NOTE',
  'FOLLOW_UP_COMPLETED',
] as const;

export const JobCreateSchema = z.object({
  customerName: z.string().min(1, 'Contact name is required').trim(),
  company: z.string().min(1, 'Company or business name is required').trim(),
  phone: z.string().min(5, 'Valid phone number is required').trim(),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  title: z.string().min(3, 'Job title is required (e.g. Walk-in freezer repair)').trim(),
  description: z.string().default(''),
  status: z.enum(JOB_STATUSES).default('NEW'),
  priority: z.enum(JOB_PRIORITIES).default('HIGH'),
  estimatedValue: z.coerce.number().min(0, 'Estimated value must be 0 or greater').default(0),
  source: z.enum(LEAD_SOURCES).default('PHONE'),
  nextFollowUpAt: z.string().nullable().optional(),
  assignedTechnician: z.string().nullable().optional(),
});

export type JobCreateInput = z.infer<typeof JobCreateSchema>;

export const JobUpdateSchema = z.object({
  title: z.string().min(3).optional(),
  description: z.string().optional(),
  status: z.enum(JOB_STATUSES).optional(),
  priority: z.enum(JOB_PRIORITIES).optional(),
  estimatedValue: z.coerce.number().min(0).optional(),
  source: z.enum(LEAD_SOURCES).optional(),
  nextFollowUpAt: z.string().nullable().optional(),
  assignedTechnician: z.string().nullable().optional(),
});

export type JobUpdateInput = z.infer<typeof JobUpdateSchema>;

export const ActivityCreateSchema = z.object({
  jobId: z.string().min(1),
  type: z.enum(ACTIVITY_TYPES),
  description: z.string().min(1, 'Activity note is required').trim(),
});

export type ActivityCreateInput = z.infer<typeof ActivityCreateSchema>;

/**
 * Strict schema for AI extracted customer messages.
 * Every field is validated before the user reviews it.
 */
export const AIExtractedLeadSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  company: z.string().min(1, 'Company name is required'),
  phone: z.string().default(''),
  email: z.string().optional().default(''),
  problem: z.string().min(3, 'Problem description is required'),
  urgency: z.enum(JOB_PRIORITIES).default('HIGH'),
  requestedTime: z.string().optional().default(''),
  source: z.enum(LEAD_SOURCES).default('TEXT'),
  suggestedValue: z.number().min(0).default(1500),
  suggestedFollowUpHours: z.number().default(4),
});

export type AIExtractedLead = z.infer<typeof AIExtractedLeadSchema>;
