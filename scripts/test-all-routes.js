async function testRoutes() {
  const routes = [
    '/',
    '/login',
    '/register',
    '/admin/dashboard',
    '/admin/partners',
    '/partner/dashboard',
    '/partner/pending',
    '/partner/rejected',
    '/conductor/dashboard'
  ];

  console.log('--- DETAILED CHECK OF ALL ROUTES ---');
  let anyError = false;
  for (const r of routes) {
    try {
      const res = await fetch('http://localhost:3000' + r);
      const text = await res.text();
      const has500 = text.includes('Internal Server Error') || text.includes('Unhandled Runtime Error');
      console.log(`Route ${r.padEnd(25)} -> Status: ${res.status}, ErrorTextFound: ${has500}`);
      if (res.status >= 400 || has500) {
        anyError = true;
        console.error(`Preview of response for ${r}:\n`, text.slice(0, 300));
      }
    } catch (e) {
      anyError = true;
      console.error(`FAILED ${r}:`, e.message);
    }
  }

  if (!anyError) {
    console.log(' ALL ROUTES ARE RETURNING 200 OK WITH NO INTERNAL SERVER ERRORS!');
  } else {
    console.log('❌ SOME ROUTES ENCOUNTERED ERRORS');
  }
}

testRoutes();
