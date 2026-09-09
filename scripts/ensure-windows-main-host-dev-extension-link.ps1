param(
    [switch]$ForceRecreate,
    [switch]$Unlink
)

$ErrorActionPreference = 'Stop'

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..')).Path
$extensionsRoot = Join-Path $env:USERPROFILE '.vscode\extensions'
$targetId = 'tiinex.tiinex-vscode'
$linkPath = Join-Path $extensionsRoot $targetId
$extensionsJsonPath = Join-Path $extensionsRoot 'extensions.json'
$packageJsonPath = Join-Path $repoRoot 'package.json'
$distEntry = Join-Path $repoRoot 'dist\extension.js'
$stateRoot = Join-Path $repoRoot '.vscode\link'
$statePath = Join-Path $stateRoot 'state.json'
$legacyMarkerRoot = Join-Path $repoRoot '.tiinex-dev'
$legacyGlobalState = Join-Path (Join-Path $env:USERPROFILE '.tiinex\dev-links') "$targetId.json"

function ConvertFrom-JsonCompat {
    param([Parameter(Mandatory = $true)][string]$RawJson)
    $command = Get-Command ConvertFrom-Json -ErrorAction Stop
    if ($command.Parameters.ContainsKey('Depth')) {
        return $RawJson | ConvertFrom-Json -Depth 100
    }
    return $RawJson | ConvertFrom-Json
}

function ConvertTo-JsonCompat {
    param([Parameter(Mandatory = $true)]$Value)
    $command = Get-Command ConvertTo-Json -ErrorAction Stop
    if ($command.Parameters.ContainsKey('Depth')) {
        return ConvertTo-Json -InputObject $Value -Depth 100
    }
    return ConvertTo-Json -InputObject $Value
}

function Get-EntryId {
    param([Parameter(Mandatory = $true)]$Entry)
    if ($Entry -is [System.Collections.IDictionary]) {
        $identifier = $Entry['identifier']
        if ($identifier -is [System.Collections.IDictionary]) { return [string]$identifier['id'] }
        if ($null -ne $identifier -and $identifier.PSObject.Properties.Match('id').Count -gt 0) { return [string]$identifier.id }
        return ''
    }
    if ($Entry.PSObject.Properties.Match('identifier').Count -eq 0) { return '' }
    $identifier = $Entry.identifier
    if ($identifier -is [System.Collections.IDictionary]) { return [string]$identifier['id'] }
    if ($null -ne $identifier -and $identifier.PSObject.Properties.Match('id').Count -gt 0) { return [string]$identifier.id }
    return ''
}

function Get-EntryLocationStrings {
    param([Parameter(Mandatory = $true)]$Entry)
    $location = if ($Entry -is [System.Collections.IDictionary]) { $Entry['location'] } elseif ($Entry.PSObject.Properties.Match('location').Count -gt 0) { $Entry.location } else { $null }
    if ($null -eq $location) { return @() }
    if ($location -is [System.Collections.IDictionary]) { return @($location['fsPath'], $location['path'], $location['external']) | Where-Object { $_ } }
    $values = @()
    foreach ($name in @('fsPath', 'path', 'external')) {
        if ($location.PSObject.Properties.Match($name).Count -gt 0) { $values += $location.$name }
    }
    return @($values | Where-Object { $_ })
}

function Get-VsCodeExtensionLocation {
    param([Parameter(Mandatory = $true)][string]$Path)
    $resolvedPath = (Resolve-Path $Path).Path
    $drive = [System.IO.Path]::GetPathRoot($resolvedPath).TrimEnd('\\').TrimEnd(':').ToLowerInvariant()
    $relativePath = $resolvedPath.Substring(2).Replace('\', '/')
    $uri = [System.Uri]::new($resolvedPath)
    return [pscustomobject]@{
        '$mid' = 1
        fsPath = $resolvedPath
        external = $uri.AbsoluteUri
        path = "/${drive}:$relativePath"
        scheme = 'file'
    }
}

function New-RegistryEntry {
    $packageJson = ConvertFrom-JsonCompat -RawJson (Get-Content -LiteralPath $packageJsonPath -Raw)
    $metadata = [pscustomobject]@{
        installedTimestamp = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
        pinned = $false
        source = 'resource'
        isPreReleaseVersion = $false
        hasPreReleaseVersion = $false
        publisherDisplayName = [string]$packageJson.publisher
    }
    return [pscustomobject]@{
        identifier = [pscustomobject]@{ id = $targetId }
        version = [string]$packageJson.version
        location = Get-VsCodeExtensionLocation -Path $linkPath
        relativeLocation = (Split-Path -Leaf $linkPath)
        metadata = $metadata
    }
}

function Read-Registry {
    if (-not (Test-Path $extensionsJsonPath)) {
        return [pscustomobject]@{ Kind = 'array'; Root = @(); Entries = @() }
    }
    $raw = Get-Content -LiteralPath $extensionsJsonPath -Raw
    if (-not $raw.Trim()) {
        return [pscustomobject]@{ Kind = 'array'; Root = @(); Entries = @() }
    }
    $parsed = ConvertFrom-JsonCompat -RawJson $raw
    if ($parsed -is [System.Collections.IEnumerable] -and -not ($parsed -is [string])) {
        return [pscustomobject]@{ Kind = 'array'; Root = $parsed; Entries = @($parsed) }
    }
    if ($parsed.PSObject.Properties.Match('extensions').Count -gt 0) {
        return [pscustomobject]@{ Kind = 'object'; Root = $parsed; Entries = @($parsed.extensions) }
    }
    return [pscustomobject]@{ Kind = 'array'; Root = @(); Entries = @() }
}

function Write-Registry {
    param(
        [Parameter(Mandatory = $true)]$Registry,
        [Parameter(Mandatory = $true)][object[]]$Entries
    )
    if ($Registry.Kind -eq 'object') {
        $Registry.Root.extensions = @($Entries)
        $value = $Registry.Root
    }
    else {
        $value = @($Entries)
    }
    Set-Content -LiteralPath $extensionsJsonPath -Value (ConvertTo-JsonCompat -Value $value) -Encoding UTF8
}

function Remove-LegacyVersionedLinks {
    if (-not (Test-Path $extensionsRoot)) { return 0 }
    $removed = 0
    foreach ($candidate in Get-ChildItem -LiteralPath $extensionsRoot -Force -ErrorAction SilentlyContinue) {
        if ($candidate.FullName -eq $linkPath) { continue }
        if (-not ($candidate.Attributes -band [IO.FileAttributes]::ReparsePoint)) { continue }
        if ($candidate.Name -notlike "$targetId-*") { continue }
        $targets = @($candidate.Target | ForEach-Object { $_.ToString() })
        if ($candidate.LinkType -eq 'Junction' -and $targets -contains $repoRoot) {
            Remove-Item -LiteralPath $candidate.FullName -Force
            $removed += 1
        }
    }
    return $removed
}

function Save-State {
    param([Parameter(Mandatory = $true)]$Registry, [Parameter(Mandatory = $true)][object[]]$PreviousEntries)
    New-Item -ItemType Directory -Force -Path $stateRoot | Out-Null
    $state = [pscustomobject]@{
        schema = 'tiinex.vscode.main-host-link.v2'
        extensionId = $targetId
        repoRoot = $repoRoot
        linkPath = $linkPath
        registryPath = $extensionsJsonPath
        registryKind = $Registry.Kind
        previousRegistryEntries = @($PreviousEntries)
        linkedAt = (Get-Date).ToUniversalTime().ToString('o')
    }
    Set-Content -LiteralPath $statePath -Value (ConvertTo-JsonCompat -Value $state) -Encoding UTF8
}

function Remove-DevelopmentRegistryEntry {
    $registry = Read-Registry
    $normalizedLink = $linkPath.Replace('\', '/').ToLowerInvariant()
    $kept = @()
    foreach ($entry in $registry.Entries) {
        $id = Get-EntryId -Entry $entry
        $locations = @(Get-EntryLocationStrings -Entry $entry | ForEach-Object { $_.ToString().Replace('\', '/').ToLowerInvariant() })
        $isOurLocation = $locations | Where-Object { $_ -eq $normalizedLink -or $_.Contains($normalizedLink) }
        if ($id -eq $targetId -and $isOurLocation) { continue }
        $kept += $entry
    }
    return [pscustomobject]@{ Registry = $registry; Entries = @($kept) }
}

function Link-Checkout {
    New-Item -ItemType Directory -Force -Path $extensionsRoot | Out-Null
    $legacyRemoved = Remove-LegacyVersionedLinks

    if (Test-Path $linkPath) {
        $existing = Get-Item $linkPath -Force
        $currentTargets = @($existing.Target | ForEach-Object { $_.ToString() })
        $isExpected = $existing.LinkType -eq 'Junction' -and $currentTargets -contains $repoRoot
        if (-not $isExpected) {
            if (-not $ForceRecreate) {
                throw "Existing path at '$linkPath' does not point to '$repoRoot'. Re-run with -ForceRecreate only if that path is a disposable reparse point."
            }
            if (-not ($existing.Attributes -band [IO.FileAttributes]::ReparsePoint)) {
                throw "Refusing to remove '$linkPath' because it is not a reparse point."
            }
            Remove-Item -LiteralPath $linkPath -Force
            New-Item -ItemType Junction -Path $linkPath -Target $repoRoot | Out-Null
        }
    }
    else {
        New-Item -ItemType Junction -Path $linkPath -Target $repoRoot | Out-Null
    }

    $registry = Read-Registry
    $previous = @()
    $existingState = $null
    if (Test-Path $statePath) {
        $existingState = ConvertFrom-JsonCompat -RawJson (Get-Content -LiteralPath $statePath -Raw)
    }
    if ($null -ne $existingState -and [string]$existingState.repoRoot -eq $repoRoot -and [string]$existingState.linkPath -eq $linkPath) {
        $previous = @($existingState.previousRegistryEntries)
    }
    else {
        $normalizedLink = $linkPath.Replace('\', '/').ToLowerInvariant()
        $previous = @($registry.Entries | Where-Object {
            if ((Get-EntryId -Entry $_) -ne $targetId) { return $false }
            $locations = @(Get-EntryLocationStrings -Entry $_ | ForEach-Object { $_.ToString().Replace('\', '/').ToLowerInvariant() })
            -not ($locations | Where-Object { $_ -eq $normalizedLink -or $_.Contains($normalizedLink) })
        })
        Save-State -Registry $registry -PreviousEntries $previous
    }
    $withoutTarget = @($registry.Entries | Where-Object { (Get-EntryId -Entry $_) -ne $targetId })
    Write-Registry -Registry $registry -Entries @($withoutTarget + (New-RegistryEntry))

    if (Test-Path $legacyMarkerRoot) { Remove-Item -LiteralPath $legacyMarkerRoot -Force -Recurse }
    if (Test-Path $legacyGlobalState) { Remove-Item -LiteralPath $legacyGlobalState -Force }

    $existing = Get-Item $linkPath -Force
    [pscustomobject]@{
        RepoRoot = $repoRoot
        LinkPath = $existing.FullName
        LinkType = $existing.LinkType
        Targets = (@($existing.Target | ForEach-Object { $_.ToString() }) -join '; ')
        RegistryPath = $extensionsJsonPath
        RegistryId = $targetId
        LegacyVersionedLinksRemoved = $legacyRemoved
        DistEntryPresent = (Test-Path $distEntry)
        ReloadRequired = $true
    } | Format-List | Out-String | Write-Output

    if (-not (Test-Path $distEntry)) {
        Write-Warning "Built extension entrypoint is missing at '$distEntry'. Run the default Tiinex build task before restarting extensions."
    }
}

function Unlink-Checkout {
    $state = $null
    if (Test-Path $statePath) {
        $state = ConvertFrom-JsonCompat -RawJson (Get-Content -LiteralPath $statePath -Raw)
    }

    if (Test-Path $linkPath) {
        $existing = Get-Item $linkPath -Force
        $targets = @($existing.Target | ForEach-Object { $_.ToString() })
        if ($existing.LinkType -ne 'Junction' -or -not ($targets -contains $repoRoot)) {
            throw "Refusing to unlink '$linkPath' because it is not this checkout's junction."
        }
        Remove-Item -LiteralPath $linkPath -Force
    }

    $current = Remove-DevelopmentRegistryEntry
    $entries = @($current.Entries)
    if ($null -ne $state -and $state.PSObject.Properties.Match('previousRegistryEntries').Count -gt 0) {
        $entries += @($state.previousRegistryEntries)
    }
    Write-Registry -Registry $current.Registry -Entries $entries

    if (Test-Path $stateRoot) { Remove-Item -LiteralPath $stateRoot -Force -Recurse }
    if (Test-Path $legacyMarkerRoot) { Remove-Item -LiteralPath $legacyMarkerRoot -Force -Recurse }
    if (Test-Path $legacyGlobalState) { Remove-Item -LiteralPath $legacyGlobalState -Force }

    Write-Output "Unlinked $targetId from this checkout. Restart VS Code once to finish returning to the prior extension registry state."
}

if ($Unlink) { Unlink-Checkout } else { Link-Checkout }
