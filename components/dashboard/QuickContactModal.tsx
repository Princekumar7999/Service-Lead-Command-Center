'use client';

import { useState } from 'react';
import { X, PhoneCall, Check, Calendar, ArrowRight } from 'lucide-react';

interface QuickContactModalProps {
  job: {
    id: string;
    title: string;
    status: string;
    customer: {
      name: string;
      company: string;
      phone: string;
    };
  } | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function QuickContactModal({ job, isOpen, onClose, onSuccess }: QuickContactModalProps) {
  const [note, setNote] = useState('');
  const [followUpDays, setFollowUpDays] = useState('2');
  const [newStatus, setNewStatus] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !job) return null;

  const quickPresets = [
    'Spoke with customer; reviewed quote details and waiting for sign-off.',
    'Called customer; left voicemail with quote number and callback info.',
    'Customer approved quote! Ready to assign technician and schedule.',
    'Sent follow-up text regarding freezer repair estimate.',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/jobs/${job.id}/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          note: note.trim() || 'Follow-up call logged with customer.',
          nextFollowUpDays: Number(followUpDays),
          newStatus: newStatus || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update follow-up');
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Error recording contact');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/80 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <PhoneCall className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Log Follow-up Call / Contact</h3>
              <p className="text-xs text-slate-500">{job.customer.company} • {job.customer.name}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Quick Preset Notes
            </label>
            <div className="grid grid-cols-1 gap-1.5">
              {quickPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setNote(preset)}
                  className="text-left text-xs px-3 py-2 rounded-lg border border-slate-200 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 text-slate-700 transition-colors"
                >
                  &ldquo;{preset}&rdquo;
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
              Contact Note / Outcome
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Enter what was discussed with the customer..."
              rows={3}
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Next Follow-up
              </label>
              <select
                value={followUpDays}
                onChange={(e) => setFollowUpDays(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                <option value="1">Tomorrow (+1 day)</option>
                <option value="2">In 2 days (+2 days)</option>
                <option value="3">In 3 days (+3 days)</option>
                <option value="7">In 1 week (+7 days)</option>
                <option value="0">No further follow-up</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">
                Advance Status (Optional)
              </label>
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                <option value="">Keep current ({job.status.replace('_', ' ')})</option>
                <option value="NEEDS_QUOTE">Needs Quote</option>
                <option value="QUOTE_SENT">Quote Sent</option>
                <option value="WAITING_ON_YES">Waiting on Yes</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="COMPLETED">Completed</option>
                <option value="LOST">Lost</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-700 shadow-sm transition-colors disabled:opacity-50"
            >
              <Check className="h-4 w-4" />
              <span>{loading ? 'Saving...' : 'Save & Update Follow-up'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
