# Enterprise Nexus - 服务启动脚本
# PowerShell 脚本用于启动所有服务

Write-Host "🚀 Starting Enterprise Nexus Services..." -ForegroundColor Cyan

# 检查 Docker 是否运行
$dockerRunning = docker info 2>$null
if (-not $dockerRunning) {
    Write-Host "❌ Docker is not running. Please start Docker first." -ForegroundColor Red
    exit 1
}

# 启动 Docker Compose 服务 (Directus + NocoDB)
Write-Host "`n📦 Starting Docker Compose services..." -ForegroundColor Yellow
Set-Location $PSScriptRoot\..
docker-compose up -d

# 等待服务启动
Write-Host "`n⏳ Waiting for services to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10

# 检查 Directus
$directusReady = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8055/server/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $directusReady = $true
            break
        }
    } catch {}
    Start-Sleep -Seconds 2
}

if ($directusReady) {
    Write-Host "✅ Directus is ready at http://localhost:8055" -ForegroundColor Green
} else {
    Write-Host "⚠️ Directus may not be ready yet" -ForegroundColor Yellow
}

# 检查 NocoDB
$nocodbReady = $false
for ($i = 0; $i -lt 30; $i++) {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8080/api/v1/health" -TimeoutSec 2 -ErrorAction SilentlyContinue
        if ($response.StatusCode -eq 200) {
            $nocodbReady = $true
            break
        }
    } catch {}
    Start-Sleep -Seconds 2
}

if ($nocodbReady) {
    Write-Host "✅ NocoDB is ready at http://localhost:8080" -ForegroundColor Green
} else {
    Write-Host "⚠️ NocoDB may not be ready yet" -ForegroundColor Yellow
}

# 启动 Portal
Write-Host "`n🌐 Starting Portal..." -ForegroundColor Yellow
Start-Process -FilePath "cmd" -ArgumentList "/c", "cd /d $PSScriptRoot\.. && yarn workspace @nexus/portal dev" -WindowStyle Normal

Write-Host "`n✅ All services started!" -ForegroundColor Green
Write-Host @"

📋 Service URLs:
   - Portal:   http://localhost:3000
   - Directus: http://localhost:8055
   - NocoDB:   http://localhost:8080

📝 Next Steps:
   1. Open http://localhost:8055 to configure Directus admin
   2. Run: node scripts/init-directus.js (after getting admin token)
   3. Open http://localhost:3000 to access Portal

"@ -ForegroundColor Cyan
