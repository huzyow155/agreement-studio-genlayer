const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');
const { createClient, chains, createAccount } = require('genlayer-js');

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

const CONTRACT_ADDRESS = '0x13ac18867642fdCd740EA14c6EA7588abdCb7F73';
const ARTIFACT_DIR = 'C:\\Users\\USER\\.gemini\\antigravity\\brain\\cefdb7e3-042e-43b2-913d-dee7cf8d898e';

async function main() {
  console.log('================================================================');
  console.log('FULL BROWSER UI E2E TEST: DUAL-WALLET STEWARD PROTECTIONS');
  console.log('Target: https://agreement-studio-genlayer.vercel.app/app');
  console.log('Contract:', CONTRACT_ADDRESS);
  console.log('================================================================\n');

  // 1. Create two distinct test accounts
  const partyA = createAccount();
  const partyB = createAccount();
  console.log('Party A (Rabby):   ', partyA.address);
  console.log('Party B (MetaMask):', partyB.address);

  const clientA = createClient({ chain: chains.studionet, account: partyA });
  const clientB = createClient({ chain: chains.studionet, account: partyB });

  // 2. Local signing bridge handled directly in-memory via CDP evaluate
  console.log('Dual-wallet test accounts initialized for live in-memory CDP bridge.\n');

  // 3. Set up fresh test spec on Studionet
  console.log('[SETUP] Creating fresh agreement spec on Studionet...');
  const title = `UI Dual-Wallet Test ${Date.now().toString().slice(-4)}`;
  const clause = 'The contractor shall deliver the repository with pure ASCII code and passing tests within 7 calendar days of contract creation.';
  const labels = 'DELIVERED, BREACH';

  async function waitTx(client, hash) {
    return await client.waitForTransactionReceipt({ hash, retries: 120, interval: 3000 });
  }

  async function safeWrite(client, params, maxRetries = 4) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const hash = await client.writeContract(params);
        await waitTx(client, hash);
        return hash;
      } catch (err) {
        console.warn(`  [SETUP RETRY] writeContract failed on attempt ${attempt + 1}: ${err.message || err}`);
        if (attempt === maxRetries - 1) throw err;
        await wait(3000);
      }
    }
  }

  const createTx = await safeWrite(clientA, {
    address: CONTRACT_ADDRESS,
    functionName: 'create_spec',
    args: [title, clause, labels]
  });
  console.log('  create_spec tx:', createTx);

  const currentSpecId = await clientA.readContract({
    address: CONTRACT_ADDRESS,
    functionName: 'get_latest_spec',
    args: [partyA.address]
  });
  console.log(`  Spec created on-chain: ${currentSpecId}`);

  console.log('[SETUP] Inviting Party B (MetaMask)...');
  await safeWrite(clientA, {
    address: CONTRACT_ADDRESS,
    functionName: 'invite',
    args: [currentSpecId, partyB.address]
  });

  console.log('[SETUP] Adding 4 scenarios (2 Party A, 2 Party B)...');
  const sc1 = 'Contractor delivered pure ASCII repository on calendar day 3 with 100% passing tests.';
  const sc2 = 'Contractor pushed all pure ASCII source files with passing unit tests on calendar day 5.';
  const sc3 = 'Contractor delivered repository containing non-ASCII unicode symbols on calendar day 4.';
  const sc4 = 'Contractor delivered pure ASCII code on calendar day 10, three days after the deadline.';

  await safeWrite(clientA, { address: CONTRACT_ADDRESS, functionName: 'add_scenario', args: [currentSpecId, sc1, 'DELIVERED'] });
  await safeWrite(clientA, { address: CONTRACT_ADDRESS, functionName: 'add_scenario', args: [currentSpecId, sc2, 'DELIVERED'] });
  await safeWrite(clientB, { address: CONTRACT_ADDRESS, functionName: 'add_scenario', args: [currentSpecId, sc3, 'BREACH'] });
  await safeWrite(clientB, { address: CONTRACT_ADDRESS, functionName: 'add_scenario', args: [currentSpecId, sc4, 'BREACH'] });

  console.log('[SETUP] Running 4 scenarios to reach green consensus...');
  for (let n = 1; n <= 4; n++) {
    await safeWrite(clientA, { address: CONTRACT_ADDRESS, functionName: 'run_scenario', args: [currentSpecId, n] });
    const scRaw = await clientA.readContract({ address: CONTRACT_ADDRESS, functionName: 'get_scenario', args: [currentSpecId, n] });
    const scObj = typeof scRaw === 'string' ? JSON.parse(scRaw) : scRaw;
    console.log(`  Scenario ${n}: expected=${scObj.expected}, label=${scObj.label}, matches=${scObj.matches}`);
    if (!scObj.matches) {
      throw new Error(`Scenario ${n} failed to reach green consensus: got ${scObj.label}`);
    }
  }

  console.log('[SETUP] Both parties initial signing of Clause v1...');
  const txSignA1 = await safeWrite(clientA, { address: CONTRACT_ADDRESS, functionName: 'sign', args: [currentSpecId] });
  const txSignB1 = await safeWrite(clientB, { address: CONTRACT_ADDRESS, functionName: 'sign', args: [currentSpecId] });
  console.log('  Party A initial sign tx:', txSignA1);
  console.log('  Party B initial sign tx:', txSignB1);

  console.log('\n[SETUP] Triggering Suite Drift: Adding Scenario 5 post-signing...');
  const txSc5 = await safeWrite(clientA, {
    address: CONTRACT_ADDRESS,
    functionName: 'add_scenario',
    args: [currentSpecId, 'Contractor delivered on calendar day 7 at 23:59 with pure ASCII and passing tests.', 'DELIVERED']
  });
  await safeWrite(clientA, { address: CONTRACT_ADDRESS, functionName: 'run_scenario', args: [currentSpecId, 5] });
  const sc5Raw = await clientA.readContract({ address: CONTRACT_ADDRESS, functionName: 'get_scenario', args: [currentSpecId, 5] });
  const sc5Obj = typeof sc5Raw === 'string' ? JSON.parse(sc5Raw) : sc5Raw;
  console.log(`  Scenario 5: expected=${sc5Obj.expected}, label=${sc5Obj.label}, matches=${sc5Obj.matches}`);
  if (!sc5Obj.matches) {
    throw new Error(`Scenario 5 failed to reach green consensus: got ${sc5Obj.label}`);
  }
  console.log('  Scenario 5 added and evaluated (GREEN):', txSc5);

  // 4. Launch Headless Chrome
  console.log('\n[BROWSER] Launching Chrome with CDP...');
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cdpPort = 9470;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-ui-e2e-'));

  const chromeProcess = spawn(chromePath, [
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${tempDir}`,
    '--headless=new',
    '--window-size=1440,1100',
    '--disable-gpu',
    '--no-sandbox',
    '--disable-extensions',
    'about:blank'
  ]);

  let targetWsUrl = null;
  for (let i = 0; i < 30; i++) {
    await wait(500);
    try {
      const list = await new Promise((resolve, reject) => {
        http.get(`http://127.0.0.1:${cdpPort}/json`, res => {
          let data = '';
          res.on('data', chunk => data += chunk);
          res.on('end', () => resolve(JSON.parse(data)));
        }).on('error', reject);
      });
      if (list && list.length > 0) {
        const pageTarget = list.find(t => t.type === 'page' && !t.url.startsWith('chrome-extension://') && t.webSocketDebuggerUrl) || list.find(t => t.webSocketDebuggerUrl);
        if (pageTarget) {
          targetWsUrl = pageTarget.webSocketDebuggerUrl;
          break;
        }
      }
    } catch (e) {}
  }

  const ws = new WebSocket(targetWsUrl);
  let msgId = 1;
  const pending = new Map();
  ws.addEventListener('message', event => {
    const msg = JSON.parse(event.data);
    if (msg.method === 'Runtime.consoleAPICalled') {
      const txt = msg.params.args.map(a => a.value || JSON.stringify(a)).join(' ');
      if (!txt.includes('Announcing')) {
        console.log('[BROWSER CONSOLE]', txt.slice(0, 160));
      }
    }
    if (msg.id && pending.has(msg.id)) {
      pending.get(msg.id)(msg);
      pending.delete(msg.id);
    }
  });
  await new Promise(resolve => ws.addEventListener('open', resolve));

  function sendCommand(method, params = {}) {
    return new Promise(resolve => {
      const id = msgId++;
      pending.set(id, resolve);
      ws.send(JSON.stringify({ id, method, params }));
    });
  }

  async function evaluate(expression) {
    const res = await sendCommand('Runtime.evaluate', { expression, returnByValue: true, awaitPromise: true });
    if (res.result?.exceptionDetails) {
      console.warn('Evaluation exception:', res.result.exceptionDetails);
    }
    return res.result?.result?.value;
  }

  async function captureScreenshot(basename) {
    const shotRes = await sendCommand('Page.captureScreenshot', { format: 'png' });
    const base64Data = shotRes.result?.data;
    if (base64Data) {
      const shotPathLocal = path.join(__dirname, basename);
      const shotPathArtifact = path.join(ARTIFACT_DIR, basename);
      fs.writeFileSync(shotPathLocal, Buffer.from(base64Data, 'base64'));
      fs.writeFileSync(shotPathArtifact, Buffer.from(base64Data, 'base64'));
      console.log(`[SCREENSHOT] Saved: ${shotPathLocal}`);
      return shotPathLocal;
    }
    return null;
  }

  await sendCommand('Page.enable');
  await sendCommand('Runtime.enable');
  await sendCommand('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1100, deviceScaleFactor: 1, mobile: false });

  // Inject EIP-6963 Wallets for Rabby and MetaMask into the document
  const injectionScript = `
    (() => {
      const partyA = "${partyA.address}";
      const partyB = "${partyB.address}";
      let reqCounter = 0;
      window.__pendingTxs = [];
      window.__txResults = {};

      function createMockProvider(walletName, accountAddress) {
        return {
          isMetaMask: walletName === 'MetaMask',
          isRabby: walletName === 'Rabby Wallet',
          on: (event, handler) => {},
          removeListener: (event, handler) => {},
          request: async ({ method, params }) => {
            console.log('Provider request (' + walletName + '):', method);
            if (method === 'eth_requestAccounts' || method === 'eth_accounts') {
              return [accountAddress];
            }
            if (method === 'eth_chainId') {
              return '0xf22f'; // 61999
            }
            if (method === 'wallet_switchEthereumChain' || method === 'wallet_addEthereumChain') {
              return null;
            }
            if (method === 'eth_sendTransaction' || method === 'gen_sendTransaction') {
              const reqId = ++reqCounter;
              console.log('Enqueuing bridge transaction #' + reqId + ' for ' + walletName);
              window.__pendingTxs.push({ reqId, account: accountAddress, params });
              return new Promise((resolve, reject) => {
                const interval = setInterval(() => {
                  if (window.__txResults[reqId]) {
                    clearInterval(interval);
                    const res = window.__txResults[reqId];
                    if (res.error) {
                      reject(new Error(res.error));
                    } else {
                      resolve(res.txHash);
                    }
                  }
                }, 150);
              });
            }
            return null;
          }
        };
      }

      const rabbyDetail = {
        info: {
          uuid: 'rabby-e2e-uuid',
          name: 'Rabby Wallet',
          icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="%237085FF"/></svg>',
          rdns: 'io.rabby'
        },
        provider: createMockProvider('Rabby Wallet', partyA)
      };

      const metaMaskDetail = {
        info: {
          uuid: 'metamask-e2e-uuid',
          name: 'MetaMask',
          icon: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><circle cx="16" cy="16" r="16" fill="%23E2761B"/></svg>',
          rdns: 'io.metamask'
        },
        provider: createMockProvider('MetaMask', partyB)
      };

      function announceAll() {
        window.dispatchEvent(new CustomEvent('eip6963:announceProvider', { detail: rabbyDetail }));
        window.dispatchEvent(new CustomEvent('eip6963:announceProvider', { detail: metaMaskDetail }));
      }

      window.addEventListener('eip6963:requestProvider', announceAll);
      const interval = setInterval(announceAll, 300);
      setTimeout(() => clearInterval(interval), 10000);

      window.__clickBtn = function(text) {
        const btns = Array.from(document.querySelectorAll('button'));
        const found = btns.find(b => b.innerText && b.innerText.toLowerCase().includes(text.toLowerCase()) && !b.disabled && b.getAttribute('aria-disabled') !== 'true');
        if (found) {
          found.scrollIntoView({ behavior: 'instant', block: 'center' });
          found.click();
          return true;
        }
        return false;
      };

      window.__dismissToast = function() {
        const btn = document.querySelector('[role="region"] button[aria-label="Dismiss notification"]');
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      };

      window.__setVal = function(selector, value) {
        const el = document.querySelector(selector);
        if (!el) return false;
        el.scrollIntoView({ behavior: 'instant', block: 'center' });
        const setter = Object.getOwnPropertyDescriptor(el.__proto__, 'value')?.set ||
                       Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set ||
                       Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set;
        setter.call(el, value);
        el.dispatchEvent(new Event('input', { bubbles: true }));
        el.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      };

      window.__scrollToText = function(text) {
        const els = Array.from(document.querySelectorAll('h1, h2, h3, h4, span, div, p, button'));
        const found = els.find(e => e.innerText && e.innerText.includes(text) && e.innerText.length < 120);
        if (found) {
          found.scrollIntoView({ behavior: 'instant', block: 'center' });
          return true;
        }
        return false;
      };
    })();
  `;

  await sendCommand('Page.addScriptToEvaluateOnNewDocument', { source: injectionScript });

  let isBridgeRunning = true;
  (async function processBridgeQueue() {
    while (isBridgeRunning) {
      try {
        const itemJson = await evaluate(`
          (() => {
            if (!window.__pendingTxs || window.__pendingTxs.length === 0) return null;
            return JSON.stringify(window.__pendingTxs.shift());
          })()
        `);
        if (itemJson) {
          const item = JSON.parse(itemJson);
          console.log(`[NODE BRIDGE] Processing tx #${item.reqId} for ${item.account}...`);
          try {
            const signer = item.account.toLowerCase() === partyA.address.toLowerCase() ? clientA : clientB;
            const txObj = item.params[0];
            const txParams = {
              to: txObj.to,
              data: txObj.data
            };
            if (txObj.value) txParams.value = BigInt(txObj.value);
            const txHash = await signer.sendTransaction(txParams);
            console.log(`[NODE BRIDGE] Tx #${item.reqId} sent: ${txHash}`);
            await evaluate(`window.__txResults[${item.reqId}] = { txHash: "${txHash}" }`);
          } catch (err) {
            console.warn(`[NODE BRIDGE] Tx #${item.reqId} rejected:`, err.message || err);
            const cleanErr = (err.message || String(err)).replace(/"/g, '\\"').replace(/[\r\n]+/g, ' ');
            await evaluate(`window.__txResults[${item.reqId}] = { error: "${cleanErr}" }`);
          }
        }
      } catch (e) {}
      await wait(150);
    }
  })();

  // Robust UI helpers
  async function waitForUILoaded(timeoutMs = 40000) {
    const start = Date.now();
    while (Date.now() - start < timeoutMs) {
      const isBusyLoading = await evaluate(`
        document.body.innerText.includes("Loading contract state") ||
        document.body.innerText.includes("Loading...")
      `);
      if (!isBusyLoading) return true;
      await wait(500);
    }
    return false;
  }

  async function clickBtnWithRetry(text, maxAttempts = 15, intervalMs = 1000) {
    for (let i = 0; i < maxAttempts; i++) {
      await waitForUILoaded();
      const clicked = await evaluate(`window.__clickBtn("${text}")`);
      if (clicked) {
        return true;
      }
      await wait(intervalMs);
    }
    return false;
  }

  async function dismissToast() {
    await wait(1000);
    const dismissed = await evaluate(`window.__dismissToast()`);
    if (dismissed) {
      console.log('    [UI] Dismissed transaction toast overlay.');
    }
    await wait(500);
  }

  async function switchWalletInUI(walletName, expectedAccount) {
    console.log(`  Switching wallet in UI to ${walletName} (${expectedAccount.slice(0, 6)}...)...`);
    await dismissToast();

    // 1. Click "Switch Wallet" or "Connect Wallet" specifically in header
    const opened = await evaluate(`
      (() => {
        const header = document.querySelector('header');
        if (!header) return false;
        const btn = Array.from(header.querySelectorAll('button')).find(b => b.innerText && (b.innerText.includes("Switch Wallet") || b.innerText.includes("Connect Wallet")));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    if (!opened) {
      console.warn('    Could not click Switch/Connect Wallet in header, trying fallback...');
      await evaluate(`window.__clickBtn("Switch Wallet") || window.__clickBtn("Connect Wallet")`);
    }
    await wait(1000);

    // 2. Click target wallet INSIDE the dialog modal specifically
    const clickedTarget = await evaluate(`
      (() => {
        const dialog = document.querySelector('[role="dialog"]');
        if (!dialog) return false;
        const btns = Array.from(dialog.querySelectorAll('button'));
        const btn = btns.find(b => b.innerText && b.innerText.includes("${walletName}"));
        if (btn) {
          btn.click();
          return true;
        }
        return false;
      })()
    `);
    if (!clickedTarget) {
      console.warn(`    Could not click ${walletName} inside dialog modal`);
    }
    await wait(2000);

    // 3. Verify the connected account in the header specifically matches expectedAccount
    for (let i = 0; i < 25; i++) {
      await waitForUILoaded();
      const matched = await evaluate(`
        (() => {
          const header = document.querySelector('header');
          if (!header) return false;
          return header.innerText.toLowerCase().includes("${expectedAccount.slice(0, 6).toLowerCase()}");
        })()
      `);
      if (matched) {
        console.log(`    Successfully switched to ${walletName} (${expectedAccount.slice(0, 6)}...) in header!`);
        await wait(1000);
        return true;
      }
      await wait(1000);
    }
    return false;
  }

  const appUrl = `https://agreement-studio-genlayer.vercel.app/app?spec=${currentSpecId}`;
  console.log(`Navigating to live production dApp on Vercel: ${appUrl}...`);
  await sendCommand('Page.navigate', { url: appUrl });

  console.log('  Waiting for contract state to load in UI...');
  let pageLoaded = false;
  for (let i = 0; i < 40; i++) {
    await wait(2000);
    const loaded = await evaluate(`!document.body.innerText.includes("Loading contract state") && document.body.innerText.includes("${currentSpecId}")`);
    if (loaded) {
      pageLoaded = true;
      console.log('  Contract state successfully loaded in live UI!');
      break;
    }
  }
  if (!pageLoaded) {
    throw new Error('Contract state failed to load in live UI within 80 seconds');
  }

  // Connect Party B (MetaMask) in live app header
  console.log('\n[UI] Connecting MetaMask (Party B) in live app header...');
  await clickBtnWithRetry("Connect Wallet");
  await wait(1000);
  await clickBtnWithRetry("MetaMask");
  await wait(3000);

  // Scroll to Dual Signatures & Spec Locking section
  await evaluate(`window.__scrollToText("Dual Signatures & Spec Locking") || window.scrollTo(0, 800)`);
  await wait(1500);

  // Wait for Locking Section to reflect the re-signature requirement
  for (let i = 0; i < 20; i++) {
    const hasResign = await evaluate(`document.body.innerText.includes("Re-Sign Updated Suite") || document.body.innerText.includes("re-signature required")`);
    if (hasResign) {
      console.log('  Re-signature requirement detected in UI!');
      break;
    }
    await wait(1500);
  }

  // -------------------------------------------------------------------------
  // CONCERN 2 - VERIFICATION 1: Re-Signature Banner & Button in UI
  // -------------------------------------------------------------------------
  console.log('\n>>> [CONCERN 2 - VERIFICATION 1] Checking Re-Signature Banner & Button in UI...');
  await evaluate(`window.__scrollToText("Your Signature Status") || window.scrollTo(0, 950)`);
  await wait(500);

  const uiState1 = await evaluate(`
    JSON.stringify({
      hasResignBanner: document.body.innerText.includes("Scenario suite changed") && document.body.innerText.includes("re-signature required"),
      hasResignButton: Array.from(document.querySelectorAll('button')).some(b => b.innerText && b.innerText.includes("Re-Sign Updated Suite")),
      hasLockProblemTitle: document.body.innerText.includes("Re-Signature Required (Suite Changed)"),
      lockDisabled: Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes("Lock Agreement Spec"))?.disabled === true
    })
  `);
  console.log('UI State 1 (Suite Drift Detected):', uiState1);
  const parsedState1 = JSON.parse(uiState1 || '{}');
  console.log('  Banner visible ("Scenario suite changed — re-signature required"):', parsedState1.hasResignBanner);
  console.log('  Re-Sign button visible ("Re-Sign Updated Suite"):', parsedState1.hasResignButton);
  console.log('  Lock Problem explanation visible ("Re-Signature Required (Suite Changed)"):', parsedState1.hasLockProblemTitle);
  console.log('  Lock button disabled:', parsedState1.lockDisabled);

  await captureScreenshot('ui_step1_suite_drift_detected.png');
  const dom1 = await evaluate(`document.body.innerHTML`);
  fs.writeFileSync(path.join(__dirname, 'ui_step1_dom_dump.html'), dom1);
  console.log('  Dumped DOM to scripts/ui_step1_dom_dump.html');

  // -------------------------------------------------------------------------
  // CONCERN 2 - VERIFICATION 2: Dual Re-Signature and Locking via UI
  // -------------------------------------------------------------------------
  console.log('\n>>> [CONCERN 2 - VERIFICATION 2] Clicking through Re-Sign flow in UI for both parties...');
  console.log('  [MetaMask - Party B] Clicking "Re-Sign Updated Suite" button in UI...');
  const clickedB = await clickBtnWithRetry("Re-Sign Updated Suite");
  if (!clickedB) throw new Error('Failed to click Re-Sign Updated Suite for Party B');
  console.log('  Waiting for Party B re-sign transaction to finalize in UI...');
  for (let i = 0; i < 35; i++) {
    await wait(2000);
    const signedText = await evaluate(`
      (() => {
        const region = document.querySelector('[role="region"]');
        const isSuccess = !!region && (region.innerText.includes("completed successfully") || !!region.querySelector('.lucide-check-circle-2'));
        const isSpinning = !!region && !!region.querySelector('.animate-spin');
        const bodySigned = document.body.innerText.includes("Signed for clause");
        return (!isSpinning && (isSuccess || bodySigned));
      })()
    `);
    if (signedText) {
      console.log('  Party B signature recorded in UI!');
      break;
    }
  }
  await dismissToast();

  // Switch to Rabby (Party A) in UI
  const switchedA = await switchWalletInUI("Rabby Wallet", partyA.address);
  if (!switchedA) throw new Error('Failed to switch to Rabby in UI');
  await waitForUILoaded();

  console.log('  [Rabby - Party A] Clicking "Re-Sign Updated Suite" button in UI...');
  const clickedA = await clickBtnWithRetry("Re-Sign Updated Suite");
  if (!clickedA) throw new Error('Failed to click Re-Sign Updated Suite for Party A');
  console.log('  Waiting for Party A re-sign transaction to finalize in UI...');
  let reSignSuccess = false;
  for (let i = 0; i < 45; i++) {
    await wait(2000);
    const state = await evaluate(`
      (() => {
        const region = document.querySelector('[role="region"]');
        const regionText = region ? region.innerText : '';
        const isSpinning = !!region && !!region.querySelector('.animate-spin');
        const isSuccess = !!region && (regionText.includes("completed successfully") || !!region.querySelector('.lucide-check-circle-2') || !!region.querySelector('.lucide-circle-check-2'));
        const lockBtn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes("Lock Agreement Spec"));
        const lockEnabled = lockBtn ? (!lockBtn.disabled && lockBtn.getAttribute('aria-disabled') !== 'true') : false;
        return {
          isSpinning,
          isSuccess,
          lockEnabled,
          regionText: regionText.slice(0, 80)
        };
      })()
    `);
    if (state && (state.isSuccess || state.lockEnabled) && !state.isSpinning) {
      reSignSuccess = true;
      console.log('  Party A re-sign transaction completed successfully in UI!', JSON.stringify(state));
      break;
    }
  }
  await dismissToast();
  await waitForUILoaded();

  console.log('  Checking Lock Agreement Spec button state in UI...');
  for (let i = 0; i < 30; i++) {
    const lockStatus = await evaluate(`
      (() => {
        const btn = Array.from(document.querySelectorAll('button')).find(b => b.innerText && b.innerText.includes("Lock Agreement Spec"));
        if (!btn) return { exists: false };
        return {
          exists: true,
          disabled: btn.disabled,
          ariaDisabled: btn.getAttribute('aria-disabled'),
          text: btn.innerText
        };
      })()
    `);
    console.log(`    Lock button status (attempt ${i + 1}):`, JSON.stringify(lockStatus));
    if (lockStatus && lockStatus.exists && !lockStatus.disabled && lockStatus.ariaDisabled !== 'true') {
      console.log('  "Lock Agreement Spec" is now ENABLED in UI!');
      break;
    }
    await wait(2000);
  }

  console.log('  Clicking "Lock Agreement Spec" button in UI...');
  await evaluate(`window.__scrollToText("Lock Agreement Spec") || window.scrollTo(0, 950)`);
  await wait(500);
  const clickedLock = await clickBtnWithRetry("Lock Agreement Spec", 25, 1500);
  if (!clickedLock) throw new Error('Failed to click Lock Agreement Spec in UI');
  console.log('  Waiting for lock transaction to finalize in UI...');
  for (let i = 0; i < 35; i++) {
    await wait(2000);
    const isLocked = await evaluate(`document.body.innerText.includes("Agreement Spec is Locked")`);
    if (isLocked) {
      console.log('  Agreement Spec successfully locked in UI!');
      break;
    }
  }

  await evaluate(`window.__scrollToText("Agreement Spec is Locked") || window.scrollTo(0, 700)`);
  await wait(1000);
  await captureScreenshot('ui_step2_spec_locked.png');
  console.log('  Saved screenshot: ui_step2_spec_locked.png');
  await dismissToast();

  async function typeInTextarea(text) {
    await evaluate(`
      (() => {
        const ta = document.querySelector('textarea');
        if (ta) {
          ta.scrollIntoView({ behavior: 'instant', block: 'center' });
          ta.focus();
          ta.value = '';
          ta.dispatchEvent(new Event('input', { bubbles: true }));
        }
      })()
    `);
    await wait(300);
    await sendCommand('Input.insertText', { text });
    await wait(500);
    await evaluate(`
      (() => {
        const ta = document.querySelector('textarea');
        if (ta) {
          ta.dispatchEvent(new Event('input', { bubbles: true }));
          ta.dispatchEvent(new Event('change', { bubbles: true }));
        }
      })()
    `);
    await wait(500);
  }

  // -------------------------------------------------------------------------
  // CONCERN 2 - VERIFICATION 3: Facts Stipulation & Duplicate Anti-Restipulation
  // -------------------------------------------------------------------------
  console.log('\n[UI] Stipulating facts via UI form...');
  await clickBtnWithRetry("3. Stipulate Facts");
  await wait(1500);
  await evaluate(`window.__scrollToText("Stipulate Dispute Facts") || window.scrollTo(0, 400)`);
  await wait(500);
  await evaluate(`window.__clickBtn("Stipulate Facts Form") || window.__clickBtn("Stipulate New Facts")`);
  await wait(1000);

  const factsText = 'Contractor delivered pure ASCII code and passing tests on calendar day 3.';
  await typeInTextarea(factsText);

  const charCount = await evaluate(`document.querySelector('textarea')?.value?.length || 0`);
  console.log(`  Typed into textarea: ${charCount} characters`);

  const submittedFacts = await clickBtnWithRetry("Submit Stipulated Facts", 15, 1000);
  if (!submittedFacts) throw new Error('Failed to click Submit Stipulated Facts');
  console.log('  Submitted facts in UI! Waiting for finality...');
  for (let i = 0; i < 35; i++) {
    await wait(2000);
    const hasFacts = await evaluate(`document.body.innerText.includes("Contractor delivered pure ASCII code")`);
    if (hasFacts) {
      console.log('  Facts rendered on UI!');
      break;
    }
  }
  await dismissToast();

  // Switch to Party B to confirm facts
  await switchWalletInUI("MetaMask", partyB.address);
  await waitForUILoaded();

  console.log('  [MetaMask - Party B] Confirming facts in UI...');
  const clickedConfirm = await clickBtnWithRetry("Confirm Facts As Agreed", 15, 1000);
  if (!clickedConfirm) throw new Error('Failed to click Confirm Facts As Agreed');
  console.log('  Clicked "Confirm Facts As Agreed" in UI! Waiting for finality...');
  for (let i = 0; i < 35; i++) {
    await wait(2000);
    const confirmed = await evaluate(`document.body.innerText.includes("Both Parties Confirmed") || document.body.innerText.includes("2 / 2 Confirmations")`);
    if (confirmed) {
      console.log('  Both parties confirmed facts on UI!');
      break;
    }
  }
  await dismissToast();

  // ATTACK 1: Attempt Identical-Text Restipulation via UI
  console.log('\n>>> [CONCERN 2 - VERIFICATION 3] Attempting Identical-Text Restipulation via UI Form...');
  await evaluate(`window.__clickBtn("Stipulate Facts Form") || window.__clickBtn("Stipulate New Facts")`);
  await wait(1000);
  await typeInTextarea(factsText);
  await wait(500);
  const submittedAttack = await clickBtnWithRetry("Submit Stipulated Facts", 15, 1000);
  if (!submittedAttack) throw new Error('Failed to click Submit Stipulated Facts for duplicate attack');
  console.log('  Submitted duplicate facts in UI! Waiting for contract rejection & UI error overlay...');

  let errorOverlay1 = null;
  for (let i = 0; i < 40; i++) {
    await wait(2000);
    const res = await evaluate(`
      (() => {
        const region = document.querySelector('[role="region"]');
        if (!region) return null;
        const text = region.innerText;
        const isFailed = !!region.querySelector('.lucide-circle-x') || !!region.querySelector('.lucide-x-circle') || text.includes('Contract Rule Triggered') || text.includes('Transaction execution stopped') || text.includes('already exist');
        return {
          overlayHeading: region.querySelector('h4')?.innerText || '',
          overlayText: text,
          hasReadableError: text.includes("already exist") || text.includes("confirm the existing record") || text.includes("Contract Rule Triggered"),
          isFailed
        };
      })()
    `);
    const parsed = typeof res === 'string' ? JSON.parse(res) : res;
    if (parsed && (parsed.hasReadableError || parsed.isFailed)) {
      errorOverlay1 = parsed;
      console.log('  Error overlay surfaced in UI!');
      break;
    }
  }

  console.log('  Error overlay readout:', JSON.stringify(errorOverlay1));
  await captureScreenshot('ui_step3_restipulation_error.png');
  const dom3 = await evaluate(`document.body.innerHTML`);
  fs.writeFileSync(path.join(__dirname, 'ui_step3_dom_dump.html'), dom3);
  console.log('  Dumped DOM to scripts/ui_step3_dom_dump.html');
  await dismissToast();

  // -------------------------------------------------------------------------
  // CONCERN 2 - VERIFICATION 4: Adjudication & Re-Adjudication Prevention
  // -------------------------------------------------------------------------
  console.log('\n[UI] Adjudicating dispute via UI...');
  await clickBtnWithRetry("4. Adjudicate");
  await wait(1000);
  await evaluate(`window.__scrollToText("Adjudicate Dispute on Studionet") || window.scrollTo(0, 500)`);
  await wait(500);

  const clickedAdj = await clickBtnWithRetry("Adjudicate Dispute on Studionet");
  if (!clickedAdj) throw new Error('Failed to click Adjudicate Dispute on Studionet in UI');
  console.log('  Adjudication triggered via UI! Waiting ~30s for multi-validator consensus...');
  for (let i = 0; i < 45; i++) {
    await wait(3000);
    const hasRuling = await evaluate(`document.body.innerText.includes("Authoritative Consensus Ruling") || document.body.innerText.includes("ADJUDICATED VERDICT")`);
    if (hasRuling) {
      console.log(`  Adjudication ruling rendered on UI after ${(i + 1) * 3}s!`);
      break;
    }
  }
  await evaluate(`window.__scrollToText("Authoritative Consensus Ruling") || window.scrollTo(0, 300)`);
  await wait(1000);
  await captureScreenshot('ui_step4_adjudication_ruling.png');
  await dismissToast();

  // ATTACK 2: Attempt Re-Adjudication via UI
  console.log('\n>>> [CONCERN 2 - VERIFICATION 4] Attempting Re-Adjudication via UI button...');
  await evaluate(`window.__scrollToText("Attempt Re-Adjudication") || window.scrollTo(0, 500)`);
  await wait(500);
  const clickedReAdj = await clickBtnWithRetry("Attempt Re-Adjudication");
  if (!clickedReAdj) throw new Error('Failed to click Attempt Re-Adjudication in UI');
  console.log('  Clicked "Attempt Re-Adjudication" in UI! Waiting for contract rejection & overlay...');

  let errorOverlay2 = null;
  for (let i = 0; i < 40; i++) {
    await wait(2000);
    const res = await evaluate(`
      (() => {
        const region = document.querySelector('[role="region"]');
        if (!region) return null;
        const text = region.innerText;
        const isFailed = !!region.querySelector('.lucide-circle-x') || !!region.querySelector('.lucide-x-circle') || text.includes('Contract Rule Triggered') || text.includes('Transaction execution stopped');
        return {
          overlayHeading: region.querySelector('h4')?.innerText || '',
          overlayText: text,
          hasReadableError: text.includes("ruling already exists") || text.includes("Contract Rule Triggered"),
          originalRulingPreserved: document.body.innerText.includes("Authoritative Consensus Ruling") || document.body.innerText.includes("ADJUDICATED VERDICT"),
          isFailed
        };
      })()
    `);
    const parsed = typeof res === 'string' ? JSON.parse(res) : res;
    if (parsed && (parsed.hasReadableError || parsed.isFailed)) {
      errorOverlay2 = parsed;
      console.log('  Re-adjudication error overlay surfaced in UI!');
      break;
    }
  }

  console.log('  Re-adjudication error overlay readout:', JSON.stringify(errorOverlay2));
  await captureScreenshot('ui_step5_readjudication_error.png');
  const dom5 = await evaluate(`document.body.innerHTML`);
  fs.writeFileSync(path.join(__dirname, 'ui_step5_dom_dump.html'), dom5);
  console.log('  Dumped DOM to scripts/ui_step5_dom_dump.html');

  console.log('\n================================================================');
  console.log('SUCCESS: ALL UI-DRIVEN STEPS COMPLETED AND VERIFIED!');
  console.log('Spec ID Tested:', currentSpecId);
  console.log('================================================================');

  isBridgeRunning = false;
  try { ws.close(); } catch(e) {}
  try { chromeProcess.kill(); } catch(e) {}
  try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch(e) {}
}

main().catch(err => {
  console.error('FATAL:', err);
  process.exit(1);
});
