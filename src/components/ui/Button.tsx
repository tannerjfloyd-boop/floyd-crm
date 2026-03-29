import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-900 disabled:pointer-events-none disabled:opacity-50",
          {
            'bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm': variant === 'default',
            'bg-rose-600 hover:bg-rose-500 text-white': variant === 'destructive',
            'border border-slate-700/50 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white': variant === 'outline',
            'bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/30': variant === 'secondary',
            'hover:bg-slate-800 text-slate-400 hover:text-slate-200': variant === 'ghost',
            'text-emerald-400 underline-offset-4 hover:underline': variant === 'link',
            'h-10 px-4 py-2': size === 'default',
            'h-8 px-3 text-xs': size === 'sm',
            'h-11 px-8': size === 'lg',
            'h-10 w-10 p-0': size === 'icon',
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
