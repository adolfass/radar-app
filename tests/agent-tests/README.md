# Agent Tests for RADAR Telegram Mini App

## Overview
Automated testing on real Android device via USB, testing INSIDE Telegram app (not Chrome web version).

## Environment
- MacBook with USB-connected Android phone
- Telegram app with RADAR Mini App open
- Appium server for automation
- ADB for device communication

## Setup
```bash
cd tests/agent-tests
pip install -r requirements.txt
```

## Quick Start
```bash
# Check device connection
adb devices

# Start Appium server (in separate terminal)
appium --relaxed-security

# Run smoke tests
pytest test_smoke.py -v

# Run all tests with report
pytest --html=reports/report.html --json-report
```

## Test Structure
```
tests/agent-tests/
├── pages/              # Page Object Models
│   ├── base.py
│   ├── auth_page.py
│   ├── dashboard_page.py
│   ├── contacts_page.py
│   ├── profile_page.py
│   ├── events_page.py
│   ├── card_form_page.py
│   └── navigator_page.py
├── utils/
│   ├── telegram_helper.py
│   └── assertions.py
├── reports/            # Generated reports + screenshots
├── test-data-generator/ # Fake data for testing
├── conftest.py         # Pytest fixtures
├── pytest.ini          # Config
├── run_tests.sh        # Runner script
└── test_*.py           # Test cases
```

## Test Categories
| Marker | Description |
|--------|-------------|
| `smoke` | Critical path (open app, navigate, basic actions) |
| `auth` | Telegram login flow |
| `navigation` | Tab switching, deep links |
| `contacts` | Contact list, search, add, export |
| `profile` | Profile screen, settings, logout |
| `business-card` | Card creation, editing, sharing |
| `events` | Event registration/unregistration |
| `graph` | Network graph visualization |
| `premium` | Subscription flow, payments |

## Agent Workflow
1. Connect to VDS via SSH
2. Verify Android device connected: `adb devices`
3. Start Appium: `appium --relaxed-security`
4. Run tests: `./run_tests.sh`
5. Analyze failures from reports/screenshots
6. Fix selectors or report bugs
7. Re-run failed tests only
8. Push changes with agent-tests-* tags

## Data-testid Requirements
All interactive elements should have data-testid:

| Component | data-testid |
|-----------|-------------|
| Navigation bottom bar | `nav-dashboard`, `nav-contacts`, `nav-graph`, `nav-events`, `nav-profile` |
| Auth | `auth-init-data`, `auth-login-btn` |
| Profile | `profile-screen`, `profile-logout-btn`, `profile-cards-section` |
| Contacts | `contacts-screen`, `contacts-list`, `contacts-search`, `contacts-export-btn` |
| Events | `events-screen`, `events-list`, `events-register-btn`, `events-unregister-btn` |
| Cards | `cards-list`, `cards-add-btn`, `cards-edit-btn`, `cards-delete-btn` |
| Business Card Form | `card-form`, `card-form-submit`, `card-form-name`, `card-form-email` |
| Navigator | `navigator-screen`, `navigator-checklist`, `navigator-step-*` |

## Bug Reporting Format
When a test fails:
```
🐛 [BUG] Screen: Issue description
Steps: 1. Open app 2. Navigate to X 3. Click Y
Expected: Z
Actual: Error/Wrong behavior
Screenshot: reports/screenshots/test_name_timestamp.png
Severity: critical/high/medium/low
```
