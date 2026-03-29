import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { formatCurrency } from '../lib/utils'
import { getDashboardStats, isDBEmpty } from '../lib/api'
import type { DashboardStats } from '../lib/api'
import { seedDatabase } from '../lib/seed'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Users, DollarSign, Phone, Database, Loader2 } from 'lucide-react'

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6']

const iconColors: Record<string, string> = {
  emerald: 'bg-emerald-500/10 text-emerald-400',
  blue:    'bg-blue-500/10 text-blue-400',
  amber:   'bg-amber-500/10 text-amber-400',
  violet:  'bg-violet-500/10 text-violet-400',
}

const kpiCards = [
  { key: 'newLeadsThisWeek',       label: 'New Leads',            sublabel: 'Last 7 days',        icon: Users,      color: 'emerald' },
  { key: 'pipelineVolume',         label: 'Pipeline Volume',      sublabel: 'Across all stages',  icon: DollarSign, color: 'blue', isCurrency: true },
  { key: 'dealsClosingThisMonth',  label: 'Closing This Month',   sublabel: 'Active deals',       icon: TrendingUp, color: 'amber' },
  { key: 'activityCountThisWeek',  label: 'Reactivation Touches', sublabel: 'This week',          icon: Phone,      color: 'violet' },
]

export function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [dbEmpty, setDbEmpty] = useState(false)
  const [seeding, setSeeding] = useState(false)

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsData, empty] = await Promise.all([getDashboardStats(), isDBEmpty()])
      setStats(statsData)
      setDbEmpty(empty)
    } catch (err) {
      console.error('Failed to load dashboard:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadData() }, [])

  const handleSeed = async () => {
    setSeeding(true)
    try {
      await seedDatabase()
      await loadData()
    } catch (err) {
      console.error('Seeding failed:', err)
    } finally {
      setSeeding(false)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  const values: Record<string, number> = {
    newLeadsThisWeek:       stats?.newLeadsThisWeek ?? 0,
    pipelineVolume:         stats?.pipelineVolume ?? 0,
    dealsClosingThisMonth:  stats?.dealsClosingThisMonth ?? 0,
    activityCountThisWeek:  stats?.activityCountThisWeek ?? 0,
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white" style={{ letterSpacing: '-0.025em' }}>Dashboard</h1>
          <p className="mt-0.5 text-sm text-slate-400">Overview of your mortgage pipeline</p>
        </div>
        {dbEmpty && (
          <Button onClick={handleSeed} disabled={seeding} variant="outline">
            {seeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Database className="mr-2 h-4 w-4" />}
            Seed Database
          </Button>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {kpiCards.map(({ key, label, sublabel, icon: Icon, color, isCurrency }) => (
          <Card key={key} className="overflow-hidden">
            <CardHeader className="flex flex-row items-start justify-between space-y-0 px-5 pt-5 pb-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{label}</p>
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconColors[color]}`}>
                <Icon className="h-4 w-4" />
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="text-3xl font-bold text-white" style={{ letterSpacing: '-0.02em' }}>
                {isCurrency ? formatCurrency(values[key]) : values[key]}
              </div>
              <p className="mt-1 text-xs text-slate-500">{sublabel}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="border-b border-slate-700/20 pb-4">
            <CardTitle className="text-base">Pipeline by Stage</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {(stats?.pipelineByStage ?? []).length === 0 ? (
              <div className="flex h-[280px] items-center justify-center text-sm text-slate-500">
                No pipeline data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={stats!.pipelineByStage} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: '#64748b', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <YAxis
                    dataKey="stage"
                    type="category"
                    width={115}
                    tick={{ fill: '#94a3b8', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    formatter={(value) => [formatCurrency(value as number), 'Total Value']}
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid rgba(71,85,105,0.4)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    cursor={{ fill: 'rgba(255,255,255,0.03)' }}
                  />
                  <Bar dataKey="value" fill="#10b981" name="Total Value" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-slate-700/20 pb-4">
            <CardTitle className="text-base">Lead Source Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            {(stats?.leadSourceBreakdown ?? []).length === 0 ? (
              <div className="flex h-[280px] items-center justify-center text-sm text-slate-500">
                No source data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={stats!.leadSourceBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.source}: ${entry.count}`}
                    outerRadius={90}
                    dataKey="count"
                  >
                    {stats!.leadSourceBreakdown.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0f172a',
                      border: '1px solid rgba(71,85,105,0.4)',
                      borderRadius: '8px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
