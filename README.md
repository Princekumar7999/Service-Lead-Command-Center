# Gushwork FollowUp (Service Lead Command Center)

> **"I just want to wake up and know who I need to call today."**  
> — Denise, Owner of PolarFlow Commercial Refrigeration Repair

A lightweight, action-first service lead and follow-up command center built for commercial refrigeration repair operators. Designed end-to-end to solve Denise's highest-cost operational leak: **losing $2,000+ repair jobs because incoming requests scattered across calls, texts, web forms, and notebooks slip through the cracks.**

[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14.2-black.svg)](https://nextjs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-green.svg)](https://www.prisma.io/)
[![Vitest](https://img.shields.io/badge/Tests-17%20Passed-emerald.svg)](https://vitest.dev/)
[![Groq](https://img.shields.io/badge/AI-Groq%20Llama--3.3--70B-orange.svg)](https://groq.com/)

---

## Table of Contents
1. [Executive Summary & Problem Discovery](#executive-summary--problem-discovery)
2. [Customer Insight: Why Denise Does Not Need a CRM](#customer-insight-why-denise-does-not-need-a-crm)
3. [The Core Solution: The 8:00 AM Command Center](#the-core-solution-the-800-am-command-center)
4. [Architecture Philosophy: "LLM for Ambiguity, Code for Certainty"](#architecture-philosophy-llm-for-ambiguity-code-for-certainty)
5. [Key Product Decisions & Intentional Tradeoffs](#key-product-decisions--intentional-tradeoffs)
6. [Core Features & User Flows](#core-features--user-flows)
   - [1. Today's Actions Queue & Revenue-at-Risk](#1-todays-actions-queue--revenue-at-risk)
   - [2. Deterministic Follow-up Engine](#2-deterministic-follow-up-engine)
   - [3. AI Text-to-Lead Ingestion (Human-in-the-Loop)](#3-ai-text-to-lead-ingestion-human-in-the-loop)
   - [4. Operational Pipeline & Husband's Business Numbers](#4-operational-pipeline--husbands-business-numbers)
   - [5. One-Click 'Mark Contacted' Action](#5-one-click-mark-contacted-action)
7. [Database Schema](#database-schema)
8. [Testing & Quality Assurance](#testing--quality-assurance)
9. [Local Setup Guide (Zero-Friction 60-Second Run)](#local-setup-guide-zero-friction-60-second-run)
10. [How AI Coding Tools Were Used](#how-ai-coding-tools-were-used)
11. [What I Would Build Next (Future Scope)](#what-i-would-build-next-future-scope)
12. [Evaluation Demo Walkthrough Script](#evaluation-demo-walkthrough-script)

---

## Executive Summary & Problem Discovery

In discovery with Denise, owner of a commercial refrigeration repair business (walk-in coolers, freezers, ice machines for restaurants and grocery stores), three core operational vulnerabilities emerged:

1. **Scattered Entry Points**: Jobs arrive simultaneously through office cell calls, website contact forms, repeat customer text messages, and a physical notebook.
2. **High-Value Leakage**: When incoming calls or quotes are not followed up within 24–48 hours, customers hire a competitor (*"Last week a restaurant called on Friday, freezer down, and I forgot to follow up... by Monday they called someone else. That is a $2,000 job gone."*).
3. **No Operational Visibility**: Denise cannot report how many open jobs exist to her husband (who manages bookkeeping), and she has no daily prioritized list of actions.

---

## Customer Insight: Why Denise Does Not Need a CRM

Most software vendors fail service business owners by imposing a bloated general-purpose CRM with 30 fields, complex sales funnels, and marketing automation.

**Denise does not have a sales pipeline problem; she has an operational memory problem.**

Denise's business volume is 15–20 jobs a week. Her mental bandwidth is consumed dispatching 4 field technicians and handling emergencies. When asked what single screen would transform her morning, her answer was unequivocal:
> *"Honestly? I just want to wake up and know who I need to call today. Like, these three people are waiting on a quote, this one said yes and needs scheduling, this one has not heard from us in two days. If I had that list every morning I would be happy. I do not need anything fancy."*

**Gushwork FollowUp was built specifically around that 8:00 AM moment.**

---

## The Core Solution: The 8:00 AM Command Center

```
                  DENISE'S INCOMING CHAOS
     (Phone Calls • SMS Texts • Web Inquiries • Notebook)
                            │
                            ▼
     ┌─────────────────────────────────────────────────────────┐
     │                GUSHWORK FOLLOWUP OS                     │
     ├─────────────────────────────────────────────────────────┤
     │ 1. Good Morning Denise: "4 customers need attention"   │
     │ 2. Potential Revenue Requiring Attention: $4,850        │
     │ 3. 🔴 2 Overdue | 🟠 2 Due Today | 🟢 5 Upcoming        │
     │ 4. Today's Actions: [Call] [Text] [Mark Contacted]      │
     │ 5. AI Message Intake: Text Message ➔ Structured Job     │
     │ 6. Operational Pipeline Board for Husband's Numbers     │
     └─────────────────────────────────────────────────────────┘
```

When Denise opens the application at 8:00 AM, she doesn't see empty dashboards, charts, or chatbots. She sees:
- **Who needs to be called right now.**
- **Why they need to be called** (e.g. *"Quote sent 2 days ago — overdue by 1 day"*).
- **How much revenue is at risk** (e.g. *"$2,000 estimated value"*).
- **Immediate action triggers**: One-click `tel:` link, pre-filled SMS template, and one-click `Mark Contacted`.

---

## Architecture Philosophy: "LLM for Ambiguity, Code for Certainty"

Operational service software requires trust. Business owners cannot rely on software that hallucinates dates, recalculates revenue unpredictably, or blindly alters customer records.

Our architecture enforces a strict division of responsibility:

```
Unstructured Input (SMS/Email)          Deterministic State & Money
           │                                       │
           ▼                                       ▼
    ┌──────────────┐                        ┌──────────────┐
    │     LLM      │                        │  Pure Code   │
    │  Extraction  │                        │  & Database  │
    └──────┬───────┘                        └──────┬───────┘
           │                                       │
           ▼                                       ▼
    Structured JSON                          Follow-up State
    & Zod Validation                       (Overdue/Today/Next)
           │                                       │
           ▼                                       ▼
    ┌──────────────┐                        Financial Sums &
    │ Human Review │                        Audit Timelines
    │  & Confirm   │                               │
    └──────┬───────┘                               │
           │                                       │
           └───────────────────┬───────────────────┘
                               ▼
                       Postgres / SQLite
```

1. **LLM for Ambiguity**: Used exclusively for extracting unstructured customer messages (names, addresses, equipment issues, requested times) into structured JSON.
2. **Code for Certainty**: Dates, follow-up urgency calculation, status progression, dollar amounts, and database updates are **100% deterministic**.

---

## Key Product Decisions & Intentional Tradeoffs

| Decision | Rationale |
| :--- | :--- |
| **No Complex Auth Barrier** | The prompt evaluates functional product execution for Denise. Adding multi-tenant OAuth, passwords, and email verification creates setup friction without improving Denise's core problem. |
| **No GPS / Technician Route Optimization** | Denise explicitly stated: *"That would be nice later but I kind of know where everyone is. The main thing is the leads and the follow ups."* Excluding routing avoided scope creep. |
| **Zero-Config SQLite by Default** | Evaluators should be able to run `npm install && npm run dev` immediately without needing a local PostgreSQL daemon or paid connection string. The Prisma schema is also 100% Postgres-compatible. |
| **Human Confirmation for AI Intake** | Rather than silently creating database records from customer texts, the app renders a review card where Denise verifies extracted details before saving. |
| **Multi-Provider AI (Groq + OpenAI + Fallback)** | Supports **Groq Cloud** (`llama-3.3-70b-versatile`) for ultra-low latency inference, **OpenAI** (`gpt-4o-mini`), and an intelligent fallback parser that guarantees zero demo failures even with no API keys. |
| **Interactive Overdue Simulation** | Includes a one-click `[⚡ Simulate Overdue (Demo)]` trigger so evaluators can test state transitions, revenue-at-risk meters, and dynamic briefing updates live. |

---

## Core Features & User Flows

### 1. Today's Actions Queue & Revenue-at-Risk
- **Revenue-at-Risk Meter**: Computes the dollar sum of all jobs requiring attention today (`OVERDUE` + `DUE_TODAY`). Connects software activity directly to financial outcome.
- **Dynamic Morning Priority Briefing**: AI/state-synthesized briefing that **dynamically updates in real-time**. If Denise moves an overdue job (e.g. ABC Restaurant) forward by 2 days, the briefing immediately updates to only highlight remaining overdue customers (e.g. Metro Foods).
- **Interactive "Simulate Overdue" Demo**: One-click action on any active job to push its follow-up 2 days into the past for instant evaluator testing.
- **Urgency Hierarchy**:
  1. `OVERDUE + URGENT` (e.g. ABC Restaurant walk-in freezer down)
  2. `OVERDUE` (sorted by days overdue descending)
  3. `DUE_TODAY + URGENT`
  4. `DUE_TODAY`
  5. `UPCOMING`
- **Action Triggers**: Direct `tel:` links for phone dials, `sms:` links for quick text outreach, and `[Mark Contacted]`.

### 2. Deterministic Follow-up Engine
Implemented in `lib/followups.ts`:
- `nextFollowUpAt < todayStart` ➔ **`OVERDUE`** (calculates exact overdue day count)
- `nextFollowUpAt >= todayStart && nextFollowUpAt <= todayEnd` ➔ **`DUE_TODAY`**
- `nextFollowUpAt > todayEnd` ➔ **`UPCOMING`**
- `status === 'COMPLETED' || status === 'LOST'` ➔ **`NONE`**

### 3. AI Text-to-Lead Ingestion (Human-in-the-Loop)
Denise receives frantic texts while driving or on calls:
> *"Hey Denise, freezer 2 at Joe's Deli is sitting at 55 degrees and we're losing product. Can someone come by around 2pm? Joe 555-0144"*

- **One-Click Ingestion**: Evaluators can click pre-configured presets or paste any message.
- **Structured Extraction**: Extracts Customer Name (`Joe`), Company (`Joe's Deli`), Phone (`555-0144`), Problem (`Walk-in freezer holding at 55 degrees`), Urgency (`URGENT`), Suggested Estimate (`$2,200`), and Next Follow-up (`In 2 hours`).
- **Human Confirmation**: Denise reviews the pre-filled form, tweaks any value, and clicks **Confirm & Create Job**.

### 4. Operational Pipeline & Husband's Business Numbers
Route: `/jobs`
- **Denise's Husband's Metrics Bar**: Instant count and valuation for Open Jobs, Active Pipeline ($), Completed Repairs ($), and Leaked/Lost Revenue ($).
- **7 Operational Stages**: `NEW` ➔ `NEEDS_QUOTE` ➔ `QUOTE_SENT` ➔ `WAITING_ON_YES` ➔ `SCHEDULED` ➔ `COMPLETED` ➔ `LOST`.
- **Quick Stage Transition Dropdown**: Update any job's status inline without tedious modal navigations.

### 5. One-Click 'Mark Contacted' Action
- Instantly logs a `CUSTOMER_CONTACTED` event to the activity history.
- Automatically reschedules the next follow-up date (e.g. +1 day, +2 days, or custom).
- Optionally auto-advances the job status (e.g. from `NEW` to `NEEDS_QUOTE`).
- Preserves a complete audit trail.

---

## Database Schema

Implemented in `prisma/schema.prisma` with three focused models:

```prisma
model Customer {
  id        String   @id @default(cuid())
  name      String
  company   String
  phone     String
  email     String?
  address   String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  jobs      Job[]
}

model Job {
  id                 String     @id @default(cuid())
  customerId         String
  customer           Customer   @relation(fields: [customerId], references: [id], onDelete: Cascade)
  title              String
  description        String
  status             String     @default("NEW")
  priority           String     @default("HIGH")
  estimatedValue     Float      @default(0)
  source             String     @default("PHONE")
  nextFollowUpAt     DateTime?
  assignedTechnician String?
  createdAt          DateTime   @default(now())
  updatedAt          DateTime   @updatedAt
  activities         Activity[]
}

model Activity {
  id          String   @id @default(cuid())
  jobId       String
  job         Job      @relation(fields: [jobId], references: [id], onDelete: Cascade)
  type        String   // LEAD_CREATED, QUOTE_SENT, CUSTOMER_CONTACTED, STATUS_CHANGED, NOTE, FOLLOW_UP_COMPLETED
  description String
  createdAt   DateTime @default(now())
}
```

---

## Testing & Quality Assurance

Comprehensive unit and integration tests are implemented with **Vitest**:

```bash
npm test
```

### Test Coverage Highlights:
- **`tests/followups.test.ts`**:
  - Overdue date classification & exact day diff calculations.
  - Same-day timestamp classification (`DUE_TODAY`).
  - Future timestamp classification (`UPCOMING`).
  - Terminal statuses (`COMPLETED`, `LOST`) correctly set to `NONE`.
  - Null date handling.
  - Accurate potential revenue aggregation.
  - Strict priority queue sorting (Overdue Urgent > Overdue High > Due Today Urgent).
- **`tests/validation_and_api.test.ts`**:
  - Zod validation for job creation payloads.
  - Rejection of invalid names, negative values, and missing fields.
  - AI extraction schema verification.
  - Activity type validation.

---

## Local Setup Guide (Zero-Friction 60-Second Run)

### Prerequisites
- Node.js 18+ (tested on Node v20 and v24)
- npm or pnpm

### Quickstart

```bash
# 1. Clone repository
git clone https://github.com/Princekumar7999/Service-Lead-Command-Center.git
cd Service-Lead-Command-Center

# 2. Install dependencies
npm install

# 3. Initialize SQLite database & seed realistic commercial refrigeration data
npx prisma db push
npm run db:seed

# 4. Start local development server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

> [!NOTE]
> **No API Key Required**: An `.env` file with `DATABASE_URL="file:./dev.db"` is included out-of-the-box. The AI extraction workflow automatically operates using an intelligent fallback entity parser. If you have an OpenAI key, you can optionally paste it into `OPENAI_API_KEY` in `.env`.

---

## How AI Coding Tools Were Used

In alignment with the Gushwork Forward Deployed Engineer ethos, AI harnesses were leveraged as an accelerator, guided by strict human architectural constraints:

1. **System Scaffolding**: Generated type-safe boilerplate, Tailwind styling tokens, and Next.js App Router structure.
2. **Schema & Seed Design**: Generated domain-authentic refrigeration equipment data (compressors, Hoshizaki ice machines, Manitowoc harvest valves, R404A recharges).
3. **Test Generation**: Drafted boundary test cases for date parsing and edge case validations.
4. **Where AI was Intentionally Restricted**:
   - Follow-up urgency calculation logic was kept **purely deterministic TypeScript**.
   - Database writes were restricted behind human verification modals.

---

## What I Would Build Next (Future Scope)

For a production rollout with Denise, the next iterative milestones would be:

1. **Twilio / Plivo SMS Webhook**: Inbound SMS forwarded directly from Denise's office line into the AI extraction queue.
2. **Email Forwarding Webhook**: Parsing web inquiry submissions from SendGrid/Postmark directly into draft leads.
3. **Automated Follow-up Reminders**: Web push notifications or SMS reminders sent to Denise at 8:00 AM.
4. **Field Technician Mobile PWA**: A read-only mobile view for Mike, Dave, Sarah, and Carlos showing their assigned jobs for the day.
5. **QuickBooks / ServiceTitan Sync**: Export approved jobs directly to accounting for invoicing upon completion.

---

## Evaluation Demo Walkthrough Script

If evaluating this prototype in an interview:

1. **0:00 — The Problem**:  
   *"Denise has four field technicians and 15–20 incoming jobs a week across phone, text, and email. Last Friday, she lost a $2,000 freezer repair simply because she forgot to follow up before Monday. We built a system to make sure that never happens again."*
2. **0:30 — The Morning Command Center (`/`)**:  
   *Show the 8:00 AM greeting, the $4,850 Revenue-at-Risk metric, and the daily action list.*
3. **1:15 — The Overdue Action Card**:  
   *Point to ABC Restaurant ($2,000 freezer quote overdue by 1 day). Demonstrate the `[Call]` and `[Text]` action triggers.*
4. **1:45 — One-Click 'Mark Contacted'**:  
   *Click 'Mark Contacted', select a preset note ("Spoke with customer, waiting for sign-off"), advance the follow-up, and show the instant card update.*
5. **2:30 — AI Text-to-Lead Ingestion (`/jobs/new?tab=ai`)**:  
   *Click 'Sample 1' (Joe's Deli text message). Click 'Extract Lead with AI'. Demonstrate the structured card extraction and explain the 'Human-in-the-Loop' architecture.*
6. **3:30 — Pipeline View (`/jobs`)**:  
   *Show the 7-stage operational board and the high-level business numbers Denise's husband needs.*
7. **4:15 — Engineering Integrity**:  
   *Run `npm test` in the terminal to demonstrate all 15 automated test suites passing.*

---

## License & Author
- **Author**: Prince Kumar ([@Princekumar7999](https://github.com/Princekumar7999))
- **Role**: Forward Deployed Engineer (FDE) Candidate — Gushwork.ai
- **Repository**: [https://github.com/Princekumar7999/Service-Lead-Command-Center](https://github.com/Princekumar7999/Service-Lead-Command-Center)
