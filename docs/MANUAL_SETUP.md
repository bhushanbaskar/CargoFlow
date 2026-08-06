# CargoFlow - Manual Setup & Operations Guide

This document contains step-by-step instructions for deploying, configuring, and operating CargoFlow with Supabase and Google AI Studio Cloud Run.

---

## 1. Supabase Project Setup
1. Log into [Supabase Console](https://database.new) and create a new project named `cargoflow-msrtc`.
2. Save your Database Password, API URL, `anon` key, and `service_role` key securely.
3. Enable PostgreSQL extensions: `uuid-ossp` and `pgcrypto`.

---

## 2. Environment Variables Configuration
Declare the following environment variables in your workspace:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL="https://your-supabase-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"

# Application URL
APP_URL="https://your-app-url.run.app"
```

---

## 3. Database Migration Execution
1. Navigate to your Supabase project SQL Editor.
2. Open and run `docs/schema.sql` to create all tables, indexes, triggers, and RLS policies.
3. Open and run `docs/seed.sql` to populate MSRTC Nashik division network data (50 stops, 10 depots, 25 routes, 30 buses, and 60 scheduled trips).

---

## 4. Initial User Roles Setup
Pre-created demo credentials for testing:
- **Super Admin (MSRTC Ops)**: `admin@msrtc.gov.in` / `CargoFlow2026!`
- **Courier Partner (BlueDart Logistics)**: `dispatch@bluedart.com` / `CargoFlow2026!`
- **Conductor (Nashik-Pune Route)**: `conductor.nashik@msrtc.gov.in` / `CargoFlow2026!`

---

## 5. Deployment Verification
1. Ensure `npm run build` passes cleanly without TypeScript or ESLint errors.
2. Launch dev server on port 3000.
