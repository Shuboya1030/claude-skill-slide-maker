#
# Slide Maker Skills Installer for Windows PowerShell
# Installs Slide Maker skill commands and runtime to ~/.claude/
#

$ErrorActionPreference = "Stop"

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ClaudeDir = Join-Path $env:USERPROFILE ".claude"
$CommandsDir = Join-Path $ClaudeDir "commands"
$LibDir = Join-Path $ClaudeDir "lib\slide-maker"

Write-Host "===================================" -ForegroundColor Cyan
Write-Host "  Slide Maker Skills Installer" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Create directories
Write-Host "[1/4] Creating directories..."
$dirs = @(
    $CommandsDir,
    (Join-Path $LibDir "exporters"),
    (Join-Path $LibDir "utils"),
    (Join-Path $LibDir "vendor"),
    (Join-Path $LibDir "templates\slide-shells")
)
foreach ($dir in $dirs) {
    New-Item -ItemType Directory -Path $dir -Force | Out-Null
}

# Copy command files
Write-Host "[2/4] Installing skill commands..."
$cmdFiles = Get-ChildItem -Path (Join-Path $ScriptDir "commands") -Filter "*.md"
foreach ($file in $cmdFiles) {
    Copy-Item $file.FullName -Destination $CommandsDir -Force
}
Write-Host "  Installed $($cmdFiles.Count) commands"

# Copy lib files
Write-Host "[3/4] Installing runtime library..."
Copy-Item (Join-Path $ScriptDir "lib\package.json") -Destination $LibDir -Force
Get-ChildItem -Path (Join-Path $ScriptDir "lib") -Filter "*.js" | ForEach-Object {
    Copy-Item $_.FullName -Destination $LibDir -Force
}
Get-ChildItem -Path (Join-Path $ScriptDir "lib\exporters") -Filter "*.js" | ForEach-Object {
    Copy-Item $_.FullName -Destination (Join-Path $LibDir "exporters") -Force
}
Get-ChildItem -Path (Join-Path $ScriptDir "lib\utils") -Filter "*.js" | ForEach-Object {
    Copy-Item $_.FullName -Destination (Join-Path $LibDir "utils") -Force
}
Get-ChildItem -Path (Join-Path $ScriptDir "lib\vendor") -Filter "*.js" | ForEach-Object {
    Copy-Item $_.FullName -Destination (Join-Path $LibDir "vendor") -Force
}

# Copy templates
Copy-Item (Join-Path $ScriptDir "templates\storyline.md") -Destination (Join-Path $LibDir "templates") -Force
Get-ChildItem -Path (Join-Path $ScriptDir "templates\slide-shells") -Filter "*.html" | ForEach-Object {
    Copy-Item $_.FullName -Destination (Join-Path $LibDir "templates\slide-shells") -Force
}

# Install npm dependencies
Write-Host "[4/4] Installing dependencies..."
Push-Location $LibDir
try {
    npm install --production 2>&1 | Select-Object -Last 3
} finally {
    Pop-Location
}

Write-Host ""
Write-Host "===================================" -ForegroundColor Green
Write-Host "  Installation complete!" -ForegroundColor Green
Write-Host "===================================" -ForegroundColor Green
Write-Host ""
Write-Host "Commands installed to: $CommandsDir"
Write-Host "Runtime installed to:  $LibDir"
Write-Host ""
Write-Host "Usage: In Claude Code, type /slides to create a presentation."
Write-Host ""
Write-Host "Optional: Install Playwright for PPTX/PNG export:"
Write-Host "  cd $LibDir; npx playwright install chromium"
Write-Host ""
