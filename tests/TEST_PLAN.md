# RADAR Mobile Testing Suite

## Test Scenarios

### 1. Profile - Referral Share (External Apps)
**Objective**: Verify referral link can be shared to external apps

**Steps**:
1. Open RADAR Mini App
2. Tap Profile avatar (top right)
3. Scroll to "Реферальная программа"
4. Tap "Поделиться"
5. Verify native share dialog opens
6. Verify can select external apps (WhatsApp, VK, SMS, etc.)

**Expected Result**: Native Android share sheet with multiple app options

**Status**: [ ] PASS / [ ] FAIL

---

### 2. Profile - One Business Card
**Objective**: Verify only one business card per user

**Steps**:
1. Open RADAR Mini App
2. Tap Profile avatar
3. Scroll to "Моя визитка"
4. If no card exists: Tap "Создать визитку" → Create one
5. If card exists: Note the card name
6. Navigate to "Создать визитку" from any menu
7. Attempt to create second card

**Expected Result**: Error message: "Вы можете иметь только одну визитку"

**Status**: [ ] PASS / [ ] FAIL

---

### 3. Profile - Business Card QR
**Objective**: Verify QR code display for business card

**Steps**:
1. Open RADAR Mini App
2. Tap Profile avatar
3. Scroll to "Моя визитка"
4. Tap "QR" button
5. Verify modal opens with QR code
6. Verify "Поделиться" button works

**Expected Result**: Modal with QR code and share option

**Status**: [ ] PASS / [ ] FAIL

---

### 4. Multi-View Network Analytics
**Objective**: Verify new visualization views work

**Steps**:
1. Open RADAR Mini App (Dashboard)
2. Scroll to "Анализ сети"
3. Tap "Показать"
4. Verify view switcher appears (🎯📊📅🌐)
5. Tap each view and verify it renders:
   - 🎯 Radar (concentric circles)
   - 📊 Matrix (4 quadrants)
   - 📅 Timeline (contact freshness)
   - 🌐 Sunburst (role hierarchy)

**Expected Result**: All 4 views render correctly

**Status**: [ ] PASS / [ ] FAIL

---

### 5. QR Exchange - Share
**Objective**: Verify QR sharing to external apps

**Steps**:
1. Navigate to QR Exchange (via bottom nav or dashboard)
2. Tap "Поделиться визиткой"
3. Verify can share to any app (Telegram, WhatsApp, etc.)

**Expected Result**: Universal share dialog opens

**Status**: [ ] PASS / [ ] FAIL

---

## Screenshots Required

| Test # | Screenshot Name | Description |
|--------|---------------|-------------|
| 1 | `01_profile_referral_share.png` | Referral share dialog |
| 2 | `02_profile_card_limit_error.png` | Error when creating second card |
| 3 | `03_profile_qr_modal.png` | QR code modal |
| 4 | `04_dashboard_view_radar.png` | Radar view |
| 4 | `05_dashboard_view_matrix.png` | Matrix view |
| 4 | `06_dashboard_view_timeline.png` | Timeline view |
| 4 | `07_dashboard_view_sunburst.png` | Sunburst view |
| 5 | `08_qr_exchange_share.png` | QR exchange share |

---

## Test Execution Date
**Date**: `date +"%Y-%m-%d %H:%M"`

**Tester**: _________________

**Device**: Xiaomi (Android)
