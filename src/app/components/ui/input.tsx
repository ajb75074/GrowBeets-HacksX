//input component for textfields
import * as React from "react"

import { cn } from "@/app/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full rounded-md border border-primary-text bg-primary-background px-3 py-2 text-sm font-bold ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-primary-text text-[rgb(221,161,94)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 font-aileron",
        className,
      )}
      style={{ color: 'rgb(254, 250, 224)' }}
      ref={ref}
      {...props}
    />
  )
})
Input.displayName = "Input"

export { Input }
