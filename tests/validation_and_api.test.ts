import { describe, it, expect } from 'vitest';
import {
  JobCreateSchema,
  JobUpdateSchema,
  ActivityCreateSchema,
  AIExtractedLeadSchema,
} from '@/lib/validation';

describe('Zod Validation Schemas', () => {
  describe('JobCreateSchema', () => {
    it('accepts a valid refrigeration repair job payload', () => {
      const validJob = {
        customerName: 'Robert Miller',
        company: 'ABC Restaurant',
        phone: '555-234-8901',
        email: 'robert@abcrestaurant.com',
        title: 'Walk-in freezer holding at 45 degrees',
        description: 'Compressor buzzing loudly, need urgent diagnosis',
        status: 'NEW',
        priority: 'URGENT',
        estimatedValue: 2000,
        source: 'PHONE',
        nextFollowUpAt: '2026-10-08T10:00:00.000Z',
        assignedTechnician: 'Mike',
      };

      const result = JobCreateSchema.safeParse(validJob);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.company).toBe('ABC Restaurant');
        expect(result.data.estimatedValue).toBe(2000);
      }
    });

    it('rejects payload with missing company or contact name', () => {
      const invalidJob = {
        customerName: '',
        company: '',
        phone: '555-0000',
        title: 'Repair',
      };

      const result = JobCreateSchema.safeParse(invalidJob);
      expect(result.success).toBe(false);
      if (!result.success) {
        const errors = result.error.flatten().fieldErrors;
        expect(errors.company).toBeDefined();
        expect(errors.customerName).toBeDefined();
      }
    });

    it('rejects negative estimated values', () => {
      const invalidValueJob = {
        customerName: 'Marcus',
        company: 'Burger House',
        phone: '555-123-4567',
        title: 'Ice machine repair',
        estimatedValue: -500,
      };

      const result = JobCreateSchema.safeParse(invalidValueJob);
      expect(result.success).toBe(false);
    });
  });

  describe('AIExtractedLeadSchema', () => {
    it('validates structured AI extraction result', () => {
      const aiOutput = {
        customerName: 'Joe',
        company: "Joe's Deli",
        phone: '555-0144',
        email: '',
        problem: 'Freezer 2 is at 55 degrees',
        urgency: 'URGENT',
        requestedTime: '14:00',
        source: 'TEXT',
        suggestedValue: 1500,
        suggestedFollowUpHours: 2,
      };

      const result = AIExtractedLeadSchema.safeParse(aiOutput);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.customerName).toBe('Joe');
        expect(result.data.urgency).toBe('URGENT');
        expect(result.data.suggestedValue).toBe(1500);
      }
    });

    it('rejects AI output if problem is missing or too short', () => {
      const invalidAI = {
        customerName: 'Joe',
        company: "Joe's Deli",
        phone: '555-0144',
        problem: 'F', // too short
        urgency: 'URGENT',
      };

      const result = AIExtractedLeadSchema.safeParse(invalidAI);
      expect(result.success).toBe(false);
    });
  });

  describe('ActivityCreateSchema', () => {
    it('validates activity creation with correct types', () => {
      const activity = {
        jobId: 'job_123',
        type: 'CUSTOMER_CONTACTED',
        description: 'Left voicemail with manager regarding quote approval.',
      };

      const result = ActivityCreateSchema.safeParse(activity);
      expect(result.success).toBe(true);
    });

    it('rejects unsupported activity types', () => {
      const badActivity = {
        jobId: 'job_123',
        type: 'UNKNOWN_TYPE',
        description: 'Testing',
      };

      const result = ActivityCreateSchema.safeParse(badActivity);
      expect(result.success).toBe(false);
    });
  });
});
