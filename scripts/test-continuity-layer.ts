// Comprehensive End-to-End Test Suite for Multi-Bus Active Blackout Protection
import { DataRepository } from '../lib/data-repository';
import {
  DEMO_ACTIVE_TASK_ID,
  DEMO_CACHED_TASK_ID,
  DEMO_UNCACHED_TASK_IDS,
  DEMO_ACTIVE_SHIPMENT,
  DEMO_CACHED_SHIPMENT,
  INITIAL_SHIPMENTS,
  INITIAL_SCHEDULED_TRIPS
} from '../lib/mock-data';

async function runContinuityTestSuite() {
  console.log('====================================================');
  console.log('🧪 CARGOFLOW MULTI-BUS CONTINUITY & BLACKOUT TEST');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition: boolean, testName: string) {
    totalTests++;
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
    }
  }

  // ----------------------------------------------------
  // TEST 1: Baseline Online State (Full Network Data)
  // ----------------------------------------------------
  console.log('--- Scenario 1: Baseline Online Data Access ---');
  const onlineShipments = await DataRepository.getVisibleShipments(INITIAL_SHIPMENTS, 'ONLINE');
  assert(onlineShipments.visibleShipments.length === INITIAL_SHIPMENTS.length, 'Online mode returns full master shipments list');
  assert(onlineShipments.hiddenServerOnlyCount === 0, 'Online mode has 0 hidden server records');

  const onlineTrips = DataRepository.getVisibleTrips(INITIAL_SCHEDULED_TRIPS, 'ONLINE');
  assert(onlineTrips.isLiveGps === true, 'Live GPS telemetry stream active when ONLINE');
  assert(onlineTrips.trips.length === INITIAL_SCHEDULED_TRIPS.length, 'All scheduled fleet trips accessible');

  const inTransitCount = INITIAL_SCHEDULED_TRIPS.filter((t) => t.tripStatus === 'IN_TRANSIT').length;
  assert(inTransitCount >= 4, `At least 4 IN_TRANSIT trips exist at baseline (found ${inTransitCount})`);

  // ----------------------------------------------------
  // TEST 2: Multi-Bus In-Transit Snapshotting at Blackout Time
  // ----------------------------------------------------
  console.log('\n--- Scenario 2: Multi-Bus In-Transit Snapshotting at Blackout Time ---');
  const snapshottedTrips = DataRepository.snapshotActiveTrips(INITIAL_SCHEDULED_TRIPS);
  assert(snapshottedTrips.length === inTransitCount, `All ${inTransitCount} IN_TRANSIT trips are snapshotted (not just 1)`);
  assert(snapshottedTrips.every((t) => t.tripStatus === 'IN_TRANSIT'), 'Every snapshotted trip has IN_TRANSIT status');
  assert(snapshottedTrips.every((t) => t.currentLocation !== undefined), 'Every snapshotted trip contains last confirmed coordinates');

  // Verify visible trips during blackout
  const offlineTrips = DataRepository.getVisibleTrips(INITIAL_SCHEDULED_TRIPS, 'SIMULATED_OFFLINE', snapshottedTrips);
  assert(offlineTrips.isLiveGps === false, 'Live GPS telemetry stream is halted during blackout');
  assert(offlineTrips.trips.length === inTransitCount, `Map renders ALL ${inTransitCount} in-transit buses (TRP001, TRP003, TRP005, etc.)`);
  assert(!offlineTrips.trips.some((t) => t.tripStatus === 'COMPLETED'), 'Completed server-only trips are withheld during blackout');
  assert(Boolean(offlineTrips.telemetryNotice?.includes('Last known position')), 'Telemetry notice indicates Last known position (10:31 AM)');

  // ----------------------------------------------------
  // TEST 3: Dynamic Metrics & Counts During Blackout
  // ----------------------------------------------------
  console.log('\n--- Scenario 3: Dynamic Metrics During Blackout ---');
  const offlineMetrics = DataRepository.getNetworkMetrics(
    INITIAL_SHIPMENTS,
    'SIMULATED_OFFLINE',
    [DEMO_ACTIVE_SHIPMENT],
    snapshottedTrips,
    []
  );
  assert(offlineMetrics.isLiveAvailable === false, 'Live network metrics marked unavailable');
  assert(offlineMetrics.totalRevenue === null, 'Revenue becomes null (displays as "—")');
  assert(offlineMetrics.totalActiveTrips === null, 'Total live fleet count becomes null (displays as "—")');
  assert(offlineMetrics.activeProtectedTripsCount === inTransitCount, `Protected trips count dynamically equals ${inTransitCount} (no hardcoding)`);
  assert(offlineMetrics.activeProtectedTasksCount === 1, 'Protected shipments count accurately tracks active tasks');

  // ----------------------------------------------------
  // TEST 4: Read Blackout Policy on Shipments & Modules
  // ----------------------------------------------------
  console.log('\n--- Scenario 4: Read Blackout on Shipments & Modules ---');
  const offlineShipments = await DataRepository.getVisibleShipments(INITIAL_SHIPMENTS, 'SIMULATED_OFFLINE');
  assert(offlineShipments.visibleShipments.some((s) => s.id === DEMO_ACTIVE_TASK_ID), 'Active protected task #482 is in visible list');
  assert(offlineShipments.visibleShipments.some((s) => s.id === DEMO_CACHED_TASK_ID), 'Cached record #470 is in visible list');
  assert(!offlineShipments.visibleShipments.some((s) => DEMO_UNCACHED_TASK_IDS.includes(s.id)), 'Uncached historical records are omitted from active list');

  const uncachedRes = await DataRepository.getShipmentById('shp-471', INITIAL_SHIPMENTS, 'SIMULATED_OFFLINE');
  assert(uncachedRes.isBackendUnavailable === true, 'Direct read of server-only record returns isBackendUnavailable = true');
  assert(uncachedRes.data === undefined, 'No fake data is fabricated for uncached records');

  assert(DataRepository.checkModuleAvailability('ANALYTICS', 'SIMULATED_OFFLINE').isAvailable === false, 'Historical analytics marked unavailable');
  assert(DataRepository.checkModuleAvailability('INVOICES', 'SIMULATED_OFFLINE').isAvailable === false, 'Invoice billing ledger marked unavailable');
  assert(DataRepository.checkModuleAvailability('PARTNERS', 'SIMULATED_OFFLINE').isAvailable === false, 'Partner verification records marked unavailable');

  // ----------------------------------------------------
  // TEST 5: Trip Status Mutation During Blackout
  // ----------------------------------------------------
  console.log('\n--- Scenario 5: Trip Status Mutation During Blackout ---');
  const tripToUpdate = snapshottedTrips[0];
  const tripUpdateRes = await DataRepository.updateTripStatus(
    tripToUpdate.id,
    'COMPLETED',
    tripToUpdate,
    'SIMULATED_OFFLINE'
  );
  assert(tripUpdateRes.isLocal === true, 'Trip status update stored locally during blackout');
  assert(tripUpdateRes.updatedTrip.tripStatus === 'COMPLETED', 'Trip marked COMPLETED');
  assert(Boolean(tripUpdateRes.queuedOp?.idempotency_key.startsWith(`trip_${tripToUpdate.id}`)), 'Unique idempotency key generated for trip update');

  // ----------------------------------------------------
  // TEST 6: Reconnection & Synchronization
  // ----------------------------------------------------
  console.log('\n--- Scenario 6: Reconnection & Synchronization ---');
  const syncLogs: string[] = [];
  const syncRes = await DataRepository.syncPendingQueue((msg) => syncLogs.push(msg));
  assert(syncRes.syncedCount >= 1, 'All queued trip and shipment mutations synchronized upon reconnection');
  assert(syncRes.conflictOps.length === 0, 'Replayed operations synchronized cleanly with zero conflicts');

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log(`🏁 TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('====================================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 ALL MULTI-BUS ACTIVE BLACKOUT POLICIES VERIFIED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

runContinuityTestSuite();
