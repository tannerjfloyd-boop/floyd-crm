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

const lockStatusStyles: Record<string, string> = {
  locked:        'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  floating:      'bg-amber-500/10 text-amber-400 border-amber-500/30',
  expired:       'bg-rose-500/10 text-rose-400 border-rose-500/30',
  lock_pending:  'bg-blue-500/10 text-blue-400 border-blue-500/30',
  lock_extended: 'bg-violet-500/10 text-violet-400 border-violet-500/30',
  relocked:      'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
}

const selectCls = "rounded-md border bg-slate-800 px-2.5 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500/50"

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
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  const filterSelectCls = "rounded-lg border border-slate-700/50 bg-slate-800 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/30"

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white" style={{ letterSpacing: '-0.025em' }}>Pipeline Tracker</h1>
        <p className="mt-0.5 text-sm text-slate-400">Active loans and their current status</p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">Stage</label>
              <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} className={filterSelectCls}>
                {stages.map(stage => (
                  <option key={stage} value={stage}>{stage === 'all' ? 'All Stages' : stage}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-slate-400">Lock Status</label>
              <select value={lockFilter} onChange={(e) => setLockFilter(e.target.value)} className={filterSelectCls}>
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
              <thead>
                <tr className="border-b border-slate-700/30 bg-slate-800/40">
                  <th className="p-4 text-left">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('borrower_name')} className="text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white px-0">
                      Borrower <ArrowUpDown className="ml-1.5 h-3 w-3" />
                    </Button>
                  </th>
                  <th className="p-4 text-left">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('loan_stage')} className="text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white px-0">
                      Stage <ArrowUpDown className="ml-1.5 h-3 w-3" />
                    </Button>
                  </th>
                  <th className="p-4 text-left">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('lender')} className="text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white px-0">
                      Lender <ArrowUpDown className="ml-1.5 h-3 w-3" />
                    </Button>
                  </th>
                  <th className="p-4 text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('loan_amount')} className="text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white px-0">
                      Amount <ArrowUpDown className="ml-1.5 h-3 w-3" />
                    </Button>
                  </th>
                  <th className="p-4 text-left">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('lock_status')} className="text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white px-0">
                      Lock Status <ArrowUpDown className="ml-1.5 h-3 w-3" />
                    </Button>
                  </th>
                  <th className="p-4 text-left">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('est_close_date')} className="text-xs font-semibold uppercase tracking-wider text-slate-400 hover:text-white px-0">
                      Est. Close <ArrowUpDown className="ml-1.5 h-3 w-3" />
                    </Button>
                  </th>
                  <th className="p-4 text-right text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Days Left
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedLoans.length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-sm text-slate-500">
                      No loans found
                    </td>
                  </tr>
                )}
                {filteredAndSortedLoans.map((loan, i) => {
                  const daysUntil = getDaysUntil(loan.est_close_date)
                  const isUrgent = daysUntil < 7
                  return (
                    <tr
                      key={loan.id}
                      className={`border-b border-slate-700/20 transition-colors hover:bg-slate-800/30 ${
                        i % 2 === 0 ? '' : 'bg-slate-800/10'
                      }`}
                    >
                      <td className="p-4 font-medium text-white">{loan.borrower_name}</td>
                      <td className="p-4 text-sm text-slate-300">{loan.loan_stage}</td>
                      <td className="p-4 text-sm text-slate-400">{loan.lender}</td>
                      <td className="p-4 text-right font-medium text-white">{formatCurrency(loan.loan_amount)}</td>
                      <td className="p-4">
                        <select
                          value={loan.lock_status}
                          onChange={(e) => handleLockStatusChange(loan, e.target.value)}
                          className={`${selectCls} border ${lockStatusStyles[loan.lock_status] ?? 'border-slate-700/30 text-slate-300'}`}
                        >
                          {LOCK_STATUSES.map(s => (
                            <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                          ))}
                        </select>
                      </td>
                      <td className="p-4 text-sm text-slate-300">{formatDate(loan.est_close_date)}</td>
                      <td className="p-4 text-right">
                        <span className={`text-sm font-semibold ${isUrgent ? 'text-rose-400' : 'text-slate-400'}`}>
                          {daysUntil}d
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
