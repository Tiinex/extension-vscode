param(
  [Parameter(Mandatory = $true)]
  [ValidateSet('PackLocal', 'UseLocal', 'Latest')]
  [string]$Mode,

  [Parameter(Mandatory = $true)]
  [string]$PackageName,

  [string]$LocalPath = '',
  [string]$CacheKey = ''
)

$ErrorActionPreference = 'Stop'
$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$cacheRoot = Join-Path ([System.IO.Path]::GetTempPath()) 'tiinex-vscode-local-packages'
$key = if ($CacheKey) { $CacheKey } else { ($PackageName -replace '[^A-Za-z0-9._-]+', '-') }
$localPackagePath = Join-Path $cacheRoot ("{0}.tgz" -f $key)

function Invoke-Npm {
  param(
    [Parameter(Mandatory = $true)]
    [string]$WorkingDirectory,
    [Parameter(Mandatory = $true)]
    [string[]]$Arguments
  )

  Push-Location $WorkingDirectory
  try {
    & npm @Arguments
    if ($LASTEXITCODE -ne 0) {
      throw "npm failed with exit code $LASTEXITCODE: npm $($Arguments -join ' ')"
    }
  }
  finally {
    Pop-Location
  }
}

if ($Mode -eq 'PackLocal') {
  if (-not $LocalPath) { throw 'LocalPath is required for PackLocal.' }
  $source = [System.IO.Path]::GetFullPath((Join-Path $repoRoot $LocalPath))
  $packageJsonPath = Join-Path $source 'package.json'
  if (-not (Test-Path -LiteralPath $packageJsonPath -PathType Leaf)) {
    throw "Local dependency package.json not found: $packageJsonPath"
  }

  $packageJson = Get-Content -LiteralPath $packageJsonPath -Raw | ConvertFrom-Json
  if ([string]$packageJson.name -ne $PackageName) {
    throw "Local dependency identity mismatch. Expected '$PackageName', found '$($packageJson.name)'."
  }

  New-Item -ItemType Directory -Force -Path $cacheRoot | Out-Null
  Push-Location $source
  try {
    $json = (& npm pack --json --pack-destination $cacheRoot) -join "`n"
    if ($LASTEXITCODE -ne 0) { throw "npm pack failed with exit code $LASTEXITCODE." }
  }
  finally {
    Pop-Location
  }
  $receipt = $json | ConvertFrom-Json
  $packedName = [string]$receipt[0].filename
  if (-not $packedName) { throw 'npm pack did not return a package filename.' }
  $packedPath = Join-Path $cacheRoot $packedName
  if (-not (Test-Path -LiteralPath $packedPath -PathType Leaf)) {
    throw "npm pack output not found: $packedPath"
  }

  if (Test-Path -LiteralPath $localPackagePath) { Remove-Item -LiteralPath $localPackagePath -Force }
  Move-Item -LiteralPath $packedPath -Destination $localPackagePath -Force
  Write-Host "Packed $PackageName -> $localPackagePath"
  exit 0
}

if ($Mode -eq 'UseLocal') {
  if (-not (Test-Path -LiteralPath $localPackagePath -PathType Leaf)) {
    throw "Local package is missing: $localPackagePath. Run the PackLocal task first."
  }
  Invoke-Npm -WorkingDirectory $repoRoot -Arguments @('install', '--no-save', '--package-lock=false', $localPackagePath)
  Write-Host "Using local $PackageName from $localPackagePath"
  exit 0
}

if ($Mode -eq 'Latest') {
  Invoke-Npm -WorkingDirectory $repoRoot -Arguments @('install', "${PackageName}@latest", '--save')
  Write-Host "Using npm latest for $PackageName"
  exit 0
}
