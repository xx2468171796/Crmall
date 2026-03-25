'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { Wallet, ArrowDownLeft, ArrowUpRight, RotateCcw, CreditCard } from 'lucide-react'
import { useAccount, useTransactions } from '@/features/ordering/hooks/use-ordering'

const TYPE_CONFIG: Record<string, { icon: typeof ArrowDownLeft; color: string; label: string }> = {
  topup: { icon: ArrowDownLeft, color: 'text-green-600', label: 'topup' },
  deduct: { icon: ArrowUpRight, color: 'text-red-600', label: 'deduct' },
  refund: { icon: RotateCcw, color: 'text-blue-600', label: 'refund' },
  credit_adjust: { icon: CreditCard, color: 'text-amber-600', label: 'credit_adjust' },
}

export default function AccountPage() {
  const t = useTranslations('ordering')
  const tc = useTranslations('common')
  const [page, setPage] = useState(1)

  const { data: accountData, isLoading: accountLoading } = useAccount()
  const { data: txData, isLoading: txLoading } = useTransactions(page, 20)

  const account = accountData?.success ? accountData.data : null
  const transactions = txData?.success ? txData.data.items : []
  const totalTx = txData?.success ? txData.data.total : 0
  const totalPages = Math.ceil(totalTx / 20)

  if (accountLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-[var(--muted-foreground)]">
        {tc('loading')}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
        <Wallet className="h-6 w-6" />
        {t('account')}
      </h1>

      {/* 账户余额卡片 */}
      {account ? (
        <div className="rounded-xl border bg-gradient-to-br from-violet-50 to-white dark:from-violet-950/20 dark:to-[var(--card)] p-6 shadow-sm">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <p className="text-xs text-[var(--muted-foreground)] mb-1">{t('balance')}</p>
              <p className="text-3xl font-bold text-[#8b5cf6]">
                {account.currency} {account.balance.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted-foreground)] mb-1">{t('credit_limit')}</p>
              <p className="text-xl font-semibold">
                {account.currency} {account.creditLimit.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-xs text-[var(--muted-foreground)] mb-1">{t('available_amount')}</p>
              <p className="text-xl font-semibold text-green-600">
                {account.currency} {(account.balance + account.creditLimit).toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border p-6 text-center text-[var(--muted-foreground)]">
          {t('no_account')}
        </div>
      )}

      {/* 交易记录 */}
      <section>
        <h2 className="font-semibold mb-3">{t('transaction_history')}</h2>
        {txLoading ? (
          <div className="flex items-center justify-center py-10 text-[var(--muted-foreground)]">
            {tc('loading')}
          </div>
        ) : transactions.length === 0 ? (
          <div className="rounded-lg border p-6 text-center text-[var(--muted-foreground)]">
            {tc('no_data')}
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {transactions.map((tx) => {
              const config = TYPE_CONFIG[tx.type] ?? TYPE_CONFIG.deduct
              const Icon = config.icon
              return (
                <div
                  key={tx.id}
                  className="flex items-center gap-3 rounded-lg border bg-[var(--card)] px-4 py-3 shadow-sm"
                >
                  <div className={`flex h-9 w-9 items-center justify-center rounded-full bg-[var(--muted)] ${config.color}`}>
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{t(`tx_type_${tx.type}`)}</p>
                    <p className="text-xs text-[var(--muted-foreground)] truncate">
                      {tx.note ?? ''} &middot; {new Date(tx.createdAt).toLocaleString('zh-CN')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className={`text-sm font-semibold ${tx.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {tx.amount >= 0 ? '+' : ''}{tx.amount.toLocaleString()}
                    </p>
                    <p className="text-xs text-[var(--muted-foreground)]">
                      {t('balance')}: {tx.balanceAfter.toLocaleString()}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* 分页 */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-[var(--accent)]"
            >
              &lsaquo;
            </button>
            <span className="text-sm text-[var(--muted-foreground)]">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="rounded-md border px-3 py-1.5 text-sm disabled:opacity-40 hover:bg-[var(--accent)]"
            >
              &rsaquo;
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
