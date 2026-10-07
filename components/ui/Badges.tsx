import React from 'react';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (s: string) => {
    switch (s) {
      case 'NEW':
        return {
          label: 'New Lead',
          classes: 'bg-blue-50 text-blue-700 border-blue-200',
        };
      case 'NEEDS_QUOTE':
        return {
          label: 'Needs Quote',
          classes: 'bg-amber-50 text-amber-700 border-amber-200',
        };
      case 'QUOTE_SENT':
        return {
          label: 'Quote Sent',
          classes: 'bg-purple-50 text-purple-700 border-purple-200',
        };
      case 'WAITING_ON_YES':
        return {
          label: 'Waiting on Yes',
          classes: 'bg-indigo-50 text-indigo-700 border-indigo-200',
        };
      case 'SCHEDULED':
        return {
          label: 'Scheduled',
          classes: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        };
      case 'COMPLETED':
        return {
          label: 'Completed',
          classes: 'bg-slate-100 text-slate-700 border-slate-300',
        };
      case 'LOST':
        return {
          label: 'Lost / Dropped',
          classes: 'bg-rose-50 text-rose-700 border-rose-200',
        };
      default:
        return {
          label: status,
          classes: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  const config = getStatusConfig(status);

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  );
}

interface PriorityBadgeProps {
  priority: string;
  className?: string;
}

export function PriorityBadge({ priority, className }: PriorityBadgeProps) {
  const getPriorityConfig = (p: string) => {
    switch (p) {
      case 'URGENT':
        return {
          label: 'Urgent',
          classes: 'bg-red-100 text-red-800 border-red-300 font-bold',
        };
      case 'HIGH':
        return {
          label: 'High',
          classes: 'bg-amber-100 text-amber-800 border-amber-300',
        };
      case 'MEDIUM':
        return {
          label: 'Medium',
          classes: 'bg-blue-100 text-blue-800 border-blue-200',
        };
      case 'LOW':
        return {
          label: 'Low',
          classes: 'bg-slate-100 text-slate-600 border-slate-200',
        };
      default:
        return {
          label: p,
          classes: 'bg-slate-100 text-slate-700 border-slate-200',
        };
    }
  };

  const config = getPriorityConfig(priority);

  return (
    <span
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border uppercase tracking-wider',
        config.classes,
        className
      )}
    >
      {config.label}
    </span>
  );
}
