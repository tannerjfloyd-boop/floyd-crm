import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { formatCurrency, formatDate, getDaysUntil } from '../lib/utils'
import * as api from '../lib/api'
import type { PipelineLoan } from '../lib/api'
import { ArrowUpDown, Loader2 } from 'lucide-react'

type SortKey = 'borrower_name' | 'loan_stage' | 'lender' | 'loan_amount' | 'lock_status' | 'est_close_date'
type SortOrder = 'asc' | 'desc'

const LOCK_STATUSES = ['locked', 'floating', 'expired', 'lock_pending', 'lock_extended', 'relocked']

export function PipelineTracker() {
  const [loans, setLoans] = useState<PipelineLoan[]>([])
  const [loading, setLoading] = useState(true)
  const [sortKey, setSortKey] = useState<SortKey>('est_close_date')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')
  const [stageFilter, setStageFilter] = useState<string>('all')
  const [lockFilter, setLockFilter] = useState<string>('all')

  useEffect(() => {
    api.getPipelineLoans()
      .then(setLoans)
      .catch(err => console.error('Failed to load pipeline:', err))
      .finally(() => setLoading(false))
  }, [])

  const stages = useMemo(() => {
    const uniqueStages = Array.from(new Set(loans.map(l => l.loan_stage)))
    return ['all', ...uniqueStages]
  }, [loans])

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortOrder('asc')
    }
  }

  const handleLockStatusChange = async (loan: PipelineLoan, newStatus: string) => {
    const prev = loans
    setLoans(loans.map(l => l.id === loan.id ? { ...l, lock_status: newStatus as PipelineLoan['lock_status'] } : l))
    try {
      await api.updatePipelineLoan(loan.id, { lock_status: newStatus })
    } catch (err) {
      console.error('Failed to update lock status:', err)
      setLoans(prev)
    }
  }

  const filteredAndSortedLoans = useMemo(() => {
    let filtered = loans
    if (stageFilter !== 'all') filtered = filtered.filter(loan => loan.loan_stage === stageFilter)
    if (lockFilter !== 'all') filtered = filtered.filter(loan => loan.lock_status === lockFilter)
    return [...filtered].sort((a, b) => {
      const aValue = a[sortKey as keyof PipelineLoan]
      const bValue = b[sortKey as keyof PipelineLoan]
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue
      }
      return 0
    })
  }, [loans, sortKey, sortOrder, stageFilter, lockFilter])

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

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
                  <option key={stage} value={stage}>{stage === 'all' ? 'All Stages' : stage}</option>
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
                <option value="all">All Status</option>
                {LOCK_STATUSES.map(status => (
                  <option key={status} value={status}>{status.replace(/_/g, ' ')}</option>
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
                    <Button variant="ghost" size="sm" onClick={() => handleSort('borrower_name')} className="font-semibold">
                      Borrower <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="p-4 text-left">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('loan_stage')} className="font-semibold">
                      Stage <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="p-4 text-left">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('lender')} className="font-semibold">
                      Lender <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="p-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('loan_amount')} className="font-semibold">
                      Loan Amount <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="p-4 text-left">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('lock_status')} className="font-semibold">
                      Lock Status <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="p-4 text-left">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('est_close_date')} className="font-semibold">
                      Est. Close <ArrowUpDown className="ml-2 h-4 w-4" />
                    </Button>
                  </th>
                  <th className="p-4 text-right">Days Until Close</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedLoans.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-muted-foreground text-sm">
                      No loans found
                    </td>
                  </tr>
                )}
                {filteredAndSortedLoans.map((loan) => {
                  const daysUntil = getDaysUntil(loan.est_close_date)
                  return (
                    <tr key={loan.id} className="border-b hover:bg-muted/50">
                      <td className="p-4 font-medium">{loan.borrower_name}</td>
                      <td className="p-4">{loan.loan_stage}</td>
                      <td className="p-4 text-sm text-muted-foreground">{loan.lender}</td>
                      <td className="p-4 text-right font-medium">{formatCurrency(loan.loan_amount)}</td>
                      <td className="p-4">
                        <select
                          value={loan.lock_status}
                          onChange={(e) => handleLockStatusChange(loan, e.target.value)}
                          className="rounded border border-input bg-background px-2 py-1 text-xs"
                        >
                          {LOCK_STATUSES.map(s => (
                            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                          ))}
                        </select>
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
