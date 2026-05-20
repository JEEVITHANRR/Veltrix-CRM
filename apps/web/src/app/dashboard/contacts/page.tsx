// apps/web/src/app/dashboard/contacts/page.tsx
'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Loader2, Trash2, Edit3, X } from 'lucide-react'
import { crmApi, Contact } from '../../../lib/api'

function ContactModal({ contact, onClose, onSave }: { contact: Partial<Contact>; onClose: () => void; onSave: (d: Partial<Contact>) => void }) {
  const [form, setForm] = useState<Partial<Contact>>(contact)
  const [saving, setSaving] = useState(false)
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-ink/40 backdrop-blur-sm" />
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-semibold text-ink">{contact.id ? 'Edit Contact' : 'New Contact'}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-surface-2"><X className="w-4 h-4 text-ink-muted" /></button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: 'firstName', label: 'First name' },
            { key: 'lastName', label: 'Last name' },
            { key: 'email', label: 'Email', span: true },
            { key: 'phone', label: 'Phone' },
            { key: 'company', label: 'Company' },
            { key: 'title', label: 'Title' },
          ].map(f => (
            <div key={f.key} className={f.span ? 'col-span-2' : ''}>
              <label className="block text-xs font-semibold text-ink-secondary mb-1 uppercase tracking-wide">{f.label}</label>
              <input value={(form as Record<string, string>)[f.key] || ''} onChange={e => set(f.key, e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-surface-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-maroon/20" />
            </div>
          ))}
          <div className="col-span-2">
            <label className="block text-xs font-semibold text-ink-secondary mb-1 uppercase tracking-wide">Notes</label>
            <textarea value={form.notes || ''} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
              className="w-full px-3 py-2.5 rounded-xl border border-surface-3 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-maroon/20 resize-none" />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-surface-3 text-sm font-semibold text-ink-tertiary hover:bg-surface-2 transition-colors">Cancel</button>
          <button onClick={async () => { setSaving(true); try { await onSave(form) } finally { setSaving(false) } }}
            disabled={saving || !form.firstName || !form.lastName}
            className="flex-1 py-2.5 rounded-xl bg-maroon text-white text-sm font-semibold hover:bg-maroon-light disabled:opacity-60 transition-colors flex items-center justify-center gap-2">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [modal, setModal] = useState<Partial<Contact> | false>(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const res = await crmApi.getContacts({ search: search || undefined })
      setContacts(res.data); setTotal(res.meta.total)
    } finally { setLoading(false) }
  }, [search])

  useEffect(() => { const t = setTimeout(load, 300); return () => clearTimeout(t) }, [load])

  const handleSave = async (d: Partial<Contact>) => {
    if ((modal as Contact)?.id) await crmApi.updateContact((modal as Contact).id, d)
    else await crmApi.createContact(d as Parameters<typeof crmApi.createContact>[0])
    setModal(false); load()
  }

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-ink">Contacts</h1>
          <p className="text-ink-muted text-sm mt-0.5">{total} contacts</p>
        </div>
        <button onClick={() => setModal({})}
          className="flex items-center gap-2 bg-maroon text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-maroon-light transition-colors">
          <Plus className="w-4 h-4" /> New Contact
        </button>
      </div>

      <div className="flex items-center gap-2 bg-white border border-surface-3 rounded-xl px-3 py-2 max-w-xs mb-6">
        <Search className="w-4 h-4 text-ink-muted" />
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search contacts…" className="bg-transparent text-sm text-ink flex-1 outline-none" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {loading ? (
          <div className="col-span-full py-16 text-center"><Loader2 className="w-6 h-6 animate-spin text-maroon mx-auto" /></div>
        ) : contacts.length === 0 ? (
          <div className="col-span-full py-16 text-center text-ink-muted text-sm">
            No contacts yet. <button onClick={() => setModal({})} className="text-maroon font-semibold hover:underline">Add one →</button>
          </div>
        ) : contacts.map(c => (
          <motion.div key={c.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl border border-surface-3 p-5 shadow-card hover:shadow-card-hover transition-shadow group">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-maroon to-maroon-dark flex items-center justify-center text-white font-bold text-sm">
                {c.firstName[0]}{c.lastName[0]}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setModal(c)} className="p-1.5 rounded-lg hover:bg-surface-2 text-ink-muted hover:text-ink">
                  <Edit3 className="w-3.5 h-3.5" />
                </button>
                <button onClick={async () => { if (confirm('Delete?')) { await crmApi.deleteContact(c.id); load() } }}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-ink-muted hover:text-red-500">
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="font-semibold text-sm text-ink">{c.firstName} {c.lastName}</div>
            {c.title && <div className="text-xs text-ink-tertiary mt-0.5">{c.title}</div>}
            {c.company && <div className="text-xs text-ink-muted">{c.company}</div>}
            {c.email && <div className="text-xs text-maroon/70 mt-2 truncate">{c.email}</div>}
            {c.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-3">
                {c.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="text-[10px] bg-surface-2 text-ink-muted px-2 py-0.5 rounded-full font-medium">{tag}</span>
                ))}
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {modal !== false && <ContactModal contact={modal} onClose={() => setModal(false)} onSave={handleSave} />}
      </AnimatePresence>
    </div>
  )
}
