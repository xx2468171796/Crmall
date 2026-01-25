import { prisma } from "@nexus/db"
import { Card, CardContent, CardHeader, CardTitle } from "@nexus/ui"
import { Building2, Users, CheckCircle, XCircle } from "lucide-react"

async function getTenants() {
  return prisma.tenant.findMany({
    include: {
      group: {
        include: {
          _count: { select: { companies: true } },
        },
      },
      _count: { select: { users: true } },
    },
    orderBy: { createdAt: "desc" },
  })
}

export default async function TenantsPage() {
  const tenants = await getTenants()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">租户管理</h1>
        <p className="text-muted-foreground">管理平台所有租户（客户企业）</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {tenants.map((tenant) => (
          <Card key={tenant.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-lg font-medium">{tenant.name}</CardTitle>
              {tenant.status === "ACTIVE" ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>编码: {tenant.code}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <span>套餐: {tenant.plan}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Building2 className="h-4 w-4" />
                    <span>{tenant.group?._count?.companies || 0} 公司</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{tenant._count?.users || 0} 用户</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {tenants.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          暂无租户数据
        </div>
      )}
    </div>
  )
}
