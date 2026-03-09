import type { InputHTMLAttributes } from 'react'

const inputClass =
  'flex h-10 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm ring-offset-[var(--background)] placeholder:text-[var(--muted-foreground)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2'

interface FormInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
}

export function FormInput({ label, id, className, ...props }: FormInputProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <input id={id} className={className ?? inputClass} {...props} />
    </div>
  )
}

FormInput.className = inputClass
