// End-to-End Test Suite for Continuity & Blackout Simulation Layer
import { DataRepository, generateIdempotencyKey, generateOperationId } from '../lib/data-repository.js';
import {
  DEMO_ACTIVE_TASK_ID,
  DEMO_CACHED_TASK_ID,
  DEMO_UNCACHED_TASK_IDS,
  DEMO_ACTIVE_SHIPMENT,
  DEMO_CACHED_SHIPMENT,
  INITIAL_SHIPMENTS
} from '../lib/mock-data.js';

async function runContinuityTestSuite() {
  console.log('====================================================');
  console.log('🧪 CARGOFLOW CONTINUITY & BLACKOUT TEST SUITE');
  console.log('====================================================\n');

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, testName) {
    totalTests++;
    if (condition) {
      console.log(`✓ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
    }
  }

  // ----------------------------------------------------
  // TEST 1: Baseline Online State
  // ----------------------------------------------------
  console.log('\n--- Scenario 1: Baseline Online Data Fetching ---');
  const onlineActiveRes = await DataRepository.getShipmentById(DEMO_ACTIVE_TASK_ID, INITIAL_SHIPMENTS, 'ONLINE');
  assert(onlineActiveRes.data && onlineActiveRes.data.id === 'shp-482', 'Online active task #482 is retrievable');
  assert(onlineActiveRes.data?.status === 'IN_TRANSIT', 'Active task status is IN_TRANSIT');

  const onlineOldRes = await DataRepository.getShipmentById('shp-471', INITIAL_SHIPMENTS, 'ONLINE');
  assert(onlineOldRes.data && onlineOldRes.data.id === 'shp-471', 'Online backend-only record #471 is retrievable normally');

  // ----------------------------------------------------
  // TEST 2: Simulated Blackout - Active Task Continuity
  // ----------------------------------------------------
  console.log('\n--- Scenario 2: Simulated Outage & Active Task Continuity ---');
  const offlineActiveRes = await DataRepository.getShipmentById(DEMO_ACTIVE_TASK_ID, INITIAL_SHIPMENTS, 'SIMULATED_OFFLINE');
  assert(offlineActiveRes.data && offlineActiveRes.isProtectedLocally, 'Active task #482 is recognized as locally protected during blackout');
  assert(offlineActiveRes.data?.waybillNumber === 'WB-2026-KPG-0482', 'Waybill number matches active task');

  // Mutate Active Task Status during Outage (Loaded -> In Transit -> Delivered)
  const updateRes1 = await DataRepository.updateShipmentStatus(
    'shp-482',
    'LOADED',
    'Loaded by Conductor Suresh Pawar',
    DEMO_ACTIVE_SHIPMENT,
    'SIMULATED_OFFLINE',
    'Suresh Pawar',
    'Nashik CBS Depot'
  );
  assert(updateRes1.isLocal === true, 'Status update is marked as local-only');
  assert(updateRes1.updatedShipment.status === 'LOADED', 'Local task state updated to LOADED');
  assert(updateRes1.queuedOp !== undefined, 'Operation entered the offline queue');
  assert(updateRes1.queuedOp?.idempotency_key.startsWith('status_shp-482'), 'Unique idempotency key generated');

  // ----------------------------------------------------
  // TEST 3: Simulated Blackout - Graceful Error for Uncached Data
  // ----------------------------------------------------
  console.log('\n--- Scenario 3: Graceful Error for Uncached Backend Records ---');
  const offlineUncachedRes = await DataRepository.getShipmentById('shp-471', INITIAL_SHIPMENTS, 'SIMULATED_OFFLINE');
  assert(offlineUncachedRes.isBackendUnavailable === true, 'Uncached old record #471 returns isBackendUnavailable = true');
  assert(offlineUncachedRes.data === undefined, 'No fake data is fabricated for uncached records');
  assert(offlineUncachedRes.error?.includes('Unable to retrieve'), 'Graceful error message returned without stack traces');

  // ----------------------------------------------------
  // TEST 4: Simulated Blackout - Cached Last Known State
  // ----------------------------------------------------
  console.log('\n--- Scenario 4: Cached Last Known State ---');
  const offlineCachedRes = await DataRepository.getShipmentById(DEMO_CACHED_TASK_ID, INITIAL_SHIPMENTS, 'SIMULATED_OFFLINE');
  assert(offlineCachedRes.isCached === true, 'Cached record #470 identified as cached snapshot');
  assert(offlineCachedRes.lastKnownTimestamp === '10:18 AM', 'Last known timestamp (10:18 AM) accurately labeled');
  assert(offlineCachedRes.data?.waybillNumber === 'WB-2026-NSH-0470', 'Cached waybill data available');

  // ----------------------------------------------------
  // TEST 5: Creating New Shipment During Blackout
  // ----------------------------------------------------
  console.log('\n--- Scenario 5: Creating New Shipment During Blackout ---');
  const createRes = await DataRepository.createShipment(
    {
      courierCompanyId: 'c0000000-0000-0000-0000-000000000001',
      courierCompanyName: 'BlueDart Express',
      senderName: 'Nashik Agro Producer Co',
      senderPhone: '+91 98220 55443',
      receiverName: 'Kopargaon APMC',
      receiverPhone: '+91 94220 99887',
      originStopId: 'STP001',
      destinationStopId: 'STP030',
      weightKg: 120.0,
      dimensionsCm: '80 x 60 x 50',
      declaredValue: 75000,
      tripId: 'TRP001',
      fareAmount: 1450,
      qrCodeHash: ''
    },
    'SIMULATED_OFFLINE'
  );
  assert(createRes.isLocal === true, 'New shipment created in local continuity store');
  assert(createRes.newShipment.status === 'RESERVED', 'New shipment marked RESERVED');
  assert(createRes.queuedOp?.operation_type === 'CREATE_SHIPMENT', 'CREATE_SHIPMENT queued with idempotency key');
  assert(createRes.queuedOp?.idempotency_key.startsWith('create_shp-'), 'Idempotency key properly formatted');

  // ----------------------------------------------------
  // TEST 6: Idempotent Restoration & Synchronization
  // ----------------------------------------------------
  console.log('\n--- Scenario 6: Synchronization Replay & Duplicate Prevention ---');
  const stepLogs = [];
  const syncRes = await DataRepository.syncPendingQueue((msg) => stepLogs.push(msg));
  assert(syncRes.syncedCount >= 2, 'Pending queue operations processed sequentially');
  assert(stepLogs.length >= 2, 'Progress steps emitted for UI feedback');
  assert(syncRes.conflictOps.length === 0, 'Clean operations synced with 0 conflicts');

  // ----------------------------------------------------
  // SUMMARY
  // ----------------------------------------------------
  console.log('\n====================================================');
  console.log(`🏁 TEST RESULTS: ${passedTests} / ${totalTests} TESTS PASSED`);
  console.log('====================================================\n');

  if (passedTests === totalTests) {
    console.log('🎉 ALL CONTINUITY & BLACKOUT TEST SCENARIOS VERIFIED SUCCESSFULLY!');
    process.exit(0);
  } else {
    console.error('❌ SOME TESTS FAILED');
    process.exit(1);
  }
}

runContinuityTestSuite();
