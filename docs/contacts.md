# Telegram Contacts Integration

## Overview

RADAR supports importing contacts from Telegram through a multi-level approach that respects user privacy while enabling efficient network building.

## Level 1: Search by @username

Search for Telegram users by their username and import their public profile data.

### Endpoint

```
POST /api/contacts/telegram/lookup
```

**Headers:**
- `Authorization: Bearer <jwt_token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "username": "ivanov"
}
```

**Response (found):**
```json
{
  "found": true,
  "alreadyAdded": false,
  "profile": {
    "telegramId": 123456789,
    "firstName": "Алексей",
    "lastName": "Иванов",
    "username": "ivanov",
    "bio": "CEO @ Startup | Building the future",
    "photoUrl": "https://api.telegram.org/file/bot.../photo.jpg",
    "isPremium": true,
    "languageCode": "ru"
  }
}
```

**Response (not found):**
```json
{
  "found": false,
  "suggestion": "Пользователь не найден или профиль приватный. Попросите контакт поделиться визиткой."
}
```

**Rate Limit:** 20 requests per minute per user.

### Data Retrieved

| Field | Source | Description |
|-------|--------|-------------|
| `telegramId` | Bot API | Unique Telegram user ID |
| `firstName` | Bot API | User's first name |
| `lastName` | Bot API | User's last name |
| `username` | Bot API | Telegram handle (without @) |
| `bio` | Bot API | User's bio/description |
| `photoUrl` | Bot API | Profile photo URL |
| `isPremium` | Bot API | Premium user badge |
| `languageCode` | Bot API | User's language setting |

## Level 2: Find friends in RADAR (Phone matching)

Find other RADAR users who have opted in to contact matching by their phone number.

### Flow

1. User grants permission via `Telegram.WebApp.requestContact()`
2. Client hashes phone: `SHA256(phone + server_salt)`
3. Client sends hash to server
4. Server returns list of matching RADAR users

### Endpoint

```
POST /api/contacts/telegram/match-by-phone
```

**Headers:**
- `Authorization: Bearer <jwt_token>`
- `Content-Type: application/json`

**Request Body:**
```json
{
  "phoneHash": "a1b2c3d4e5f6..."
}
```

**Response:**
```json
{
  "matches": [
    {
      "userId": 42,
      "name": "Мария Петрова",
      "username": "mariya_p",
      "avatarUrl": "https://..."
    }
  ]
}
```

**Rate Limit:** 10 requests per minute per user.

### Database Fields

```prisma
model User {
  phoneHash             String?  @unique
  allowContactMatching  Boolean @default(false)
}
```

- `phoneHash`: SHA256 hash of phone number with server salt
- `allowContactMatching`: User must explicitly opt-in to be findable

## Level 3: Business Card Exchange (QR/Link)

Exchanging digital business cards via QR codes or shareable links. See `docs/business-cards.md`.

## Caching

Profile data is cached to reduce Bot API calls:

- **Redis** (primary): 1 hour TTL
- **In-memory** (fallback): 1 hour TTL

Cache invalidation occurs automatically on TTL expiry.

## Security & Privacy

| Aspect | Implementation |
|--------|----------------|
| Profile access | Public data only via Bot API |
| Phone matching | Hash on client + salt on server |
| Opt-in | `allowContactMatching` flag required |
| Rate limiting | 20/min for lookup, 10/min for phone match |
| Logging | No personal data in logs |

## Architecture

```
┌─────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Client    │────▶│  Backend API     │────▶│  Bot API    │
│ (Telegram)  │     │                  │     │ (Telegram)  │
└─────────────┘     │ - Throttler      │     └─────────────┘
                    │ - Validation     │
                    │ - Cache          │
                    └────────┬─────────┘
                             │
                    ┌────────▼─────────┐
                    │   PostgreSQL     │
                    │ - Users          │
                    │ - Contacts       │
                    └──────────────────┘
```