import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { formatCurrency, formatDate } from '../lib/utils'
import * as api from '../lib/api'
import type { Contact, Lead, Activity } from '../lib/api'
import { Phone, Mail, MessageSquare, Calendar, Plus, PhoneCall, FileText, Loader2, X } from 'lucide-react'

const activityIcons: Record<string, React.ElementType> = {
  call: PhoneCall,
  email: Mail,
  text: MessageSquare,
  meeting: Calendar,
  note: FileText,
}

const ACTIVITY_TYPES = ['call', 'email', 'text', 'meeting', 'note']

const inputCls = "w-full rounded-lg border border-slate-700/50 bg-slate-800 px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50"

export function ContactDetail() {
  const { id } = useParams<{ id: string }>()
  const [contact, setContact] = useState<Contact | null>(null)
  const [leads, setLeads] = useState<Lead[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)
  const [showLogForm, setShowLogForm] = useState(false)
  const [logType, setLogType] = useState('call')
  const [logDescription, setLogDescription] = useState('')
  const [logSaving, setLogSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      api.getContact(id),
      api.getLeads(),
      api.getActivities(id),
    ]).then(([contactData, allLeads, activityData]) => {
      setContact(contactData)
      setLeads(allLeads.filter(l => l.contact_id === id))
      setActivities(activityData)
    }).catch(err => {
      console.error('Failed to load contact:', err)
    }).finally(() => setLoading(false))
  }, [id])

  const handleLogActivity = (type: string) => {
    setLogType(type)
    setShowLogForm(true)
  }

  const submitLogActivity = async () => {
    if (!id || !logDescription) return
    setLogSaving(true)
    try {
      await api.logActivity({ contact_id: id, type: logType, summary: logDescription })
      const updated = await api.getActivities(id)
      setActivities(updated)
      setShowLogForm(false)
      setLogDescription('')
    } catch (err) {
      console.error('Failed to log activity:', err)
    } finally {
      setLogSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-slate-500">Contact not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Hero / Header */}
      <div className="bg-slate-900 border border-slate-700/30 rounded-xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">{contact.full_name}</h1>
            <div className="mt-2 flex items-center gap-4 text-sm text-slate-400">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-slate-500" />
                {contact.email}
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-slate-500" />
                {contact.phone}
              </div>
            </div>
          </div>
          <Badge variant="secondary">{contact.contact_type}</Badge>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button size="sm" onClick={() => handleLogActivity('call')}>
            <PhoneCall className="mr-2 h-4 w-4" />
            Log Call
          </Button>
          <button
            onClick={() => handleLogActivity('text')}
            className="inline-flex items-center rounded-lg border border-slate-700/50 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Send Text
          </button>
          <button
            onClick={() => handleLogActivity('meeting')}
            className="inline-flex items-center rounded-lg border border-slate-700/50 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Calendar className="mr-2 h-4 w-4" />
            Schedule Follow-up
          </button>
          <button
            onClick={() => handleLogActivity('note')}
            className="inline-flex items-center rounded-lg border border-slate-700/50 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Note
          </button>
        </div>
      </div>

      {/* Log Activity Form */}
      {showLogForm && (
        <div className="bg-slate-900 border border-slate-700/30 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-white capitalize">Log {logType}</h3>
            <button onClick={() => setShowLogForm(false)} className="text-slate-500 hover:text-slate-300 transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5 block">Type</label>
              <select
                value={logType}
                onChange={(e) => setLogType(e.target.value)}
                className={inputCls}
              >
                {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1.5 block">Notes</label>
              <textarea
                value={logDescription}
                onChange={(e) => setLogDescription(e.target.value)}
                placeholder="What happened?"
                rows={3}
                className={`${inputCls} resize-none`}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={submitLogActivity} disabled={logSaving || !logDescription} size="sm">
                {logSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save
              </Button>
              <button
                onClick={() => setShowLogForm(false)}
                className="rounded-lg border border-slate-700/50 px-3 py-1.5 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-slate-900 border border-slate-700/30 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-5">Activity Timeline</h2>
            <div className="space-y-5">
              {activities.map((activity) => {
                const Icon = activityIcons[activity.type] ?? FileText
                return (
                  <div key={activity.id} className="flex gap-4 border-l-2 border-emerald-500/40 pl-4 relative">
                    <div className="absolute -left-[9px] top-1 h-4 w-4 rounded-full bg-emerald-500/20 border-2 border-emerald-500/60 flex items-center justify-center">
                      <div className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500/10">
                            <Icon className="h-3.5 w-3.5 text-emerald-400" />
                          </div>
                          <p className="font-medium text-white capitalize">{activity.type}</p>
                        </div>
                        <p className="text-xs text-slate-500">
                          {formatDate(activity.created_at)}
                        </p>
                      </div>
                      <p className="mt-1.5 text-sm text-slate-400 pl-8">
                        {activity.description}
                      </p>
                    </div>
                  </div>
                )
              })}

              {activities.length === 0 && (
                <p className="text-center text-sm text-slate-500 py-8">
                  No activity recorded yet
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Linked Leads */}
          <div className="bg-slate-900 border border-slate-700/30 rounded-xl p-5">
            <h2 className="text-base font-semibold text-white mb-4">Active Leads</h2>
            <div className="space-y-3">
              {leads.map((lead) => (
                <div key={lead.id} className="rounded-lg border border-slate-700/30 bg-slate-800/50 p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm text-slate-300">{lead.loan_type}</p>
                      <p className="text-sm font-semibold text-emerald-400">
                        {formatCurrency(lead.loan_amount)}
                      </p>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {lead.stage}
                    </Badge>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    Follow-up: {formatDate(lead.next_follow_up)}
                  </p>
                </div>
              ))}

              {leads.length === 0 && (
                <p className="text-center text-sm text-slate-500 py-4">
                  No active leads
                </p>
              )}
            </div>
          </div>

          {/* Relationship Data */}
          <div className="bg-slate-900 border border-slate-700/30 rounded-xl p-5">
            <h2 className="text-base font-semibold text-white mb-4">Relationship Data</h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-400">Customer Since</span>
                <span className="font-medium text-slate-300">{formatDate(contact.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Total Deals</span>
                <span className="font-medium text-slate-300">{leads.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Last Contact</span>
                <span className="font-medium text-slate-300">
                  {activities.length > 0
                    ? formatDate(activities[0].created_at)
                    : 'Never'
                  }
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
