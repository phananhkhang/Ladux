[CmdletBinding()]
param(
    [string]$ProductionPath = '',
    [string]$DevelopmentPath = ''
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

$repoRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
if ([string]::IsNullOrWhiteSpace($ProductionPath)) {
    $ProductionPath = Join-Path $repoRoot '.env.production'
}
if ([string]::IsNullOrWhiteSpace($DevelopmentPath)) {
    $DevelopmentPath = Join-Path $repoRoot 'backend\.env'
}

function Read-EnvFile([string]$Path) {
    $values = @{}
    foreach ($line in Get-Content -LiteralPath $Path) {
        $trimmed = $line.Trim()
        if ($trimmed.Length -eq 0 -or $trimmed.StartsWith('#')) {
            continue
        }

        if ($trimmed -match '^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)=(.*)$') {
            $value = $matches[2].Trim()
            if ($value.Length -ge 2) {
                $first = $value.Substring(0, 1)
                $last = $value.Substring($value.Length - 1, 1)
                if (($first -eq '"' -and $last -eq '"') -or ($first -eq "'" -and $last -eq "'")) {
                    $value = $value.Substring(1, $value.Length - 2)
                }
            }
            $values[$matches[1]] = $value
        }
    }
    return $values
}

function Test-Placeholder([string]$Value) {
    return [string]::IsNullOrWhiteSpace($Value) -or $Value -match '^(CHANGE_ME|REPLACE_ME|YOUR_|your-|dummy$|test$)'
}

$requiredProductionKeys = @(
    'DB_USERNAME',
    'DB_PASSWORD',
    'JWT_SECRET',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'MAIL_USERNAME',
    'MAIL_PASSWORD',
    'VNPAY_TMN_CODE',
    'VNPAY_HASH_SECRET',
    'VNPAY_PAY_URL',
    'VNPAY_RETURN_URL',
    'VNPAY_REFUND_URL',
    'VNPAY_IPN_URL',
    'DEEPSEEK_API_KEY',
    'GOOGLE_GENAI_API_KEY',
    'APP_CORS_ALLOWED_ORIGINS',
    'OAUTH2_SUCCESS_REDIRECT',
    'OAUTH2_FAILURE_REDIRECT'
)

$secretKeys = @(
    'DB_PASSWORD',
    'JWT_SECRET',
    'GOOGLE_CLIENT_SECRET',
    'MAIL_PASSWORD',
    'VNPAY_HASH_SECRET',
    'DEEPSEEK_API_KEY',
    'GOOGLE_GENAI_API_KEY'
)

$errors = [System.Collections.Generic.List[string]]::new()
if (-not (Test-Path -LiteralPath $ProductionPath -PathType Leaf)) {
    $errors.Add("Missing production env file: $ProductionPath")
    $production = @{}
} else {
    $production = Read-EnvFile $ProductionPath
}

foreach ($key in $requiredProductionKeys) {
    if (-not $production.ContainsKey($key) -or [string]::IsNullOrWhiteSpace([string]$production[$key])) {
        $errors.Add("Missing or empty production variable: $key")
    } elseif (Test-Placeholder ([string]$production[$key])) {
        $errors.Add("Placeholder production variable: $key")
    }
}

if ($production.ContainsKey('SPRING_PROFILES_ACTIVE') -and $production['SPRING_PROFILES_ACTIVE'] -ne 'prod') {
    $errors.Add('SPRING_PROFILES_ACTIVE must be prod')
}

if ((Test-Path -LiteralPath $DevelopmentPath -PathType Leaf) -and $production.Count -gt 0) {
    $development = Read-EnvFile $DevelopmentPath
    foreach ($key in $secretKeys) {
        if ($development.ContainsKey($key) -and $production.ContainsKey($key) -and
            -not [string]::IsNullOrWhiteSpace([string]$development[$key]) -and
            $development[$key] -eq $production[$key]) {
            $errors.Add("Production reuses the development value for: $key")
        }
    }
}

$trackedProductionEnv = @(git -c core.excludesFile=NUL -C $repoRoot ls-files -- '.env.production')
if ($trackedProductionEnv.Count -gt 0) {
    $errors.Add('.env.production is tracked by Git')
}

git -c core.excludesFile=NUL -C $repoRoot check-ignore -q -- '.env.production' 2>$null
$ignoreExitCode = $LASTEXITCODE
if ($ignoreExitCode -ne 0) {
    $errors.Add('.env.production is not covered by .gitignore')
}

if ($errors.Count -gt 0) {
    Write-Output 'Production env validation failed:'
    foreach ($errorMessage in $errors) {
        Write-Output (" - " + $errorMessage)
    }
    exit 1
}

Write-Output 'Production env validation passed: required values are present, production profile is active, and no development secret is reused.'
