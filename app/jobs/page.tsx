'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Kanban,
  Search,
  Plus,
  ArrowUpRight,
  RefreshCw,
  Phone,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Trash2,
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badges';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { JOB_STATUSES } from '@/lib/validation';

export default function PipelinePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [updatingJobId, setUpdatingJobId] = useState<string | null>(null);
  const [jobToDelete, setJobToDelete] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/jobs');
      const json = await res.json();
      setData(json);
    } catch (err) {
      console.error('Failed to load jobs for pipeline:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  const handleQuickStatusChange = async (jobId: string, newStatus: string) => {
    try {
      setUpdatingJobId(jobId);
      const res = await fetch(`/api/jobs/${jobId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        fetchJobs();
      }
    } catch (err) {
      console.error('Failed to change status:', err);
    } finally {
      setUpdatingJobId(null);
    }
  };

  const handleDeleteJob = async () => {
    if (!jobToDelete) return;
    try {
      setDeleting(true);
      const res = await fetch(`/api/jobs/${jobToDelete.id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete job');
      setJobToDelete(null);
      await fetchJobs();
    } catch (err: any) {
      alert(err.message || 'Error deleting job');
    } finally {
      setDeleting(false);
    }
  };

  const allJobs: any[] = data?.jobs || [];

  const filteredJobs = searchQuery
    ? allJobs.filter(
        (j) =>
          j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.customer.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
          j.customer.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : allJobs;

  // Pipeline metrics for Denise's husband
  const activeJobs = allJobs.filter((j) => j.status !== 'COMPLETED' && j.status !== 'LOST');
  const activePipelineValue = activeJobs.reduce((sum, j) => sum + (j.estimatedValue || 0), 0);
  const completedValue = allJobs
    .filter((j) => j.status === 'COMPLETED')
    .reduce((sum, j) => sum + (j.estimatedValue || 0), 0);
  const lostValue = allJobs
    .filter((j) => j.status === 'LOST')
    .reduce((sum, j) => sum + (j.estimatedValue || 0), 0);

  const pipelineColumns = [
    {
      key: 'NEW',
      title: 'New Lead',
      description: 'Incoming calls & texts',
      color: 'border-blue-400 bg-blue-50/40 text-blue-800',
    },
    {
      key: 'NEEDS_QUOTE',
      title: 'Needs Quote',
      description: 'Tech diagnosis required',
      color: 'border-amber-400 bg-amber-50/40 text-amber-800',
    },
    {
      key: 'QUOTE_SENT',
      title: 'Quote Sent',
      description: 'Awaiting customer review',
      color: 'border-purple-400 bg-purple-50/40 text-purple-800',
    },
    {
      key: 'WAITING_ON_YES',
      title: 'Waiting on Yes',
      description: 'Follow-up critical',
      color: 'border-indigo-400 bg-indigo-50/40 text-indigo-800',
    },
    {
      key: 'SCHEDULED',
      title: 'Scheduled',
      description: 'Tech assigned & dispatched',
      color: 'border-emerald-400 bg-emerald-50/40 text-emerald-800',
    },
    {
      key: 'COMPLETED',
      title: 'Completed',
      description: 'Repairs finished',
      color: 'border-slate-300 bg-slate-50/40 text-slate-800',
    },
    {
      key: 'LOST',
      title: 'Lost / Leaked',
      description: 'Missed opportunities',
      color: 'border-rose-300 bg-rose-50/40 text-rose-800',
    },
  ];

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* 1. Header & Quick Numbers for Husband */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            <Kanban className="h-4 w-4 text-blue-600" />
            <span>Operational Pipeline</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 mt-1">
            Service Job Stages
          </h1>
          <p className="text-sm text-slate-600">
            Full visibility across all service stages — from new incoming leads to completed repairs.
          </p>
        </div>

        {/* Metrics for Denise & her husband */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-sm">
          <div className="px-3 border-r border-slate-100 last:border-none">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Open Jobs
            </span>
            <span className="text-lg font-black text-slate-900">{activeJobs.length}</span>
          </div>
          <div className="px-3 border-r border-slate-100 last:border-none">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Active Pipeline
            </span>
            <span className="text-lg font-black text-blue-600">
              {formatCurrency(activePipelineValue)}
            </span>
          </div>
          <div className="px-3 border-r border-slate-100 last:border-none">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Completed
            </span>
            <span className="text-lg font-black text-emerald-600">
              {formatCurrency(completedValue)}
            </span>
          </div>
          <div className="px-3">
            <span className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Leaked / Lost
            </span>
            <span className="text-lg font-black text-rose-600">
              {formatCurrency(lostValue)}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Search & Controls */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company or equipment problem..."
            className="w-full rounded-lg border border-slate-300 bg-white pl-9 pr-3 py-1.5 text-xs sm:text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button
            onClick={() => fetchJobs()}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <Link
            href="/jobs/new"
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>+ New Job</span>
          </Link>
        </div>
      </div>

      {/* 3. Pipeline Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-start overflow-x-auto pb-4">
        {pipelineColumns.map((col) => {
          const colJobs = filteredJobs.filter((j) => j.status === col.key);
          const colTotal = colJobs.reduce((sum, j) => sum + (j.estimatedValue || 0), 0);

          return (
            <div
              key={col.key}
              className="flex flex-col rounded-xl border border-slate-200 bg-slate-50/70 p-3 min-w-[230px]"
            >
              {/* Column Header */}
              <div className="pb-3 border-b border-slate-200/80 mb-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-800">
                    {col.title}
                  </span>
                  <span className="rounded-full bg-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-700">
                    {colJobs.length}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1 text-[11px] text-slate-500">
                  <span>{col.description}</span>
                  <span className="font-semibold text-slate-700">{formatCurrency(colTotal)}</span>
                </div>
              </div>

              {/* Column Cards */}
              <div className="space-y-2.5">
                {colJobs.length === 0 ? (
                  <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
                    No jobs in this stage
                  </div>
                ) : (
                  colJobs.map((job) => {
                    const isOverdue = job.followUpAnalysis?.urgency === 'OVERDUE';
                    const isToday = job.followUpAnalysis?.urgency === 'DUE_TODAY';

                    return (
                      <div
                        key={job.id}
                        className={`rounded-lg border bg-white p-3 shadow-sm hover:shadow transition-all ${
                          isOverdue
                            ? 'border-red-300 ring-1 ring-red-100'
                            : isToday
                            ? 'border-amber-300 ring-1 ring-amber-100'
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-1 mb-1.5">
                          <Link
                            href={`/jobs/${job.id}`}
                            className="font-bold text-xs text-slate-900 hover:text-blue-600 line-clamp-1"
                          >
                            {job.customer.company}
                          </Link>
                          <PriorityBadge priority={job.priority} />
                        </div>

                        <p className="text-xs text-slate-700 font-medium line-clamp-2 mb-2">
                          {job.title}
                        </p>

                        <div className="flex items-center justify-between text-xs font-semibold text-slate-900 border-t border-slate-100 pt-2 mb-2">
                          <span className="text-[11px] text-slate-500">Value</span>
                          <span>{formatCurrency(job.estimatedValue)}</span>
                        </div>

                        {/* Follow-up tag */}
                        {job.followUpAnalysis && job.followUpAnalysis.urgency !== 'NONE' && (
                          <div className="mb-2">
                            <span
                              className={`inline-block text-[10px] font-bold px-1.5 py-0.5 rounded border ${job.followUpAnalysis.badgeClass}`}
                            >
                              {job.followUpAnalysis.label}
                            </span>
                          </div>
                        )}

                        {/* Quick Stage Move Dropdown */}
                        <div className="flex items-center justify-between gap-1 pt-1 border-t border-slate-100">
                          <select
                            value={job.status}
                            disabled={updatingJobId === job.id}
                            onChange={(e) => handleQuickStatusChange(job.id, e.target.value)}
                            className="w-full text-[11px] bg-slate-50 border border-slate-200 rounded px-1.5 py-1 text-slate-700 focus:outline-none focus:border-blue-500"
                          >
                            {JOB_STATUSES.map((statusKey) => (
                              <option key={statusKey} value={statusKey}>
                                Move to: {statusKey.replace('_', ' ')}
                              </option>
                            ))}
                          </select>

                          <Link
                            href={`/jobs/${job.id}`}
                            title="View Job Details"
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                          >
                            <ArrowUpRight className="h-3 w-3" />
                          </Link>

                          <button
                            type="button"
                            onClick={() => setJobToDelete(job)}
                            title="Delete Project"
                            className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-rose-200 text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!jobToDelete}
        itemTitle={jobToDelete?.title || ''}
        companyName={jobToDelete?.customer?.company}
        loading={deleting}
        onClose={() => setJobToDelete(null)}
        onConfirm={handleDeleteJob}
      />
    </div>
  );
}
