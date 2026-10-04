const { spawn } = require('child_process');
const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

async function wait(ms) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const cdpPort = 9466;
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'chrome-demo3-'));

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

  console.log('Navigating to Demo 3: https://agreement-studio-genlayer.vercel.app/app?spec=54bd67a9b46c');
  await sendCommand('Page.navigate', { url: 'https://agreement-studio-genlayer.vercel.app/app?spec=54bd67a9b46c' });

  // Poll until contract state is loaded (up to 20s)
  let loaded = false;
  for (let i = 0; i < 20; i++) {
    await wait(1000);
    const text = await evaluate(`document.body.innerText`);
    if (text && !text.includes('Loading contract state') && text.includes('Why is Lock disabled?')) {
      loaded = true;
      console.log(`Demo 3 loaded with lock disabled explanation in ${i + 1}s!`);
      break;
    }
  }

  const pageData = await evaluate(`
    JSON.stringify({
      title: document.title,
      url: window.location.href,
      specId: "54bd67a9b46c",
      hasLockDisabledPrompt: document.body.innerText.includes("Why is Lock disabled?"),
      hasRedScenarios: document.body.innerText.includes("Ambiguity or Mismatch") || document.body.innerText.includes("is red"),
      textSnippet: document.body.innerText.slice(0, 1400)
    })
  `);

  console.log('\n--- LIVE DEMO 3 PAGE DATA ---');
  const parsed = JSON.parse(pageData || '{}');
  console.log(JSON.stringify(parsed, null, 2));

  const shotRes = await sendCommand('Page.captureScreenshot', { format: 'png' });
  const base64Data = shotRes.result?.data;
  if (base64Data) {
    const shotPath = path.join(__dirname, 'live_prod_demo3_verified.png');
    fs.writeFileSync(shotPath, Buffer.from(base64Data, 'base64'));
    console.log('Demo 3 Screenshot saved to:', shotPath);
  }

  try { ws.close(); } catch(e) {}
  try { chromeProcess.kill(); } catch(e) {}
  try { fs.rmSync(tempDir, { recursive: true, force: true }); } catch(e) {}
}

main().catch(console.error);
