param(
  [ValidateSet('help','install','doctor','tools','refresh','call','bridge')]
  [string]$Action = 'help',
  [string]$Tool,
  [string]$ArgumentsFile
)
$projectRoot = Split-Path $PSScriptRoot -Parent
if ($Action -eq 'install') {
  $env:NODE_OPTIONS = (($env:NODE_OPTIONS + ' --use-system-ca').Trim())
  & npm.cmd ci --prefix (Join-Path $projectRoot 'tools/penpot') --ignore-scripts
} else {
  $cliArgs = @((Join-Path $projectRoot 'tools/penpot/penpot.mjs'), $Action)
  if ($Tool) { $cliArgs += $Tool }
  if ($ArgumentsFile) { $cliArgs += $ArgumentsFile }
  & node --use-system-ca @cliArgs
}
exit $LASTEXITCODE
