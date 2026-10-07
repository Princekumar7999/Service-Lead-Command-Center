'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Search, Plus, Sparkles, RefreshCw, AlertCircle, Filter } from 'lucide-react';
import { MorningHeader } from '@/components/dashboard/MorningHeader';
import { MetricsBar } from '@/components/dashboard/MetricsBar';
import { TodayActionsQueue } from '@/components/dashboard/TodayActionsQueue';
import { QuickContactModal } from '@/components/dashboard/QuickContactModal';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('actionable'); // actionable (default), overdue, today, upcoming, all
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedJobForContact, setSelectedJobForContact] = useState<any>(null);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filter) params.set('filter', filter);
      if (searchQuery) params.set('q', searchQuery);

      const res = await fetch(`/api/jobs?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load dashboard data');
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message || 'Error communicating with database');
    } finally {
      setLoading(false);
    }
  }, [filter, searchQuery]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const metrics = data?.metrics || {
    total: 0,
    overdueCount: 0,
    dueTodayCount: 0,
    upcomingCount: 0,
    completedCount: 0,
    attentionNeededCount: 0,
    potentialRevenue: 0,
  };

  const displayedJobs = data?.jobs || [];

  const handleSimulateOverdue = async (jobId: string) => {
    try {
      const res = await fetch(`/api/jobs/${jobId}/simulate-overdue`, {
        method: 'POST',
      });
      if (res.ok) {
        await fetchJobs();
      }
    } catch (err) {
      console.error('Failed to simulate overdue:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
      {/* 1. Denise's 8:00 AM Greeting & Revenue-at-Risk */}
      <MorningHeader
        attentionCount={metrics.attentionNeededCount}
        overdueCount={metrics.overdueCount}
        dueTodayCount={metrics.dueTodayCount}
        potentialRevenue={metrics.potentialRevenue}
        overdueJobs={metrics.overdueJobs || []}
        dueTodayJobs={metrics.dueTodayJobs || []}
      />

      {/* 2. Interactive Urgency Counters (Overdue / Due Today / Upcoming / All) */}
      <MetricsBar
        metrics={metrics}
        activeFilter={filter}
        onFilterChange={(newFilter) => setFilter(newFilter)}
      />

      {/* 3. Search and Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">
            {filter === 'actionable' && "Today's Action Priority Queue"}
            {filter === 'overdue' && 'Overdue Follow-ups Requiring Immediate Contact'}
            {filter === 'today' && 'Scheduled Follow-ups Due Today'}
            {filter === 'upcoming' && 'Upcoming Scheduled Service Leads'}
            {filter === 'all' && 'All Active Repair Service Jobs'}
          </h2>
          <span className="rounded-full bg-slate-200 px-2 py-0.5 text-xs font-bold text-slate-700">
            {displayedJobs.length}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search customer, issue..."
              className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <button
            onClick={() => fetchJobs()}
            title="Refresh jobs"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 4. Error Display */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 flex items-center gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Unable to load jobs</p>
            <p className="text-xs text-red-700">{error}</p>
          </div>
          <button
            onClick={() => fetchJobs()}
            className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      )}

      {/* 5. Loading Skeleton */}
      {loading && !data && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl border border-slate-200 bg-white p-5 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* 6. Main Action List */}
      {!loading && (
        <TodayActionsQueue
          jobs={data?.jobs || []}
          onOpenContactModal={(job) => setSelectedJobForContact(job)}
          onSimulateOverdue={handleSimulateOverdue}
        />
      )}

      {/* 7. Modal for one-click 'Mark Contacted' */}
      <QuickContactModal
        job={selectedJobForContact}
        isOpen={!!selectedJobForContact}
        onClose={() => setSelectedJobForContact(null)}
        onSuccess={() => {
          fetchJobs();
        }}
      />
    </div>
  );
}
