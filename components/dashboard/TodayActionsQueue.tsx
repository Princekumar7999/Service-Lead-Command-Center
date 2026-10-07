'use client';

import Link from 'next/link';
import { Phone, MessageSquare, ArrowUpRight, CheckCircle2, Clock, User, Building, AlertCircle } from 'lucide-react';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badges';
import { formatCurrency, formatDate } from '@/lib/utils';

interface JobActionItem {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  estimatedValue: number;
  source: string;
  nextFollowUpAt: string | null;
  assignedTechnician: string | null;
  customer: {
    id: string;
    name: string;
    company: string;
    phone: string;
    email: string | null;
  };
  followUpAnalysis: {
    urgency: 'OVERDUE' | 'DUE_TODAY' | 'UPCOMING' | 'NONE';
    daysDiff: number;
    label: string;
    badgeClass: string;
    reasonText: string;
  };
}

interface TodayActionsQueueProps {
  jobs: JobActionItem[];
  onOpenContactModal: (job: JobActionItem) => void;
  onSimulateOverdue?: (jobId: string) => void;
}

export function TodayActionsQueue({
  jobs,
  onOpenContactModal,
  onSimulateOverdue,
}: TodayActionsQueueProps) {
  if (jobs.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 mb-3">
          <CheckCircle2 className="h-6 w-6" />
        </div>
        <h3 className="text-base font-semibold text-slate-900">No pending follow-ups in this view 🎉</h3>
        <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
          You are completely caught up! New requests from phone, text, or web forms will appear here automatically.
        </p>
        <div className="mt-6">
          <Link
            href="/jobs/new"
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            + Create New Job
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => {
        const isOverdue = job.followUpAnalysis.urgency === 'OVERDUE';
        const isToday = job.followUpAnalysis.urgency === 'DUE_TODAY';

        return (
          <div
            key={job.id}
            className={`group rounded-xl border bg-white p-4 sm:p-5 shadow-sm transition-all hover:shadow-md ${
              isOverdue
                ? 'border-red-300 ring-1 ring-red-100 hover:border-red-400'
                : isToday
                ? 'border-amber-300 ring-1 ring-amber-100 hover:border-amber-400'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Left Column: Who + What + Urgency */}
              <div className="space-y-2 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${job.followUpAnalysis.badgeClass}`}
                  >
                    {isOverdue && <span className="mr-1.5 h-2 w-2 rounded-full bg-red-600 animate-pulse" />}
                    {isToday && <span className="mr-1.5 h-2 w-2 rounded-full bg-amber-500" />}
                    {job.followUpAnalysis.label}
                  </span>

                  <StatusBadge status={job.status} />
                  <PriorityBadge priority={job.priority} />

                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    via <strong className="text-slate-700 capitalize">{job.source.toLowerCase()}</strong>
                  </span>
                </div>

                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition-colors">
                      <Link href={`/jobs/${job.id}`}>
                        {job.customer.company}
                      </Link>
                    </h3>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs font-medium text-slate-600 flex items-center gap-1">
                      <User className="h-3 w-3 text-slate-400" />
                      {job.customer.name}
                    </span>
                  </div>

                  <p className="text-sm font-medium text-slate-800 mt-0.5">
                    {job.title}
                  </p>

                  <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                    {job.description}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-1">
                  <span>
                    Phone:{' '}
                    <a
                      href={`tel:${job.customer.phone.replace(/[^0-9]/g, '')}`}
                      className="font-semibold text-slate-700 hover:underline"
                    >
                      {job.customer.phone}
                    </a>
                  </span>

                  {job.assignedTechnician && (
                    <span>
                      Tech: <strong className="text-slate-700">{job.assignedTechnician}</strong>
                    </span>
                  )}

                  {job.nextFollowUpAt && (
                    <span className="flex items-center gap-1 text-slate-600">
                      <Clock className="h-3 w-3 text-slate-400" />
                      Target: {formatDate(job.nextFollowUpAt)}
                    </span>
                  )}
                </div>
              </div>

              {/* Right Column: Value + Action Buttons */}
              <div className="flex flex-row lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 pt-3 lg:pt-0 border-slate-100 gap-3">
                <div className="text-left lg:text-right">
                  <span className="block text-[11px] font-medium text-slate-400 uppercase tracking-wider">
                    Estimated Value
                  </span>
                  <span className="text-lg font-black text-slate-900">
                    {formatCurrency(job.estimatedValue)}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${job.customer.phone.replace(/[^0-9]/g, '')}`}
                    title="Direct Phone Call"
                    className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                  >
                    <Phone className="h-3.5 w-3.5 mr-1 text-emerald-600" />
                    <span>Call</span>
                  </a>

                  <a
                    href={`sms:${job.customer.phone.replace(/[^0-9]/g, '')}?&body=Hi%20${encodeURIComponent(
                      job.customer.name
                    )},%20this%20is%20Denise%20from%20PolarFlow%20Refrigeration%20following%20up%20on%20your%20repair.`}
                    title="Quick Text Message"
                    className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-blue-600 hover:border-blue-200 transition-colors"
                  >
                    <MessageSquare className="h-3.5 w-3.5 mr-1 text-blue-600" />
                    <span>Text</span>
                  </a>

                  <button
                    type="button"
                    onClick={() => onOpenContactModal(job)}
                    title="Record follow-up contact and update schedule"
                    className="inline-flex items-center justify-center h-8 px-3 rounded-lg bg-slate-900 text-xs font-semibold text-white shadow-sm hover:bg-slate-800 transition-colors"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-emerald-400" />
                    <span>Mark Contacted</span>
                  </button>

                  {onSimulateOverdue && !isOverdue && (
                    <button
                      type="button"
                      onClick={() => onSimulateOverdue(job.id)}
                      title="Demo Action: Set follow-up date to 2 days ago to demonstrate overdue queue and dynamic briefing update"
                      className="inline-flex items-center justify-center h-8 px-2.5 rounded-lg border border-red-200 bg-red-50 text-[11px] font-bold text-red-700 hover:bg-red-100 hover:border-red-300 transition-colors shadow-sm"
                    >
                      <Clock className="h-3 w-3 mr-1 text-red-600" />
                      <span>Simulate Overdue</span>
                    </button>
                  )}

                  <Link
                    href={`/jobs/${job.id}`}
                    title="View Full Job & Activity Details"
                    className="inline-flex items-center justify-center h-8 w-8 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                  >
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
