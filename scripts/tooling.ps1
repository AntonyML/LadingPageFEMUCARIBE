param(
  [ValidateSet('install','install-penpot','check','typecheck','lint','format','format:check','build','test:unit','test:e2e','browsers','versions')]
  [string]$Action = 'check'
)
$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path $PSScriptRoot -Parent
$expectedNode = (Get-Content (Join-Path $projectRoot '.node-version') -Raw).Trim()
$runtimeHome = $env:FEMUCARIBE_NODE_HOME
if (!$runtimeHome) {
  $portableHome = Join-Path $env:USERPROFILE ".codex/runtimes/node-v$expectedNode-win-x64"
  if (Test-Path (Join-Path $portableHome 'node.exe')) { $runtimeHome = $portableHome }
}
$previousPath = $env:PATH
$previousOptions = $env:NODE_OPTIONS
Push-Location $projectRoot
try {
  if ($runtimeHome) { $env:PATH = "$runtimeHome;$env:PATH" }
  $env:NODE_OPTIONS = (($env:NODE_OPTIONS + ' --use-system-ca').Trim())
  $actualNode = (& node --version).Trim()
  if ($LASTEXITCODE -ne 0 -or $actualNode -ne "v$expectedNode") { throw "Node requerido: $expectedNode; actual: $actualNode. Selecciona el runtime o define FEMUCARIBE_NODE_HOME." }
  $expectedPnpm = (Get-Content package.json -Raw | ConvertFrom-Json).packageManager.Split('@')[1]
  $actualPnpm = (& pnpm --version).Trim()
  if ($LASTEXITCODE -ne 0 -or $actualPnpm -ne $expectedPnpm) { throw "pnpm requerido: $expectedPnpm; actual: $actualPnpm" }
  if ($Action -eq 'versions') {
    Write-Output "Node $actualNode; pnpm $actualPnpm"
  } elseif ($Action -in @('install','install-penpot')) {
    if ($Action -eq 'install') {
      & pnpm install --frozen-lockfile
      if ($LASTEXITCODE -ne 0) { throw 'Root install failed' }
    }
    & pnpm --dir tools/penpot install --frozen-lockfile --ignore-scripts
    if ($LASTEXITCODE -ne 0) { throw 'Penpot install failed' }
  } elseif ($Action -eq 'browsers') {
    & pnpm exec playwright install chromium
    if ($LASTEXITCODE -ne 0) { throw 'Chromium install failed' }
  } else {
    & pnpm run $Action
    if ($LASTEXITCODE -ne 0) { throw "Failed: $Action" }
  }
} finally {
  Pop-Location
  $env:PATH = $previousPath
  $env:NODE_OPTIONS = $previousOptions
}
