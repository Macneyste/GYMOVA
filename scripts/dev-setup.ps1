# One-shot development bootstrap for Windows PowerShell. Run from the repository root:
#   powershell -ExecutionPolicy Bypass -File scripts/dev-setup.ps1
$ErrorActionPreference = 'Stop'
Set-Location (Join-Path $PSScriptRoot '..')

Write-Host '> Installing workspaces'
npm install

if (-not (Test-Path 'apps/api/.env')) {
  Write-Host '> Creating apps/api/.env with random secrets'
  Copy-Item 'apps/api/.env.example' 'apps/api/.env'
  function New-Secret { node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))" }
  $env1 = Get-Content 'apps/api/.env' -Raw
  $env1 = $env1 -replace 'JWT_ACCESS_SECRET=.*', ('JWT_ACCESS_SECRET="' + (New-Secret) + '"')
  $env1 = $env1 -replace 'JWT_REFRESH_SECRET=.*', ('JWT_REFRESH_SECRET="' + (New-Secret) + '"')
  $env1 = $env1 -replace 'QR_TOKEN_SECRET=.*', ('QR_TOKEN_SECRET="' + (New-Secret) + '"')
  Set-Content 'apps/api/.env' $env1 -Encoding utf8
}

if (-not (Test-Path 'apps/admin/.env.local')) { Copy-Item 'apps/admin/.env.example' 'apps/admin/.env.local' }

if (Get-Command docker -ErrorAction SilentlyContinue) {
  Write-Host '> Starting PostgreSQL, Redis and MinIO'
  npm run docker:up
  Start-Sleep -Seconds 8
} else {
  Write-Warning 'Docker not found - make sure DATABASE_URL in apps/api/.env points to a running PostgreSQL 16.'
}

Write-Host '> Prisma generate + migrate + seed'
npm run db:generate
npm run db:migrate -- --name init
npm run db:seed
Write-Host 'Done. Start the API with: npm run dev:api'
