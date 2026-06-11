'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

// ── Types ───────────────────────────────────────────────────────────────────

type LeadCible  = 'DRH' | 'Dirigeant' | 'CIP'
type LeadStatut = 'froid' | 'tiede' | 'chaud'

interface Lead {
  id: string
  prenom: string | null
  nom: string | null
  email: string | null
  poste: string | null
  entreprise: string | null
  statut: LeadStatut | null
  cible: LeadCible | null
  linkedin_url: string | null
  unipile_provider_id: string | null
  unipile_chat_id: string | null
  invite_sent_at: string | null
  accepted_at: string | null
  first_reply_at: string | null
  auto_reply_sent_at: string | null
  relance_1_sent_at: string | null
  relance_2_sent_at: string | null
  created_at: string
}

interface Stats {
  total: number
  invited: number
  accepted: number
  replied: number
  tauxAcceptation: number
  tauxReponse: number
  statuts: { froid: number; tiede: number; chaud: number }
  invitesAujourdHui: number
}

interface Settings {
  id: string
  cible: LeadCible
  auto_reply_message: string | null
  relance_1_message: string | null
  relance_1_delay_days: number
  relance_2_message: string | null
  relance_2_delay_days: number
}

// ── Helpers ──────────────────────────────────────────────────────────────────

const CIBLE_COLORS: Record<LeadCible, string> = {
  DRH:       'bg-purple-100 text-purple-700',
  Dirigeant: 'bg-blue-100 text-blue-700',
  CIP:       'bg-orange-100 text-orange-700',
}

const STATUT_COLORS: Record<LeadStatut, string> = {
  froid: 'bg-slate-100 text-slate-600',
  tiede: 'bg-amber-100 text-amber-700',
  chaud: 'bg-red-100 text-red-700',
}

const STATUT_EMOJI: Record<LeadStatut, string> = {
  froid: '🧊',
  tiede: '🌡️',
  chaud: '🔥',
}

function fmt(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })
}

// ── Main Page ────────────────────────────────────────────────────────────────

export default function ProspectionPage() {
  const [leads, setLeads]         = useState<Lead[]>([])
  const [stats, setStats]         = useState<Stats | null>(null)
  const [settings, setSettings]   = useState<Settings[]>([])
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState<'prospects' | 'import' | 'settings'>('prospects')
  const [filterCible, setFilterCible]   = useState<LeadCible | ''>('')
  const [filterStatut, setFilterStatut] = useState<LeadStatut | ''>('')
  const [toast, setToast]         = useState<{ msg: string; ok: boolean } | null>(null)
  const [running, setRunning]     = useState(false)

  const showToast = useCallback((msg: string, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 3500)
  }, [])

  const loadAll = useCallback(async () => {
    const [leadsRes, statsRes, settingsRes] = await Promise.all([
      fetch('/api/prospects'),
      fetch('/api/stats'),
      fetch('/api/settings'),
    ])
    if (leadsRes.ok)    setLeads(await leadsRes.json())
    if (statsRes.ok)    setStats(await statsRes.json())
    if (settingsRes.ok) setSettings(await settingsRes.json())
    setLoading(false)
  }, [])

  useEffect(() => { loadAll() }, [loadAll])

  const filteredLeads = leads.filter(l => {
    if (filterCible  && l.cible  !== filterCible)  return false
    if (filterStatut && l.statut !== filterStatut) return false
    return true
  })

  async function runAutomation() {
    setRunning(true)
    const res = await fetch('/api/automation/run', { method: 'POST' })
    const data = await res.json()
    setRunning(false)
    if (res.ok) {
      showToast(`✅ ${data.invitesSent} invitations · ${data.autoRepliesSent} auto-réponses · ${data.relance1Sent + data.relance2Sent} relances`)
      loadAll()
    } else {
      showToast(data.error ?? 'Erreur automation', false)
    }
  }

  async function sendInvite(id: string) {
    const res = await fetch(`/api/prospects/${id}/invite`, { method: 'POST' })
    const data = await res.json()
    if (res.ok) { showToast('Invitation envoyée'); loadAll() }
    else showToast(data.error ?? 'Erreur', false)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">L</div>
          <h1 className="text-lg font-semibold text-gray-900">LDG School — Prospection</h1>
        </div>
        <button
          onClick={runAutomation}
          disabled={running}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {running ? (
            <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : '▶'}
          Lancer automation
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-6 space-y-6">

        {/* Stats */}
        {stats && <StatsBar stats={stats} />}

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {(['prospects', 'import', 'settings'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                tab === t ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {t === 'prospects' ? 'Prospects' : t === 'import' ? 'Importer' : 'Configuration'}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === 'prospects' && (
          <ProspectsTab
            leads={filteredLeads}
            loading={loading}
            filterCible={filterCible}
            filterStatut={filterStatut}
            onFilterCible={setFilterCible}
            onFilterStatut={setFilterStatut}
            onSendInvite={sendInvite}
          />
        )}
        {tab === 'import' && (
          <ImportTab onImported={() => { loadAll(); setTab('prospects') }} showToast={showToast} />
        )}
        {tab === 'settings' && (
          <SettingsTab settings={settings} onSaved={(s) => {
            setSettings(prev => prev.map(p => p.cible === s.cible ? s : p))
            showToast('Configuration sauvegardée')
          }} />
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 px-4 py-3 rounded-xl shadow-lg text-sm font-medium text-white transition-all ${
          toast.ok ? 'bg-emerald-600' : 'bg-red-600'
        }`}>
          {toast.msg}
        </div>
      )}
    </div>
  )
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────

function StatsBar({ stats }: { stats: Stats }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
      <StatCard label="Total" value={stats.total} sub="prospects" color="text-gray-900" />
      <StatCard label="Invités" value={stats.invited} sub={`auj: ${stats.invitesAujourdHui}/15`} color="text-indigo-600" />
      <StatCard label="Accepté" value={`${stats.tauxAcceptation}%`} sub={`${stats.accepted} / ${stats.invited}`} color="text-blue-600" />
      <StatCard label="Réponse" value={`${stats.tauxReponse}%`} sub={`${stats.replied} / ${stats.accepted}`} color="text-emerald-600" />
      <StatCard label="🧊 Froid" value={stats.statuts.froid} sub="leads" color="text-slate-600" />
      <StatCard label="🌡️ Tiède" value={stats.statuts.tiede} sub="leads" color="text-amber-600" />
      <StatCard label="🔥 Chaud" value={stats.statuts.chaud} sub="leads" color="text-red-600" />
    </div>
  )
}

function StatCard({ label, value, sub, color }: { label: string; value: string | number; sub: string; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
    </div>
  )
}

// ── Prospects Tab ─────────────────────────────────────────────────────────────

function ProspectsTab({
  leads, loading, filterCible, filterStatut, onFilterCible, onFilterStatut, onSendInvite,
}: {
  leads: Lead[]
  loading: boolean
  filterCible: LeadCible | ''
  filterStatut: LeadStatut | ''
  onFilterCible: (v: LeadCible | '') => void
  onFilterStatut: (v: LeadStatut | '') => void
  onSendInvite: (id: string) => void
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Filters */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
        <span className="text-sm text-gray-500">{leads.length} prospect{leads.length !== 1 ? 's' : ''}</span>
        <div className="flex-1" />
        <select
          value={filterCible}
          onChange={e => onFilterCible(e.target.value as LeadCible | '')}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
        >
          <option value="">Toutes cibles</option>
          <option value="DRH">DRH</option>
          <option value="Dirigeant">Dirigeant</option>
          <option value="CIP">CIP</option>
        </select>
        <select
          value={filterStatut}
          onChange={e => onFilterStatut(e.target.value as LeadStatut | '')}
          className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white"
        >
          <option value="">Tous statuts</option>
          <option value="froid">🧊 Froid</option>
          <option value="tiede">🌡️ Tiède</option>
          <option value="chaud">🔥 Chaud</option>
        </select>
      </div>

      {loading ? (
        <div className="py-16 text-center text-sm text-gray-400">Chargement…</div>
      ) : leads.length === 0 ? (
        <div className="py-16 text-center text-sm text-gray-400">Aucun prospect. Importez des données via l&apos;onglet &ldquo;Importer&rdquo;.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="text-left px-4 py-3">Prospect</th>
                <th className="text-left px-4 py-3">Cible</th>
                <th className="text-left px-4 py-3">Statut</th>
                <th className="text-left px-4 py-3">Invité</th>
                <th className="text-left px-4 py-3">Accepté</th>
                <th className="text-left px-4 py-3">Répondu</th>
                <th className="text-left px-4 py-3">R1</th>
                <th className="text-left px-4 py-3">R2</th>
                <th className="text-left px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {leads.map(lead => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{lead.prenom} {lead.nom}</div>
                    <div className="text-xs text-gray-400 truncate max-w-[180px]">{lead.entreprise ?? lead.poste ?? '—'}</div>
                  </td>
                  <td className="px-4 py-3">
                    {lead.cible ? (
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${CIBLE_COLORS[lead.cible]}`}>
                        {lead.cible}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    {lead.statut ? (
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${STATUT_COLORS[lead.statut]}`}>
                        {STATUT_EMOJI[lead.statut]} {lead.statut}
                      </span>
                    ) : '—'}
                  </td>
                  <td className="px-4 py-3 text-gray-500">{fmt(lead.invite_sent_at)}</td>
                  <td className="px-4 py-3 text-gray-500">{fmt(lead.accepted_at)}</td>
                  <td className="px-4 py-3 text-gray-500">{fmt(lead.first_reply_at)}</td>
                  <td className="px-4 py-3 text-gray-500">{fmt(lead.relance_1_sent_at)}</td>
                  <td className="px-4 py-3 text-gray-500">{fmt(lead.relance_2_sent_at)}</td>
                  <td className="px-4 py-3">
                    {!lead.invite_sent_at && lead.unipile_provider_id ? (
                      <button
                        onClick={() => onSendInvite(lead.id)}
                        className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-lg hover:bg-indigo-700 transition-colors"
                      >
                        Inviter
                      </button>
                    ) : lead.invite_sent_at ? (
                      <span className="text-xs text-gray-400">Envoyé</span>
                    ) : (
                      <span className="text-xs text-amber-500" title="unipile_provider_id manquant">ID LinkedIn requis</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

// ── Import Tab ────────────────────────────────────────────────────────────────

function ImportTab({ onImported, showToast }: { onImported: () => void; showToast: (m: string, ok?: boolean) => void }) {
  const fileRef  = useRef<HTMLInputElement>(null)
  const [manual, setManual] = useState({ prenom: '', nom: '', email: '', entreprise: '', poste: '', cible: 'DRH' as LeadCible, linkedin_url: '', unipile_provider_id: '' })
  const [saving, setSaving] = useState(false)

  async function importCSV(file: File) {
    const text = await file.text()
    const res  = await fetch('/api/prospects', {
      method:  'POST',
      headers: { 'Content-Type': 'text/csv' },
      body:    text,
    })
    const data = await res.json()
    if (res.ok) { showToast(`${data.imported} prospect(s) importé(s)`); onImported() }
    else showToast(data.error ?? 'Erreur import', false)
  }

  async function addManual(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = [{
      ...manual,
      unipile_provider_id: manual.unipile_provider_id || undefined,
      email:       manual.email || undefined,
      entreprise:  manual.entreprise || undefined,
      poste:       manual.poste || undefined,
    }]
    const res = await fetch('/api/prospects', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload),
    })
    const data = await res.json()
    setSaving(false)
    if (res.ok) {
      showToast('Prospect ajouté')
      setManual({ prenom: '', nom: '', email: '', entreprise: '', poste: '', cible: 'DRH', linkedin_url: '', unipile_provider_id: '' })
      onImported()
    } else {
      showToast(data.error ?? 'Erreur', false)
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      {/* CSV */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-1">Importer un CSV</h2>
        <p className="text-xs text-gray-400 mb-4">Colonnes attendues : <code className="bg-gray-100 px-1 rounded">linkedin_url, prenom, nom, email, entreprise, poste, cible</code></p>
        <div
          onClick={() => fileRef.current?.click()}
          className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50 transition-colors"
        >
          <div className="text-3xl mb-2">📂</div>
          <p className="text-sm text-gray-500">Cliquez ou glissez un fichier CSV</p>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={e => { const f = e.target.files?.[0]; if (f) importCSV(f) }}
        />
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-xs font-medium text-gray-600 mb-1">Exemple CSV :</p>
          <pre className="text-xs text-gray-500 overflow-x-auto">{`linkedin_url,prenom,nom,email,entreprise,poste,cible
https://linkedin.com/in/jean-dupont,Jean,Dupont,jean@corp.fr,Acme,DRH,DRH`}</pre>
        </div>
      </div>

      {/* Manuel */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="font-semibold text-gray-900 mb-4">Ajout manuel</h2>
        <form onSubmit={addManual} className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Prénom *" value={manual.prenom} onChange={v => setManual(p => ({ ...p, prenom: v }))} required />
            <Field label="Nom *"    value={manual.nom}    onChange={v => setManual(p => ({ ...p, nom: v }))}    required />
          </div>
          <Field label="URL LinkedIn *" value={manual.linkedin_url} onChange={v => setManual(p => ({ ...p, linkedin_url: v }))} placeholder="https://linkedin.com/in/..." required />
          <Field label="Unipile Provider ID" value={manual.unipile_provider_id} onChange={v => setManual(p => ({ ...p, unipile_provider_id: v }))} placeholder="ACo... (requis pour inviter)" />
          <Field label="Email"      value={manual.email}      onChange={v => setManual(p => ({ ...p, email: v }))} />
          <Field label="Entreprise" value={manual.entreprise} onChange={v => setManual(p => ({ ...p, entreprise: v }))} />
          <Field label="Poste"      value={manual.poste}      onChange={v => setManual(p => ({ ...p, poste: v }))} />
          <div>
            <label className="text-xs font-medium text-gray-700">Cible *</label>
            <select
              value={manual.cible}
              onChange={e => setManual(p => ({ ...p, cible: e.target.value as LeadCible }))}
              className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm"
            >
              <option value="DRH">DRH</option>
              <option value="Dirigeant">Dirigeant</option>
              <option value="CIP">CIP</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="w-full py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Ajout…' : 'Ajouter le prospect'}
          </button>
        </form>
      </div>
    </div>
  )
}

function Field({ label, value, onChange, placeholder, required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; required?: boolean }) {
  return (
    <div>
      <label className="text-xs font-medium text-gray-700">{label}</label>
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="mt-1 w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
      />
    </div>
  )
}

// ── Settings Tab ──────────────────────────────────────────────────────────────

function SettingsTab({ settings, onSaved }: { settings: Settings[]; onSaved: (s: Settings) => void }) {
  const [activeCible, setActiveCible] = useState<LeadCible>('DRH')
  const current = settings.find(s => s.cible === activeCible)
  const [form, setForm] = useState<Omit<Settings, 'id' | 'cible'>>({
    auto_reply_message:   '',
    relance_1_message:    '',
    relance_1_delay_days: 5,
    relance_2_message:    '',
    relance_2_delay_days: 10,
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (current) setForm({
      auto_reply_message:   current.auto_reply_message   ?? '',
      relance_1_message:    current.relance_1_message     ?? '',
      relance_1_delay_days: current.relance_1_delay_days,
      relance_2_message:    current.relance_2_message     ?? '',
      relance_2_delay_days: current.relance_2_delay_days,
    })
  }, [current])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const res = await fetch('/api/settings', {
      method:  'PUT',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ cible: activeCible, ...form }),
    })
    const data = await res.json()
    setSaving(false)
    if (res.ok) onSaved(data)
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex border-b border-gray-100">
        {(['DRH', 'Dirigeant', 'CIP'] as LeadCible[]).map(c => (
          <button
            key={c}
            onClick={() => setActiveCible(c)}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeCible === c ? 'text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <form onSubmit={save} className="p-6 space-y-5 max-w-2xl">
        <div>
          <label className="text-sm font-medium text-gray-700">Réponse automatique (quand la personne accepte)</label>
          <p className="text-xs text-gray-400 mb-2">Utilise <code>[Prénom]</code> pour personnaliser</p>
          <textarea
            value={form.auto_reply_message ?? ''}
            onChange={e => setForm(p => ({ ...p, auto_reply_message: e.target.value }))}
            rows={4}
            placeholder={`Bonjour [Prénom], merci d'avoir accepté ma demande !…`}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
          />
        </div>

        <div className="grid grid-cols-4 gap-3 items-start">
          <div className="col-span-3">
            <label className="text-sm font-medium text-gray-700">Relance 1</label>
            <p className="text-xs text-gray-400 mb-2">Message si pas de réponse</p>
            <textarea
              value={form.relance_1_message ?? ''}
              onChange={e => setForm(p => ({ ...p, relance_1_message: e.target.value }))}
              rows={3}
              placeholder="Bonjour [Prénom], je me permets de revenir vers vous…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Délai (jours)</label>
            <p className="text-xs text-gray-400 mb-2">Après acceptation</p>
            <input
              type="number"
              min={1}
              value={form.relance_1_delay_days}
              onChange={e => setForm(p => ({ ...p, relance_1_delay_days: Number(e.target.value) }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3 items-start">
          <div className="col-span-3">
            <label className="text-sm font-medium text-gray-700">Relance 2</label>
            <p className="text-xs text-gray-400 mb-2">Message si toujours pas de réponse</p>
            <textarea
              value={form.relance_2_message ?? ''}
              onChange={e => setForm(p => ({ ...p, relance_2_message: e.target.value }))}
              rows={3}
              placeholder="Bonjour [Prénom], dernière tentative de ma part…"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 resize-none"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700">Délai (jours)</label>
            <p className="text-xs text-gray-400 mb-2">Après relance 1</p>
            <input
              type="number"
              min={1}
              value={form.relance_2_delay_days}
              onChange={e => setForm(p => ({ ...p, relance_2_delay_days: Number(e.target.value) }))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Sauvegarde…' : 'Sauvegarder'}
        </button>
      </form>
    </div>
  )
}
