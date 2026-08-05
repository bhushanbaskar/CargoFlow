# CargoFlow - Quality Assurance & Testing Guide

## Key Test Suites

1. **Authentication & RBAC Enforcement**:
   - Verify Super Admin cannot create courier shipments.
   - Verify Courier Partner cannot alter bus schedules or depot routes.
   - Verify Conductors only see shipments assigned to their active trips.

2. **Deterministic Matching Engine Test**:
   - Query route Nashik (STP001) -> Pune (STP030).
   - Verify that buses operating RTE001 with > weight requirement and departure time in future are selected.
   - Verify rejected trips include detailed failure cause (e.g. "Insufficient capacity (needed 50kg, available 30kg)").

3. **Waybill & QR Code Workflow Test**:
   - Generate shipment -> State: `RESERVED`.
   - Conductor scans QR at origin depot -> State: `LOADED`. Capacity updated on trip.
   - Conductor scans QR at destination depot -> State: `DELIVERED`. Capacity restored.
