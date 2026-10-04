const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const { createClient, chains, createAccount } = require('genlayer-js');
const fs = require('fs');
const path = require('path');

const CONTRACT = '0x13ac18867642fdCd740EA14c6EA7588abdCb7F73';

async function withRetry(fn, desc, maxRetries = 6, baseDelay = 3000) {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      console.warn(`[Retry ${i}/${maxRetries}] ${desc}: ${err.message || err}`);
      if (i === maxRetries) throw err;
      await new Promise(r => setTimeout(r, baseDelay * i));
    }
  }
}

async function main() {
  console.log('=== SEEDING PERSISTENT DEMOS ON NEW CONTRACT ===');
  console.log('Contract Address:', CONTRACT);

  // -------------------------------------------------------------
  // DEMO 2: POSITIVE LOCKED CLOUD SLA AGREEMENT
  // -------------------------------------------------------------
  console.log('\n=============================================');
  console.log('--- SEEDING DEMO 2: Cloud SLA (Positive Locked) ---');
  console.log('=============================================');

  const d2PartyA = createAccount();
  const d2PartyB = createAccount();
  console.log('Demo 2 Party A:', d2PartyA.address);
  console.log('Demo 2 Party B:', d2PartyB.address);

  const d2ClientA = createClient({ chain: chains.studionet, account: d2PartyA });
  const d2ClientB = createClient({ chain: chains.studionet, account: d2PartyB });

  const d2Title = 'Cloud Service Level Agreement (SLA)';
  const d2Clause = 'The cloud service provider shall maintain monthly API uptime of at least 99.9% and respond to critical outage incidents within 1 hour.';
  const d2Labels = 'COMPLIANT, VIOLATION';

  console.log('[D2-1] Creating spec...');
  const txD2Create = await withRetry(
    () => d2ClientA.writeContract({ address: CONTRACT, functionName: 'create_spec', args: [d2Title, d2Clause, d2Labels] }),
    'd2 create_spec'
  );
  console.log('txD2Create:', txD2Create);
  await withRetry(() => d2ClientA.waitForTransactionReceipt({ hash: txD2Create, retries: 120, interval: 3000 }), 'rcD2Create');

  const rawD2Latest = await d2ClientA.readContract({ address: CONTRACT, functionName: 'get_latest_spec', args: [d2PartyA.address] });
  const d2SpecId = typeof rawD2Latest === 'string' ? rawD2Latest.replace(/^"|"$/g, '') : rawD2Latest;
  console.log('Demo 2 Spec ID:', d2SpecId);

  console.log('[D2-2] Inviting Party B...');
  const txD2Invite = await withRetry(
    () => d2ClientA.writeContract({ address: CONTRACT, functionName: 'invite', args: [d2SpecId, d2PartyB.address] }),
    'd2 invite'
  );
  console.log('txD2Invite:', txD2Invite);
  await withRetry(() => d2ClientA.waitForTransactionReceipt({ hash: txD2Invite, retries: 120, interval: 3000 }), 'rcD2Invite');

  const d2Scenarios = [
    {
      text: 'Provider achieved 99.98% monthly uptime across all endpoints and responded to the single P1 outage in 22 minutes.',
      expected: 'COMPLIANT',
      who: 'A'
    },
    {
      text: 'Provider achieved 99.92% monthly uptime. There were zero critical outage incidents during the billing period.',
      expected: 'COMPLIANT',
      who: 'A'
    },
    {
      text: 'Provider experienced multiple unscheduled outages resulting in 99.40% monthly uptime. Critical ticket was resolved in 45 minutes.',
      expected: 'VIOLATION',
      who: 'B'
    },
    {
      text: 'Provider achieved 99.95% monthly uptime, but took 3 hours and 15 minutes to respond to a critical outage incident.',
      expected: 'VIOLATION',
      who: 'B'
    }
  ];

  for (let i = 0; i < d2Scenarios.length; i++) {
    const sc = d2Scenarios[i];
    const client = sc.who === 'A' ? d2ClientA : d2ClientB;
    console.log(`[D2-${3 + i}] ${sc.who === 'A' ? 'Party A' : 'Party B'} adding scenario ${i + 1}...`);
    const tx = await withRetry(
      () => client.writeContract({ address: CONTRACT, functionName: 'add_scenario', args: [d2SpecId, sc.text, sc.expected] }),
      `d2 sc${i + 1}`
    );
    console.log(`txD2Sc${i + 1}:`, tx);
    await withRetry(() => client.waitForTransactionReceipt({ hash: tx, retries: 120, interval: 3000 }), `rcD2Sc${i + 1}`);
  }

  console.log('[D2-7] Running validator consensus on all 4 scenarios...');
  for (let n = 1; n <= 4; n++) {
    const tx = await withRetry(
      () => d2ClientA.writeContract({ address: CONTRACT, functionName: 'run_scenario', args: [d2SpecId, n] }),
      `d2 run(${n})`
    );
    console.log(`run_scenario(${n}) tx:`, tx);
    await withRetry(() => d2ClientA.waitForTransactionReceipt({ hash: tx, retries: 180, interval: 3000 }), `rcD2Run(${n})`);
    const sc = JSON.parse(await d2ClientA.readContract({ address: CONTRACT, functionName: 'get_scenario', args: [d2SpecId, n] }));
    console.log(`  Scenario #${n}: expected=${sc.expected}, consensus=${sc.label}, matches=${sc.matches}`);
  }

  console.log('[D2-8] Dual signing...');
  const txD2SignA = await withRetry(
    () => d2ClientA.writeContract({ address: CONTRACT, functionName: 'sign', args: [d2SpecId] }),
    'd2 sign A'
  );
  console.log('txD2SignA:', txD2SignA);
  await withRetry(() => d2ClientA.waitForTransactionReceipt({ hash: txD2SignA, retries: 120, interval: 3000 }), 'rcD2SignA');

  const txD2SignB = await withRetry(
    () => d2ClientB.writeContract({ address: CONTRACT, functionName: 'sign', args: [d2SpecId] }),
    'd2 sign B'
  );
  console.log('txD2SignB:', txD2SignB);
  await withRetry(() => d2ClientB.waitForTransactionReceipt({ hash: txD2SignB, retries: 120, interval: 3000 }), 'rcD2SignB');

  console.log('[D2-9] Locking agreement spec...');
  const txD2Lock = await withRetry(
    () => d2ClientA.writeContract({ address: CONTRACT, functionName: 'lock', args: [d2SpecId] }),
    'd2 lock'
  );
  console.log('txD2Lock:', txD2Lock);
  await withRetry(() => d2ClientA.waitForTransactionReceipt({ hash: txD2Lock, retries: 120, interval: 3000 }), 'rcD2Lock');

  const lockedSpec = JSON.parse(await d2ClientA.readContract({ address: CONTRACT, functionName: 'get_spec', args: [d2SpecId] }));
  console.log('Locked Spec Status:', lockedSpec.status, 'Hash:', lockedSpec.spec_hash);

  console.log('[D2-10] Stipulating facts...');
  const d2FactsText = 'During October 2026, the provider maintained 99.95% uptime across all production APIs and responded to the only critical incident in 38 minutes.';
  const txD2Stip = await withRetry(
    () => d2ClientA.writeContract({ address: CONTRACT, functionName: 'stipulate_facts', args: [d2SpecId, d2FactsText] }),
    'd2 stipulate_facts'
  );
  console.log('txD2Stip:', txD2Stip);
  await withRetry(() => d2ClientA.waitForTransactionReceipt({ hash: txD2Stip, retries: 120, interval: 3000 }), 'rcD2Stip');

  const rawD2LatestFacts = await d2ClientA.readContract({ address: CONTRACT, functionName: 'get_latest_facts_id', args: [d2SpecId] });
  const d2FactsId = typeof rawD2LatestFacts === 'string' ? rawD2LatestFacts.replace(/^"|"$/g, '') : rawD2LatestFacts;
  console.log('Demo 2 Facts ID:', d2FactsId);

  console.log('[D2-11] Party B confirming facts...');
  const txD2Confirm = await withRetry(
    () => d2ClientB.writeContract({ address: CONTRACT, functionName: 'confirm_facts', args: [d2SpecId, d2FactsId] }),
    'd2 confirm_facts'
  );
  console.log('txD2Confirm:', txD2Confirm);
  await withRetry(() => d2ClientB.waitForTransactionReceipt({ hash: txD2Confirm, retries: 120, interval: 3000 }), 'rcD2Confirm');

  console.log('[D2-12] Adjudicating agreement...');
  const txD2Adjudicate = await withRetry(
    () => d2ClientA.writeContract({ address: CONTRACT, functionName: 'adjudicate', args: [d2SpecId, d2FactsId] }),
    'd2 adjudicate'
  );
  console.log('txD2Adjudicate:', txD2Adjudicate);
  await withRetry(() => d2ClientA.waitForTransactionReceipt({ hash: txD2Adjudicate, retries: 180, interval: 3000 }), 'rcD2Adjudicate');

  const d2Ruling = JSON.parse(await d2ClientA.readContract({ address: CONTRACT, functionName: 'get_ruling', args: [d2SpecId, d2FactsId] }));
  console.log('Demo 2 Ruling:', JSON.stringify(d2Ruling, null, 2));

  // -------------------------------------------------------------
  // DEMO 3: AMBIGUOUS CLAUSE - BLOCKED FROM LOCKING
  // -------------------------------------------------------------
  console.log('\n=============================================');
  console.log('--- SEEDING DEMO 3: Consulting Deliverable (Ambiguous / Blocked) ---');
  console.log('=============================================');

  const d3PartyA = createAccount();
  const d3PartyB = createAccount();
  console.log('Demo 3 Party A:', d3PartyA.address);
  console.log('Demo 3 Party B:', d3PartyB.address);

  const d3ClientA = createClient({ chain: chains.studionet, account: d3PartyA });
  const d3ClientB = createClient({ chain: chains.studionet, account: d3PartyB });

  const d3Title = 'Consulting Deliverable Quality Agreement';
  const d3Clause = 'The consultant shall produce work that is reasonably satisfactory and meets general professional expectations within a mutually agreeable timeframe.';
  const d3Labels = 'ACCEPTABLE, UNACCEPTABLE';

  console.log('[D3-1] Creating spec...');
  const txD3Create = await withRetry(
    () => d3ClientA.writeContract({ address: CONTRACT, functionName: 'create_spec', args: [d3Title, d3Clause, d3Labels] }),
    'd3 create_spec'
  );
  console.log('txD3Create:', txD3Create);
  await withRetry(() => d3ClientA.waitForTransactionReceipt({ hash: txD3Create, retries: 120, interval: 3000 }), 'rcD3Create');

  const rawD3Latest = await d3ClientA.readContract({ address: CONTRACT, functionName: 'get_latest_spec', args: [d3PartyA.address] });
  const d3SpecId = typeof rawD3Latest === 'string' ? rawD3Latest.replace(/^"|"$/g, '') : rawD3Latest;
  console.log('Demo 3 Spec ID:', d3SpecId);

  console.log('[D3-2] Inviting Party B...');
  const txD3Invite = await withRetry(
    () => d3ClientA.writeContract({ address: CONTRACT, functionName: 'invite', args: [d3SpecId, d3PartyB.address] }),
    'd3 invite'
  );
  console.log('txD3Invite:', txD3Invite);
  await withRetry(() => d3ClientA.waitForTransactionReceipt({ hash: txD3Invite, retries: 120, interval: 3000 }), 'rcD3Invite');

  const d3Scenarios = [
    {
      text: 'Consultant delivers a 40-page report on day 14. The client says it looks fine but has not tested any recommendations yet.',
      expected: 'ACCEPTABLE',
      who: 'A'
    },
    {
      text: 'Consultant delivers rough notes and a slide deck with no executive summary by an unspecified deadline. The client feels it is "okay but not great."',
      expected: 'ACCEPTABLE',
      who: 'A'
    },
    {
      text: 'Consultant submits a polished final report 3 days after the verbal deadline, but the client never specified the deadline in writing.',
      expected: 'UNACCEPTABLE',
      who: 'B'
    },
    {
      text: 'Consultant delivers a prototype that technically works but the client expected production-quality code. No quality standard was defined in the clause.',
      expected: 'UNACCEPTABLE',
      who: 'B'
    }
  ];

  for (let i = 0; i < d3Scenarios.length; i++) {
    const sc = d3Scenarios[i];
    const client = sc.who === 'A' ? d3ClientA : d3ClientB;
    console.log(`[D3-${3 + i}] ${sc.who === 'A' ? 'Party A' : 'Party B'} adding scenario ${i + 1}...`);
    const tx = await withRetry(
      () => client.writeContract({ address: CONTRACT, functionName: 'add_scenario', args: [d3SpecId, sc.text, sc.expected] }),
      `d3 sc${i + 1}`
    );
    console.log(`txD3Sc${i + 1}:`, tx);
    await withRetry(() => client.waitForTransactionReceipt({ hash: tx, retries: 120, interval: 3000 }), `rcD3Sc${i + 1}`);
  }

  console.log('[D3-7] Running validator consensus on all 4 scenarios...');
  for (let n = 1; n <= 4; n++) {
    const tx = await withRetry(
      () => d3ClientA.writeContract({ address: CONTRACT, functionName: 'run_scenario', args: [d3SpecId, n] }),
      `d3 run(${n})`
    );
    console.log(`run_scenario(${n}) tx:`, tx);
    await withRetry(() => d3ClientA.waitForTransactionReceipt({ hash: tx, retries: 180, interval: 3000 }), `rcD3Run(${n})`);
    const sc = JSON.parse(await d3ClientA.readContract({ address: CONTRACT, functionName: 'get_scenario', args: [d3SpecId, n] }));
    console.log(`  Scenario #${n}: expected=${sc.expected}, consensus=${sc.label}, matches=${sc.matches}`);
  }

  const d3Report = JSON.parse(await d3ClientA.readContract({ address: CONTRACT, functionName: 'suite_report', args: [d3SpecId] }));
  console.log('Demo 3 Suite Report:', JSON.stringify(d3Report, null, 2));

  const result = {
    contract: CONTRACT,
    timestamp: new Date().toISOString(),
    demo2: {
      title: d2Title,
      spec_id: d2SpecId,
      facts_id: d2FactsId,
      status: lockedSpec.status,
      spec_hash: lockedSpec.spec_hash,
      ruling: d2Ruling
    },
    demo3: {
      title: d3Title,
      spec_id: d3SpecId,
      status: 'DRAFT',
      ready_to_lock: d3Report.ready_to_lock,
      red_scenarios: d3Report.red_scenarios,
      lock_problems: d3Report.lock_problems
    }
  };

  const outPath = path.join(__dirname, 'seeded_demos.json');
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2));
  console.log('\n=============================================');
  console.log('SUCCESS! Seeded demos saved to:', outPath);
  console.log(JSON.stringify(result, null, 2));
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
