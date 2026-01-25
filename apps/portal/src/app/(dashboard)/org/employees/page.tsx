import { prisma } from "@nexus/db"
import { auth } from "@nexus/auth"
import { Card, CardContent, CardHeader, CardTitle } from "@nexus/ui"
import { User, Building2, Mail } from "lucide-react"
import { redirect } from "next/navigation"

async function getEmployees(
  tenantId: string | null,
  companyId: string | null,
  isPlatformAdmin: boolean
) {
  const where: Record<string, unknown> = {}

  if (!isPlatformAdmin) {
    if (tenantId) where.tenantId = tenantId
    if (companyId) where.companyId = companyId
  }

  return prisma.employee.findMany({
    where,
    include: {
      user: { select: { name: true, email: true } },
      company: { select: { name: true } },
      department: { select: { name: true } },
      team: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  })
}

export default async function EmployeesPage() {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  const employees = await getEmployees(
    session.user.tenantId || null,
    session.user.companyId || null,
    session.user.isPlatformAdmin || false
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">员工管理</h1>
        <p className="text-muted-foreground">管理公司员工信息</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {employees.map((emp) => (
          <Card key={emp.id}>
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg font-medium">
                <User className="h-5 w-5" />
                {emp.user?.name || emp.employeeNo}
              </CardTitle>
              <p className="text-xs text-muted-foreground">
                {emp.position || "员工"}
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {emp.user?.email && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-4 w-4" />
                    <span>{emp.user.email}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>
                    {emp.company?.name}
                    {emp.department && ` / ${emp.department.name}`}
                    {emp.team && ` / ${emp.team.name}`}
                  </span>
                </div>
                <div className="text-xs">
                  工号: {emp.employeeNo} | 状态: {emp.status}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {employees.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          暂无员工数据
        </div>
      )}
    </div>
  )
}
