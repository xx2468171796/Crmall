import { Card, CardContent, CardHeader, CardTitle } from "@nexus/ui"
import { Users, Building2, FileText, TrendingUp } from "lucide-react"

const stats = [
  { title: "员工总数", value: "128", icon: Users, change: "+12%" },
  { title: "公司数量", value: "5", icon: Building2, change: "+2" },
  { title: "本月文档", value: "432", icon: FileText, change: "+18%" },
  { title: "活跃用户", value: "89", icon: TrendingUp, change: "+5%" },
]

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">欢迎回来，这是您的工作台概览</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-500">{stat.change}</span> 较上月
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
