# Music Agent Booking Platform — Product Requirements Document

## Overview

A web-based booking and contract management platform for music booking agents. The agent manages a roster of 10-50 artists, tracking every show from initial inquiry through to confirmed contract. The system provides calendar views, rich booking records with full contractual detail, a status-driven workflow with automated triggers, and drag-and-drop date management.

**Tech stack:** Next.js (App Router), Supabase (Postgres + Realtime), Tailwind CSS, shadcn/ui
**Prototype note:** Auth is skipped for v1. Single-user agent tool.

---

## Users & Access

| Role | Access | Notes |
|------|--------|-------|
| **Agent** (primary) | Full app access | Single user for prototype, no login required |
| **Promoter** (external) | Shareable form links only | No account needed. Receives unique URLs to fill in deal memos (Phase 2) |
| **Artist** (external) | Email confirmations only | Receives offer sheets and confirms via email/link (Phase 3) |

---

## Phase 1 — MVP (Core Platform)

### 1.1 Artist Roster

**Description:** Manage a roster of artists the agent represents.

**Data model — `artists`:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid | PK |
| `name` | text | Required |
| `slug` | text | URL-friendly, unique |
| `genre` | text | Optional |
| `territory` | text | e.g. "Worldwide", "UK/EU" |
| `color` | text | Hex color for calendar display |
| `notes` | text | Free-form |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**Features:**
- CRUD for artists
- Artist list/grid view with search
- Each artist has a dedicated page at `/artists/[slug]` showing their calendar and bookings
- Color assignment for master calendar differentiation

---

### 1.2 Booking Records

**Description:** The core data unit. Each booking represents a single show/date for an artist. Contains all contractual and logistical information.

**Data model — `bookings`:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid | PK |
| `artist_id` | uuid | FK → artists |
| `status` | enum | See status workflow below |
| `status_locked` | boolean | Default false. Locked from `contracted` onwards |
| `date` | date | Show date |
| `day_of_week` | text | Auto-derived from date |
| `country` | text | |
| `city` | text | |
| `venue_name` | text | |
| `venue_capacity` | integer | Total venue capacity |
| `room` | text | Specific room/stage if multi-room venue |
| `room_capacity` | integer | Room/stage capacity |
| `currency` | text | e.g. GBP, EUR, USD |
| `fee` | decimal | Guaranteed fee amount |
| `deal_type` | enum | See deal types below |
| `deal_percentage` | decimal | For split/vs deals |
| `deal_versus` | boolean | Is it a "versus" deal (higher of fee or %) |
| `expenses` | decimal | Travel/accommodation allowance |
| `buyout` | decimal | Buyout amount if applicable |
| `add_ons` | text | Additional deal terms (free-form) |
| `billing` | text | e.g. "Headliner", "Support", "B2B" |
| `set_length` | integer | Minutes |
| `set_time` | time | Scheduled set time |
| `promoter_name` | text | |
| `promoter_email` | text | |
| `promoter_company` | text | |
| `previous_artists` | text | Who played this slot/venue before |
| `artists_booked` | text | Other artists on the bill |
| `tour_id` | uuid | FK → tours (nullable, for grouping) |
| `notes` | text | Free-form agent notes |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

**Deal types enum:**

| Value | Description |
|-------|-------------|
| `flat_fee` | Guaranteed flat fee |
| `door_split` | Percentage of door/ticket revenue |
| `versus` | Higher of guaranteed fee OR percentage |
| `plus` | Guaranteed fee PLUS percentage over threshold |
| `buyout` | All-inclusive buyout (fee + expenses) |
| `custom` | Free-form, details in `add_ons` |

---

### 1.3 Status Workflow

**Description:** Bookings progress through a defined status workflow. Each transition may trigger actions (automated triggers come in Phase 2+, but the statuses and manual transitions are Phase 1).

**Statuses (in order):**

| Status | Description | Color |
|--------|-------------|-------|
| `enquiry` | Initial lead / inbound enquiry | Gray |
| `hold` | Date held, not yet offered | Blue |
| `offered` | Offer sent to promoter | Yellow |
| `pending` | Awaiting promoter response | Orange |
| `confirmed` | Promoter confirmed, not yet contracted | Green |
| `contracted` | Contract signed and executed | Dark Green |
| `advanced` | Show advanced (logistics confirmed) | Purple |
| `settled` | Post-show, financials settled | Teal |
| `cancelled` | Cancelled at any stage | Red |
| `declined` | Offer declined | Dark Red |

**Rules:**
- Status can move forward or backward freely until `contracted`
- From `contracted` onwards, status is **locked by default**
- Locked statuses can be **unlocked** with an explicit action (unlock button + confirmation)
- Once unlocked, status can be changed, then re-locked
- `cancelled` and `declined` can be set from any status
- All status changes are logged in a `booking_status_log` table

**Data model — `booking_status_log`:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid | PK |
| `booking_id` | uuid | FK → bookings |
| `from_status` | text | Previous status |
| `to_status` | text | New status |
| `changed_at` | timestamptz | |
| `note` | text | Optional reason for change |

---

### 1.4 Calendar Views

**Description:** Two calendar views — a master view across all artists and per-artist views.

#### Master Calendar (`/calendar`)
- Monthly view (default), with week and day toggles
- Shows all bookings across all artists
- Each booking shown as a colored chip (artist color) with: artist name, city, venue, status indicator
- Click to open booking detail
- Filter by: artist, status, country
- Drag-and-drop to change dates

#### Artist Calendar (`/artists/[slug]`)
- Same calendar component, filtered to one artist
- Shows booking chips with: city, venue, status, fee
- Inline quick-add: click empty date to create new booking for that artist
- Drag-and-drop to change dates

---

### 1.5 Booking Management UI

**Description:** Full CRUD interface for bookings.

#### Booking Detail Panel / Page
- Side panel (slide-over) from calendar, or full page at `/bookings/[id]`
- All fields from the data model, organized in sections:
  - **Header:** Artist, Date, Status (with transition buttons)
  - **Venue:** Country, City, Venue, Capacity, Room, Room Capacity
  - **Deal:** Currency, Fee, Deal Type, Percentage, Versus, Expenses, Buyout, Add-ons
  - **Show:** Billing, Set Length, Set Time, Other Artists, Previous Artists
  - **Promoter:** Name, Email, Company
  - **Notes:** Free-form text area
  - **History:** Status change log (read-only)
- All fields are **manually editable at all times** (unless status-locked, in which case unlock first)
- Auto-save on field blur (debounced)

#### Booking Actions
- **Duplicate:** Copy booking to same artist (new date required)
- **Copy to artist:** Duplicate booking to a different artist's calendar
- **Delete:** Soft delete with confirmation
- **Lock/Unlock:** Toggle status lock

---

### 1.6 Drag, Drop & Bulk Operations

- **Drag to move:** Drag a booking chip on the calendar to change its date
- **Duplicate drag:** Hold Alt/Option + drag to duplicate a booking to a new date
- **Multi-select:** Shift+click to select multiple bookings for bulk operations
- **Bulk status change:** Change status of multiple selected bookings at once
- **Cut/Copy/Paste:** Standard keyboard shortcuts on selected bookings

---

### 1.7 Tours

**Description:** Group bookings into tours/runs for easier management.

**Data model — `tours`:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid | PK |
| `name` | text | e.g. "EU Summer 2026" |
| `artist_id` | uuid | FK → artists |
| `start_date` | date | |
| `end_date` | date | |
| `notes` | text | |
| `created_at` | timestamptz | |

**Features:**
- Create tours and associate bookings with them
- Tour view: see all dates in a tour as a list/timeline
- Bulk actions on tour bookings (change status, duplicate tour for another artist)

---

## Phase 2 — External Workflows & Automation

> These features build on Phase 1. Not in MVP but designed for in the data model.

### 2.1 Deal Memo Forms (Shareable Links)

- When a booking moves to `offered` status, agent can generate a **shareable link**
- Link opens a public form (no login) pre-populated with known details
- Promoter fills in remaining fields (venue details, technical info, billing, etc.)
- On submission, data flows back into the booking record
- Agent is notified of submission
- Agent reviews and can accept/edit the returned data

**Data model — `deal_memo_links`:**

| Field | Type | Notes |
|-------|------|-------|
| `id` | uuid | PK |
| `booking_id` | uuid | FK → bookings |
| `token` | text | Unique URL token |
| `status` | enum | `sent`, `viewed`, `submitted`, `expired` |
| `submitted_data` | jsonb | Promoter's responses |
| `created_at` | timestamptz | |
| `expires_at` | timestamptz | |

### 2.2 Automated Status Triggers

| Trigger (status change) | Action |
|--------------------------|--------|
| → `offered` | Option to generate deal memo link |
| Deal memo submitted | Notify agent, auto-populate booking fields |
| → `confirmed` | Generate offer sheet, email to artist for confirmation |
| Artist confirms | Email to artist + agent, status → `contracted` |
| → `contracted` | Auto-lock status, trigger logistics checklist |
| → `cancelled` | Notify all relevant parties |

### 2.3 Email Integration (Resend)

- Transactional emails via Resend API
- Templates for: deal memo request, offer sheet, confirmation, cancellation
- Email log stored per booking
- All emails include a link back to the relevant form/booking

---

## Phase 3 — Contract Generation & Logistics

> Future phase, noted here for architectural awareness.

### 3.1 Contract Generation
- Auto-generate contract PDF from booking data
- Template system for different contract types
- E-signature integration (DocuSign/HelloSign)

### 3.2 Offer Sheets
- Formatted offer summary sent to artists
- Single show or full tour run summaries
- Artist confirmation flow (confirm/decline with notes)

### 3.3 Logistics Module
- Post-contract logistics checklist (travel, accommodation, tech rider, etc.)
- Linked to booking, triggered on `contracted` status

---

## Technical Architecture

### Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| UI | Tailwind CSS + shadcn/ui |
| Calendar | Custom build on top of date-fns, or @dnd-kit for drag-drop |
| Database | Supabase (PostgreSQL) |
| ORM | Supabase JS client (direct) or Drizzle ORM |
| Email | Resend (Phase 2) |
| Deployment | Vercel |
| State | React Server Components + React Query for client state |

### Database Schema (Supabase)

```
artists
  ├── bookings (artist_id → artists.id)
  │     ├── booking_status_log (booking_id → bookings.id)
  │     └── deal_memo_links (booking_id → bookings.id)  [Phase 2]
  └── tours (artist_id → artists.id)
        └── bookings.tour_id → tours.id
```

### Key Pages / Routes

| Route | Description |
|-------|-------------|
| `/` | Dashboard — upcoming bookings, stats, quick actions |
| `/calendar` | Master calendar (all artists) |
| `/artists` | Artist roster list |
| `/artists/[slug]` | Artist detail + artist calendar |
| `/bookings/[id]` | Booking detail page |
| `/tours` | Tours list |
| `/tours/[id]` | Tour detail + dates |
| `/memo/[token]` | Public deal memo form (Phase 2) |

### Supabase Policies

For prototype (no auth): all tables have open read/write access via Supabase anon key. When auth is added later, RLS policies will restrict by agent user.

---

## UI/UX Principles

1. **Speed first** — The agent inputs dozens of bookings. Every interaction must be fast. Auto-save, keyboard shortcuts, minimal clicks.
2. **Information density** — Show as much data as possible in calendar/list views. Agents think in grids.
3. **Manual override always** — Every auto-populated or auto-triggered field can be manually overridden. The system suggests, the agent decides.
4. **Status is king** — The status workflow drives the entire application. Status should be visible everywhere and changeable quickly.
5. **Forgiving** — Everything is reversible. Deletes are soft. Locks are unlockable. Status can go backward.

---

## Phase 1 MVP — Issue Breakdown (Preview)

These will become individual GitHub issues:

1. **Project setup** — Next.js + Supabase + Tailwind + shadcn/ui scaffolding
2. **Database schema** — Supabase migrations for artists, bookings, tours, status log
3. **Artist CRUD** — Roster management pages
4. **Booking CRUD** — Full booking form with all fields, organized in sections
5. **Status workflow** — Status transitions, locking/unlocking, status log
6. **Master calendar view** — Monthly calendar with booking chips, filtering
7. **Artist calendar view** — Per-artist calendar with inline quick-add
8. **Drag and drop** — Move bookings, alt-drag to duplicate, multi-select
9. **Tour management** — Tour CRUD, associate bookings, tour view
10. **Dashboard** — Home page with upcoming dates, stats, quick actions
11. **Booking list view** — Tabular view of bookings with sort/filter (alternative to calendar)
12. **Search** — Global search across bookings, artists, venues

---

## Open Questions

1. **Venue database** — Should venues be a separate entity (reusable across bookings) or just text fields per booking? *Recommendation: separate `venues` table for Phase 2, plain text for MVP.*
2. **Multi-currency** — Display fees in original currency only, or also show converted amounts? *Recommendation: original currency only for MVP.*
3. **Financial reporting** — Any need for commission tracking, income summaries? *Recommendation: Phase 3.*
4. **Mobile** — Is mobile usage important or is this primarily desktop? *Recommendation: responsive design but optimize for desktop.*
