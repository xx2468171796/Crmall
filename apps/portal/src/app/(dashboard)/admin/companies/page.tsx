import { prisma } from "@nexus/db"
import { auth } from "@nexus/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@nexus/ui"
import { Building2, Users, FolderTree } from "lucide-react"
import { redirect } from "next/navigation"

async function getCompanies(tenantId: string | null, isPlatformAdmin: boolean) {
  const where = isPlatformAdmin ? {} : tenantId ? { tenantId } : { id: "none" }
  
  return prisma.company.findMany({
    where,
    include: {
      tenant: { select: { name: true } },
      _count: {
        select: {
          departments: true,
          employees: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  })
}

export default async function CompaniesPage() {
  const session = await auth()
  
  if (!session?.user) {
    redirect("/login")
  }

  const companies = await getCompanies(
    session.user.tenantId || null,
    session.user.isPlatformAdmin || false
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">公司管理</h1>
        <p className="text-muted-foreground">管理集团下属公司</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <Card key={company.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">{company.name}</CardTitle>
              {session.user.isPlatformAdmin && company.tenant && (
                <p className="text-xs text-muted-foreground">
                  租户: {company.tenant.name}
                </p>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="text-muted-foreground">
                  编码: {company.code}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <FolderTree className="h-4 w-4" />
                    <span>{company._count?.departments || 0} 部门</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{company._count?.employees || 0} 员工</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {companies.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          暂无公司数据
        </div>
      )}
    </div>
  )
}
