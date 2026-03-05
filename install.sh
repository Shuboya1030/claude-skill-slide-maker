#!/usr/bin/env bash
#
# Slide Maker Skills Installer for macOS / Linux / Git Bash on Windows
# Installs Slide Maker skill commands and runtime to ~/.claude/
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLAUDE_DIR="$HOME/.claude"
COMMANDS_DIR="$CLAUDE_DIR/commands"
LIB_DIR="$CLAUDE_DIR/lib/slide-maker"

echo "==================================="
echo "  Slide Maker Skills Installer"
echo "==================================="
echo ""

# Create directories
echo "[1/4] Creating directories..."
mkdir -p "$COMMANDS_DIR"
mkdir -p "$LIB_DIR/exporters"
mkdir -p "$LIB_DIR/utils"
mkdir -p "$LIB_DIR/vendor"
mkdir -p "$LIB_DIR/templates/slide-shells"

# Copy command files
echo "[2/4] Installing skill commands..."
cp "$SCRIPT_DIR/commands/"*.md "$COMMANDS_DIR/"
echo "  Installed $(ls "$SCRIPT_DIR/commands/"*.md | wc -l | tr -d ' ') commands"

# Copy lib files
echo "[3/4] Installing runtime library..."
cp "$SCRIPT_DIR/lib/package.json" "$LIB_DIR/"
cp "$SCRIPT_DIR/lib/"*.js "$LIB_DIR/"
cp "$SCRIPT_DIR/lib/exporters/"*.js "$LIB_DIR/exporters/"
cp "$SCRIPT_DIR/lib/utils/"*.js "$LIB_DIR/utils/"
cp "$SCRIPT_DIR/lib/vendor/"*.js "$LIB_DIR/vendor/"

# Copy templates
cp "$SCRIPT_DIR/templates/storyline.md" "$LIB_DIR/templates/"
cp "$SCRIPT_DIR/templates/slide-shells/"*.html "$LIB_DIR/templates/slide-shells/"

# Install npm dependencies
echo "[4/4] Installing dependencies..."
cd "$LIB_DIR"
npm install --production 2>&1 | tail -3

echo ""
echo "==================================="
echo "  Installation complete!"
echo "==================================="
echo ""
echo "Commands installed to: $COMMANDS_DIR"
echo "Runtime installed to:  $LIB_DIR"
echo ""
echo "Usage: In Claude Code, type /slides to create a presentation."
echo ""
echo "Optional: Install Playwright for PPTX/PNG export:"
echo "  cd $LIB_DIR && npx playwright install chromium"
echo ""
