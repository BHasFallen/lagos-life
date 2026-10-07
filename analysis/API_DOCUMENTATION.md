# Lagos Life — Complete API Reference & Endpoint Catalogue

This document catalogs the 117 API endpoints reverse-engineered from the Lagos Life client bundles and verified against the live server.

---

## 1. Public & Core State Endpoints

### `GET /api/gov`
- **Description**: Returns the current term, elected Governor profile, active statewide policies, announcements, and election candidate roster.
- **Auth Required**: No.
- **Sample Response**:
  ```json
  {
    "term": { "id": "oct-2026", "ends": 1792000000000 },
    "governor": {
      "id": "usr_9918",
      "username": "Franka",
      "slogan": "Good roads, steady light, and equal opportunity for every Lagosian",
      "policy": "steady_light",
      "announcement": "Steady light is law this week"
    },
    "election": {
      "candidates": [ ...3081 candidates... ],
      "canRun": true,
      "canVote": true
    }
  }
  ```

### `GET /api/homes?map=1`
- **Description**: Returns all 400 player-owned residences across Lagos with map coordinates, areas, and occupant IDs.
- **Auth Required**: No.

### `GET /api/sea`
- **Description**: Returns all 595 active sponsored floating plots in the Lagos Lagoon, including billboard image coordinates, titles, and hyperlinks.
- **Auth Required**: No.

### `GET /api/ads`
- **Description**: Returns all 38 physical highway billboard slots, active sponsors, queue lists, and daily pricing.
- **Auth Required**: No.

### `GET /api/ads/:id/image` & `GET /api/sea/:id/image`
- **Description**: Delivers the JPG/PNG billboard texture artwork for terrestrial and marine billboard frames.
- **Auth Required**: No.

### `GET /api/daily`
- **Description**: Returns daily in-game weather, weekday, daily newspaper headline, and tips.
- **Sample**:
  ```json
  {
    "date": "2026-10-07",
    "weekday": "Wednesday",
    "weather": "Sunny with light clouds over Lekki",
    "headline": "Governor Franka pledges zero blackouts this week",
    "tip": "Save on fuel by cooking with gas instead of kerosene"
  }
  ```

### `GET /api/radio`
- **Description**: Returns directory of 40 real Nigerian streaming radio stations with frequencies, cities, and live audio stream URLs.
- **Auth Required**: No.

### `GET /api/music` & `GET /api/music/slots`
- **Description**: In-game radio broadcast schedule and current Afrobeats track playing across venues.
- **Audio Delivery**: Direct MP3 audio streamed from `/api/music/file/songs/:id/:hash.mp3`.

### `GET /api/forbes`
- **Description**: Returns the top 100 richest players in Lagos Life ranked by verified Net Worth.

---

## 2. Authentication & Profile Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/api/auth/mode` | GET | Checks active authentication mode and login gates |
| `/api/auth/me` | GET | Returns authenticated user profile and session expiration |
| `/api/auth/login` | POST | Authenticates via email, phone, or username |
| `/api/auth/register` | POST | Creates new character with chosen starting origin |
| `/api/auth/logout` | POST | Destroys active session cookie |
| `/api/auth/terms` | GET / POST | Retrieves or accepts terms of service |
| `/api/auth/verify` | POST | Verifies OTP / email code |
| `/api/auth/reset` | POST | Requests password reset link |

---

## 3. Gameplay & World Interaction Endpoints (Authenticated)

| Category | Endpoint | Method | Description |
| :--- | :--- | :--- | :--- |
| **Banking** | `/api/bank` | GET / POST | View account balance, deposit, withdraw, transfer |
| **Property**| `/api/property` | GET / POST | Commercial rental management, till cashout, tenant leases |
| **Property**| `/api/property?city=` | GET | Player and NPC real estate listings by city |
| **Crime**   | `/api/crime` | GET / POST | View robbery history, victims, attempt pickpocket/theft |
| **Bail**    | `/api/bail` | POST | Pay police bail to get out of holding cell |
| **Bail**    | `/api/bail?friends=1` | GET | List friends currently in police custody requiring bail |
| **Court**   | `/api/court` | GET / POST | File or contest legal claims, hire lawyers, review briefs |
| **Gambling**| `/api/casino` | GET / POST | Place bets on Eko Casino table games (Oba's table) |
| **Betting** | `/api/bet/instant` | POST | Instant Premier League betting at Viewing Centres |
| **Betting** | `/api/bet?day=` | GET | Historical viewing centre accumulator results |
| **Campus**  | `/api/campus` | GET / POST | UNILAG course registration, lecture attendance, exams |
| **Social**  | `/api/gist?feed=1` | GET | In-game social media feed (Gist - Twitter/X clone) |
| **Social**  | `/api/gist?post=` | GET / POST | View or publish microblog posts on Gist |
| **Housing** | `/api/homes/:id/knock` | POST | Knock on a player's house door to request entry |
| **Housing** | `/api/cohabit` | GET / POST | Invite or accept cohabitation requests from roommates |
| **Housing** | `/api/save/old-home` | GET | Retrieve grandfathered residences upon relocation |
| **Jobs**    | `/api/jobs` | GET / POST | Gig job board (decorating, errands), hiring, freelance escrow |
| **Business**| `/api/company` | GET / POST | Register CAC company, manage branches, withdraw profits |
| **Business**| `/api/company?top=1` | GET | Top companies leaderboard across Lagos and Abuja |
| **Aviation**| `/api/jets` | GET / POST | Private jet hangar, charters, luxury flight bookings |
| **Aviation**| `/api/flights` | GET / POST | Commercial flight departure board (Air Peace / Ibom Air) |
| **Nightlife**| `/api/spray` | POST | Throw Naira bills in the air at Quilox or parties |
| **Nightlife**| `/api/spray/pick` | POST | Pick up sprayed Naira bills from the dance floor |
| **Family**  | `/api/family` | GET / POST | Kinship network, siblings, partners, marriage proposals |
| **Politics**| `/api/politics` | GET | State ministries, executive cabinet, commissioner posts |
| **Politics**| `/api/gov/vote` | POST | Cast ballot in Governor / Senate election |
| **Politics**| `/api/gov/run` | POST | Register as an electoral candidate |
| **Politics**| `/api/gov/policy` | POST | (Governor only) Enact statewide policy decrees |
| **Chat**    | `/api/messages` | GET / POST | In-game direct messaging threads between players |
| **Chat**    | `/api/say` | POST | Speak aloud in current 3D room / venue |
| **Identity**| `/api/verified` | GET | Verified blue-check public figures registry |
| **Squads**  | `/api/squads` | GET / POST | Player gangs, social clubs, and neighborhood squads |
| **Ads**     | `/api/my-ads` | GET | Personal billboard advertisements active on highways |
| **Radio**   | `/api/music/slots` | GET / POST | Reserve on-air radio broadcast slots for music releases |

