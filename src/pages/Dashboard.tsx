import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { formatCurrency } from '../lib/utils'
import { getDashboardStats, isDBEmpty } from '../lib/api'
import type { DashboardStats } from '../lib/api'
import { seedDatabase } from '../lib/seed'
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { TrendingUp, Users, DollarSign, Phone, Database, Loader2 } from 'lucide-react'

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

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
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your mortgage pipeline</p>
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
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Leads This Week</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.newLeadsThisWeek ?? 0}</div>
            <p className="text-xs text-muted-foreground">Last 7 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pipeline Volume</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats?.pipelineVolume ?? 0)}</div>
            <p className="text-xs text-muted-foreground">Across all stages</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Deals Closing This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.dealsClosingThisMonth ?? 0}</div>
            <p className="text-xs text-muted-foreground">This month</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Reactivation Touches</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.activityCountThisWeek ?? 0}</div>
            <p className="text-xs text-muted-foreground">This week</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Pipeline by Stage</CardTitle>
          </CardHeader>
          <CardContent>
            {(stats?.pipelineByStage ?? []).length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground text-sm">
                No pipeline data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stats!.pipelineByStage} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="stage" type="category" width={100} />
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                  <Bar dataKey="value" fill="#3b82f6" name="Total Value" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lead Source Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            {(stats?.leadSourceBreakdown ?? []).length === 0 ? (
              <div className="flex h-[300px] items-center justify-center text-muted-foreground text-sm">
                No source data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={stats!.leadSourceBreakdown}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry: any) => `${entry.source}: ${entry.count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {stats!.leadSourceBreakdown.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
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
