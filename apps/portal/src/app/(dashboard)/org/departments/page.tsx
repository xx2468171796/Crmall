import { prisma } from "@nexus/db"
import { auth } from "@nexus/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@nexus/ui"
import { FolderTree, Users } from "lucide-react"
import { redirect } from "next/navigation"

async function getDepartments(
  tenantId: string | null,
  companyId: string | null,
  isPlatformAdmin: boolean
) {
  const where: Record<string, unknown> = {}
  
  if (!isPlatformAdmin) {
    if (tenantId) where.tenantId = tenantId
    if (companyId) where.companyId = companyId
  }

  return prisma.department.findMany({
    where,
    include: {
      company: { select: { name: true } },
      parent: { select: { name: true } },
      _count: {
        select: {
          children: true,
          teams: true,
          employees: true,
        },
      },
    },
    orderBy: [{ level: "asc" }, { sortOrder: "asc" }],
  })
}

export default async function DepartmentsPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const departments = await getDepartments(
    session.user.tenantId || null,
    session.user.companyId || null,
    session.user.isPlatformAdmin || false
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">部门管理</h1>
        <p className="text-muted-foreground">管理公司组织架构</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {departments.map((dept) => (
          <Card key={dept.id}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">
                {dept.name}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {dept.company?.name}
                {dept.parent && ` / ${dept.parent.name}`}
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1">
                  <FolderTree className="h-4 w-4" />
                  <span>{dept._count?.children || 0} 子部门</span>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  <span>{dept._count?.employees || 0} 员工</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {departments.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          暂无部门数据
        </div>
      )}
    </div>
  )
}
