export type FollowUpUrgency = 'OVERDUE' | 'DUE_TODAY' | 'UPCOMING' | 'NONE';

export interface FollowUpAnalysis {
  urgency: FollowUpUrgency;
  daysDiff: number; // negative if overdue, 0 if today, positive if upcoming
  label: string;
  badgeClass: string;
  reasonText: string;
}

/**
 * Deterministically analyzes the follow-up urgency for a given date and job status.
 *
 * Rules:
 * - Completed or Lost jobs do not require follow-up ('NONE').
 * - Null or undefined follow-up date means no follow-up scheduled ('NONE').
 * - Date before the start of today is 'OVERDUE'.
 * - Date between start and end of today is 'DUE_TODAY'.
 * - Date after end of today is 'UPCOMING'.
 */
export function getFollowUpAnalysis(
  nextFollowUpAt: Date | string | null | undefined,
  jobStatus?: string,
  referenceDate: Date = new Date()
): FollowUpAnalysis {
  // If the job is already finished or lost, no action is needed
  if (jobStatus === 'COMPLETED' || jobStatus === 'LOST') {
    return {
      urgency: 'NONE',
      daysDiff: 0,
      label: jobStatus === 'COMPLETED' ? 'Job Completed' : 'Job Closed / Lost',
      badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
      reasonText: 'No pending actions',
    };
  }

  if (!nextFollowUpAt) {
    return {
      urgency: 'NONE',
      daysDiff: 0,
      label: 'No Follow-up Scheduled',
      badgeClass: 'bg-slate-100 text-slate-500 border-slate-200',
      reasonText: 'Schedule a next follow-up date',
    };
  }

  const target = typeof nextFollowUpAt === 'string' ? new Date(nextFollowUpAt) : new Date(nextFollowUpAt.getTime());

  // Normalize reference date to local calendar day
  const todayStart = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
    0,
    0,
    0,
    0
  );

  const todayEnd = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth(),
    referenceDate.getDate(),
    23,
    59,
    59,
    999
  );

  const targetDayStart = new Date(
    target.getFullYear(),
    target.getMonth(),
    target.getDate(),
    0,
    0,
    0,
    0
  );

  const diffMs = targetDayStart.getTime() - todayStart.getTime();
  const daysDiff = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (target < todayStart) {
    const overdueDays = Math.abs(daysDiff);
    const dayUnit = overdueDays === 1 ? 'day' : 'days';
    return {
      urgency: 'OVERDUE',
      daysDiff,
      label: `Overdue by ${overdueDays} ${dayUnit}`,
      badgeClass: 'bg-red-50 text-red-700 border-red-200 font-semibold',
      reasonText: overdueDays === 1 ? 'Follow-up overdue by 1 day' : `Follow-up overdue by ${overdueDays} days`,
    };
  }

  if (target >= todayStart && target <= todayEnd) {
    return {
      urgency: 'DUE_TODAY',
      daysDiff: 0,
      label: 'Due Today',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
      reasonText: 'Customer needs follow-up today',
    };
  }

  // Upcoming in future days
  const upcomingDays = daysDiff;
  const unit = upcomingDays === 1 ? 'day' : 'days';
  return {
    urgency: 'UPCOMING',
    daysDiff,
    label: `Upcoming (${upcomingDays} ${unit})`,
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    reasonText: `Scheduled in ${upcomingDays} ${unit}`,
  };
}

/**
 * Checks whether an urgency requires Denise's attention today (Overdue or Due Today).
 */
export function isActionRequiredToday(urgency: FollowUpUrgency): boolean {
  return urgency === 'OVERDUE' || urgency === 'DUE_TODAY';
}

/**
 * Calculates total potential revenue requiring attention today.
 * Sum of estimatedValue for jobs where follow-up is OVERDUE or DUE_TODAY.
 */
export function calculatePotentialRevenue<T extends { estimatedValue: number; nextFollowUpAt: Date | string | null; status: string }>(
  jobs: T[],
  referenceDate: Date = new Date()
): number {
  return jobs.reduce((total, job) => {
    const analysis = getFollowUpAnalysis(job.nextFollowUpAt, job.status, referenceDate);
    if (isActionRequiredToday(analysis.urgency)) {
      return total + (job.estimatedValue || 0);
    }
    return total;
  }, 0);
}

/**
 * Deterministically sorts today's action queue.
 * Priority hierarchy:
 * 1. OVERDUE + URGENT
 * 2. OVERDUE (older first)
 * 3. DUE_TODAY + URGENT
 * 4. DUE_TODAY (higher priority first)
 * 5. UPCOMING
 */
export function sortJobsByActionPriority<
  T extends {
    priority: string;
    nextFollowUpAt: Date | string | null;
    status: string;
    estimatedValue: number;
  }
>(jobs: T[], referenceDate: Date = new Date()): T[] {
  const priorityWeight: Record<string, number> = {
    URGENT: 4,
    HIGH: 3,
    MEDIUM: 2,
    LOW: 1,
  };

  return [...jobs].sort((a, b) => {
    const analysisA = getFollowUpAnalysis(a.nextFollowUpAt, a.status, referenceDate);
    const analysisB = getFollowUpAnalysis(b.nextFollowUpAt, b.status, referenceDate);

    // Rank urgencies
    const urgencyScore: Record<FollowUpUrgency, number> = {
      OVERDUE: 300,
      DUE_TODAY: 200,
      UPCOMING: 100,
      NONE: 0,
    };

    const scoreA = urgencyScore[analysisA.urgency] + (priorityWeight[a.priority] || 1) * 10;
    const scoreB = urgencyScore[analysisB.urgency] + (priorityWeight[b.priority] || 1) * 10;

    if (scoreA !== scoreB) {
      return scoreB - scoreA; // higher score first
    }

    // If tied in overdue, older overdue first (more negative daysDiff)
    if (analysisA.urgency === 'OVERDUE' && analysisB.urgency === 'OVERDUE') {
      if (analysisA.daysDiff !== analysisB.daysDiff) {
        return analysisA.daysDiff - analysisB.daysDiff;
      }
    }

    // Tie-breaker: higher estimated revenue first
    return (b.estimatedValue || 0) - (a.estimatedValue || 0);
  });
}
