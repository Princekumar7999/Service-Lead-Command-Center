'use client';

import { Trash2, AlertTriangle, X } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  title?: string;
  itemTitle: string;
  companyName?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteConfirmModal({
  isOpen,
  title = 'Delete Service Project / Job',
  itemTitle,
  companyName,
  loading = false,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 bg-rose-50/70 px-5 py-3.5">
          <div className="flex items-center gap-2 text-rose-800 font-bold text-sm">
            <AlertTriangle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{title}</span>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-600 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-3">
          <p className="text-sm text-slate-700">
            Are you sure you want to permanently delete this service project?
          </p>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs">
            {companyName && (
              <p className="font-bold text-slate-900 mb-0.5">{companyName}</p>
            )}
            <p className="text-slate-600">{itemTitle}</p>
          </div>

          <p className="text-xs text-rose-600 font-medium">
            ⚠️ This will remove all associated follow-up timers, contact logs, and timeline notes. This action cannot be undone.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2.5 px-5 py-3.5 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-rose-700 disabled:opacity-50 transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>{loading ? 'Deleting...' : 'Yes, Delete Project'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
