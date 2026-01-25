"use client"

import { useSession, signOut } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, Button } from "@nexus/ui"
import { User, LogOut, Shield } from "lucide-react"

export default function SettingsPage() {
  const { data: session } = useSession()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">设置</h1>
        <p className="text-muted-foreground">账户设置和个人偏好</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              账户信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                姓名
              </label>
              <p className="text-lg">{session?.user?.name || "-"}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                邮箱
              </label>
              <p className="text-lg">{session?.user?.email || "-"}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              权限信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                角色
              </label>
              <p className="text-lg">
                {session?.user?.isPlatformAdmin
                  ? "平台管理员"
                  : session?.user?.dataScope || "普通用户"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                数据范围
              </label>
              <p className="text-lg">{session?.user?.dataScope || "SELF"}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <LogOut className="h-5 w-5" />
            登出
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Button
            variant="destructive"
            onClick={() => signOut({ callbackUrl: "/login" })}
          >
            退出登录
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
