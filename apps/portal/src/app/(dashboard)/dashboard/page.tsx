import { useTranslations } from 'next-intl'

/**
 * Dashboard 页面 — 工作台
 */
export default function DashboardPage() {
  const t = useTranslations('dashboard')

  return (
    <div className="flex flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          {t('welcome')}
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          TWCRM 智能家居 CRM 系统
        </p>
      </div>

      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title={t('total_customers')} value="0" />
        <StatCard title={t('total_opportunities')} value="NT$0" />
        <StatCard title={t('total_contracts')} value="NT$0" />
        <StatCard title={t('pending_workorders')} value="0" />
      </div>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <p className="text-2xl font-bold mt-2">{value}</p>
    </div>
  )
}
