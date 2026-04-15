<div align="center">

# ZTic

**Multi-Tenant Event Ticketing SaaS — Built for India's University Ecosystem**

[![Node.js](https://img.shields.io/badge/Node.js-20.x-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_M0-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/atlas)
[![Redis](https://img.shields.io/badge/Upstash-Redis-DC382D?logo=redis&logoColor=white)](https://upstash.com)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.x-010101?logo=socket.io)](https://socket.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

<br/>

> A bootstrapped, zero-infrastructure-cost SaaS platform for managing ticketing across college tech fests, cultural events, and indie gatherings — with real-time seat locking, passwordless auth, and multi-tenant isolation baked in from day one.

<br/>

[Features](#-features) · [Architecture](#-architecture) · [Tech Stack](#-tech-stack) · [Getting Started](#-getting-started) · [API Reference](#-api-reference) · [Roadmap](#-roadmap) · [Contributing](#-contributing)

</div>

---

## Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Architecture](#-architecture)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Design System](#-design-system)
- [Security Model](#-security-model)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧭 Overview

ZTic started as a B2C movie/event ticket booking system and evolved into a **multi-tenant SaaS marketplace** purpose-built for the Indian university event circuit — IIT/NIT tech fests, cultural fests (Mood Indigo, Saarang, Cognizance), and indie gatherings.

The platform solves a real problem: most university fests and indie organizers resort to Google Forms + manual UPI transfers, with zero real-time seat visibility, no automated confirmation, and constant overselling. ZTic brings production-grade ticketing infrastructure to organizers who can't afford enterprise solutions.

**Core philosophy:** $0 infrastructure cost until traction is proven. Every architectural decision is optimized for free-tier viability without sacrificing correctness or scalability.

---

##  Features

### For Attendees
-  **Real-time seat selection** with live lock visualization across all connected clients
-  **Passwordless OTP auth** via SMS (Twilio), Email (Resend), and WhatsApp (Gupshup)
-  **Instant booking confirmation** with email receipts
-  **Mobile-first UI** built on a distinctive Zen-Brutalism design language

### For Organizers
-  **Self-serve onboarding** — create a tenant, configure events, go live in minutes
-  **Flexible seat mapping** — numbered seats, general admission, or hybrid layouts
-  **Live dashboard** — real-time bookings, revenue, and check-in metrics
-  **QR-based check-in** — scan-to-validate at the gate *(Phase 6)*
-  **Razorpay UPI integration** — direct settlement to organizer accounts *(Phase 5B)*

### Platform
-  **True multi-tenancy** — middleware-enforced data isolation, no cross-tenant leakage
-  **Distributed seat locking** — Redis SET NX + Lua atomic release prevents overselling across server instances
-  **JWT refresh token rotation** with reuse detection for compromised session invalidation
-  **Cross-instance pub/sub** via `@socket.io/redis-adapter` for horizontal scalability

---

##  Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        CLIENT (Vercel)                       │
│              Vite + React + GSAP ScrollTrigger               │
│                   Zen-Brutalism Design System                │
└──────────────────────────┬──────────────────────────────────┘
                           │ HTTPS / WSS
┌──────────────────────────▼──────────────────────────────────┐
│                    API SERVER (Render)                        │
│                  Node.js + Express + Socket.IO               │
│                                                              │
│  ┌────────────────┐   ┌─────────────────┐  ┌─────────────┐ │
│  │  Auth Layer    │   │  Tenant Layer   │  │  Seat Lock  │ │
│  │  OTP + JWT     │   │  Middleware +   │  │  Engine     │ │
│  │  Refresh Rot.  │   │  Query Inject   │  │  Redis NX   │ │
│  └────────────────┘   └─────────────────┘  └─────────────┘ │
└───────┬──────────────────────────────────────────┬──────────┘
        │                                          │
┌───────▼──────────┐                   ┌───────────▼──────────┐
│  MongoDB Atlas   │                   │   Upstash Redis       │
│  M0 Free Tier    │                   │   Serverless          │
│  Mongoose +      │                   │   SET NX Mutex +      │
│  Atomic Sessions │                   │   Lua Scripts         │
└──────────────────┘                   └───────────────────────┘
```

### Seat Locking Flow

```
Client selects seat
      │
      ▼
POST /api/seats/lock
      │
      ▼
Redis SET NX  ──── key exists? ──── YES ──▶ 409 Seat Already Locked
      │
     NO
      │
      ▼
Lock granted (TTL: 300s)
      │
      ▼
Socket.IO broadcast ──▶ All clients: seat marked as "locked"
      │
      ▼
Client completes payment
      │
      ▼
POST /api/bookings/confirm
      │
      ▼
Mongoose atomic session:
  - Create Booking document
  - Decrement seat inventory
  - Lua script: verify ownership + DELETE Redis key
      │
      ▼
Booking confirmed ──▶ Socket.IO: seat marked "booked"
```

### Multi-Tenant Isolation

Every request passes through `tenantMiddleware` which:
1. Extracts `tenantId` from the JWT payload
2. Attaches it to `req.tenant`
3. All Mongoose queries are injected with `{ tenantId: req.tenant._id }` via query helpers
4. No model is ever queried without tenant scoping — enforced at the middleware layer, not the route handler

---

##  Tech Stack

| Layer | Technology | Why |
|---|---|---|
| **Frontend** | Vite + React 18 | Fast HMR, tree-shaking, modern DX |
| **Animations** | GSAP ScrollTrigger | Production-grade scroll animations |
| **Backend** | Node.js + Express | Lightweight, composable middleware |
| **Real-time** | Socket.IO 4 | Reliable WebSocket with fallback |
| **Database** | MongoDB Atlas M0 | Flexible schema, free tier, Mongoose ODM |
| **Cache / Lock** | Upstash Serverless Redis | 10k cmd/day free, true serverless |
| **Auth** | JWT (access + refresh) | Stateless, rotation with reuse detection |
| **OTP — SMS** | Twilio | Reliable delivery across India |
| **OTP — Email** | Resend | Developer-first email API |
| **OTP — WhatsApp** | Gupshup | WhatsApp Business API, major in India |
| **Payments** | Razorpay UPI | India-first, UPI/cards/netbanking |
| **Pub/Sub** | @socket.io/redis-adapter | Cross-instance Socket.IO events |
| **Hosting — API** | Render | Native WebSocket support on free tier |
| **Hosting — Client** | Vercel | Edge CDN, instant deploys |

---

## 📁 Project Structure

```
ztic/
├── client/                          # Vite + React frontend
│   ├── public/
│   │   └── textures/                # Washi paper SVG texture
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/                  # Design system atoms
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── HankoStamp.jsx
│   │   │   │   └── TategakiText.jsx
│   │   │   ├── auth/
│   │   │   │   ├── OtpInput.jsx
│   │   │   │   └── ChannelSelector.jsx
│   │   │   ├── seats/
│   │   │   │   ├── SeatMap.jsx
│   │   │   │   └── SeatLegend.jsx
│   │   │   └── layout/
│   │   │       ├── Navbar.jsx
│   │   │       └── Footer.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Events.jsx
│   │   │   ├── EventDetail.jsx
│   │   │   ├── Booking.jsx
│   │   │   ├── Confirmation.jsx
│   │   │   ├── OrganizerOnboarding.jsx
│   │   │   ├── OrganizerDashboard.jsx
│   │   │   └── NotFound.jsx
│   │   ├── hooks/
│   │   │   ├── useSocket.js
│   │   │   ├── useAuth.js
│   │   │   └── useSeatLock.js
│   │   ├── store/                   # Context / Zustand slices
│   │   ├── utils/
│   │   │   └── api.js               # Axios instance with interceptors
│   │   ├── styles/
│   │   │   ├── tokens.css           # Design system CSS variables
│   │   │   └── global.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── vite.config.js               # Proxy to :5001 for dev
│   └── package.json
│
├── server/                          # Express + Socket.IO backend
│   ├── config/
│   │   ├── db.js                    # Mongoose Atlas connection
│   │   └── redis.js                 # Upstash IORedis client
│   ├── middleware/
│   │   ├── auth.js                  # JWT verify + attach req.user
│   │   ├── tenant.js                # Multi-tenant isolation
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Tenant.js
│   │   ├── Event.js
│   │   ├── Seat.js
│   │   ├── Booking.js
│   │   ├── OtpToken.js
│   │   └── RefreshToken.js
│   ├── routes/
│   │   ├── auth.js                  # OTP send/verify, refresh, logout
│   │   ├── tenants.js               # Onboarding, config
│   │   ├── events.js                # CRUD for organizers
│   │   ├── seats.js                 # Lock / release / status
│   │   ├── bookings.js              # Confirm, list, cancel
│   │   └── webhooks.js              # Razorpay webhook handler
│   ├── services/
│   │   ├── otpService.js            # Channel-agnostic OTP dispatch
│   │   ├── seatLockService.js       # Redis NX + Lua scripts
│   │   ├── paymentService.js        # Razorpay order + verify
│   │   └── emailService.js          # Resend confirmation
│   ├── socket/
│   │   ├── index.js                 # Socket.IO server init
│   │   └── seatHandlers.js          # lock / unlock / book events
│   ├── scripts/
│   │   └── lua/
│   │       └── releaseLock.lua      # Atomic ownership-verified release
│   ├── app.js
│   └── package.json
│
├── .env.example
├── .gitignore
└── README.md
```

---

##  Getting Started

### Prerequisites

- Node.js ≥ 20.x
- A free [MongoDB Atlas](https://www.mongodb.com/atlas) account (M0 cluster)
- A free [Upstash](https://upstash.com) account (Serverless Redis)
- [Twilio](https://www.twilio.com), [Resend](https://resend.com), and [Gupshup](https://www.gupshup.io) accounts for OTP channels

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/ztic.git
cd ztic
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### 3. Configure Environment Variables

```bash
cp .env.example server/.env
# Fill in all required values (see Environment Variables section below)
```

### 4. Run in Development

```bash
# Terminal 1 — Backend (port 5001)
cd server && npm run dev

# Terminal 2 — Frontend (port 5173, proxied to :5001)
cd client && npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

---

##  Environment Variables

Create `server/.env` from the template below:

```env
# Server
NODE_ENV=development
PORT=5001

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/ztic?retryWrites=true&w=majority

# Upstash Redis
UPSTASH_REDIS_REST_URL=https://xxxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token_here

# JWT
JWT_ACCESS_SECRET=your_strong_access_secret_here
JWT_REFRESH_SECRET=your_strong_refresh_secret_here
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

# OTP — Twilio SMS
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

# OTP — Resend Email
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx
RESEND_FROM_EMAIL=noreply@yourdomain.com

# OTP — Gupshup WhatsApp
GUPSHUP_API_KEY=your_gupshup_api_key
GUPSHUP_SOURCE_NUMBER=+91xxxxxxxxxx

# Razorpay (Phase 5B)
RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_razorpay_secret
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret

# Client URL (for CORS)
CLIENT_URL=http://localhost:5173
```

>  Never commit `.env` to version control. The `.gitignore` already excludes it.

---

##  API Reference

### Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/auth/otp/send` | Send OTP via `sms`, `email`, or `whatsapp` |
| `POST` | `/api/auth/otp/verify` | Verify OTP, receive access + refresh tokens |
| `POST` | `/api/auth/token/refresh` | Rotate refresh token, receive new access token |
| `POST` | `/api/auth/logout` | Invalidate refresh token |

### Tenants

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/tenants/onboard` | Create organizer tenant | 🔐 |
| `GET` | `/api/tenants/me` | Fetch current tenant profile | 🔐 |
| `PATCH` | `/api/tenants/me` | Update tenant settings | 🔐 |

### Events

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `GET` | `/api/events` | List all public events | — |
| `GET` | `/api/events/:id` | Get event + seat map | — |
| `POST` | `/api/events` | Create event (organizer) | 🔐 |
| `PATCH` | `/api/events/:id` | Update event | 🔐 |
| `DELETE` | `/api/events/:id` | Delete event | 🔐 |

### Seats

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/seats/lock` | Lock seat (Redis NX, TTL 300s) | 🔐 |
| `DELETE` | `/api/seats/lock/:seatId` | Release lock (Lua atomic) | 🔐 |
| `GET` | `/api/seats/status/:eventId` | Live seat availability snapshot | — |

### Bookings

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/api/bookings/confirm` | Confirm booking post-payment | 🔐 |
| `GET` | `/api/bookings/mine` | List user's bookings | 🔐 |
| `GET` | `/api/bookings/:id` | Get booking detail + QR | 🔐 |

### Webhooks

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/webhooks/razorpay` | Razorpay payment event handler |

---

##  Design System

ZTic uses a custom **Zen-Brutalism** design language — a deliberate collision of Japanese wabi-sabi aesthetics and raw brutalist UI principles.

| Token | Value | Usage |
|---|---|---|
| `--border-width` | `2px` | All interactive elements |
| `--shadow-offset` | `4px` | Hard offset box shadows |
| `--radius` | `0` | Zero border-radius throughout |
| `--color-ink` | `#0D0D0D` | Sumi black — primary text + borders |
| `--color-accent` | `#6B2737` | Urushi Burgundy — CTAs + highlights |
| `--color-paper` | `#F5F0E8` | Washi paper — primary background |
| `--color-muted` | `#8C7B6E` | Secondary text |

**Signature interactions:**
- Cursor-reactive hard shadows on hover (GSAP ticker)
- GSAP ScrollTrigger reveal animations on event cards
- `Tategaki` vertical text in section headers (CSS writing-mode)
- `Hanko` stamp badges for event status (sold out / live / upcoming)

---

##  Security Model

### JWT Strategy
- **Access token:** 15-minute TTL, signed with `JWT_ACCESS_SECRET`, carries `userId` + `tenantId` + `role`
- **Refresh token:** 7-day TTL, hashed with bcrypt and stored in `RefreshToken` collection
- **Reuse detection:** Each refresh token has a `family` field. If a previously consumed token is presented, the entire family is immediately revoked (compromise detection)

### OTP Security
- OTP codes are bcrypt-hashed before storage in `OtpToken` collection
- TTL index on `OtpToken.expiresAt` for automatic MongoDB cleanup
- Rate-limited at the route level — max 3 OTP requests per phone/email per 10 minutes

### Seat Lock Integrity
- Redis `SET NX PX` ensures only one client can hold a lock per seat
- Lock key stores `userId:tenantId` as value
- Release script is a Lua atomic: reads the key, verifies ownership, and deletes — all in a single Redis round-trip. Prevents accidental release of another user's lock.

### Multi-Tenant Isolation
- `tenantMiddleware` is mounted globally on all protected routes
- All Mongoose models expose `byTenant(tenantId)` query helpers
- No route handler can query across tenants — enforced at the middleware layer

---

## ☁️ Deployment

ZTic is designed to run entirely on free-tier infrastructure.

### Backend → Render

```bash
# Set all environment variables in Render dashboard
# Build command: npm install
# Start command: node app.js
# Ensure "WebSocket support" is enabled (Render supports this natively)
```

### Frontend → Vercel

```bash
# Root: ./client
# Build command: npm run build
# Output dir: dist
# Set VITE_API_URL to your Render backend URL
```

### Database → MongoDB Atlas M0

- Free forever, 512 MB storage
- Whitelist `0.0.0.0/0` for Render's dynamic IPs (or use Render's static outbound IPs)

### Cache → Upstash Redis

- 10,000 commands/day free tier
- Copy REST URL + token to server environment variables

> **Cost at launch:** $0/month across all services.

---

##  Roadmap

| Phase | Status | Description |
|---|---|---|
| Phase 1–3 | ✅ Complete | B2C foundations, design system, real-time seat selection |
| Phase 4 | ✅ Complete | Passwordless OTP auth, JWT rotation |
| Phase 5A | ✅ Complete | Multi-tenancy, distributed seat locking |
| **Phase 5B** | 🔄 In Progress | Razorpay UPI payment integration + webhook handler |
| Phase 5C | 📋 Planned | Booking confirmation email via Resend |
| Phase 6 | 📋 Planned | Organizer Portal, QR code check-in |
| Phase 7 | 📋 Planned | Production hardening + full free-tier deployment |

---

## 🤝 Contributing

ZTic is currently a solo bootstrapped project. Contributions, issue reports, and feature suggestions are welcome.

```bash
# Fork the repo
git clone https://github.com/<your-username>/ztic.git

# Create a feature branch
git checkout -b feat/your-feature-name

# Commit with conventional commits
git commit -m "feat: add organizer analytics endpoint"

# Push and open a PR
git push origin feat/your-feature-name
```

Please open an issue first for major changes to discuss scope and approach.

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">

Built with obsessive attention to detail by **Shashank** · [LinkedIn](https://linkedin.com/in/) · [Twitter / X](https://x.com/)

*Tickets for the chaos. Infrastructure for the organizers.*

</div>
