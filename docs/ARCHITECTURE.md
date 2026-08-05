# CargoFlow Architecture & System Design

## Overview
CargoFlow is a SaaS platform operated by Maharashtra State Road Transport Corporation (MSRTC) that transforms unutilized passenger bus luggage hold capacity into an automated, schedule-driven cargo logistics network for courier partners and regional enterprise shippers.

---

## Core System Architecture

```
[ Courier Partner Platform ]      [ MSRTC Admin Console ]      [ Conductor Mobile Interface ]
          │                                 │                                │
          └─────────────────────────┬───────┴────────────────────────────────┘
                                    │
                                    ▼
                         [ Next.js 15 App Router ]
                     (Tailwind CSS v4 + Motion + Lucide)
                                    │
                      ┌─────────────┴─────────────┐
                      │  REST & Server Actions    │
                      │  Deterministic Matcher    │
                      └─────────────┬─────────────┘
                                    │
                                    ▼
                      [ Supabase PostgreSQL DB ]
              (RLS Policies, Triggers, Spatial Indexes)
```

---

## System Roles & Security Boundaries

1. **SUPER_ADMIN (MSRTC Operations Command)**
   - Operates fleet, depots, routes, conductors, and pricing rules.
   - Access to real-time telemetry, revenue analytics, and network capacity heatmaps.
   - *Forbidden*: Creating shipments directly as a courier.

2. **COURIER_PARTNER (Logistics Operators)**
   - Books cargo capacity on scheduled buses via deterministic matching engine.
   - Manages waybills, track-and-trace timelines, invoices, and payment histories.
   - *Forbidden*: Modifying bus schedules, depots, or conductor assignments.

3. **CONDUCTOR (En-Route Mobile Operations)**
   - Manages assigned trip cargo, scans QR waybills at origin/destination depots.
   - Marks cargo as `LOADED` / `DELIVERED`, reports exceptions or weight discrepancies.
   - *Forbidden*: Viewing full revenue analytics or network configuration.

---

## Technical Stack
- **Framework**: Next.js 15 (App Router, Server Actions, API Routes)
- **Styling & UI**: Tailwind CSS v4, Motion (framer-motion), Lucide Icons
- **Database & Auth**: Supabase PostgreSQL + Auth + RLS Security Policies
- **Map System**: Interactive custom vector maps with live trip simulation and bus marker interpolation
- **Matching Engine**: Deterministic route sequence compatibility, capacity checking, departure window verification
