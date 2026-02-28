/**
 * 登录页面布局
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40">
      <div className="w-full max-w-[400px] p-6">
        {children}
      </div>
    </div>
  )
}
