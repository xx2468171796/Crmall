'use client'

import { LOCALES, LOCALE_LABELS, DEFAULT_LOCALE } from '@twcrm/shared'
import type { Locale } from '@twcrm/shared'
import { Globe } from 'lucide-react'

const selectClass =
  'flex h-10 w-full rounded-md border border-[var(--input)] bg-[var(--background)] px-3 py-2 text-sm ring-offset-[var(--background)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2'

interface LocaleSelectProps {
  /** 作为表单字段时的 name */
  name?: string
  /** 受控模式 value */
  value?: Locale
  /** 非受控默认值 */
  defaultValue?: Locale
  /** 变更回调 */
  onChange?: (locale: Locale) => void
  /** 额外 className */
  className?: string
  /** 是否显示 Globe 图标（header 紧凑模式） */
  compact?: boolean
  /** label 文字，不传则不渲染 label */
  label?: string
  /** aria-label */
  ariaLabel?: string
}

export function LocaleSelect({
  name = 'locale',
  value,
  defaultValue = DEFAULT_LOCALE,
  onChange,
  className,
  compact = false,
  label,
  ariaLabel,
}: LocaleSelectProps) {
  const select = (
    <select
      id={name}
      name={name}
      value={value}
      defaultValue={value === undefined ? defaultValue : undefined}
      onChange={onChange ? (e) => onChange(e.target.value as Locale) : undefined}
      className={
        className ??
        (compact
          ? 'appearance-none rounded-md pl-8 pr-2 py-1.5 text-xs border border-[var(--input)] bg-[var(--background)] hover:bg-[var(--accent)] cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--ring)]'
          : selectClass)
      }
      aria-label={ariaLabel}
    >
      {LOCALES.map((loc) => (
        <option key={loc} value={loc}>
          {LOCALE_LABELS[loc]}
        </option>
      ))}
    </select>
  )

  if (compact) {
    return (
      <div className="relative">
        {select}
        <Globe className="absolute left-2 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--muted-foreground)] pointer-events-none" />
      </div>
    )
  }

  if (label) {
    return (
      <div className="flex flex-col gap-2">
        <label htmlFor={name} className="text-sm font-medium">
          {label}
        </label>
        {select}
      </div>
    )
  }

  return select
}
