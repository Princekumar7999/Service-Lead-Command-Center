import { describe, it, expect } from 'vitest';
import {
  getFollowUpAnalysis,
  isActionRequiredToday,
  calculatePotentialRevenue,
  sortJobsByActionPriority,
} from '@/lib/followups';

describe('Follow-up Urgency Engine', () => {
  const refDate = new Date(2026, 9, 7, 8, 30, 0); // Oct 7, 2026 8:30 AM

  it('correctly classifies dates in the past as OVERDUE', () => {
    const twoDaysAgo = new Date(2026, 9, 5, 14, 0, 0);
    const analysis = getFollowUpAnalysis(twoDaysAgo, 'QUOTE_SENT', refDate);

    expect(analysis.urgency).toBe('OVERDUE');
    expect(analysis.daysDiff).toBe(-2);
    expect(analysis.label).toBe('Overdue by 2 days');
    expect(isActionRequiredToday(analysis.urgency)).toBe(true);
  });

  it('correctly classifies yesterday as Overdue by 1 day', () => {
    const yesterday = new Date(2026, 9, 6, 17, 0, 0);
    const analysis = getFollowUpAnalysis(yesterday, 'NEEDS_QUOTE', refDate);

    expect(analysis.urgency).toBe('OVERDUE');
    expect(analysis.daysDiff).toBe(-1);
    expect(analysis.label).toBe('Overdue by 1 day');
  });

  it('correctly classifies today timestamps as DUE_TODAY', () => {
    const todayAfternoon = new Date(2026, 9, 7, 14, 0, 0);
    const analysis = getFollowUpAnalysis(todayAfternoon, 'WAITING_ON_YES', refDate);

    expect(analysis.urgency).toBe('DUE_TODAY');
    expect(analysis.daysDiff).toBe(0);
    expect(analysis.label).toBe('Due Today');
    expect(isActionRequiredToday(analysis.urgency)).toBe(true);
  });

  it('correctly classifies future timestamps as UPCOMING', () => {
    const tomorrow = new Date(2026, 9, 8, 10, 0, 0);
    const analysis = getFollowUpAnalysis(tomorrow, 'SCHEDULED', refDate);

    expect(analysis.urgency).toBe('UPCOMING');
    expect(analysis.daysDiff).toBe(1);
    expect(analysis.label).toBe('Upcoming (1 day)');
    expect(isActionRequiredToday(analysis.urgency)).toBe(false);
  });

  it('returns NONE for COMPLETED or LOST jobs regardless of date', () => {
    const pastDate = new Date(2026, 9, 1, 10, 0, 0);

    const completed = getFollowUpAnalysis(pastDate, 'COMPLETED', refDate);
    expect(completed.urgency).toBe('NONE');
    expect(completed.label).toBe('Job Completed');
    expect(isActionRequiredToday(completed.urgency)).toBe(false);

    const lost = getFollowUpAnalysis(pastDate, 'LOST', refDate);
    expect(lost.urgency).toBe('NONE');
    expect(lost.label).toBe('Job Closed / Lost');
    expect(isActionRequiredToday(lost.urgency)).toBe(false);
  });

  it('returns NONE when no follow-up date is provided', () => {
    const noDate = getFollowUpAnalysis(null, 'NEW', refDate);
    expect(noDate.urgency).toBe('NONE');
    expect(noDate.label).toBe('No Follow-up Scheduled');
    expect(isActionRequiredToday(noDate.urgency)).toBe(false);
  });

  it('calculates potential revenue requiring attention accurately', () => {
    const jobs = [
      { id: '1', estimatedValue: 2000, nextFollowUpAt: new Date(2026, 9, 5), status: 'QUOTE_SENT' }, // Overdue
      { id: '2', estimatedValue: 1500, nextFollowUpAt: new Date(2026, 9, 7, 11, 0), status: 'WAITING_ON_YES' }, // Due Today
      { id: '3', estimatedValue: 3200, nextFollowUpAt: new Date(2026, 9, 9), status: 'QUOTE_SENT' }, // Upcoming (not counted)
      { id: '4', estimatedValue: 4500, nextFollowUpAt: new Date(2026, 9, 5), status: 'COMPLETED' }, // Completed (not counted)
      { id: '5', estimatedValue: 900, nextFollowUpAt: new Date(2026, 9, 5), status: 'LOST' }, // Lost (not counted)
    ];

    const revenue = calculatePotentialRevenue(jobs, refDate);
    expect(revenue).toBe(3500); // 2000 + 1500
  });

  it('sorts today actions by strict business urgency hierarchy', () => {
    const jobs = [
      {
        id: 'upcoming-urgent',
        priority: 'URGENT',
        nextFollowUpAt: new Date(2026, 9, 10),
        status: 'NEW',
        estimatedValue: 1000,
      },
      {
        id: 'due-today-medium',
        priority: 'MEDIUM',
        nextFollowUpAt: new Date(2026, 9, 7, 15, 0),
        status: 'WAITING_ON_YES',
        estimatedValue: 1500,
      },
      {
        id: 'overdue-urgent',
        priority: 'URGENT',
        nextFollowUpAt: new Date(2026, 9, 5),
        status: 'QUOTE_SENT',
        estimatedValue: 2000,
      },
      {
        id: 'due-today-urgent',
        priority: 'URGENT',
        nextFollowUpAt: new Date(2026, 9, 7, 10, 0),
        status: 'NEEDS_QUOTE',
        estimatedValue: 2500,
      },
      {
        id: 'overdue-high',
        priority: 'HIGH',
        nextFollowUpAt: new Date(2026, 9, 6),
        status: 'WAITING_ON_YES',
        estimatedValue: 1200,
      },
    ];

    const sorted = sortJobsByActionPriority(jobs, refDate);

    // Overdue Urgent should be first
    expect(sorted[0].id).toBe('overdue-urgent');
    // Overdue High should be second
    expect(sorted[1].id).toBe('overdue-high');
    // Due Today Urgent should be third
    expect(sorted[2].id).toBe('due-today-urgent');
    // Due Today Medium should be fourth
    expect(sorted[3].id).toBe('due-today-medium');
    // Upcoming should be last
    expect(sorted[4].id).toBe('upcoming-urgent');
  });

  it('correctly transitions an upcoming job to OVERDUE when simulated 2 days in the past', () => {
    const futureDate = new Date(refDate.getTime() + 2 * 24 * 60 * 60 * 1000);
    const initialAnalysis = getFollowUpAnalysis(futureDate, 'QUOTE_SENT', refDate);
    expect(initialAnalysis.urgency).toBe('UPCOMING');

    // Simulate 2 days ago
    const simulatedPastDate = new Date(refDate.getTime() - 2 * 24 * 60 * 60 * 1000);
    const simulatedAnalysis = getFollowUpAnalysis(simulatedPastDate, 'QUOTE_SENT', refDate);
    expect(simulatedAnalysis.urgency).toBe('OVERDUE');
    expect(simulatedAnalysis.daysDiff).toBe(-2);
    expect(isActionRequiredToday(simulatedAnalysis.urgency)).toBe(true);
  });

  it('correctly removes a job from the overdue set when follow-up is rescheduled to future', () => {
    const overdueDate = new Date(refDate.getTime() - 2 * 24 * 60 * 60 * 1000);
    const initialAnalysis = getFollowUpAnalysis(overdueDate, 'QUOTE_SENT', refDate);
    expect(initialAnalysis.urgency).toBe('OVERDUE');

    // User contacts customer and reschedules +2 days
    const rescheduledDate = new Date(refDate.getTime() + 2 * 24 * 60 * 60 * 1000);
    const updatedAnalysis = getFollowUpAnalysis(rescheduledDate, 'WAITING_ON_YES', refDate);
    expect(updatedAnalysis.urgency).toBe('UPCOMING');
    expect(isActionRequiredToday(updatedAnalysis.urgency)).toBe(false);
  });
});
