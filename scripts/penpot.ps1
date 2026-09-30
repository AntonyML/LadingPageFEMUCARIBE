param(
  [ValidateSet('help','install','doctor','tools','refresh','call','bridge')]
  [string]$Action = 'help',
  [string]$Tool,
  [string]$ArgumentsFile
)
$projectRoot = Split-Path $PSScriptRoot -Parent
if ($Action -eq 'install') {
  & powershell -NoProfile -File (Join-Path $PSScriptRoot 'tooling.ps1') install-penpot
} else {
  $cliArgs = @((Join-Path $projectRoot 'tools/penpot/penpot.mjs'), $Action)
  if ($Tool) { $cliArgs += $Tool }
  if ($ArgumentsFile) { $cliArgs += $ArgumentsFile }
  & node --use-system-ca @cliArgs
}
exit $LASTEXITCODE
