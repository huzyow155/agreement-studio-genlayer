const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cdpPort = 9460;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-live-browser-'));

  const chromeProcess = spawn(chromePath, [
    `--remote-debugging-port=${cdpPort}`,
    `--user-data-dir=${tempDir}`,
    '--headless=new',
    '--window-size=1280,1200',
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
    return res.result?.result?.value;
  }

  await sendCommand('Page.enable');
  await sendCommand('Runtime.enable');

  console.log('Navigating to live app: https://agreement-studio-genlayer.vercel.app/app');
  await sendCommand('Page.navigate', { url: 'https://agreement-studio-genlayer.vercel.app/app' });

  // Poll until contract state is loaded (up to 20s)
  console.log('Waiting for on-chain state to load...');
  let loaded = false;
  for (let i = 0; i < 20; i++) {
    await wait(1000);
    const text = await evaluate(`document.body.innerText`);
    if (text && !text.includes('Loading contract state') && text.includes('Agreement Spec is Locked')) {
      loaded = true;
      console.log(`Loaded in ${i + 1} seconds!`);
      break;
    }
  }

  const pageData = await evaluate(`
    JSON.stringify({
      title: document.title,
      url: window.location.href,
      specId: document.querySelector('strong')?.innerText || 'not found',
      isLocked: document.body.innerText.includes('Agreement Spec is Locked'),
      hasSpecHash: document.body.innerText.includes('ae27c70be11d'),
      hasAdjudicationRuling: document.body.innerText.includes('COMPLIANT'),
      hasCanaryPass: document.body.innerText.includes('Pass') || document.body.innerText.includes('Canary'),
      textSnippet: document.body.innerText.slice(0, 1200)
    })
  `);

  console.log('\n--- LIVE PAGE DATA ---');
  const parsed = JSON.parse(pageData || '{}');
  console.log(JSON.stringify(parsed, null, 2));

  // Capture screenshot of live production dApp
  const shotRes = await sendCommand('Page.captureScreenshot', { format: 'png' });
  const base64Data = shotRes.result?.data;
  if (base64Data) {
    const shotPath = path.join(__dirname, 'live_prod_app_verified.png');
    fs.writeFileSync(shotPath, Buffer.from(base64Data, 'base64'));
    console.log('\nSUCCESS! Screenshot saved to:', shotPath);
  } else {
    console.warn('Screenshot data was missing:', shotRes);
  }

  try { ws.close(); } catch(e) {}
  try { chromeProcess.kill(); } catch(e) {}
  try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch(e) {}
}

main().catch(console.error);
