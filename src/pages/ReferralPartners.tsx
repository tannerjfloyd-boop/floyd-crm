import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { formatDate } from '../lib/utils'
import * as api from '../lib/api'
import type { Partner } from '../lib/api'
import { MessageSquare, Calendar, Plus, X, Loader2 } from 'lucide-react'

const tierColors = {
  A: 'default',
  B: 'secondary',
  C: 'outline',
} as const

const PARTNER_TYPES = ['Realtor', 'Financial Advisor', 'CPA', 'Attorney', 'Insurance Agent', 'Builder', 'Other']

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
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Referral Partners</h1>
          <p className="text-muted-foreground">Manage relationships with your referral network</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Partner
        </Button>
      </div>

      {(['A', 'B', 'C'] as const).map((tier) => (
        <div key={tier}>
          <div className="mb-4 flex items-center gap-2">
            <h2 className="text-2xl font-semibold">Tier {tier}</h2>
            <Badge variant={tierColors[tier]}>{getPartnersByTier(tier).length} partners</Badge>
          </div>

          {getPartnersByTier(tier).length === 0 ? (
            <p className="text-sm text-muted-foreground py-2">No Tier {tier} partners yet.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {getPartnersByTier(tier).map((partner) => (
                <Card key={partner.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{partner.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{partner.company}</p>
                      </div>
                      <Badge variant={tierColors[partner.tier]}>
                        Tier {partner.tier}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-1 text-sm">
                      <p className="text-muted-foreground">{partner.partner_type}</p>
                      <p className="font-semibold">{partner.deals_closed} deals closed</p>
                      {partner.last_deal_date && (
                        <p className="text-xs text-muted-foreground">
                          Last deal: {formatDate(partner.last_deal_date)}
                        </p>
                      )}
                    </div>

                    <div className="rounded-lg bg-muted p-2 text-xs">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3" />
                        <span className="font-medium">Next touchpoint:</span>
                      </div>
                      <p className="mt-1">{formatDate(partner.next_touchpoint)}</p>
                    </div>

                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="flex-1">
                        <MessageSquare className="mr-2 h-4 w-4" />
                        Add Note
                      </Button>
                      <Button size="sm" variant="outline" className="flex-1">
                        Log Activity
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      ))}

      {/* New Partner Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 pb-0">
              <h2 className="text-xl font-semibold">New Partner</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Full Name *</label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  placeholder="Jane Smith"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Company *</label>
                <input
                  type="text"
                  value={form.company}
                  onChange={(e) => setForm({ ...form, company: e.target.value })}
                  placeholder="ABC Realty"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Email</label>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="jane@abc.com"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Phone</label>
                  <input
                    type="tel"
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="555-555-5555"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Partner Type</label>
                <select
                  value={form.partner_type}
                  onChange={(e) => setForm({ ...form, partner_type: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {PARTNER_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Tier</label>
                <select
                  value={form.tier}
                  onChange={(e) => setForm({ ...form, tier: e.target.value as 'A' | 'B' | 'C' })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="A">Tier A (Top Partner)</option>
                  <option value="B">Tier B (Active)</option>
                  <option value="C">Tier C (Occasional)</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleCreatePartner}
                  disabled={saving || !form.full_name || !form.company}
                  className="flex-1"
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Partner
                </Button>
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
