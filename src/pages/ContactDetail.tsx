import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
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
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!contact) {
    return (
      <div className="flex h-full items-center justify-center">
        <p className="text-muted-foreground">Contact not found</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-3xl">{contact.full_name}</CardTitle>
              <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  {contact.email}
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  {contact.phone}
                </div>
              </div>
            </div>
            <Badge variant="secondary">{contact.contact_type}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            <Button size="sm" onClick={() => handleLogActivity('call')}>
              <PhoneCall className="mr-2 h-4 w-4" />
              Log Call
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleLogActivity('text')}>
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Text
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleLogActivity('meeting')}>
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Follow-up
            </Button>
            <Button size="sm" variant="outline" onClick={() => handleLogActivity('note')}>
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Log Activity Form */}
      {showLogForm && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold capitalize">Log {logType}</h3>
              <button onClick={() => setShowLogForm(false)} className="text-muted-foreground hover:text-foreground">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Type</label>
                <select
                  value={logType}
                  onChange={(e) => setLogType(e.target.value)}
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                >
                  {ACTIVITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Notes</label>
                <textarea
                  value={logDescription}
                  onChange={(e) => setLogDescription(e.target.value)}
                  placeholder="What happened?"
                  rows={3}
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={submitLogActivity} disabled={logSaving || !logDescription} size="sm">
                  {logSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Save
                </Button>
                <Button variant="outline" size="sm" onClick={() => setShowLogForm(false)}>Cancel</Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities.map((activity) => {
                  const Icon = activityIcons[activity.type] ?? FileText
                  return (
                    <div key={activity.id} className="flex gap-4">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                        <Icon className="h-4 w-4 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium capitalize">{activity.type}</p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(activity.created_at)}
                          </p>
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {activity.description}
                        </p>
                      </div>
                    </div>
                  )
                })}

                {activities.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-8">
                    No activity recorded yet
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Linked Leads */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Active Leads</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {leads.map((lead) => (
                  <div key={lead.id} className="rounded-lg border p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{lead.loan_type}</p>
                        <p className="text-sm font-semibold text-primary">
                          {formatCurrency(lead.loan_amount)}
                        </p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {lead.stage}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Follow-up: {formatDate(lead.next_follow_up)}
                    </p>
                  </div>
                ))}

                {leads.length === 0 && (
                  <p className="text-center text-sm text-muted-foreground py-4">
                    No active leads
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Relationship Data */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Relationship Data</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer Since</span>
                  <span className="font-medium">{formatDate(contact.created_at)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Total Deals</span>
                  <span className="font-medium">{leads.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Contact</span>
                  <span className="font-medium">
                    {activities.length > 0
                      ? formatDate(activities[0].created_at)
                      : 'Never'
                    }
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
