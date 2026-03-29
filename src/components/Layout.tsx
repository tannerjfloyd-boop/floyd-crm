import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Inbox,
  TrendingUp,
  Users,
  History,
  Menu,
  X,
} from 'lucide-react'
import { cn } from '../lib/utils'

interface LayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Lead Inbox', href: '/leads', icon: Inbox },
  { name: 'Pipeline', href: '/pipeline', icon: TrendingUp },
  { name: 'Partners', href: '/partners', icon: Users },
  { name: 'Reactivation', href: '/reactivation', icon: History },
]

export function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    document.documentElement.classList.add('dark')
  }, [])

  return (
    <div className="flex h-screen bg-slate-950">
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-60 flex-col bg-slate-900 border-r border-slate-700/30 transform transition-transform duration-200 ease-in-out lg:relative lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between px-5 border-b border-slate-700/30 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
            <h1 className="text-base font-bold tracking-tight text-white" style={{ letterSpacing: '-0.02em' }}>
              Floyd CRM
            </h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-500 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-3 py-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium border transition-all duration-150',
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200 border-transparent'
                )}
              >
                <item.icon
                  className={cn('h-4 w-4 shrink-0', isActive ? 'text-emerald-400' : 'text-slate-500')}
                />
                {item.name}
              </Link>
            )
          })}
        </nav>

        {/* User badge */}
        <div className="shrink-0 border-t border-slate-700/30 p-4">
          <div className="flex items-center gap-3 rounded-lg bg-slate-800/50 px-3 py-2.5">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-400">
              TF
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-slate-200">Tanner Floyd</p>
              <p className="truncate text-xs text-slate-500">Loan Officer</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-slate-700/30 bg-slate-900/80 px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-400 hover:text-white"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            <span className="text-sm font-bold text-white" style={{ letterSpacing: '-0.02em' }}>
              Floyd CRM
            </span>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-slate-950 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
