import { useState, useMemo } from 'react'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { formatCurrency, formatDate } from '../lib/utils'
import { mockPastClients } from '../lib/mockData'
import type { PastClient } from '../lib/mockData'
import { Check } from 'lucide-react'

export function PastClientReactivation() {
  const [clients] = useState<PastClient[]>(mockPastClients)
  const [refiEligibleOnly, setRefiEligibleOnly] = useState(false)
  const [minEquity, setMinEquity] = useState(0)
  const [lastContactedBefore, setLastContactedBefore] = useState('')
  const [selectedClients, setSelectedClients] = useState<Set<string>>(new Set())

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
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedClients(newSelected)
  }

  const handleBatchMarkContacted = () => {
    alert(`Marking ${selectedClients.size} clients as contacted`)
    setSelectedClients(new Set())
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Past Client Reactivation</h1>
        <p className="text-muted-foreground">Identify and reconnect with past clients</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="refi-eligible"
                checked={refiEligibleOnly}
                onChange={(e) => setRefiEligibleOnly(e.target.checked)}
                className="h-4 w-4 rounded border-input"
              />
              <label htmlFor="refi-eligible" className="text-sm font-medium">
                Refi Eligible Only
              </label>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Min Equity</label>
              <select
                value={minEquity}
                onChange={(e) => setMinEquity(Number(e.target.value))}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value={0}>All</option>
                <option value={50000}>$50,000+</option>
                <option value={100000}>$100,000+</option>
                <option value={150000}>$150,000+</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Last Contacted Before</label>
              <input
                type="date"
                value={lastContactedBefore}
                onChange={(e) => setLastContactedBefore(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Batch Actions */}
      {selectedClients.size > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {selectedClients.size} client{selectedClients.size !== 1 ? 's' : ''} selected
              </span>
              <Button onClick={handleBatchMarkContacted}>
                Mark as Contacted
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="w-12 p-4"></th>
                  <th className="p-4 text-left font-semibold">Name</th>
                  <th className="p-4 text-left font-semibold">Property Address</th>
                  <th className="p-4 text-left font-semibold">Close Date</th>
                  <th className="p-4 text-right font-semibold">Current Rate</th>
                  <th className="p-4 text-right font-semibold">Est. Equity</th>
                  <th className="p-4 text-left font-semibold">Refi Eligible</th>
                  <th className="p-4 text-left font-semibold">Status</th>
                  <th className="p-4 text-left font-semibold">Life Events</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={selectedClients.has(client.id)}
                        onChange={() => toggleClientSelection(client.id)}
                        className="h-4 w-4 rounded border-input"
                      />
                    </td>
                    <td className="p-4 font-medium">{client.name}</td>
                    <td className="p-4 text-sm text-muted-foreground">{client.property_address}</td>
                    <td className="p-4">{formatDate(client.original_close_date)}</td>
                    <td className="p-4 text-right">{client.current_rate.toFixed(3)}%</td>
                    <td className="p-4 text-right font-medium">{formatCurrency(client.estimated_equity)}</td>
                    <td className="p-4">
                      {client.refi_eligible ? (
                        <Badge variant="success">
                          <Check className="mr-1 h-3 w-3" />
                          Eligible
                        </Badge>
                      ) : (
                        <Badge variant="outline">Not Eligible</Badge>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge
                        variant={
                          client.reactivation_status === 'Not Contacted'
                            ? 'outline'
                            : client.reactivation_status === 'Contacted'
                            ? 'secondary'
                            : client.reactivation_status === 'Scheduled'
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {client.reactivation_status}
                      </Badge>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-1">
                        {client.life_events.map((event, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {event}
                          </Badge>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
