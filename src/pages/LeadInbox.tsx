import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { formatCurrency, formatDate } from '../lib/utils'
import * as api from '../lib/api'
import type { Lead, Contact } from '../lib/api'
import { Calendar, Plus, Loader2, X } from 'lucide-react'

const stages = ['New', 'Contacted', 'Pre-Approved', 'Under Contract', 'Closed', 'Lost'] as const

const temperatureBorder: Record<string, string> = {
  hot:  'border-l-rose-500',
  warm: 'border-l-amber-500',
  cold: 'border-l-emerald-500',
}

const temperatureVariant: Record<string, 'danger' | 'warning' | 'success'> = {
  hot:  'danger',
  warm: 'warning',
  cold: 'success',
}

const LOAN_TYPES = ['Purchase', 'Refinance', 'Cash-Out Refi', 'HELOC', 'VA IRRRL', 'FHA Streamline', 'USDA', 'Construction']

const inputCls = "w-full rounded-lg border border-slate-700/50 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50"

export function LeadInbox() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [expandedLead, setExpandedLead] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [contacts, setContacts] = useState<Contact[]>([])
  const [form, setForm] = useState({
    contact_id: '',
    loan_type: 'Purchase',
    loan_amount: '',
    temperature: 'warm',
    next_follow_up: '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.getLeads()
      .then(setLeads)
      .catch(err => console.error('Failed to load leads:', err))
      .finally(() => setLoading(false))
  }, [])

  const openModal = async () => {
    setShowModal(true)
    try {
      const cs = await api.getContacts()
      setContacts(cs)
    } catch (err) {
      console.error('Failed to load contacts:', err)
    }
  }

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result
    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStage = destination.droppableId as Lead['stage']
    const prev = leads
    setLeads(leads.map(lead => lead.id === draggableId ? { ...lead, stage: newStage } : lead))
    try {
      await api.updateLead(draggableId, { stage: newStage })
    } catch (err) {
      console.error('Failed to update lead stage:', err)
      setLeads(prev)
    }
  }

  const getLeadsByStage = (stage: Lead['stage']) => leads.filter(lead => lead.stage === stage)

  const handleCreateLead = async () => {
    if (!form.contact_id || !form.loan_amount) return
    setSaving(true)
    try {
      const newLead = await api.createLead({
        contact_id: form.contact_id,
        loan_type: form.loan_type,
        loan_amount: Number(form.loan_amount),
        stage: 'New',
        temperature: form.temperature,
        next_follow_up: form.next_follow_up || undefined,
      })
      setLeads(prev => [newLead, ...prev])
      setShowModal(false)
      setForm({ contact_id: '', loan_type: 'Purchase', loan_amount: '', temperature: 'warm', next_follow_up: '' })
    } catch (err) {
      console.error('Failed to create lead:', err)
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ letterSpacing: '-0.025em' }}>Lead Inbox</h1>
          <p className="mt-0.5 text-sm text-slate-400">Drag and drop leads to update their stage</p>
        </div>
        <Button onClick={openModal}>
          <Plus className="mr-2 h-4 w-4" />
          New Lead
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stages.map((stage) => {
            const stageLeads = getLeadsByStage(stage)
            return (
              <div key={stage} className="flex flex-col">
                {/* Column header */}
                <div className="mb-2 flex items-center justify-between px-1">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">{stage}</h3>
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-slate-800 px-1.5 text-xs font-medium text-slate-400">
                    {stageLeads.length}
                  </span>
                </div>

                <Droppable droppableId={stage}>
                  {(provided, snapshot) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className={`min-h-[120px] flex-1 space-y-2 rounded-xl border p-2 transition-colors ${
                        snapshot.isDraggingOver
                          ? 'border-emerald-500/20 bg-slate-800/60'
                          : 'border-slate-700/20 bg-slate-900/40'
                      }`}
                    >
                      {stageLeads.map((lead, index) => (
                        <Draggable key={lead.id} draggableId={lead.id} index={index}>
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                              className={`cursor-pointer rounded-lg border-l-2 border border-slate-700/30 bg-slate-800 transition-all ${
                                temperatureBorder[lead.temperature]
                              } ${snapshot.isDragging ? 'shadow-xl shadow-black/40 ring-1 ring-slate-600/50' : ''} ${
                                expandedLead === lead.id ? 'ring-1 ring-emerald-500/30' : ''
                              }`}
                            >
                              <div className="p-3 space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="text-sm font-medium text-white leading-snug">{lead.contact_name}</h4>
                                  <Badge variant={temperatureVariant[lead.temperature]} className="shrink-0">
                                    {lead.temperature}
                                  </Badge>
                                </div>

                                <div className="space-y-0.5 text-xs text-slate-400">
                                  <p>{lead.loan_type}</p>
                                  <p className="font-semibold text-slate-200">{formatCurrency(lead.loan_amount)}</p>
                                </div>

                                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                  <Calendar className="h-3 w-3 shrink-0" />
                                  {formatDate(lead.next_follow_up)}
                                </div>

                                {expandedLead === lead.id && (
                                  <div className="space-y-1 border-t border-slate-700/30 pt-2 text-xs">
                                    <p><span className="text-slate-500">Source:</span> <span className="text-slate-300">{lead.lead_source}</span></p>
                                    <p><span className="text-slate-500">Created:</span> <span className="text-slate-300">{formatDate(lead.created_at)}</span></p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </div>
            )
          })}
        </div>
      </DragDropContext>

      {/* New Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-xl border border-slate-700/30 bg-slate-900 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-700/20 px-6 py-4">
              <h2 className="text-lg font-semibold text-white">New Lead</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-4 p-6">
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">Contact</label>
                <select value={form.contact_id} onChange={(e) => setForm({ ...form, contact_id: e.target.value })} className={inputCls}>
                  <option value="">Select a contact...</option>
                  {contacts.map(c => <option key={c.id} value={c.id}>{c.full_name}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">Loan Type</label>
                <select value={form.loan_type} onChange={(e) => setForm({ ...form, loan_type: e.target.value })} className={inputCls}>
                  {LOAN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">Loan Amount</label>
                <input type="number" value={form.loan_amount} onChange={(e) => setForm({ ...form, loan_amount: e.target.value })} placeholder="350000" className={inputCls} />
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">Temperature</label>
                <select value={form.temperature} onChange={(e) => setForm({ ...form, temperature: e.target.value })} className={inputCls}>
                  <option value="hot">Hot</option>
                  <option value="warm">Warm</option>
                  <option value="cold">Cold</option>
                </select>
              </div>
              <div>
                <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">Next Follow-up</label>
                <input type="date" value={form.next_follow_up} onChange={(e) => setForm({ ...form, next_follow_up: e.target.value })} className={inputCls} />
              </div>
              <div className="flex gap-2 pt-1">
                <Button onClick={handleCreateLead} disabled={saving || !form.contact_id || !form.loan_amount} className="flex-1">
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Lead
                </Button>
                <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
