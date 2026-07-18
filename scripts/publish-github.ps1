param(
  [Parameter(Mandatory = $true)]
  [string]$Token,

  [string]$RepoName = "village-gallery-kapoorpur",
  [string]$Description = "Hindi-first PWA village memory gallery for Kapoorpur.",
  [switch]$Private
)

$ErrorActionPreference = "Stop"

function Invoke-GitHubJson {
  param(
    [Parameter(Mandatory = $true)][string]$Method,
    [Parameter(Mandatory = $true)][string]$Uri,
    [object]$Body = $null
  )

  $headers = @{
    Authorization          = "Bearer $Token"
    Accept                 = "application/vnd.github+json"
    "X-GitHub-Api-Version" = "2022-11-28"
  }

  $params = @{
    Method  = $Method
    Uri     = $Uri
    Headers = $headers
  }

  if ($null -ne $Body) {
    $params.Body = ($Body | ConvertTo-Json -Depth 10)
    $params.ContentType = "application/json"
  }

  Invoke-RestMethod @params
}

function Get-GitCommand {
  $gitCommand = Get-Command git -ErrorAction SilentlyContinue
  if ($gitCommand) {
    return $gitCommand.Source
  }

  $bundledGit = "C:\Users\singh\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\git\cmd\git.exe"
  if (Test-Path $bundledGit) {
    return $bundledGit
  }

  throw "Git was not found. Install Git or run from the Codex workspace runtime."
}

$script:GitExe = Get-GitCommand

function Invoke-Git {
  param([Parameter(ValueFromRemainingArguments = $true)][string[]]$Args)
  & $script:GitExe @Args
  if ($LASTEXITCODE -ne 0) {
    throw "Git command failed: git $($Args -join ' ')"
  }
}

$user = Invoke-GitHubJson -Method GET -Uri "https://api.github.com/user"
$owner = $user.login

try {
  $repo = Invoke-GitHubJson -Method GET -Uri "https://api.github.com/repos/$owner/$RepoName"
  Write-Host "Using existing GitHub repository: $($repo.full_name)"
} catch {
  $repo = Invoke-GitHubJson -Method POST -Uri "https://api.github.com/user/repos" -Body @{
    name        = $RepoName
    description = $Description
    private     = [bool]$Private
    auto_init   = $false
  }
  Write-Host "Created GitHub repository: $($repo.full_name)"
}

$remoteUrl = "https://x-access-token:$Token@github.com/$owner/$RepoName.git"
$safeUrl = "https://github.com/$owner/$RepoName.git"

$existingRemote = ""
try {
  $existingRemote = (& $script:GitExe remote get-url origin 2>$null)
} catch {
  $existingRemote = ""
}

try {
  if ([string]::IsNullOrWhiteSpace($existingRemote)) {
    Invoke-Git remote add origin $remoteUrl
  } else {
    Invoke-Git remote set-url origin $remoteUrl
  }

  Invoke-Git push -u origin main
} finally {
  try {
    Invoke-Git remote set-url origin $safeUrl
  } catch {
    Write-Host "Could not reset the Git remote URL automatically."
  }
}

try {
  Invoke-GitHubJson -Method POST -Uri "https://api.github.com/repos/$owner/$RepoName/pages" -Body @{
    build_type = "workflow"
  } | Out-Null
  Write-Host "Enabled GitHub Pages with GitHub Actions."
} catch {
  Write-Host "GitHub Pages may already be enabled or may need one manual click in repository Settings."
}

Write-Host "Repository: https://github.com/$owner/$RepoName"
Write-Host "Pages URL will appear after the GitHub Actions deployment finishes."
