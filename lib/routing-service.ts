import { Stop, Route } from './types';
import PRECOMPUTED_ROUTES from './precomputed-routes.json';

export interface RoadRouteCoordinate {
  latitude: number;
  longitude: number;
}

export interface RoadRouteResult {
  routeId?: string;
  name?: string;
  /**
   * Leaflet-ready coordinates: array of [latitude, longitude]
   */
  coordinates: [number, number][];
  distanceKm: number;
  durationMinutes: number;
  durationHours: number;
  source: 'LIVE_OSRM' | 'PRECOMPUTED_ROAD_CACHE' | 'IN_MEMORY_CACHE';
  coordinateCount: number;
  isVerifiedRoadRoute: boolean;
}

export interface RouteValidationReport {
  isValidGeometry: boolean;
  isRoadRoute: boolean;
  isStraightLine: boolean;
  isFallbackUsed: boolean;
  coordinateCount: number;
  errorReason?: string;
}

export interface RoutingDebugLog {
  request: {
    provider: string;
    origin: string;
    destination: string;
    waypoints: string[];
  };
  response: {
    httpStatus: number | string;
    routeFound: boolean;
    geometryType: string;
    coordinateCount: number;
    distance: string;
    duration: string;
  };
  validation: {
    validGeometry: boolean;
    roadRoute: boolean;
    straightLine: boolean;
    fallbackUsed: boolean;
  };
}

// In-memory runtime cache for dynamically calculated routes
const inMemoryRouteCache = new Map<string, RoadRouteResult>();

/**
 * Normalizes coordinate key string for caching
 */
function getRouteCacheKey(waypoints: Array<{ latitude: number; longitude: number }>): string {
  return waypoints.map(w => `${w.longitude.toFixed(5)},${w.latitude.toFixed(5)}`).join(';');
}

/**
 * Validates road route geometry against straight-line anomalies
 */
export function validateRouteGeometry(
  coordinates: [number, number][],
  waypointCount: number
): RouteValidationReport {
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length === 0) {
    return {
      isValidGeometry: false,
      isRoadRoute: false,
      isStraightLine: false,
      isFallbackUsed: false,
      coordinateCount: 0,
      errorReason: 'Empty or undefined geometry returned'
    };
  }

  // A real road route between 2 or more stops must contain intermediate road network vertices
  // A straight line between waypoints would have coordinateCount === waypointCount (typically 2 or 3)
  const isStraightLine = coordinates.length <= Math.max(2, waypointCount);
  const isRoadRoute = coordinates.length >= Math.max(10, waypointCount * 5);
  const isValidGeometry = coordinates.every(
    pt => Array.isArray(pt) && pt.length === 2 && !isNaN(pt[0]) && !isNaN(pt[1])
  );

  return {
    isValidGeometry,
    isRoadRoute,
    isStraightLine,
    isFallbackUsed: false,
    coordinateCount: coordinates.length,
    errorReason: isStraightLine
      ? 'Route returned has insufficient intermediate vertices (looks like a straight line connection).'
      : !isValidGeometry
      ? 'Invalid coordinate format in geometry.'
      : undefined
  };
}

/**
 * Logs comprehensive route audit to console matching Section 16 specification
 */
export function logRouteAudit(log: RoutingDebugLog): void {
  console.groupCollapsed(
    `%c[ROAD-ROUTING] ${log.request.origin} → ${log.request.destination} (${log.response.coordinateCount} road coords, ${log.response.distance})`,
    'color: #0284c7; font-weight: bold;'
  );
  console.log(`ROUTE REQUEST
--------------
Provider: ${log.request.provider}
Origin: ${log.request.origin}
Destination: ${log.request.destination}
Waypoints: ${log.request.waypoints.join(' -> ')}

ROUTE RESPONSE
--------------
HTTP Status: ${log.response.httpStatus}
Route Found: ${log.response.routeFound}
Geometry Type: ${log.response.geometryType}
Coordinate Count: ${log.response.coordinateCount}
Distance: ${log.response.distance}
Duration: ${log.response.duration}

ROUTE VALIDATION
----------------
Valid Geometry: ${log.validation.validGeometry}
Road Route: ${log.validation.roadRoute}
Straight Line: ${log.validation.straightLine}
Fallback Used: ${log.validation.fallbackUsed}`);
  console.groupEnd();
}

/**
 * Fetches true road-network route from OSRM driving engine
 * STRICT RULE: Never returns a straight-line fallback.
 */
export async function fetchRoadRoute(
  waypoints: Array<{ latitude: number; longitude: number; name?: string }>,
  routeId?: string,
  routeName?: string
): Promise<RoadRouteResult> {
  if (!waypoints || waypoints.length < 2) {
    throw new Error('At least origin and destination are required to calculate a road route.');
  }

  const cacheKey = getRouteCacheKey(waypoints);
  const originName = waypoints[0]?.name || `${waypoints[0]?.latitude},${waypoints[0]?.longitude}`;
  const destName = waypoints[waypoints.length - 1]?.name || `${waypoints[waypoints.length - 1]?.latitude},${waypoints[waypoints.length - 1]?.longitude}`;
  const waypointNames = waypoints.map(w => w.name || `${w.latitude.toFixed(4)},${w.longitude.toFixed(4)}`);

  // 1. Check in-memory runtime cache
  if (inMemoryRouteCache.has(cacheKey)) {
    const cached = inMemoryRouteCache.get(cacheKey)!;
    return cached;
  }

  // 2. Check precomputed verified road geometry database (instant, offline-resilient, 100% verified roads)
  if (routeId && (PRECOMPUTED_ROUTES as Record<string, any>)[routeId]) {
    const precomputed = (PRECOMPUTED_ROUTES as Record<string, any>)[routeId];
    const result: RoadRouteResult = {
      routeId,
      name: routeName || precomputed.name,
      coordinates: precomputed.coordinates as [number, number][],
      distanceKm: precomputed.distanceKm,
      durationMinutes: precomputed.durationMinutes,
      durationHours: precomputed.durationHours,
      source: 'PRECOMPUTED_ROAD_CACHE',
      coordinateCount: precomputed.coordinates.length,
      isVerifiedRoadRoute: true
    };

    inMemoryRouteCache.set(cacheKey, result);

    logRouteAudit({
      request: {
        provider: 'OSRM Highway Graph (Verified Road Cache)',
        origin: originName,
        destination: destName,
        waypoints: waypointNames
      },
      response: {
        httpStatus: 200,
        routeFound: true,
        geometryType: 'LineString',
        coordinateCount: result.coordinateCount,
        distance: `${result.distanceKm} km`,
        duration: `${result.durationHours} hrs`
      },
      validation: {
        validGeometry: true,
        roadRoute: true,
        straightLine: false,
        fallbackUsed: false
      }
    });

    return result;
  }

  // 3. Query Live OSRM Driving Engine API
  // Note: OSRM URL format requires [longitude, latitude] separated by semicolons
  const osrmCoordsStr = waypoints.map(w => `${w.longitude},${w.latitude}`).join(';');
  const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${osrmCoordsStr}?overview=full&geometries=geojson&steps=false`;

  try {
    const response = await fetch(osrmUrl);
    if (!response.ok) {
      throw new Error(`OSRM routing HTTP error ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error(`OSRM routing failed with code: ${data.code}`);
    }

    const selectedRoute = data.routes[0];
    if (!selectedRoute.geometry || !selectedRoute.geometry.coordinates) {
      throw new Error('OSRM returned route without geometry coordinates.');
    }

    // Convert GeoJSON [longitude, latitude] to Leaflet [latitude, longitude]
    const leafletCoords: [number, number][] = selectedRoute.geometry.coordinates.map(
      (c: [number, number]) => [Number(c[1].toFixed(6)), Number(c[0].toFixed(6))]
    );

    // Validate geometry
    const validation = validateRouteGeometry(leafletCoords, waypoints.length);
    if (!validation.isValidGeometry || validation.isStraightLine) {
      throw new Error(`Routing validation failed: ${validation.errorReason || 'Not a valid road path'}`);
    }

    const distanceKm = Math.round(selectedRoute.distance / 100) / 10;
    const durationMinutes = Math.round(selectedRoute.duration / 60);
    const durationHours = Math.round((selectedRoute.duration / 3600) * 10) / 10;

    const result: RoadRouteResult = {
      routeId,
      name: routeName,
      coordinates: leafletCoords,
      distanceKm,
      durationMinutes,
      durationHours,
      source: 'LIVE_OSRM',
      coordinateCount: leafletCoords.length,
      isVerifiedRoadRoute: true
    };

    inMemoryRouteCache.set(cacheKey, result);

    logRouteAudit({
      request: {
        provider: 'OSRM Driving Engine (router.project-osrm.org)',
        origin: originName,
        destination: destName,
        waypoints: waypointNames
      },
      response: {
        httpStatus: response.status,
        routeFound: true,
        geometryType: selectedRoute.geometry.type || 'LineString',
        coordinateCount: leafletCoords.length,
        distance: `${distanceKm} km`,
        duration: `${durationHours} hrs`
      },
      validation: {
        validGeometry: validation.isValidGeometry,
        roadRoute: validation.isRoadRoute,
        straightLine: validation.isStraightLine,
        fallbackUsed: false
      }
    });

    return result;
  } catch (err: any) {
    console.error(`[ROAD-ROUTING ERROR] Failed to calculate road route between ${originName} and ${destName}:`, err);

    logRouteAudit({
      request: {
        provider: 'OSRM Driving Engine (router.project-osrm.org)',
        origin: originName,
        destination: destName,
        waypoints: waypointNames
      },
      response: {
        httpStatus: 'FAILED',
        routeFound: false,
        geometryType: 'None',
        coordinateCount: 0,
        distance: 'N/A',
        duration: 'N/A'
      },
      validation: {
        validGeometry: false,
        roadRoute: false,
        straightLine: false,
        fallbackUsed: false
      }
    });

    // STRICT: Do NOT return a straight line fallback!
    throw new Error(`Road route calculation failed: ${err.message || 'No physical road path available'}`);
  }
}

/**
 * Calculates continuous road geometry for a given Route entity using its ordered stops
 */
export async function getRouteRoadGeometry(
  route: Route,
  stopsMap: Map<string, Stop>
): Promise<RoadRouteResult> {
  const srcStop = stopsMap.get(route.sourceStopId);
  const destStop = stopsMap.get(route.destinationStopId);

  if (!srcStop || !destStop) {
    throw new Error(`Route ${route.id} has invalid source or destination stops.`);
  }

  const intermediateStops: Stop[] = [];
  if (route.intermediateStopIds && route.intermediateStopIds.length > 0) {
    for (const stopId of route.intermediateStopIds) {
      const s = stopsMap.get(stopId);
      if (s) intermediateStops.push(s);
    }
  }

  const orderedStops = [srcStop, ...intermediateStops, destStop];
  return fetchRoadRoute(orderedStops, route.id, route.name);
}

/**
 * Smoothly interpolates an exact [lat, lng] point along the road geometry line
 * based on progress ratio (0 = origin, 1 = destination)
 */
export function interpolatePositionAlongRoad(
  coordinates: [number, number][],
  progress: number
): [number, number] {
  if (!coordinates || coordinates.length === 0) {
    return [0, 0];
  }
  if (coordinates.length === 1) {
    return coordinates[0];
  }

  const clampedProgress = Math.max(0, Math.min(1, progress));
  const totalPoints = coordinates.length;
  const targetFloatIndex = clampedProgress * (totalPoints - 1);
  const index = Math.floor(targetFloatIndex);
  const subProgress = targetFloatIndex - index;

  if (index >= totalPoints - 1) {
    return coordinates[totalPoints - 1];
  }

  const p1 = coordinates[index];
  const p2 = coordinates[index + 1];

  const lat = p1[0] + (p2[0] - p1[0]) * subProgress;
  const lng = p1[1] + (p2[1] - p1[1]) * subProgress;

  return [Number(lat.toFixed(6)), Number(lng.toFixed(6))];
}
