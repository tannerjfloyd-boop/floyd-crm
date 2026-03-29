import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { formatDate } from '../lib/utils'
import * as api from '../lib/api'
import type { Partner } from '../lib/api'
import { MessageSquare, Calendar, Plus, X, Loader2 } from 'lucide-react'

const PARTNER_TYPES = ['Realtor', 'Financial Advisor', 'CPA', 'Attorney', 'Insurance Agent', 'Builder', 'Other']

const tierConfig = {
  A: { label: 'Tier A', color: 'text-amber-400', badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30', dot: 'bg-amber-400' },
  B: { label: 'Tier B', color: 'text-slate-300', badge: 'bg-slate-700/50 text-slate-300 border-slate-600/50', dot: 'bg-slate-400' },
  C: { label: 'Tier C', color: 'text-orange-400', badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30', dot: 'bg-orange-400' },
} as const

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const avatarColors = ['bg-emerald-600', 'bg-blue-600', 'bg-violet-600', 'bg-rose-600', 'bg-amber-600']
function getAvatarColor(name: string) {
  const sum = name.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return avatarColors[sum % avatarColors.length]
}

export function ReferralPartners() {
  const [partners, setPartners] = useState<Partner[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    full_name: '',
    email: '',
    phone: '',
    company: '',
    partner_type: 'Realtor',
    tier: 'B' as 'A' | 'B' | 'C',
  })

  useEffect(() => {
    api.getPartners()
      .then(setPartners)
      .catch(err => console.error('Failed to load partners:', err))
      .finally(() => setLoading(false))
  }, [])

  const getPartnersByTier = (tier: Partner['tier']) => partners.filter(p => p.tier === tier)

  const handleCreatePartner = async () => {
    if (!form.full_name || !form.company) return
    setSaving(true)
    try {
      const contact = await api.createContact({
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        contact_type: 'referral_partner',
      })
      await api.createPartner({
        contact_id: contact.id,
        company: form.company,
        partner_type: form.partner_type,
        relationship_tier: form.tier,
      })
      const updated = await api.getPartners()
      setPartners(updated)
      setShowModal(false)
      setForm({ full_name: '', email: '', phone: '', company: '', partner_type: 'Realtor', tier: 'B' })
    } catch (err) {
      console.error('Failed to create partner:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-slate-500" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">Referral Partners</h1>
          <p className="text-slate-400 mt-1">Manage relationships with your referral network</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="bg-emerald-600 hover:bg-emerald-500 text-white">
          <Plus className="mr-2 h-4 w-4" />
          New Partner
        </Button>
      </div>

      {(['A', 'B', 'C'] as const).map((tier) => {
        const cfg = tierConfig[tier]
        const tierPartners = getPartnersByTier(tier)
        return (
          <div key={tier}>
            <div className="mb-4 flex items-center gap-3">
              <div className={`h-2 w-2 rounded-full ${cfg.dot}`} />
              <h2 className={`text-xl font-semibold ${cfg.color}`}>{cfg.label}</h2>
              <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${cfg.badge}`}>
                {tierPartners.length} partners
              </span>
            </div>

            {tierPartners.length === 0 ? (
              <p className="text-sm text-slate-500 py-2 pl-5">No Tier {tier} partners yet.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tierPartners.map((partner) => (
                  <div key={partner.id} className="bg-slate-900/80 border border-slate-700/30 rounded-xl p-5 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full ${getAvatarColor(partner.name)} flex items-center justify-center text-white text-sm font-semibold flex-shrink-0`}>
                          {getInitials(partner.name)}
                        </div>
                        <div>
                          <p className="text-white font-semibold leading-tight">{partner.name}</p>
                          <p className="text-slate-400 text-sm">{partner.company}</p>
                        </div>
                      </div>
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${cfg.badge}`}>
                        {tier}
                      </span>
                    </div>

                    <div className="space-y-1 text-sm">
                      <p className="text-slate-400">{partner.partner_type}</p>
                      <p className="text-white font-semibold">{partner.deals_closed} deals closed</p>
                      {partner.last_deal_date && (
                        <p className="text-xs text-slate-500">
                          Last deal: {formatDate(partner.last_deal_date)}
                        </p>
                      )}
                    </div>

                    <div className="rounded-lg bg-slate-800/50 border border-slate-700/20 p-2.5 text-xs">
                      <div className="flex items-center gap-2 text-slate-400">
                        <Calendar className="h-3 w-3" />
                        <span className="font-medium">Next touchpoint:</span>
                      </div>
                      <p className="mt-1 text-slate-300">{formatDate(partner.next_touchpoint)}</p>
                    </div>

                    <div className="flex gap-2">
                      <button className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-700/50 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                        <MessageSquare className="h-3.5 w-3.5" />
                        Add Note
                      </button>
                      <button className="flex-1 flex items-center justify-center gap-1.5 rounded-lg border border-slate-700/50 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors">
                        Log Activity
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      })}

      {/* New Partner Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700/30 rounded-xl w-full max-w-md mx-4 shadow-2xl">
            <div className="flex items-center justify-between p-6 pb-0">
              <h2 className="text-xl font-semibold text-white">New Partner</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Full Name *</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Jane Smith"
                  className="w-full rounded-lg border border-slate-700/50 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Company *</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="ABC Realty"
                  className="w-full rounded-lg border border-slate-700/50 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="jane@abc.com"
                    className="w-full rounded-lg border border-slate-700/50 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-300 mb-2 block">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="555-555-5555"
                    className="w-full rounded-lg border border-slate-700/50 bg-slate-800 px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Partner Type</label>
                <select
                  value={form.partner_type}
                  onChange={(e) => setForm({ ...form, partner_type: e.target.value })}
                  className="w-full rounded-lg border border-slate-700/50 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                >
                  {PARTNER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-300 mb-2 block">Tier</label>
                <select
                  value={form.tier}
                  onChange={(e) => setForm({ ...form, tier: e.target.value as 'A' | 'B' | 'C' })}
                  className="w-full rounded-lg border border-slate-700/50 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-1 focus:ring-emerald-500/50"
                >
                  <option value="A">Tier A (Top Partner)</option>
                  <option value="B">Tier B (Active)</option>
                  <option value="C">Tier C (Occasional)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleCreatePartner}
                  disabled={saving || !form.full_name || !form.company}
                  className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed px-4 py-2 text-sm font-medium text-white transition-colors"
                >
                  {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                  Add Partner
                </button>
                <button
                  onClick={() => setShowModal(false)}
                  className="rounded-lg border border-slate-700/50 px-4 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
