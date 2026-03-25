import { useState } from 'react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { formatCurrency, formatDate } from '../lib/utils'
import { mockLeads } from '../lib/mockData'
import type { Lead } from '../lib/mockData'
import { Calendar } from 'lucide-react'

const stages = ['New', 'Contacted', 'Pre-Approved', 'Under Contract', 'Closed', 'Lost'] as const

const temperatureColors = {
  hot: '🔴',
  warm: '🟡',
  cold: '🟢',
}

export function LeadInbox() {
  const [leads, setLeads] = useState<Lead[]>(mockLeads)
  const [expandedLead, setExpandedLead] = useState<string | null>(null)

  const onDragEnd = (result: DropResult) => {
    const { destination, source, draggableId } = result

    if (!destination) return
    if (destination.droppableId === source.droppableId && destination.index === source.index) return

    const newStage = destination.droppableId as Lead['stage']
    setLeads(leads.map(lead => 
      lead.id === draggableId ? { ...lead, stage: newStage } : lead
    ))
  }

  const getLeadsByStage = (stage: Lead['stage']) => {
    return leads.filter(lead => lead.stage === stage)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Lead Inbox</h1>
        <p className="text-muted-foreground">Drag and drop leads to update their stage</p>
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
    </div>
  )
}
