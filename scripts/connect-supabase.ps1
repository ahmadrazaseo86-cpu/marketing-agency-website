param (
    [Parameter(Mandatory=$true)]
    [string]$ConnectionString
)

Write-Host "=============================================" -ForegroundColor Cyan
Write-Host "  Connecting WordPress CMS to Supabase DB   " -ForegroundColor Cyan
Write-Host "=============================================" -ForegroundColor Cyan

$envPath = Join-Path $PSScriptRoot "..\.env"
$prismaDir = Join-Path $PSScriptRoot "..\prisma"
$schemaSupabase = Join-Path $prismaDir "schema.supabase.prisma"
$schemaActive = Join-Path $prismaDir "schema.prisma"

# 1. Update schema.prisma to use PostgreSQL
Write-Host "`n[1/4] Configuring Prisma schema for PostgreSQL..." -ForegroundColor Yellow
Copy-Item -Path $schemaSupabase -Destination $schemaActive -Force

# 2. Update .env with Supabase Connection String
Write-Host "[2/4] Updating .env with Supabase database URL..." -ForegroundColor Yellow
$envContent = @"
DATABASE_URL="$ConnectionString"
DIRECT_URL="$ConnectionString"
JWT_SECRET="wordpress-super-secret-jwt-key-2026-change-in-production"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
"@
Set-Content -Path $envPath -Value $envContent -Force

# 3. Push schema to Supabase
Write-Host "[3/4] Pushing tables and schema to Supabase PostgreSQL (prisma db push)..." -ForegroundColor Yellow
$env:Path = [System.Environment]::GetEnvironmentVariable("Path","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("Path","User")
npx prisma db push

# 4. Seed Database
Write-Host "[4/4] Seeding initial WordPress data (admin user, posts, plugins, themes, options)..." -ForegroundColor Yellow
node (Join-Path $prismaDir "seed.js")

Write-Host "`n=============================================" -ForegroundColor Green
Write-Host "  SUCCESS! Supabase Database Connected & Live" -ForegroundColor Green
Write-Host "=============================================" -ForegroundColor Green
Write-Host "Default Login:" -ForegroundColor White
Write-Host "  Username: admin" -ForegroundColor White
Write-Host "  Password: admin123`n" -ForegroundColor White
