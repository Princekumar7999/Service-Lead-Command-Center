'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  Building,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Wrench,
  DollarSign,
  Send,
} from 'lucide-react';
import { PriorityBadge } from '@/components/ui/Badges';
import { JOB_STATUSES, JOB_PRIORITIES, LEAD_SOURCES } from '@/lib/validation';

function NewJobContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'ai' ? 'ai' : 'manual';

  const [activeTab, setActiveTab] = useState<'ai' | 'manual'>(initialTab);

  // AI Extraction State
  const [rawMessage, setRawMessage] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [aiError, setAiError] = useState('');
  const [extractedLead, setExtractedLead] = useState<any | null>(null);
  const [extractionMeta, setExtractionMeta] = useState<{ mode?: string; provider?: string } | null>(null);

  // Manual & Review Form State
  const [formData, setFormData] = useState({
    customerName: '',
    company: '',
    phone: '',
    email: '',
    address: '',
    title: '',
    description: '',
    status: 'NEW',
    priority: 'HIGH',
    estimatedValue: 1500,
    source: 'PHONE',
    nextFollowUpAt: '',
    assignedTechnician: 'Mike',
  });

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  // Sample real text messages for reviewer convenience
  const sampleMessages = [
    {
      label: "Sample 1: Joe's Deli Walk-in Emergency (From transcript)",
      text: "Hey Denise, freezer 2 at Joe's Deli is sitting at 55 degrees and we're losing product. Can someone come by around 2pm? Joe 555-0144",
    },
    {
      label: 'Sample 2: ABC Restaurant Compressor Issue',
      text: "Hi Denise, this is Robert from ABC Restaurant. Our walk-in freezer compressor is making a loud buzzing sound and temp is creeping up. Please call me back at 555-234-8901.",
    },
    {
      label: 'Sample 3: Fresh Market Ice Machine Leak',
      text: "Denise, Elena here from Fresh Market. Our Manitowoc ice machine is leaking water on the prep kitchen floor. Need a quote ASAP. Elena (555) 901-2345.",
    },
  ];

  const handleExtract = async (textToExtract?: string) => {
    const text = textToExtract || rawMessage;
    if (!text.trim()) {
      setAiError('Please enter or select a customer message first.');
      return;
    }

    setExtracting(true);
    setAiError('');

    try {
      const res = await fetch('/api/ai/extract', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to extract lead details.');
      }

      setExtractedLead(data.extracted);
      setExtractionMeta({
        mode: data.mode,
        provider: data.provider || (data.mode === 'deterministic-nlp-fallback' ? 'Smart NLP Engine' : 'AI Cloud'),
      });

      // Pre-fill form for human confirmation
      const hours = data.extracted.suggestedFollowUpHours || 4;
      const followUpDate = new Date(Date.now() + hours * 60 * 60 * 1000);
      const isoString = followUpDate.toISOString().slice(0, 16);

      setFormData({
        customerName: data.extracted.customerName,
        company: data.extracted.company,
        phone: data.extracted.phone || '',
        email: data.extracted.email || '',
        address: '',
        title: data.extracted.problem,
        description: `Customer Message: "${text}"\nRequested Time: ${data.extracted.requestedTime || 'Standard'}`,
        status: 'NEW',
        priority: data.extracted.urgency,
        estimatedValue: data.extracted.suggestedValue,
        source: data.extracted.source,
        nextFollowUpAt: isoString,
        assignedTechnician: 'Mike',
      });
    } catch (err: any) {
      setAiError(err.message || 'Error communicating with AI service');
    } finally {
      setExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFormError('');

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          estimatedValue: Number(formData.estimatedValue) || 0,
          nextFollowUpAt: formData.nextFollowUpAt ? new Date(formData.nextFollowUpAt).toISOString() : null,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create job.');
      }

      router.push(`/jobs/${data.job.id}`);
    } catch (err: any) {
      setFormError(err.message || 'Error saving job to database');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 mb-3"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Today&apos;s Actions</span>
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
          Create Commercial Service Job
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Capture new walk-in cooler, freezer, or ice machine repair requests and ensure a follow-up is scheduled.
        </p>
      </div>

      {/* Mode Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          type="button"
          onClick={() => setActiveTab('ai')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'ai'
              ? 'border-indigo-600 text-indigo-600 bg-indigo-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <Sparkles className="h-4 w-4 text-indigo-600" />
          <span>✨ AI Message Ingestion (Text/Email)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('manual')}
          className={`flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-semibold transition-colors ${
            activeTab === 'manual'
              ? 'border-blue-600 text-blue-600 bg-blue-50/30'
              : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
          }`}
        >
          <FileText className="h-4 w-4 text-blue-600" />
          <span>Manual Entry Form</span>
        </button>
      </div>

      {/* AI Extraction Section */}
      {activeTab === 'ai' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-indigo-200 bg-indigo-50/40 p-5 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-indigo-950 flex items-center gap-1.5">
                  <Sparkles className="h-4 w-4 text-indigo-600" />
                  <span>Paste Raw Customer Message</span>
                </h2>
                <p className="text-xs text-indigo-800 mt-0.5">
                  Denise receives scattered texts and voicemails. AI parses the customer, equipment issue, urgency, and estimated value for human confirmation.
                </p>
              </div>
              <span className="rounded bg-indigo-200/70 px-2 py-0.5 text-[10px] font-bold text-indigo-900 uppercase">
                Human-in-the-Loop
              </span>
            </div>

            {/* Quick Test Presets */}
            <div>
              <span className="block text-[11px] font-semibold text-indigo-900 uppercase tracking-wider mb-1.5">
                Quick Test Presets (Click to Auto-fill & Extract):
              </span>
              <div className="flex flex-wrap gap-2">
                {sampleMessages.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setRawMessage(sample.text);
                      handleExtract(sample.text);
                    }}
                    className="text-left text-xs bg-white border border-indigo-200 hover:border-indigo-400 hover:bg-indigo-50 text-indigo-900 px-3 py-1.5 rounded-lg shadow-sm transition-colors"
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <textarea
                value={rawMessage}
                onChange={(e) => setRawMessage(e.target.value)}
                placeholder="Paste customer text message, website inquiry email, or voicemail transcript here..."
                rows={4}
                className="w-full rounded-lg border border-indigo-200 bg-white p-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {aiError && (
              <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200">
                {aiError}
              </div>
            )}

            <div className="flex items-center justify-between">
              <span className="text-xs text-indigo-700">
                &ldquo;LLM for ambiguity, Code for certainty.&rdquo; Review draft before DB write.
              </span>
              <button
                type="button"
                disabled={extracting || !rawMessage.trim()}
                onClick={() => handleExtract()}
                className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-indigo-700 transition-colors disabled:opacity-50"
              >
                <Sparkles className="h-4 w-4" />
                <span>{extracting ? 'Analyzing with AI...' : '✨ Extract Lead with AI'}</span>
              </button>
            </div>
          </div>

          {/* AI Extracted Confirmation Banner */}
          {extractedLead && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2 text-emerald-900 font-bold text-sm">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                  <span>Lead Extracted Successfully — Please Review & Confirm Below</span>
                </div>
                {extractionMeta && (
                  <span className="rounded-full bg-emerald-200/80 px-2.5 py-0.5 text-[11px] font-bold text-emerald-900 border border-emerald-300">
                    Engine: {extractionMeta.provider} {extractionMeta.mode ? `(${extractionMeta.mode})` : ''}
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-800">
                Check the pre-filled fields below. You can adjust the estimated value, technician, or follow-up date before saving.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Main Form (Used for both AI Confirmation and Manual Entry) */}
      <form onSubmit={handleSubmit} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm space-y-6">
        {formError && (
          <div className="rounded-lg bg-red-50 p-3 text-xs text-red-700 border border-red-200 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{formError}</span>
          </div>
        )}

        {/* Customer Information */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
            <Building className="h-4 w-4 text-blue-600" />
            <span>Customer & Business Information</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company / Restaurant Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="e.g. ABC Restaurant, Joe's Deli"
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Contact Person Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.customerName}
                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                placeholder="e.g. Robert Miller, Elena"
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="(555) 000-0000"
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address (Optional)
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="manager@example.com"
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Service Address (Optional)
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="742 Evergreen Terrace, Downtown"
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Job & Refrigeration Equipment Details */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 pb-2 border-b border-slate-100 mb-4 flex items-center gap-2">
            <Wrench className="h-4 w-4 text-blue-600" />
            <span>Equipment Problem & Service Scope</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Job Title / Problem Summary <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g. Walk-in Freezer Holding at 45°F, Ice Machine Leak"
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Detailed Diagnostic Notes & Raw Request
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Provide notes on equipment model, temperature readings, noise, or customer timeline..."
                rows={3}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estimated Value ($)
              </label>
              <input
                type="number"
                min="0"
                step="50"
                value={formData.estimatedValue}
                onChange={(e) => setFormData({ ...formData, estimatedValue: Number(e.target.value) })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lead Source
              </label>
              <select
                value={formData.source}
                onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                {LEAD_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Urgency / Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                {JOB_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Initial Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                {JOB_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Target Follow-up Date & Time <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.nextFollowUpAt}
                onChange={(e) => setFormData({ ...formData, nextFollowUpAt: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              />
              <span className="text-[11px] text-slate-500 mt-1 block">
                Powers Denise&apos;s morning action queue and prevents forgotten jobs.
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assigned Field Technician
              </label>
              <select
                value={formData.assignedTechnician}
                onChange={(e) => setFormData({ ...formData, assignedTechnician: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none"
              >
                <option value="Mike">Mike (Senior Refrigeration Tech)</option>
                <option value="Dave">Dave (HVAC / Compressors)</option>
                <option value="Sarah">Sarah (Commercial Display Cases)</option>
                <option value="Carlos">Carlos (Ice Machines & Glycol)</option>
                <option value="">Unassigned (Denise to Dispatch)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <Link
            href="/"
            className="rounded-lg px-4 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
          >
            Cancel
          </Link>

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>{submitting ? 'Creating Service Job...' : 'Confirm & Create Job'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}

export default function NewJobPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-4xl mx-auto p-12 text-center text-slate-500">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-blue-600 border-t-transparent mb-2" />
          <p className="text-xs font-semibold text-slate-600">Loading job intake form...</p>
        </div>
      }
    >
      <NewJobContent />
    </Suspense>
  );
}
