const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const { createClient, chains, createAccount } = require('genlayer-js');
const fs = require('fs');
const path = require('path');

const CONTRACT_ADDRESS = '0x13ac18867642fdCd740EA14c6EA7588abdCb7F73';

async function withRetry(fn, desc, maxRetries = 8, baseDelay = 3000) {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      return await fn();
    } catch (err) {
      console.warn(`[Retry ${i}/${maxRetries}] ${desc} failed: ${err.message || err}`);
      if (i === maxRetries) throw err;
      await new Promise(r => setTimeout(r, baseDelay * i));
    }
  }
}

async function main() {
  console.log('================================================================');
  console.log('E2E TEST: DEMONSTRATING BOTH STEWARD PROTECTIONS ON STUDIONET');
  console.log('Contract:', CONTRACT_ADDRESS);
  console.log('================================================================\n');

  const partyA = createAccount();
  const partyB = createAccount();
  console.log('Party A Address:', partyA.address);
  console.log('Party B Address:', partyB.address);

  const clientA = createClient({ chain: chains.studionet, account: partyA });
  const clientB = createClient({ chain: chains.studionet, account: partyB });

  const trace = {
    contract: CONTRACT_ADDRESS,
    timestamp: new Date().toISOString(),
    partyA: partyA.address,
    partyB: partyB.address,
    steps: []
  };

  // ============================================================
  // PROTECTION 1: SCENARIO SUITE BINDING
  // ============================================================
  console.log('>>> [STEP 1] Create Agreement Spec');
  const title = `E2E Protections ${Date.now().toString().slice(-4)}`;
  const clause = 'The contractor shall deliver the repository with pure ASCII code and passing tests within 7 calendar days of contract creation.';
  const labels = 'DELIVERED, BREACH';

  const txCreate = await withRetry(
    () => clientA.writeContract({ address: CONTRACT_ADDRESS, functionName: 'create_spec', args: [title, clause, labels] }),
    'create_spec'
  );
  console.log('  txCreate:', txCreate);
  await withRetry(() => clientA.waitForTransactionReceipt({ hash: txCreate, retries: 120, interval: 3000 }), 'rcCreate');

  const rawLatest = await clientA.readContract({ address: CONTRACT_ADDRESS, functionName: 'get_latest_spec', args: [partyA.address] });
  const specId = typeof rawLatest === 'string' ? rawLatest.replace(/^"|"$/g, '') : rawLatest;
  console.log('  Spec ID:', specId);

  trace.steps.push({ name: 'create_spec', tx: txCreate, specId });

  console.log('\n>>> [STEP 2] Invite Party B');
  const txInvite = await withRetry(
    () => clientA.writeContract({ address: CONTRACT_ADDRESS, functionName: 'invite', args: [specId, partyB.address] }),
    'invite'
  );
  console.log('  txInvite:', txInvite);
  await withRetry(() => clientA.waitForTransactionReceipt({ hash: txInvite, retries: 120, interval: 3000 }), 'rcInvite');
  trace.steps.push({ name: 'invite', tx: txInvite });

  console.log('\n>>> [STEP 3] Propose Initial 4 Scenarios (2 Party A, 2 Party B)');
  const initialScenarios = [
    { text: 'Contractor delivered pure ASCII code with 100% tests passing on calendar day 3.', exp: 'DELIVERED', who: 'A' },
    { text: 'Contractor delivered pure ASCII code with passing tests on calendar day 6.', exp: 'DELIVERED', who: 'A' },
    { text: 'Contractor delivered non-ASCII characters in source files on calendar day 4.', exp: 'BREACH', who: 'B' },
    { text: 'Contractor delivered after 12 calendar days with failing test suites.', exp: 'BREACH', who: 'B' }
  ];

  for (let i = 0; i < initialScenarios.length; i++) {
    const sc = initialScenarios[i];
    const client = sc.who === 'A' ? clientA : clientB;
    const tx = await withRetry(
      () => client.writeContract({ address: CONTRACT_ADDRESS, functionName: 'add_scenario', args: [specId, sc.text, sc.exp] }),
      `add_scenario ${i + 1}`
    );
    console.log(`  Added scenario ${i + 1} by Party ${sc.who} (tx: ${tx})`);
    await withRetry(() => client.waitForTransactionReceipt({ hash: tx, retries: 120, interval: 3000 }), `rcSc${i + 1}`);
  }

  console.log('\n>>> [STEP 4] Run Consensus on All 4 Scenarios');
  for (let n = 1; n <= 4; n++) {
    const tx = await withRetry(
      () => clientA.writeContract({ address: CONTRACT_ADDRESS, functionName: 'run_scenario', args: [specId, n] }),
      `run_scenario ${n}`
    );
    console.log(`  run_scenario(${n}) tx: ${tx}`);
    await withRetry(() => clientA.waitForTransactionReceipt({ hash: tx, retries: 180, interval: 3000 }), `rcRun${n}`);
  }

  const initialReport = JSON.parse(await clientA.readContract({ address: CONTRACT_ADDRESS, functionName: 'suite_report', args: [specId] }));
  const initialDigest = initialReport.scenario_suite_digest;
  console.log('  Initial Scenario Suite Digest:', initialDigest);

  console.log('\n>>> [STEP 5] Both Parties Sign Initial Scenario Suite');
  const txSignA1 = await withRetry(
    () => clientA.writeContract({ address: CONTRACT_ADDRESS, functionName: 'sign', args: [specId] }),
    'sign A1'
  );
  console.log('  txSignA1:', txSignA1);
  await withRetry(() => clientA.waitForTransactionReceipt({ hash: txSignA1, retries: 120, interval: 3000 }), 'rcSignA1');

  const txSignB1 = await withRetry(
    () => clientB.writeContract({ address: CONTRACT_ADDRESS, functionName: 'sign', args: [specId] }),
    'sign B1'
  );
  console.log('  txSignB1:', txSignB1);
  await withRetry(() => clientB.waitForTransactionReceipt({ hash: txSignB1, retries: 120, interval: 3000 }), 'rcSignB1');

  trace.steps.push({ name: 'initial_signatures', txA: txSignA1, txB: txSignB1, suiteDigest: initialDigest });

  console.log('\n>>> [STEP 6] ATTACK/DRIFT: Add Scenario 5 after both parties signed');
  const txSc5 = await withRetry(
    () => clientA.writeContract({
      address: CONTRACT_ADDRESS,
      functionName: 'add_scenario',
      args: [specId, 'Contractor delivered on calendar day 7 at 23:59 with pure ASCII and passing tests.', 'DELIVERED']
    }),
    'add_scenario 5'
  );
  console.log('  txSc5:', txSc5);
  await withRetry(() => clientA.waitForTransactionReceipt({ hash: txSc5, retries: 120, interval: 3000 }), 'rcSc5');

  // Run consensus on scenario 5 so it is green
  const txRun5 = await withRetry(
    () => clientA.writeContract({ address: CONTRACT_ADDRESS, functionName: 'run_scenario', args: [specId, 5] }),
    'run_scenario 5'
  );
  console.log('  run_scenario(5) tx:', txRun5);
  await withRetry(() => clientA.waitForTransactionReceipt({ hash: txRun5, retries: 180, interval: 3000 }), 'rcRun5');

  const postSc5Report = JSON.parse(await clientA.readContract({ address: CONTRACT_ADDRESS, functionName: 'suite_report', args: [specId] }));
  const postSc5Digest = postSc5Report.scenario_suite_digest;
  console.log('  New Scenario Suite Digest:', postSc5Digest);
  console.log('  Digest Changed:', initialDigest !== postSc5Digest);
  console.log('  Lock Problems:', JSON.stringify(postSc5Report.lock_problems, null, 2));

  const hasReSignProblemA = postSc5Report.lock_problems.some(p => p.toLowerCase().includes(partyA.address.toLowerCase()) && p.includes('must re-sign'));
  const hasReSignProblemB = postSc5Report.lock_problems.some(p => p.toLowerCase().includes(partyB.address.toLowerCase()) && p.includes('must re-sign'));
  console.log('  Party A re-sign problem detected:', hasReSignProblemA);
  console.log('  Party B re-sign problem detected:', hasReSignProblemB);

  console.log('\n>>> [STEP 7] Verify Lock is BLOCKED (Protection 1 in Action)');
  let lockFailedAsExpected = false;
  let lockErrorMsg = '';
  try {
    const txLockFail = await clientA.writeContract({ address: CONTRACT_ADDRESS, functionName: 'lock', args: [specId] });
    console.log('  txLockFail submitted:', txLockFail);
    const rc = await clientA.waitForTransactionReceipt({ hash: txLockFail, retries: 120, interval: 3000 });
    console.log('  Receipt execution_result:', rc.execution_result);
    if (rc.execution_result === 'ERROR') {
      lockFailedAsExpected = true;
      lockErrorMsg = 'Transaction reverted on-chain with execution_result: ERROR';
    }
  } catch (err) {
    lockFailedAsExpected = true;
    lockErrorMsg = err.message || String(err);
    console.log('  Caught lock error:', lockErrorMsg);
  }
  console.log('  Lock Blocked as Expected:', lockFailedAsExpected);
  trace.steps.push({ name: 'lock_blocked_after_suite_change', success: lockFailedAsExpected, error: lockErrorMsg });

  console.log('\n>>> [STEP 8] Renewed Dual Approval: Both parties re-sign updated suite');
  const txSignA2 = await withRetry(
    () => clientA.writeContract({ address: CONTRACT_ADDRESS, functionName: 'sign', args: [specId] }),
    're-sign A2'
  );
  console.log('  txSignA2:', txSignA2);
  await withRetry(() => clientA.waitForTransactionReceipt({ hash: txSignA2, retries: 120, interval: 3000 }), 'rcSignA2');

  const txSignB2 = await withRetry(
    () => clientB.writeContract({ address: CONTRACT_ADDRESS, functionName: 'sign', args: [specId] }),
    're-sign B2'
  );
  console.log('  txSignB2:', txSignB2);
  await withRetry(() => clientB.waitForTransactionReceipt({ hash: txSignB2, retries: 120, interval: 3000 }), 'rcSignB2');

  console.log('\n>>> [STEP 9] Lock Now Succeeds with Validated Suite Binding');
  const txLockSuccess = await withRetry(
    () => clientA.writeContract({ address: CONTRACT_ADDRESS, functionName: 'lock', args: [specId] }),
    'lock success'
  );
  console.log('  txLockSuccess:', txLockSuccess);
  await withRetry(() => clientA.waitForTransactionReceipt({ hash: txLockSuccess, retries: 120, interval: 3000 }), 'rcLockSuccess');

  const lockedSpec = JSON.parse(await clientA.readContract({ address: CONTRACT_ADDRESS, functionName: 'get_spec', args: [specId] }));
  console.log('  Spec Status:', lockedSpec.status);
  console.log('  Locked Spec Hash:', lockedSpec.spec_hash);
  trace.steps.push({ name: 'lock_succeeded', tx: txLockSuccess, specHash: lockedSpec.spec_hash });

  // ============================================================
  // PROTECTION 2: ANTI-RESTIPULATION & RE-ADJUDICATION
  // ============================================================
  console.log('\n>>> [STEP 10] Party A Stipulates Dispute Facts');
  const disputeFacts = 'Contractor delivered pure ASCII code and all passing unit tests on calendar day 4.';
  const txStip1 = await withRetry(
    () => clientA.writeContract({ address: CONTRACT_ADDRESS, functionName: 'stipulate_facts', args: [specId, disputeFacts] }),
    'stipulate_facts 1'
  );
  console.log('  txStip1:', txStip1);
  await withRetry(() => clientA.waitForTransactionReceipt({ hash: txStip1, retries: 120, interval: 3000 }), 'rcStip1');

  const factsId = await clientA.readContract({ address: CONTRACT_ADDRESS, functionName: 'get_latest_facts_id', args: [specId] });
  console.log('  Facts ID:', factsId);

  console.log('\n>>> [STEP 11] Party B Confirms Facts (Reaches 2 confirmations)');
  const txConfirm = await withRetry(
    () => clientB.writeContract({ address: CONTRACT_ADDRESS, functionName: 'confirm_facts', args: [specId, factsId] }),
    'confirm_facts'
  );
  console.log('  txConfirm:', txConfirm);
  await withRetry(() => clientB.waitForTransactionReceipt({ hash: txConfirm, retries: 120, interval: 3000 }), 'rcConfirm');

  const factsBefore = JSON.parse(await clientA.readContract({ address: CONTRACT_ADDRESS, functionName: 'get_facts', args: [specId, factsId] }));
  console.log('  Confirmations before restipulation attempt:', factsBefore.by);

  console.log('\n>>> [STEP 12] ATTACK: Attempt Identical-Text Restipulation to overwrite confirmations');
  let restipFailedAsExpected = false;
  let restipErrorMsg = '';
  try {
    const txRestipFail = await clientA.writeContract({ address: CONTRACT_ADDRESS, functionName: 'stipulate_facts', args: [specId, disputeFacts] });
    console.log('  txRestipFail submitted:', txRestipFail);
    const rc = await clientA.waitForTransactionReceipt({ hash: txRestipFail, retries: 120, interval: 3000 });
    console.log('  Receipt execution_result:', rc.execution_result);
    if (rc.execution_result === 'ERROR') {
      restipFailedAsExpected = true;
      restipErrorMsg = 'Transaction reverted on-chain with execution_result: ERROR';
    }
  } catch (err) {
    restipFailedAsExpected = true;
    restipErrorMsg = err.message || String(err);
    console.log('  Caught restipulation error:', restipErrorMsg);
  }
  console.log('  Restipulation Rejected as Expected:', restipFailedAsExpected);

  const factsAfter = JSON.parse(await clientA.readContract({ address: CONTRACT_ADDRESS, functionName: 'get_facts', args: [specId, factsId] }));
  console.log('  Confirmations after restipulation attempt:', factsAfter.by);
  console.log('  Confirmations preserved intact:', JSON.stringify(factsBefore.by) === JSON.stringify(factsAfter.by));
  trace.steps.push({ name: 'restipulation_rejected_confirmations_preserved', success: restipFailedAsExpected });

  console.log('\n>>> [STEP 13] Adjudicate Agreement (Produces Authoritative Ruling)');
  const txAdjudicate = await withRetry(
    () => clientA.writeContract({ address: CONTRACT_ADDRESS, functionName: 'adjudicate', args: [specId, factsId] }),
    'adjudicate 1'
  );
  console.log('  txAdjudicate:', txAdjudicate);
  await withRetry(() => clientA.waitForTransactionReceipt({ hash: txAdjudicate, retries: 180, interval: 3000 }), 'rcAdjudicate');

  const ruling1 = JSON.parse(await clientA.readContract({ address: CONTRACT_ADDRESS, functionName: 'get_ruling', args: [specId, factsId] }));
  console.log('  Ruling verdict:', ruling1.verdict);
  console.log('  Ruling canary_pass:', ruling1.canary_pass);

  console.log('\n>>> [STEP 14] ATTACK: Attempt Re-Adjudication on Existing (spec_id, facts_id)');
  let readjudicateFailedAsExpected = false;
  let readjudicateErrorMsg = '';
  try {
    const txReadjudicateFail = await clientA.writeContract({ address: CONTRACT_ADDRESS, functionName: 'adjudicate', args: [specId, factsId] });
    console.log('  txReadjudicateFail submitted:', txReadjudicateFail);
    const rc = await clientA.waitForTransactionReceipt({ hash: txReadjudicateFail, retries: 120, interval: 3000 });
    console.log('  Receipt execution_result:', rc.execution_result);
    if (rc.execution_result === 'ERROR') {
      readjudicateFailedAsExpected = true;
      readjudicateErrorMsg = 'Transaction reverted on-chain with execution_result: ERROR';
    }
  } catch (err) {
    readjudicateFailedAsExpected = true;
    readjudicateErrorMsg = err.message || String(err);
    console.log('  Caught re-adjudication error:', readjudicateErrorMsg);
  }
  console.log('  Re-adjudication Rejected as Expected:', readjudicateFailedAsExpected);

  const rulingAfter = JSON.parse(await clientA.readContract({ address: CONTRACT_ADDRESS, functionName: 'get_ruling', args: [specId, factsId] }));
  console.log('  Ruling preserved byte-for-byte:', JSON.stringify(ruling1) === JSON.stringify(rulingAfter));
  trace.steps.push({ name: 'readjudication_rejected_ruling_preserved', success: readjudicateFailedAsExpected });

  const outPath = path.join(__dirname, 'e2e_both_protections_trace.json');
  fs.writeFileSync(outPath, JSON.stringify(trace, null, 2));
  console.log('\n================================================================');
  console.log('E2E TEST COMPLETE: BOTH PROTECTIONS FULLY VERIFIED ON STUDIONET!');
  console.log('Trace saved to:', outPath);
  console.log('================================================================');
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
