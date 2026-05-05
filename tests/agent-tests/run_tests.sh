#!/bin/bash
set -e

echo "🚀 RADAR Agent Tests - Android Device"

# 1. Check device
echo "📱 Checking device..."
if ! adb devices | grep -q "device$"; then
    echo "❌ No device connected"
    echo "💡 Connect Android phone via USB and enable USB debugging"
    exit 1
fi
echo "✅ Device found"

# 2. Check Appium
echo "🔍 Checking Appium..."
if ! curl -s http://localhost:4723/status > /dev/null 2>&1; then
    echo "⚠️ Appium not running. Start it:"
    echo "   appium --relaxed-security"
    exit 1
fi
echo "✅ Appium ready"

# 3. Clean reports
mkdir -p reports/screenshots
rm -f reports/report.html reports/report.json
rm -f reports/screenshots/*.png

# 4. Run tests
echo "🧪 Running tests..."
if [ "$1" = "--smoke" ]; then
    echo "→ Smoke tests only"
    pytest test_smoke.py -v
elif [ "$1" = "--single" ] && [ -n "$2" ]; then
    echo "→ Single test: $2"
    pytest "$2" -v
else
    echo "→ All tests"
    pytest .
fi

# 5. Results
echo ""
echo "📊 Results:"
if [ -f "reports/report.html" ]; then
    echo "✅ HTML report: reports/report.html"
fi

if [ -f "reports/report.json" ]; then
    PASSED=$(python3 -c "import json; d=json.load(open('reports/report.json')); print(d.get('summary',{}).get('passed',0))" 2>/dev/null || echo "?")
    FAILED=$(python3 -c "import json; d=json.load(open('reports/report.json')); print(d.get('summary',{}).get('failed',0))" 2>/dev/null || echo "?")
    echo "✅ Passed: $PASSED"
    echo "❌ Failed: $FAILED"
fi

echo ""
ls -la reports/screenshots/ 2>/dev/null && echo "📸 Screenshots saved"
