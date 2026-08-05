# CargoFlow Database Design & Specification

## Schema Comparison & Evolution

| Metric / Aspect | Provided Initial JSON Dataset | Proposed Production PostgreSQL Schema |
| :--- | :--- | :--- |
| **Route Stops** | String array (`intermediateStopIds`) | Normalized `route_stops` table with explicit sequence order (`stop_order`) |
| **Trip Telemetry** | Embedded JSON `currentLocation` | Normalized `scheduled_trips` + `trip_telemetry_logs` |
| **Shippers & Users** | Non-existent | `profiles` & `courier_companies` with strict RLS |
| **Cargo Management** | None | `shipments` & `shipment_reservations` with QR verification |
| **Financials** | None | `invoices` with automated tax & fare breakdown |

---

## Entity Relationship Diagram (ERD)

```
 [ divisions ] 1 ───< [ depots ] 1 ───< [ conductors ]
       │                    │                  │
       │                    ▼                  ▼
       └───────────< [ routes ] 1 ───< [ scheduled_trips ]
                         │                     │
                         ▼                     │
                  [ route_stops ]              │
                                               │
 [ courier_companies ] 1 ───< [ shipments ] 1 ─┴─< [ shipment_reservations ]
          │                          │
          ▼                          ▼
     [ profiles ]              [ invoices ]
```

---

## Detailed Table Overview

1. `divisions`: MSRTC administrative divisions (e.g., Nashik).
2. `depots`: Operational depots attached to divisions and primary stops.
3. `stops`: Physical bus stands/terminals with geographic coordinates (latitude, longitude).
4. `routes`: Route definitions connecting a source stop and a destination stop.
5. `route_stops`: Sequential stop sequence mapping for deterministic matching queries.
6. `buses`: Fleet inventory with vehicle types, registrations, and total cargo hold capacities.
7. `conductors`: Staff records linked to user profiles and assigned depots.
8. `courier_companies`: Registered logistics clients with credit limits and corporate profiles.
9. `profiles`: System users mapped to `auth.users` with strict role definitions (`SUPER_ADMIN`, `COURIER_PARTNER`, `CONDUCTOR`).
10. `scheduled_trips`: Daily/scheduled bus trips with available capacity counters and live GPS telemetry.
11. `shipments`: Courier waybills containing weight, dimensions, QR security hashes, and origin/destination.
12. `shipment_reservations`: Junction table assigning shipments to specific scheduled trips.
13. `invoices`: Automated billing statements with tax breakdown and payment status tracking.

---

## Row Level Security (RLS) Strategy
- **`profiles`**: Users can read their own profile; Super Admins can read/manage all profiles.
- **`shipments`**: Courier Partners can view and insert their own company's shipments. Conductors can view shipments reserved on their assigned trips. Super Admins can view all shipments.
- **`scheduled_trips` / `buses` / `routes` / `stops`**: Publicly queryable for route search and booking; editable only by Super Admins.
- **`invoices`**: Courier Partners can read their company's invoices. Super Admins can manage all invoices.
