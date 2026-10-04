const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const { createClient, chains, createAccount } = require('genlayer-js');
const fs = require('fs');

async function withRetry(fn, desc, maxRetries = 6, baseDelay = 4000) {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      console.warn(`[Retry ${i}/${maxRetries}] ${desc} error: ${err.message || err}`);
      if (i === maxRetries) throw err;
      await new Promise(r => setTimeout(r, baseDelay * i));
    }
  }
}

async function runDemo2() {
  console.log('================================================================');
  console.log('       DEMO 2 SPEC: CLOUD SERVICE LEVEL AGREEMENT (SLA)         ');
  console.log('================================================================');

  const CONTRACT_ADDRESS = '0x13ac18867642fdCd740EA14c6EA7588abdCb7F73';

  const partyA = createAccount();
  const partyB = createAccount();
  console.log('Party A (Customer): ', partyA.address);
  console.log('Party B (Provider): ', partyB.address);

  const clientA = createClient({ chain: chains.studionet, account: partyA });
  const clientB = createClient({ chain: chains.studionet, account: partyB });

  const title = 'Cloud Service Level Agreement (SLA)';
  const clause = 'The cloud service provider shall maintain monthly API uptime of at least 99.9% and respond to critical outage incidents within 1 hour.';
  const labelsCsv = 'COMPLIANT, VIOLATION';

  // 1. Create Spec
  console.log('\n[1/10] Party A creates Spec...');
  const txCreate = await withRetry(
    () => clientA.writeContract({
      address: CONTRACT_ADDRESS,
      functionName: 'create_spec',
      args: [title, clause, labelsCsv]
    }),
    'create_spec'
  );
  console.log('txCreate:', txCreate);
  await withRetry(() => clientA.waitForTransactionReceipt({ hash: txCreate, retries: 120, interval: 3000 }), 'rcCreate');

  const rawLatest = await clientA.readContract({
    address: CONTRACT_ADDRESS,
    functionName: 'get_latest_spec',
    args: [partyA.address]
  });
  const specId = typeof rawLatest === 'string' ? rawLatest.replace(/^"|"$/g, '') : rawLatest;
  console.log('Spec ID created:', specId);

  // 2. Invite Party B
  console.log('\n[2/10] Party A invites Party B...');
  const txInvite = await withRetry(
    () => clientA.writeContract({
      address: CONTRACT_ADDRESS,
      functionName: 'invite',
      args: [specId, partyB.address]
    }),
    'invite'
  );
  console.log('txInvite:', txInvite);
  await withRetry(() => clientA.waitForTransactionReceipt({ hash: txInvite, retries: 120, interval: 3000 }), 'rcInvite');

  // 3. Propose scenarios: Party A proposes 1 & 2
  console.log('\n[3/10] Party A proposes Scenario 1 & 2...');
  const txSc1 = await withRetry(
    () => clientA.writeContract({
      address: CONTRACT_ADDRESS,
      functionName: 'add_scenario',
      args: [specId, 'The provider maintains 99.95% API uptime for the month and acknowledged the single outage alert within 20 minutes.', 'COMPLIANT']
    }),
    'sc1'
  );
  console.log('txSc1 (Party A):', txSc1);
  await withRetry(() => clientA.waitForTransactionReceipt({ hash: txSc1, retries: 120, interval: 3000 }), 'rcSc1');

  const txSc2 = await withRetry(
    () => clientA.writeContract({
      address: CONTRACT_ADDRESS,
      functionName: 'add_scenario',
      args: [specId, 'The provider maintains 100% monthly availability with zero downtime and all healthchecks passing.', 'COMPLIANT']
    }),
    'sc2'
  );
  console.log('txSc2 (Party A):', txSc2);
  await withRetry(() => clientA.waitForTransactionReceipt({ hash: txSc2, retries: 120, interval: 3000 }), 'rcSc2');

  // 4. Party B proposes 3 & 4
  console.log('\n[4/10] SWITCH WALLET to Party B: Party B proposes Scenario 3 & 4...');
  const txSc3 = await withRetry(
    () => clientB.writeContract({
      address: CONTRACT_ADDRESS,
      functionName: 'add_scenario',
      args: [specId, 'A critical database outage occurs and the support team does not respond or investigate for 4 hours.', 'VIOLATION']
    }),
    'sc3'
  );
  console.log('txSc3 (Party B):', txSc3);
  await withRetry(() => clientB.waitForTransactionReceipt({ hash: txSc3, retries: 120, interval: 3000 }), 'rcSc3');

  const txSc4 = await withRetry(
    () => clientB.writeContract({
      address: CONTRACT_ADDRESS,
      functionName: 'add_scenario',
      args: [specId, 'Monthly server availability drops to 98.5% due to repeated unscheduled infrastructure failures.', 'VIOLATION']
    }),
    'sc4'
  );
  console.log('txSc4 (Party B):', txSc4);
  await withRetry(() => clientB.waitForTransactionReceipt({ hash: txSc4, retries: 120, interval: 3000 }), 'rcSc4');

  // 5. Run consensus 1..4
  console.log('\n[5/10] Run Validator Consensus on all 4 scenarios...');
  const txRuns = [];
  for (let i = 1; i <= 4; i++) {
    await new Promise(r => setTimeout(r, 2000));
    console.log(`Running scenario #${i}...`);
    const txRun = await withRetry(
      () => clientA.writeContract({
        address: CONTRACT_ADDRESS,
        functionName: 'run_scenario',
        args: [specId, i]
      }),
      `run ${i}`
    );
    console.log(`txRun #${i}:`, txRun);
    await withRetry(() => clientA.waitForTransactionReceipt({ hash: txRun, retries: 120, interval: 3000 }), `rcRun ${i}`);
    txRuns.push(txRun);

    const scData = await clientA.readContract({
      address: CONTRACT_ADDRESS,
      functionName: 'get_scenario',
      args: [specId, i]
    });
    console.log(`Scenario #${i} verdict:`, JSON.parse(scData).label, 'matches:', JSON.parse(scData).matches);
  }

  // 6. Both sign
  console.log('\n[6/10] Dual signing...');
  const txSignA = await withRetry(() => clientA.writeContract({ address: CONTRACT_ADDRESS, functionName: 'sign', args: [specId] }), 'signA');
  console.log('txSignA (Party A):', txSignA);
  await withRetry(() => clientA.waitForTransactionReceipt({ hash: txSignA, retries: 120, interval: 3000 }), 'rcSignA');

  const txSignB = await withRetry(() => clientB.writeContract({ address: CONTRACT_ADDRESS, functionName: 'sign', args: [specId] }), 'signB');
  console.log('txSignB (Party B):', txSignB);
  await withRetry(() => clientB.waitForTransactionReceipt({ hash: txSignB, retries: 120, interval: 3000 }), 'rcSignB');

  // 7. Check suite report
  const rawRep = await clientA.readContract({ address: CONTRACT_ADDRESS, functionName: 'suite_report', args: [specId] });
  const rep = JSON.parse(rawRep);
  console.log('\nSuite report:', rep);
  if (!rep.ready_to_lock) throw new Error('Not ready to lock: ' + JSON.stringify(rep.lock_problems));

  // 8. Lock
  console.log('\n[7/10] SWITCH BACK TO WALLET A: Locking spec...');
  const txLock = await withRetry(() => clientA.writeContract({ address: CONTRACT_ADDRESS, functionName: 'lock', args: [specId] }), 'lock');
  console.log('txLock:', txLock);
  const rcLock = await withRetry(() => clientA.waitForTransactionReceipt({ hash: txLock, retries: 120, interval: 3000 }), 'rcLock');
  console.log('Lock status:', rcLock.status_name, '| Result:', rcLock.result_name);

  // 9. Stipulate & confirm facts
  console.log('\n[8/10] Party A stipulates dispute facts...');
  const disputeFacts = 'During July 2026, the provider recorded 99.98% total API uptime, and responded to the single incident alert in 25 minutes.';
  const txFacts = await withRetry(
    () => clientA.writeContract({
      address: CONTRACT_ADDRESS,
      functionName: 'stipulate_facts',
      args: [specId, disputeFacts]
    }),
    'stipulate_facts'
  );
  console.log('txFacts:', txFacts);
  await withRetry(() => clientA.waitForTransactionReceipt({ hash: txFacts, retries: 120, interval: 3000 }), 'rcFacts');

  const rawFactsId = await clientA.readContract({
    address: CONTRACT_ADDRESS,
    functionName: 'get_latest_facts_id',
    args: [specId]
  });
  const factsId = typeof rawFactsId === 'string' ? rawFactsId.replace(/^"|"$/g, '') : rawFactsId;
  console.log('Stipulated Facts ID:', factsId);

  console.log('SWITCH TO WALLET B: Party B confirms facts...');
  const txConfirm = await withRetry(
    () => clientB.writeContract({
      address: CONTRACT_ADDRESS,
      functionName: 'confirm_facts',
      args: [specId, factsId]
    }),
    'confirm_facts'
  );
  console.log('txConfirm:', txConfirm);
  await withRetry(() => clientB.waitForTransactionReceipt({ hash: txConfirm, retries: 120, interval: 3000 }), 'rcConfirm');

  // 10. Adjudicate
  console.log('\n[9/10] Executing on-chain validator consensus adjudication...');
  const txAdj = await withRetry(
    () => clientA.writeContract({
      address: CONTRACT_ADDRESS,
      functionName: 'adjudicate',
      args: [specId, factsId]
    }),
    'adjudicate'
  );
  console.log('txAdj:', txAdj);
  const rcAdj = await withRetry(() => clientA.waitForTransactionReceipt({ hash: txAdj, retries: 120, interval: 3000 }), 'rcAdj');
  console.log('Adjudication status:', rcAdj.status_name, '| Result:', rcAdj.result_name);

  const rawRuling = await clientA.readContract({
    address: CONTRACT_ADDRESS,
    functionName: 'get_ruling',
    args: [specId, factsId]
  });
  const ruling = JSON.parse(rawRuling);
  console.log('\n================================================================');
  console.log('               ON-CHAIN RULING VERDICT RECEIVED                 ');
  console.log('================================================================');
  console.log(ruling);

  const finalRecord = {
    title,
    clause,
    labels: labelsCsv,
    partyA: partyA.address,
    partyB: partyB.address,
    specId,
    factsId,
    verdict: ruling.verdict,
    canaryPass: ruling.canary_pass,
    specHash: ruling.spec_hash,
    transactions: {
      txCreate,
      txInvite,
      txSc1,
      txSc2,
      txSc3,
      txSc4,
      txRuns,
      txSignA,
      txSignB,
      txLock,
      txFacts,
      txConfirm,
      txAdj
    }
  };

  fs.writeFileSync('scripts/demo2_live_run.json', JSON.stringify(finalRecord, null, 2));
  console.log('\nAll steps succeeded end-to-end! Saved to scripts/demo2_live_run.json');
}

runDemo2().catch((err) => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
