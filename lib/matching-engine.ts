import { Stop, Route, Bus, ScheduledTrip, MatchOption } from './types';
import PRECOMPUTED_ROUTES from './precomputed-routes.json';

/**
 * Calculates straight-line Haversine distance in kilometers between two lat/lng coordinates.
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c * 10) / 10;
}

/**
 * Reconstructs full ordered stops sequence for a route based on source, intermediates, and destination.
 */
export function getRouteStopsSequence(route: Route, allStops: Stop[]): Stop[] {
  const stopsMap = new Map(allStops.map(s => [s.id, s]));
  const sequence: Stop[] = [];

  const source = stopsMap.get(route.sourceStopId);
  if (source) sequence.push(source);

  for (const stopId of route.intermediateStopIds) {
    const s = stopsMap.get(stopId);
    if (s) sequence.push(s);
  }

  const dest = stopsMap.get(route.destinationStopId);
  if (dest) sequence.push(dest);

  return sequence;
}

/**
 * Checks if a route connects originStopId to destinationStopId in valid directional order.
 */
export function isRouteCompatible(
  route: Route,
  originStopId: string,
  destinationStopId: string,
  allStops: Stop[]
): { compatible: boolean; originIndex: number; destIndex: number; subSequence: Stop[] } {
  const fullSeq = getRouteStopsSequence(route, allStops);
  const originIndex = fullSeq.findIndex(s => s.id === originStopId);
  const destIndex = fullSeq.findIndex(s => s.id === destinationStopId);

  if (originIndex !== -1 && destIndex !== -1 && originIndex < destIndex) {
    return {
      compatible: true,
      originIndex,
      destIndex,
      subSequence: fullSeq.slice(originIndex, destIndex + 1)
    };
  }

  return { compatible: false, originIndex: -1, destIndex: -1, subSequence: [] };
}

/**
 * Deterministic Matching Engine
 * Matches courier shipment requests against active scheduled trips.
 */
export function findMatchingTrips(params: {
  originStopId: string;
  destinationStopId: string;
  weightKg: number;
  allTrips: ScheduledTrip[];
  allBuses: Bus[];
  allRoutes: Route[];
  allStops: Stop[];
}): MatchOption[] {
  const { originStopId, destinationStopId, weightKg, allTrips, allBuses, allRoutes, allStops } = params;

  const busesMap = new Map(allBuses.map(b => [b.id, b]));
  const routesMap = new Map(allRoutes.map(r => [r.id, r]));

  const matches: MatchOption[] = [];

  for (const trip of allTrips) {
    // 1. Skip if trip completed or cancelled
    if (trip.tripStatus === 'COMPLETED' || trip.tripStatus === 'CANCELLED') {
      continue;
    }

    const route = routesMap.get(trip.routeId);
    const bus = busesMap.get(trip.busId);
    if (!route || !bus) continue;

    // 2. Check Route Sequence Compatibility
    const routeMatch = isRouteCompatible(route, originStopId, destinationStopId, allStops);
    if (!routeMatch.compatible) continue;

    // 3. Check Capacity Requirement
    if (trip.availableCargoCapacityKg < weightKg) {
      continue;
    }

    // 4. Calculate Road Distance and Estimated Fare
    let tripDistanceKm = 0;
    const precomputed = (PRECOMPUTED_ROUTES as Record<string, any>)[route.id];
    if (precomputed && precomputed.distanceKm) {
      // Pro-rate distance according to subSequence fraction of total route stops
      const fullSeq = getRouteStopsSequence(route, allStops);
      const fraction = Math.max(0.2, (routeMatch.subSequence.length - 1) / Math.max(1, fullSeq.length - 1));
      tripDistanceKm = Math.round(precomputed.distanceKm * fraction * 10) / 10;
    } else {
      for (let i = 0; i < routeMatch.subSequence.length - 1; i++) {
        const s1 = routeMatch.subSequence[i];
        const s2 = routeMatch.subSequence[i + 1];
        // Apply realistic road curvature coefficient (~1.28x over straight-line)
        tripDistanceKm += Math.round(calculateDistanceKm(s1.latitude, s1.longitude, s2.latitude, s2.longitude) * 1.28 * 10) / 10;
      }
    }
    if (tripDistanceKm === 0) tripDistanceKm = 50;

    // Bus Type Base Rate per kg per km
    let ratePerKgKm = 0.15; // Ordinary
    if (bus.busType === 'Semi Luxury') ratePerKgKm = 0.20;
    if (bus.busType === 'Shivshahi') ratePerKgKm = 0.25;
    if (bus.busType === 'E-Shivai') ratePerKgKm = 0.22;

    const baseFare = Math.max(120, Math.round(weightKg * tripDistanceKm * ratePerKgKm));

    // 5. Calculate Score & Human Explanation
    const capacityFillRatio = (trip.totalCargoCapacityKg - trip.availableCargoCapacityKg) / trip.totalCargoCapacityKg;
    const isDirect = routeMatch.originIndex === 0 && routeMatch.destIndex === routeMatch.subSequence.length - 1;
    
    let score = 100;
    if (!isDirect) score -= 15;
    score += Math.round((trip.availableCargoCapacityKg - weightKg) * 0.5);

    const depMinutes = parseTimeToMinutes(trip.departureTime);
    const arrMinutes = parseTimeToMinutes(trip.arrivalTime);
    const durationHours = Math.max(1, Math.round(((arrMinutes - depMinutes + 1440) % 1440) / 60 * 10) / 10);

    const reasonParts: string[] = [];
    if (isDirect) reasonParts.push(`Direct schedule on ${route.name}`);
    else reasonParts.push(`En-route stop match (${routeMatch.subSequence.length} stops)`);

    reasonParts.push(`${Math.round(trip.availableCargoCapacityKg)}kg free capacity in ${bus.busType} hold`);
    reasonParts.push(`Departs ${trip.departureTime}`);

    matches.push({
      trip,
      bus,
      route,
      fareAmount: baseFare,
      compatibilityScore: Math.min(99, Math.max(60, score)),
      departureEtaMinutes: depMinutes,
      estimatedDeliveryHours: durationHours,
      pathStops: routeMatch.subSequence,
      reason: reasonParts.join(' • ')
    });
  }

  // Sort best matches by compatibility score descending, then departure time
  return matches.sort((a, b) => b.compatibilityScore - a.compatibilityScore);
}

function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}
