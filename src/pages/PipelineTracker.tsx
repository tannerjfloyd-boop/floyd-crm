import { useState, useMemo } from 'react'
import { Card, CardContent } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { formatCurrency, formatDate, getDaysUntil } from '../lib/utils'
import { mockLoans } from '../lib/mockData'
import type { Loan } from '../lib/mockData'
import { ArrowUpDown } from 'lucide-react'

type SortKey = keyof Loan
type SortOrder = 'asc' | 'desc'

const lockStatusColors = {
  locked: 'success',
  floating: 'warning',
  expired: 'destructive',
} as const

export function PipelineTracker() {
  const [loans] = useState<Loan[]>(mockLoans)
  const [sortKey, setSortKey] = useState<SortKey>('est_close_date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [lockFilter, setLockFilter] = useState<string>('all')

  const stages = useMemo(() => {
    const uniqueStages = Array.from(new Set(loans.map(l => l.loan_stage)))
    return ['all', ...uniqueStages]
  }, [loans])

  const lockStatuses = ['all', 'locked', 'floating', 'expired']

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const filteredAndSortedLoans = useMemo(() => {
    let filtered = loans

    if (stageFilter !== 'all') {
      filtered = filtered.filter(loan => loan.loan_stage === stageFilter)
    }

    if (lockFilter !== 'all') {
      filtered = filtered.filter(loan => loan.lock_status === lockFilter)
    }

    return filtered.sort((a, b) => {
      const aValue = a[sortKey]
      const bValue = b[sortKey]

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }

      return 0
    })
  }, [loans, sortKey, sortOrder, stageFilter, lockFilter])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Pipeline Tracker</h1>
        <p className="text-muted-foreground">Active loans and their current status</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Stage</label>
              <select
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {stages.map(stage => (
                  <option key={stage} value={stage}>
                    {stage === 'all' ? 'All Stages' : stage}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Lock Status</label>
              <select
                value={lockFilter}
                onChange={(e) => setLockFilter(e.target.value)}
                className="rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                {lockStatuses.map(status => (
                  <option key={status} value={status}>
                    {status === 'all' ? 'All Status' : status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b bg-muted/50">
                <tr>
                  <th className="p-4 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('borrower_name')}
                      className="font-semibold"
                    >
                      Borrower
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="p-4 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('loan_stage')}
                      className="font-semibold"
                    >
                      Stage
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="p-4 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('lender')}
                      className="font-semibold"
                    >
                      Lender
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="p-4 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('loan_amount')}
                      className="font-semibold"
                    >
                      Loan Amount
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="p-4 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('lock_status')}
                      className="font-semibold"
                    >
                      Lock Status
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="p-4 text-left">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSort('est_close_date')}
                      className="font-semibold"
                    >
                      Est. Close
                      <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="p-4 text-right">
                    Days Until Close
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedLoans.map((loan) => {
                  const daysUntil = getDaysUntil(loan.est_close_date)
                  return (
                    <tr key={loan.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{loan.borrower_name}</td>
                      <td className="p-4">{loan.loan_stage}</td>
                      <td className="p-4 text-sm text-muted-foreground">{loan.lender}</td>
                      <td className="p-4 text-right font-medium">{formatCurrency(loan.loan_amount)}</td>
                      <td className="p-4">
                        <Badge variant={lockStatusColors[loan.lock_status]}>
                          {loan.lock_status}
                        </Badge>
                      </td>
                      <td className="p-4">{formatDate(loan.est_close_date)}</td>
                      <td className="p-4 text-right">
                        <span className={daysUntil < 7 ? 'font-semibold text-destructive' : ''}>
                          {daysUntil} days
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
