'use client';

import { Sparkles, Calendar, AlertCircle } from 'lucide-react';
import { formatDateOnly } from '@/lib/utils';

interface MorningHeaderProps {
  attentionCount: number;
  overdueCount: number;
  dueTodayCount: number;
  potentialRevenue: number;
}

export function MorningHeader({
  attentionCount,
  overdueCount,
  dueTodayCount,
  potentialRevenue,
}: MorningHeaderProps) {
  const today = new Date();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            <span>{formatDateOnly(today)}</span>
            <span>•</span>
            <span className="text-slate-600 font-semibold">PolarFlow Commercial Refrigeration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Good morning, Denise 👋
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            {attentionCount === 0 ? (
              <span className="text-emerald-700 font-medium">All caught up! No overdue or pending follow-ups today.</span>
            ) : (
              <span>
                <strong className="text-slate-900">{attentionCount} customers</strong> need your attention today to keep repair jobs moving.
              </span>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-blue-100 bg-blue-50/70 px-4 py-3 text-right">
            <span className="block text-[11px] font-semibold text-blue-800 uppercase tracking-wider">
              Potential Revenue Requiring Attention
            </span>
            <span className="text-2xl font-extrabold text-blue-900">
              ${potentialRevenue.toLocaleString()}
            </span>
          </div>
        </div>
      </div>

      {/* AI Daily Priority Summary banner */}
      {attentionCount > 0 && (
        <div className="rounded-xl border border-indigo-200 bg-gradient-to-r from-indigo-50/90 via-purple-50/70 to-blue-50/80 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm">
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
                  Morning Priority Briefing
                </span>
                <span className="rounded bg-indigo-200/60 px-1.5 py-0.2 text-[10px] font-semibold text-indigo-800">
                  AI Synthesized
                </span>
              </div>
              <p className="text-xs sm:text-sm text-indigo-950 leading-relaxed">
                {overdueCount > 0 ? (
                  <>
                    You have <strong className="text-red-700">{overdueCount} overdue customer {overdueCount === 1 ? 'quote' : 'quotes'}</strong> that risk leaking to competitors. Check ABC Restaurant ($2,000 freezer quote) and Metro Foods first.
                  </>
                ) : (
                  <>
                    You have <strong className="text-amber-800">{dueTodayCount} jobs</strong> scheduled for contact today. Burger House is awaiting a compressor quote before their weekend rush.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
