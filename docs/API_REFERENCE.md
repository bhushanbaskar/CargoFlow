# CargoFlow - API Reference

## Endpoints Summary

- `GET /api/routes/search`: Search routes with origin, destination, and weight parameters.
- `POST /api/shipments/match`: Run deterministic matching algorithm against active scheduled trips.
- `POST /api/shipments/reserve`: Reserve cargo capacity on a scheduled bus trip.
- `PATCH /api/conductor/scan`: Process QR code scan for loading/delivering cargo.
- `GET /api/analytics/network`: Fetch network capacity metrics, revenue trends, and active trips.
