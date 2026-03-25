import { useParams } from 'react-router-dom'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { formatCurrency, formatDate } from '../lib/utils'
import { mockContacts, mockLeads, mockActivities } from '../lib/mockData'
import { Phone, Mail, MessageSquare, Calendar, Plus, PhoneCall, FileText } from 'lucide-react'

const activityIcons = {
  call: PhoneCall,
  email: Mail,
  text: MessageSquare,
  meeting: Calendar,
  note: FileText,
}

export function ContactDetail() {
  const { id } = useParams<{ id: string }>()
  const contact = mockContacts.find(c => c.id === id)
  const contactLeads = mockLeads.filter(l => l.contact_id === id)
  const contactActivities = mockActivities.filter(a => a.contact_id === id)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

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
              <CardTitle className="text-3xl">{contact.name}</CardTitle>
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
            <Badge variant="secondary">{contact.type}</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button size="sm">
              <PhoneCall className="mr-2 h-4 w-4" />
              Log Call
            </Button>
            <Button size="sm" variant="outline">
              <MessageSquare className="mr-2 h-4 w-4" />
              Send Text
            </Button>
            <Button size="sm" variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Schedule Follow-up
            </Button>
            <Button size="sm" variant="outline">
              <Plus className="mr-2 h-4 w-4" />
              Add Note
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Activity Timeline */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Activity Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contactActivities.map((activity) => {
                  const Icon = activityIcons[activity.type]
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

                {contactActivities.length === 0 && (
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
                {contactLeads.map((lead) => (
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

                {contactLeads.length === 0 && (
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
                  <span className="font-medium">{contactLeads.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Last Contact</span>
                  <span className="font-medium">
                    {contactActivities.length > 0 
                      ? formatDate(contactActivities[0].created_at)
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
