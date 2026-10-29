'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Star, Plus, Trash2, ChevronUp, ChevronDown, Eye, EyeOff, RefreshCw, Save, X, Check, Download, Upload } from 'lucide-react';

// ─── CSV helpers ────────────────────────────────────────────────────────────

function escapeCSVField(val: unknown): string {
  const str = String(val ?? '');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuote = false;
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < normalized.length; i++) {
    const ch = normalized[i];
    if (ch === '"') {
      if (inQuote && normalized[i + 1] === '"') { field += '"'; i++; }
      else inQuote = !inQuote;
    } else if (ch === ',' && !inQuote) {
      row.push(field); field = '';
    } else if (ch === '\n' && !inQuote) {
      row.push(field); rows.push(row); row = []; field = '';
    } else {
      field += ch;
    }
  }
  if (field || row.length) { row.push(field); rows.push(row); }
  return rows;
}

const CSV_HEADERS = ['id', 'name', 'rating', 'date', 'treatment', 'text', 'isActive', 'sortOrder'] as const;

interface Testimonial {
  id: string;
  name: string;
  rating: number;
  date: string;
  treatment: string;
  text: string;
  isActive: boolean;
  sortOrder: number;
}

const BLANK: Omit<Testimonial, 'id' | 'sortOrder' | 'isActive'> = {
  name: '',
  rating: 5,
  date: '',
  treatment: '',
  text: '',
};

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" onClick={() => onChange(n)} className="p-0.5">
          <Star className={`h-4 w-4 ${n <= value ? 'fill-amber-400 text-amber-400' : 'text-gray-300'}`} />
        </button>
      ))}
    </div>
  );
}

export default function ReviewsAdminPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<Testimonial>>({});
  const [showAddForm, setShowAddForm] = useState(false);
  const [newForm, setNewForm] = useState({ ...BLANK });
  const [addingSaving, setAddingSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [importStatus, setImportStatus] = useState<{ state: 'idle' | 'preview' | 'importing' | 'done'; preview?: { rows: Testimonial[]; created: number; updated: number }; result?: { created: number; updated: number } }>({ state: 'idle' });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/testimonials');
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data.testimonials);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const patch = async (id: string, data: Partial<Testimonial>) => {
    setSaving(id);
    try {
      const res = await fetch(`/api/admin/testimonials/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) await load();
    } finally {
      setSaving(null);
    }
  };

  const toggleActive = (t: Testimonial) => patch(t.id, { isActive: !t.isActive });

  const move = async (index: number, direction: -1 | 1) => {
    const swapIndex = index + direction;
    if (swapIndex < 0 || swapIndex >= testimonials.length) return;
    const a = testimonials[index];
    const b = testimonials[swapIndex];
    setSaving(a.id);
    try {
      await Promise.all([
        fetch(`/api/admin/testimonials/${a.id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sortOrder: b.sortOrder }),
        }),
        fetch(`/api/admin/testimonials/${b.id}`, {
          method: 'PATCH', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sortOrder: a.sortOrder }),
        }),
      ]);
      await load();
    } finally {
      setSaving(null);
    }
  };

  const startEdit = (t: Testimonial) => {
    setEditingId(t.id);
    setEditDraft({ name: t.name, rating: t.rating, date: t.date, treatment: t.treatment, text: t.text });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    await patch(editingId, editDraft);
    setEditingId(null);
    setEditDraft({});
  };

  const cancelEdit = () => { setEditingId(null); setEditDraft({}); };

  const deleteTestimonial = async (id: string) => {
    setSaving(id);
    try {
      await fetch(`/api/admin/testimonials/${id}`, { method: 'DELETE' });
      await load();
    } finally {
      setSaving(null);
      setConfirmDelete(null);
    }
  };

  const exportCSV = () => {
    const headerRow = CSV_HEADERS.join(',');
    const dataRows = testimonials.map((t) =>
      [t.id, t.name, t.rating, t.date, t.treatment, t.text, t.isActive, t.sortOrder]
        .map(escapeCSVField)
        .join(',')
    );
    const csv = [headerRow, ...dataRows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `testimonials-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const text = await file.text();
    const allRows = parseCSV(text).filter((r) => r.some((f) => f.trim()));
    if (allRows.length < 2) return;

    const [headerRow, ...dataRows] = allRows;
    const headers = headerRow.map((h) => h.trim().toLowerCase());
    const idx = (col: string) => headers.indexOf(col);

    const parsed: Testimonial[] = dataRows
      .filter((r) => r[idx('text')]?.trim())
      .map((r, i) => ({
        id: r[idx('id')]?.trim() || '',
        name: r[idx('name')]?.trim() || '',
        rating: Math.min(5, Math.max(1, parseInt(r[idx('rating')]) || 5)),
        date: r[idx('date')]?.trim() || '',
        treatment: r[idx('treatment')]?.trim() || '',
        text: r[idx('text')]?.trim() || '',
        isActive: r[idx('isactive')] !== 'false' && r[idx('isactive')] !== '0',
        sortOrder: parseInt(r[idx('sortorder')]) || i,
      }));

    const existingIds = new Set(testimonials.map((t) => t.id));
    const willUpdate = parsed.filter((r) => r.id && existingIds.has(r.id)).length;
    const willCreate = parsed.length - willUpdate;

    setImportStatus({ state: 'preview', preview: { rows: parsed, created: willCreate, updated: willUpdate } });
  };

  const confirmImport = async () => {
    if (!importStatus.preview) return;
    setImportStatus((s) => ({ ...s, state: 'importing' }));
    try {
      const res = await fetch('/api/admin/testimonials/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ testimonials: importStatus.preview.rows }),
      });
      const data = await res.json();
      setImportStatus({ state: 'done', result: data });
      await load();
    } catch {
      setImportStatus({ state: 'idle' });
    }
  };

  const addTestimonial = async () => {
    if (!newForm.name || !newForm.text || !newForm.date || !newForm.treatment) return;
    setAddingSaving(true);
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...newForm, isActive: true }),
      });
      if (res.ok) {
        setNewForm({ ...BLANK });
        setShowAddForm(false);
        await load();
      }
    } finally {
      setAddingSaving(false);
    }
  };

  const activeCount = testimonials.filter((t) => t.isActive).length;

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <Star className="h-6 w-6 text-[#2E2865]" />
          <h1 className="text-2xl font-bold text-gray-900">Reviews</h1>
          <span className="text-sm text-gray-500">
            ({activeCount} active · {testimonials.length} total)
          </span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={load}
            className="p-2 border border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50"
            title="Refresh"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
          <button
            onClick={exportCSV}
            disabled={testimonials.length === 0}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 disabled:opacity-40"
            title="Download all reviews as CSV"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
            title="Upload a CSV to bulk-import or update reviews"
          >
            <Upload className="h-4 w-4" /> Import CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv,text/csv"
            className="hidden"
            onChange={handleFileSelect}
          />
          <button
            onClick={() => setShowAddForm(true)}
            className="flex items-center gap-2 px-4 py-2 bg-[#2E2865] text-white text-sm rounded-lg hover:bg-[#1E1845] transition-colors"
          >
            <Plus className="h-4 w-4" /> Add Review
          </button>
        </div>
      </div>

      <div className="mb-4 p-3 bg-blue-50 rounded-lg text-xs text-blue-800">
        Active reviews appear on the home page in sort order. Toggle visibility or reorder without publishing code changes.
        <span className="block mt-1 text-blue-600">
          CSV columns: <code className="font-mono">id, name, rating, date, treatment, text, isActive, sortOrder</code> — the <code className="font-mono">id</code> column lets imports update existing rows.
        </span>
      </div>

      {/* Import status banner */}
      {importStatus.state === 'preview' && importStatus.preview && (
        <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-xl">
          <p className="text-sm font-medium text-amber-900 mb-1">
            Ready to import {importStatus.preview.rows.length} review{importStatus.preview.rows.length !== 1 ? 's' : ''}
          </p>
          <p className="text-xs text-amber-700 mb-3">
            {importStatus.preview.created} new &nbsp;·&nbsp; {importStatus.preview.updated} update{importStatus.preview.updated !== 1 ? 's' : ''}
          </p>
          <div className="flex gap-2">
            <button
              onClick={confirmImport}
              className="px-3 py-1.5 text-sm bg-[#2E2865] text-white rounded-lg hover:bg-[#1E1845]"
            >
              Confirm Import
            </button>
            <button
              onClick={() => setImportStatus({ state: 'idle' })}
              className="px-3 py-1.5 text-sm border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {importStatus.state === 'importing' && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
          <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
          <p className="text-sm text-blue-800">Importing…</p>
        </div>
      )}

      {importStatus.state === 'done' && importStatus.result && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Check className="h-4 w-4 text-green-600" />
            <p className="text-sm text-green-800">
              Import complete — {importStatus.result.created} created, {importStatus.result.updated} updated
            </p>
          </div>
          <button
            onClick={() => setImportStatus({ state: 'idle' })}
            className="text-green-600 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Add form */}
      {showAddForm && (
        <div className="mb-6 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">New Review</h2>
            <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Reviewer name *</label>
              <input
                value={newForm.name}
                onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Sarah M."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Date *</label>
              <input
                value={newForm.date}
                onChange={(e) => setNewForm((f) => ({ ...f, date: e.target.value }))}
                placeholder="e.g. 2 months ago"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Treatment tag *</label>
              <input
                value={newForm.treatment}
                onChange={(e) => setNewForm((f) => ({ ...f, treatment: e.target.value }))}
                placeholder="e.g. HIFU"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Rating</label>
              <StarPicker value={newForm.rating} onChange={(r) => setNewForm((f) => ({ ...f, rating: r }))} />
            </div>
          </div>
          <div className="mb-4">
            <label className="block text-xs font-medium text-gray-600 mb-1">Review text *</label>
            <textarea
              value={newForm.text}
              onChange={(e) => setNewForm((f) => ({ ...f, text: e.target.value }))}
              rows={3}
              placeholder="Paste or type the review…"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent resize-none"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={addTestimonial}
              disabled={addingSaving || !newForm.name || !newForm.text || !newForm.date || !newForm.treatment}
              className="px-4 py-2 text-sm bg-[#2E2865] text-white rounded-lg hover:bg-[#1E1845] disabled:opacity-50 flex items-center gap-2"
            >
              {addingSaving ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Add Review
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16">
          <RefreshCw className="h-6 w-6 text-gray-400 animate-spin" />
        </div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No reviews yet. Add the first one above.</div>
      ) : (
        <div className="space-y-3">
          {testimonials.map((t, index) => {
            const isEditing = editingId === t.id;
            const isSaving = saving === t.id;
            const isConfirmingDelete = confirmDelete === t.id;

            return (
              <div
                key={t.id}
                className={`bg-white rounded-xl border transition-all ${
                  t.isActive ? 'border-gray-200' : 'border-gray-100 opacity-60'
                }`}
              >
                {/* Row header */}
                <div className="flex items-center gap-3 p-4">
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-0.5 shrink-0">
                    <button
                      onClick={() => move(index, -1)}
                      disabled={index === 0 || isSaving}
                      className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20"
                    >
                      <ChevronUp className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => move(index, 1)}
                      disabled={index === testimonials.length - 1 || isSaving}
                      className="p-0.5 text-gray-300 hover:text-gray-600 disabled:opacity-20"
                    >
                      <ChevronDown className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Order badge */}
                  <span className="w-6 text-center text-xs font-mono text-gray-400 shrink-0">{index + 1}</span>

                  {/* Stars */}
                  <div className="flex gap-0.5 shrink-0">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`h-3.5 w-3.5 ${i < t.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`}
                      />
                    ))}
                  </div>

                  {/* Name + date */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-900 truncate">{t.name}</p>
                    <p className="text-xs text-gray-400 truncate">{t.date} · {t.treatment}</p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0">
                    {isSaving && <RefreshCw className="h-4 w-4 text-gray-400 animate-spin" />}

                    <button
                      onClick={() => toggleActive(t)}
                      title={t.isActive ? 'Hide from site' : 'Show on site'}
                      className={`p-1.5 rounded-lg transition-colors ${
                        t.isActive
                          ? 'text-green-600 hover:bg-green-50'
                          : 'text-gray-400 hover:bg-gray-100'
                      }`}
                    >
                      {t.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                    </button>

                    {isEditing ? (
                      <>
                        <button
                          onClick={saveEdit}
                          className="p-1.5 rounded-lg text-green-600 hover:bg-green-50"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={cancelEdit}
                          className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => startEdit(t)}
                        className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 text-xs font-medium"
                      >
                        <Save className="h-4 w-4" />
                      </button>
                    )}

                    {isConfirmingDelete ? (
                      <>
                        <button
                          onClick={() => deleteTestimonial(t.id)}
                          className="px-2 py-1 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          Delete
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="px-2 py-1 text-xs border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setConfirmDelete(t.id)}
                        className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Edit form (inline expansion) */}
                {isEditing && (
                  <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Reviewer name</label>
                        <input
                          value={editDraft.name ?? ''}
                          onChange={(e) => setEditDraft((d) => ({ ...d, name: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                        <input
                          value={editDraft.date ?? ''}
                          onChange={(e) => setEditDraft((d) => ({ ...d, date: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Treatment tag</label>
                        <input
                          value={editDraft.treatment ?? ''}
                          onChange={(e) => setEditDraft((d) => ({ ...d, treatment: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Rating</label>
                        <StarPicker
                          value={editDraft.rating ?? 5}
                          onChange={(r) => setEditDraft((d) => ({ ...d, rating: r }))}
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">Review text</label>
                      <textarea
                        value={editDraft.text ?? ''}
                        onChange={(e) => setEditDraft((d) => ({ ...d, text: e.target.value }))}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#2E2865] focus:border-transparent resize-none"
                      />
                    </div>
                  </div>
                )}

                {/* Preview text (when not editing) */}
                {!isEditing && (
                  <p className="px-4 pb-3 text-xs text-gray-400 line-clamp-2 border-t border-gray-50 pt-2">
                    {t.text}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
