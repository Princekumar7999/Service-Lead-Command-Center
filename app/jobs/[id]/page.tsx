'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Clock,
  Calendar,
  User,
  Building,
  CheckCircle2,
  AlertTriangle,
  History,
  Send,
  Wrench,
  DollarSign,
  AlertCircle,
  FileEdit,
  Trash2,
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '@/components/ui/Badges';
import { QuickContactModal } from '@/components/dashboard/QuickContactModal';
import { DeleteConfirmModal } from '@/components/ui/DeleteConfirmModal';
import { formatCurrency, formatDate } from '@/lib/utils';
import { JOB_STATUSES, JOB_PRIORITIES } from '@/lib/validation';

export default function JobDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modals & form state
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [newNote, setNewNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);

  // Quick edit state
  const [editingStatus, setEditingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  // Delete modal state
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteJob = async () => {
    try {
      setDeleting(true);
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete job');
      router.push('/');
    } catch (err: any) {
      alert(err.message || 'Error deleting job');
      setDeleting(false);
    }
  };

  const fetchJob = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await fetch(`/api/jobs/${id}`);
      if (!res.ok) throw new Error('Job not found');
      const data = await res.json();
      setJob(data.job);
      setSelectedStatus(data.job.status);
    } catch (err: any) {
      setError(err.message || 'Error fetching job');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setAddingNote(true);
      const res = await fetch(`/api/jobs/${id}/activities`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'NOTE',
          description: newNote.trim(),
        }),
      });

      if (!res.ok) throw new Error('Failed to record note');
      setNewNote('');
      fetchJob();
    } catch (err) {
      console.error(err);
    } finally {
      setAddingNote(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      const res = await fetch(`/api/jobs/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) throw new Error('Failed to update status');
      setEditingStatus(false);
      fetchJob();
    } catch (err) {
      console.error(err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSimulateOverdue = async () => {
    try {
      const res = await fetch(`/api/jobs/${id}/simulate-overdue`, {
        method: 'POST',
      });
      if (res.ok) {
        fetchJob();
      }
    } catch (err) {
      console.error('Failed to simulate overdue:', err);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-4">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="h-64 bg-white rounded-xl border border-slate-200 p-6 animate-pulse" />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
        <AlertCircle className="mx-auto h-10 w-10 text-red-500 mb-3" />
        <h2 className="text-lg font-bold text-slate-900">Unable to load job details</h2>
        <p className="text-sm text-slate-500 mt-1">{error || 'This job could not be located.'}</p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  const isOverdue = job.followUpAnalysis?.urgency === 'OVERDUE';
  const isToday = job.followUpAnalysis?.urgency === 'DUE_TODAY';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Navigation bar */}
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Today&apos;s Actions</span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            href="/jobs"
            className="text-xs font-semibold text-blue-600 hover:text-blue-800"
          >
            View in Pipeline &rarr;
          </Link>
        </div>
      </div>

      {/* Overdue / Urgency Warning Banner */}
      {isOverdue && (
        <div className="rounded-xl border border-red-300 bg-red-50 p-4 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="text-sm font-bold text-red-900">
                Action Required: {job.followUpAnalysis.label}
              </h4>
              <p className="text-xs text-red-800">
                This job is at risk of leaking to a competitor. Denise&apos;s commercial customers expect prompt confirmation before calling another service provider.
              </p>
              <div className="pt-2 flex items-center gap-2">
                <button
                  onClick={() => setIsContactModalOpen(true)}
                  className="rounded-lg bg-red-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-red-700 shadow-sm transition-colors"
                >
                  ⚡ Record Follow-up Call Now
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Job Card */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {/* Top Header */}
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge status={job.status} />
                <PriorityBadge priority={job.priority} />
                {job.followUpAnalysis?.urgency !== 'NONE' && (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${job.followUpAnalysis.badgeClass}`}
                  >
                    {job.followUpAnalysis.label}
                  </span>
                )}
                <span className="text-xs text-slate-500">
                  Source: <strong className="text-slate-700 capitalize">{job.source.toLowerCase()}</strong>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {job.customer.company}
              </h1>
              <p className="text-base font-semibold text-slate-800">{job.title}</p>
            </div>

            <div className="sm:text-right">
              <span className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                Estimated Value
              </span>
              <span className="text-3xl font-black text-slate-900">
                {formatCurrency(job.estimatedValue)}
              </span>
            </div>
          </div>
        </div>

        {/* Action Triggers Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-6 py-3.5 bg-slate-100/70 border-b border-slate-200">
          <div className="flex items-center gap-2">
            <a
              href={`tel:${job.customer.phone.replace(/[^0-9]/g, '')}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-blue-600 transition-colors"
            >
              <Phone className="h-3.5 w-3.5 text-emerald-600" />
              <span>Call ({job.customer.phone})</span>
            </a>

            <a
              href={`sms:${job.customer.phone.replace(/[^0-9]/g, '')}?&body=Hi%20${encodeURIComponent(
                job.customer.name
              )},%20this%20is%20Denise%20from%20PolarFlow%20Refrigeration.`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:text-blue-600 transition-colors"
            >
              <MessageSquare className="h-3.5 w-3.5 text-blue-600" />
              <span>Send Text</span>
            </a>

            {job.customer.email && (
              <a
                href={`mailto:${job.customer.email}?subject=Follow-up:%20${encodeURIComponent(
                  job.title
                )}`}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 transition-colors"
              >
                <Mail className="h-3.5 w-3.5 text-slate-600" />
                <span>Email</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isOverdue && (
              <button
                type="button"
                onClick={handleSimulateOverdue}
                title="Demo Action: Set follow-up date to 2 days ago to demonstrate overdue queue and dynamic briefing update"
                className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50 px-3.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 hover:border-red-300 transition-colors shadow-sm"
              >
                <Clock className="h-3.5 w-3.5 text-red-600" />
                <span>⚡ Simulate Overdue (Demo)</span>
              </button>
            )}

            <button
              onClick={() => setIsContactModalOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-4 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-slate-800 transition-colors"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              <span>Mark Contacted</span>
            </button>

            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-rose-200 bg-rose-50/70 px-3 py-1.5 text-xs font-bold text-rose-700 hover:bg-rose-100 hover:border-rose-300 transition-colors shadow-sm"
              title="Delete this service project"
            >
              <Trash2 className="h-3.5 w-3.5 text-rose-600" />
              <span>Delete Project</span>
            </button>
          </div>
        </div>

        {/* Content Body Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          {/* Customer & Scheduling Info (1 col) */}
          <div className="p-6 space-y-5">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Customer Details
              </h3>
              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex items-center gap-2">
                  <User className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span className="font-semibold">{job.customer.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <span>{job.customer.company}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                  <a href={`tel:${job.customer.phone}`} className="hover:underline font-medium">
                    {job.customer.phone}
                  </a>
                </div>
                {job.customer.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{job.customer.email}</span>
                  </div>
                )}
                {job.customer.address && (
                  <div className="flex items-start gap-2">
                    <MapPin className="h-3.5 w-3.5 text-slate-400 shrink-0 mt-0.5" />
                    <span>{job.customer.address}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Service Schedule
              </h3>
              <div className="space-y-2 text-xs">
                <div>
                  <span className="text-slate-500 block">Next Follow-Up:</span>
                  <span className="font-bold text-slate-800">
                    {job.nextFollowUpAt ? formatDate(job.nextFollowUpAt) : 'None scheduled'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block">Assigned Tech:</span>
                  <span className="font-bold text-slate-800">
                    {job.assignedTechnician || 'Unassigned'}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 block">Lead Created:</span>
                  <span className="text-slate-700">{formatDate(job.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Quick Status Modifier */}
            <div className="pt-4 border-t border-slate-100">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Change Pipeline Status
              </h3>
              <select
                value={job.status}
                disabled={updatingStatus}
                onChange={(e) => handleStatusChange(e.target.value)}
                className="w-full text-xs font-semibold rounded-lg border border-slate-300 p-2 text-slate-800 focus:outline-none focus:border-blue-500"
              >
                {JOB_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description & Activity Log (2 cols) */}
          <div className="md:col-span-2 p-6 space-y-6">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Problem & Diagnostic Notes
              </h3>
              <p className="text-sm text-slate-800 whitespace-pre-wrap bg-slate-50 p-4 rounded-lg border border-slate-100 leading-relaxed">
                {job.description || 'No detailed diagnostic description provided.'}
              </p>
            </div>

            {/* Timeline & Activity History */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <History className="h-3.5 w-3.5 text-blue-600" />
                  <span>Activity & Contact History</span>
                </h3>
                <span className="text-[11px] text-slate-400">
                  {job.activities?.length || 0} events recorded
                </span>
              </div>

              {/* Add Note Form */}
              <form onSubmit={handleAddNote} className="mb-5 flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Log a quick note, phone call result, or diagnostic update..."
                  className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={addingNote || !newNote.trim()}
                  className="rounded-lg bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  <Send className="h-3.5 w-3.5" />
                </button>
              </form>

              {/* Timeline Items */}
              <div className="relative pl-6 space-y-4 border-l-2 border-slate-200">
                {job.activities?.map((activity: any) => {
                  let dotColor = 'bg-slate-400';
                  if (activity.type === 'LEAD_CREATED') dotColor = 'bg-blue-600';
                  if (activity.type === 'QUOTE_SENT') dotColor = 'bg-purple-600';
                  if (activity.type === 'CUSTOMER_CONTACTED') dotColor = 'bg-emerald-600';
                  if (activity.type === 'STATUS_CHANGED') dotColor = 'bg-amber-600';

                  return (
                    <div key={activity.id} className="relative group">
                      <div
                        className={`absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-white ${dotColor}`}
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                            {activity.type.replace('_', ' ')}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {formatDate(activity.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-slate-800 mt-0.5 leading-relaxed">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Contact Modal */}
      <QuickContactModal
        job={job}
        isOpen={isContactModalOpen}
        onClose={() => setIsContactModalOpen(false)}
        onSuccess={() => fetchJob()}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteDialogOpen}
        itemTitle={job.title}
        companyName={job.customer.company}
        loading={deleting}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteJob}
      />
    </div>
  );
}
