import React from 'react'
import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const alertVariants = cva(
  'relative w-full rounded-2xl border border-slate-200 bg-white p-4 [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-slate-950 [&>svg+div]:pl-7',
  {
    variants: {
      variant: {
        default: 'text-slate-950',
        destructive: 'border-rose-500/50 text-rose-600 [&>svg]:text-rose-600'
      }
    },
    defaultVariants: {
      variant: 'default'
    }
  }
)

const Alert = React.forwardRef(function Alert({ className, variant, ...props }, ref) {
  return <div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props} />
})

const AlertTitle = React.forwardRef(function AlertTitle({ className, ...props }, ref) {
  return <h5 ref={ref} className={cn('mb-1 font-medium leading-none tracking-tight', className)} {...props} />
})

const AlertDescription = React.forwardRef(function AlertDescription({ className, ...props }, ref) {
  return <div ref={ref} className={cn('text-sm [&_p]:leading-relaxed', className)} {...props} />
})

export { Alert, AlertTitle, AlertDescription }
