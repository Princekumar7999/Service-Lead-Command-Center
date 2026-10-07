'use client';

import { AlertTriangle, Clock, CalendarDays, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsBarProps {
  metrics: {
    total: number;
    overdueCount: number;
    dueTodayCount: number;
    upcomingCount: number;
    completedCount: number;
  };
  activeFilter: string;
  onFilterChange: (filter: string) => void;
}

export function MetricsBar({ metrics, activeFilter, onFilterChange }: MetricsBarProps) {
  const cards = [
    {
      id: 'overdue',
      title: 'Overdue Follow-ups',
      count: metrics.overdueCount,
      subtitle: 'Quotes & leads waiting past due',
      icon: AlertTriangle,
      colorClass: 'border-red-200 bg-red-50/50 text-red-700 hover:bg-red-50',
      activeClass: 'ring-2 ring-red-500 bg-red-50',
      badgeClass: 'bg-red-600 text-white',
    },
    {
      id: 'today',
      title: 'Due Today',
      count: metrics.dueTodayCount,
      subtitle: 'Scheduled for call or response today',
      icon: Clock,
      colorClass: 'border-amber-200 bg-amber-50/50 text-amber-800 hover:bg-amber-50',
      activeClass: 'ring-2 ring-amber-500 bg-amber-50',
      badgeClass: 'bg-amber-600 text-white',
    },
    {
      id: 'upcoming',
      title: 'Upcoming',
      count: metrics.upcomingCount,
      subtitle: 'Follow-ups scheduled for future days',
      icon: CalendarDays,
      colorClass: 'border-emerald-200 bg-emerald-50/50 text-emerald-800 hover:bg-emerald-50',
      activeClass: 'ring-2 ring-emerald-500 bg-emerald-50',
      badgeClass: 'bg-emerald-600 text-white',
    },
    {
      id: 'all',
      title: 'All Active Jobs',
      count: metrics.total,
      subtitle: 'Across all pipeline stages',
      icon: CheckCircle2,
      colorClass: 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
      activeClass: 'ring-2 ring-slate-700 bg-slate-50',
      badgeClass: 'bg-slate-700 text-white',
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isActive = activeFilter === card.id;

        return (
          <button
            key={card.id}
            type="button"
            onClick={() => onFilterChange(card.id)}
            className={cn(
              'flex flex-col text-left p-4 rounded-xl border transition-all shadow-sm',
              card.colorClass,
              isActive && card.activeClass
            )}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider">{card.title}</span>
              <Icon className="h-4 w-4 opacity-75" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold">{card.count}</span>
              <span className="text-xs opacity-75 hidden sm:inline">{card.subtitle}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
