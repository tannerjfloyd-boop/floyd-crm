import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { formatCurrency, formatDate } from '../lib/utils'
import * as api from '../lib/api'
import type { Lead, Contact } from '../lib/api'
import { Calendar, Plus, Loader2, X } from 'lucide-react'

const stages = ['New', 'Contacted', 'Pre-Approved', 'Under Contract', 'Closed', 'Lost'] as const

const temperatureColors = {
  hot: '🔴',
  warm: '🟡',
  cold: '🟢',
}

const LOAN_TYPES = ['Purchase', 'Refinance', 'Cash-Out Refi', 'HELOC', 'VA IRRRL', 'FHA Streamline', 'USDA', 'Construction']

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
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lead Inbox</h1>
          <p className="text-muted-foreground">Drag and drop leads to update their stage</p>
        </div>
        <Button onClick={openModal}>
          <Plus className="mr-2 h-4 w-4" />
          New Lead
        </Button>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {stages.map((stage) => (
            <div key={stage} className="flex flex-col">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">{stage}</h3>
                <Badge variant="secondary">{getLeadsByStage(stage).length}</Badge>
              </div>

              <Droppable droppableId={stage}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className={`flex-1 space-y-2 rounded-lg p-2 transition-colors ${
                      snapshot.isDraggingOver ? 'bg-accent' : 'bg-muted/20'
                    }`}
                  >
                    {getLeadsByStage(stage).map((lead, index) => (
                      <Draggable key={lead.id} draggableId={lead.id} index={index}>
                        {(provided, snapshot) => (
                          <Card
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`cursor-pointer transition-shadow ${
                              snapshot.isDragging ? 'shadow-lg' : ''
                            } ${expandedLead === lead.id ? 'ring-2 ring-primary' : ''}`}
                            onClick={() => setExpandedLead(expandedLead === lead.id ? null : lead.id)}
                          >
                            <CardContent className="p-3">
                              <div className="space-y-2">
                                <div className="flex items-start justify-between">
                                  <h4 className="font-medium text-sm">{lead.contact_name}</h4>
                                  <span className="text-lg">{temperatureColors[lead.temperature]}</span>
                                </div>

                                <div className="text-xs text-muted-foreground">
                                  <p>{lead.loan_type}</p>
                                  <p className="font-semibold text-foreground">{formatCurrency(lead.loan_amount)}</p>
                                </div>

                                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                                  <Calendar className="h-3 w-3" />
                                  {formatDate(lead.next_follow_up)}
                                </div>

                                {expandedLead === lead.id && (
                                  <div className="mt-3 space-y-1 border-t pt-2 text-xs">
                                    <p><span className="font-medium">Source:</span> {lead.lead_source}</p>
                                    <p><span className="font-medium">Created:</span> {formatDate(lead.created_at)}</p>
                                    <p><span className="font-medium">Temperature:</span> {lead.temperature}</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      {/* New Lead Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <Card className="w-full max-w-md mx-4">
            <div className="flex items-center justify-between p-6 pb-0">
              <h2 className="text-xl font-semibold">New Lead</h2>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
              </button>
            </div>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Contact</label>
                <select
                  value={form.contact_id}
                  onChange={(e) => setForm({ ...form, contact_id: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="">Select a contact...</option>
                  {contacts.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Loan Type</label>
                <select
                  value={form.loan_type}
                  onChange={(e) => setForm({ ...form, loan_type: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {LOAN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Loan Amount</label>
                <input
                  type="number"
                  value={form.loan_amount}
                  onChange={(e) => setForm({ ...form, loan_amount: e.target.value })}
                  placeholder="350000"
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Temperature</label>
                <select
                  value={form.temperature}
                  onChange={(e) => setForm({ ...form, temperature: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  <option value="hot">🔴 Hot</option>
                  <option value="warm">🟡 Warm</option>
                  <option value="cold">🟢 Cold</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Next Follow-up</label>
                <input
                  type="date"
                  value={form.next_follow_up}
                  onChange={(e) => setForm({ ...form, next_follow_up: e.target.value })}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleCreateLead}
                  disabled={saving || !form.contact_id || !form.loan_amount}
                  className="flex-1"
                >
                  {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Lead
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
