import type { ButtonHTMLAttributes } from 'react'

interface SubmitButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  pending?: boolean
  pendingText?: string
}

export function SubmitButton({
  pending = false,
  pendingText,
  children,
  className,
  ...props
}: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      className={
        className ??
        'inline-flex h-10 items-center justify-center rounded-md bg-[var(--primary)] px-4 text-sm font-medium text-[var(--primary-foreground)] hover:bg-[var(--primary)]/90 disabled:pointer-events-none disabled:opacity-50'
      }
      {...props}
    >
      {pending ? (pendingText ?? children) : children}
    </button>
  )
}
