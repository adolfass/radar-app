#!/bin/bash
# RADAR Mobile Test Script
# Usage: ./run_tests.sh

SCREENSHOTS_DIR="/Users/mac/project/radar-docs/tests/screenshots"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

echo "======================================"
echo "RADAR Mobile Testing Suite"
echo "======================================"
echo ""

# Check device connection
echo "[1/5] Checking device connection..."
adb devices | grep -q "device$" || { echo "ERROR: No device connected"; exit 1; }
echo "✓ Device connected"
echo ""

# Create screenshot with timestamp
take_screenshot() {
    local name="$1"
    local filepath="$SCREENSHOTS_DIR/${TIMESTAMP}_${name}.png"
    ~/Library/Android/sdk/platform-tools/adb exec-out screencap -p > "$filepath"
    echo "  ✓ Screenshot: ${TIMESTAMP}_${name}.png"
}

# Get screen state via UI dump
dump_ui() {
    ~/Library/Android/sdk/platform-tools/adb shell "uiautomator dump /sdcard/dump.xml" 2>/dev/null
    ~/Library/Android/sdk/platform-tools/adb pull /sdcard/dump.xml "$SCREENSHOTS_DIR/${TIMESTAMP}_ui_dump.xml" 2>/dev/null
    echo "  ✓ UI dump saved"
}

echo "[2/5] Taking Dashboard screenshot..."
take_screenshot "00_dashboard"
dump_ui
echo ""

echo "[3/5] Test scenarios (manual interaction required):"
echo "  1. Navigate to Profile → Referral Share"
echo "  2. Navigate to Profile → Business Card"
echo "  3. Navigate to Dashboard → Multi-View"
echo "  4. Navigate to QR Exchange"
echo ""
echo "  After navigation, press ENTER to take screenshot..."
read -r
echo ""

echo "[4/5] Taking current screen screenshot..."
take_screenshot "manual_test"
echo ""

echo "[5/5] Listing screenshots..."
echo ""
ls -la "$SCREENSHOTS_DIR"/${TIMESTAMP}_*.png 2>/dev/null || echo "No screenshots found"
echo ""

echo "======================================"
echo "Test session complete!"
echo "Screenshots saved to: $SCREENSHOTS_DIR"
echo "======================================"
