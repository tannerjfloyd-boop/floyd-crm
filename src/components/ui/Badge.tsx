import * as React from "react"
import { cn } from "../../lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info' | 'danger' | 'neutral'
}

const variantStyles: Record<string, string> = {
  default: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  secondary: 'bg-slate-700/50 text-slate-300 border border-slate-600/30',
  destructive: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  outline: 'border border-slate-600/50 text-slate-400 bg-transparent',
  success: 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20',
  warning: 'bg-amber-500/10 text-amber-400 border border-amber-500/20',
  info: 'bg-blue-500/10 text-blue-400 border border-blue-500/20',
  danger: 'bg-rose-500/10 text-rose-400 border border-rose-500/20',
  neutral: 'bg-slate-700/50 text-slate-300 border border-slate-600/30',
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        variantStyles[variant] || variantStyles.default,
        className
      )}
      {...props}
    />
  )
}

export { Badge }
