import { useState, useEffect, useMemo } from 'react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { formatCurrency, formatDate } from '../lib/utils'
import * as api from '../lib/api'
import type { PastClient } from '../lib/api'
import { Check, Loader2 } from 'lucide-react'

const inputCls = "rounded-lg border border-slate-700/50 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50"

const lifeEventColors: Record<string, string> = {
  'New Baby':       'bg-blue-500/20 text-blue-300 border-blue-500/30',
  'Marriage':       'bg-pink-500/20 text-pink-300 border-pink-500/30',
  'Divorce':        'bg-rose-500/20 text-rose-300 border-rose-500/30',
  'Job Change':     'bg-amber-500/20 text-amber-300 border-amber-500/30',
  'Retirement':     'bg-violet-500/20 text-violet-300 border-violet-500/30',
  'Moving':         'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  'Empty Nest':     'bg-orange-500/20 text-orange-300 border-orange-500/30',
}

export function PastClientReactivation() {
  const [clients, setClients] = useState<PastClient[]>([])
  const [loading, setLoading] = useState(true)
  const [refiEligibleOnly, setRefiEligibleOnly] = useState(false)
  const [minEquity, setMinEquity] = useState(0)
  const [lastContactedBefore, setLastContactedBefore] = useState('')
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set())
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getPastClients()
      .then(setClients)
      .catch(err => console.error('Failed to load past clients:', err))
      .finally(() => setLoading(false))
  }, [])

  const filteredClients = useMemo(() => {
    return clients.filter(client => {
      if (refiEligibleOnly && !client.refi_eligible) return false
      if (minEquity > 0 && client.estimated_equity < minEquity) return false
      if (lastContactedBefore) {
        if (!client.last_contacted) return true
        if (new Date(client.last_contacted) >= new Date(lastContactedBefore)) return false
      }
      return true
    })
  }, [clients, refiEligibleOnly, minEquity, lastContactedBefore])

  const toggleClientSelection = (id: string) => {
    const newSelected = new Set(selectedClients)
    if (newSelected.has(id)) newSelected.delete(id)
    else newSelected.add(id)
    setSelectedClients(newSelected)
  }

  const handleBatchMarkContacted = async () => {
    setSaving(true)
    const today = new Date().toISOString().split('T')[0]
    try {
      await Promise.all(
        Array.from(selectedClients).map(id =>
          api.updatePastClient(id, {
            reactivation_status: 'Contacted',
            last_reactivation_attempt: today,
          })
        )
      )
      setClients(prev =>
        prev.map(c =>
          selectedClients.has(c.id)
            ? { ...c, reactivation_status: 'Contacted' as const, last_contacted: today }
            : c
        )
      )
      setSelectedClients(new Set())
    } catch (err) {
      console.error('Failed to update clients:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white">Past Client Reactivation</h1>
        <p className="text-slate-400 mt-1">Identify and reconnect with past clients</p>
      </div>

      {/* Filters */}
      <div className="bg-slate-900 border border-slate-700/30 rounded-xl p-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="refi-eligible"
              checked={refiEligibleOnly}
              onChange={(e) => setRefiEligibleOnly(e.target.checked)}
              className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-emerald-500"
            />
            <label htmlFor="refi-eligible" className="text-sm font-medium text-slate-300">
              Refi Eligible Only
            </label>
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5 block">Min Equity</label>
            <select
              value={minEquity}
              onChange={(e) => setMinEquity(Number(e.target.value))}
              className={inputCls}
            >
              <option value={0}>All</option>
              <option value={50000}>$50,000+</option>
              <option value={100000}>$100,000+</option>
              <option value={150000}>$150,000+</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5 block">Last Contacted Before</label>
            <input
              type="date"
              value={lastContactedBefore}
              onChange={(e) => setLastContactedBefore(e.target.value)}
              className={inputCls}
            />
          </div>
        </div>
      </div>

      {/* Batch Actions */}
      {selectedClients.size > 0 && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-300">
              {selectedClients.size} client{selectedClients.size !== 1 ? 's' : ''} selected
            </span>
            <Button onClick={handleBatchMarkContacted} disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Mark as Contacted
            </Button>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-slate-900 border border-slate-700/30 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-800/50 border-b border-slate-700/30">
              <tr>
                <th className="w-12 p-4"></th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Name</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Property Address</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Close Date</th>
                <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Current Rate</th>
                <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">Est. Equity</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Refi Eligible</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Status</th>
                <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider text-slate-400">Life Events</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/20">
              {filteredClients.length === 0 && (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 text-sm">
                    No past clients found
                  </td>
                </tr>
              )}
              {filteredClients.map((client) => (
                <tr key={client.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={selectedClients.has(client.id)}
                      onChange={() => toggleClientSelection(client.id)}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-800 accent-emerald-500"
                    />
                  </td>
                  <td className="p-4 font-medium text-white">{client.name}</td>
                  <td className="p-4 text-sm text-slate-400">{client.property_address}</td>
                  <td className="p-4 text-slate-300">{formatDate(client.original_close_date)}</td>
                  <td className="p-4 text-right text-slate-300">{client.current_rate.toFixed(3)}%</td>
                  <td className={`p-4 text-right font-semibold ${client.refi_eligible ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {formatCurrency(client.estimated_equity)}
                  </td>
                  <td className="p-4">
                    {client.refi_eligible ? (
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                        <Check className="h-3 w-3" />
                        Eligible
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full border border-slate-600/50 bg-slate-700/30 px-2.5 py-0.5 text-xs font-medium text-slate-400">
                        Not Eligible
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    <Badge
                      variant={
                        client.reactivation_status === 'Not Contacted' ? 'outline'
                        : client.reactivation_status === 'Contacted' ? 'secondary'
                        : client.reactivation_status === 'Scheduled' ? 'default'
                        : 'destructive'
                      }
                    >
                      {client.reactivation_status}
                    </Badge>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-1 flex-wrap">
                      {client.life_events.map((event, index) => (
                        <span
                          key={index}
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${
                            lifeEventColors[event] ?? 'bg-slate-700/30 text-slate-400 border-slate-600/50'
                          }`}
                        >
                          {event}
                        </span>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
