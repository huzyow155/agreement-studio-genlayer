const https = require('https');

function fetch(url) {
  return new Promise((resolve, reject) => {
    https.get(url, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    }).on('error', reject);
  });
}

async function main() {
  console.log('=== VERIFYING LIVE PRODUCTION BUNDLE ON VERCEL ===');
  const liveUrl = 'https://agreement-studio-genlayer.vercel.app';
  console.log('Fetching:', liveUrl);

  const htmlRes = await fetch(liveUrl);
  console.log('HTML Status:', htmlRes.status);

  // Extract JS bundle URLs from HTML
  const scriptRegex = /src="(\/assets\/[^"]+\.js)"/g;
  let match;
  const scriptUrls = [];
  while ((match = scriptRegex.exec(htmlRes.data)) !== null) {
    scriptUrls.push(match[1]);
  }
  console.log('Found script assets in HTML:', scriptUrls);

  const NEW_CONTRACT = '0x13ac18867642fdCd740EA14c6EA7588abdCb7F73';
  const OLD_CONTRACT = '0xf227D68595178A2192888c85E3550fEff4b79406';

  let foundNewInLive = false;
  let foundOldInLive = false;

  for (const scriptPath of scriptUrls) {
    const fullUrl = `${liveUrl}${scriptPath}`;
    console.log(`\nFetching live asset: ${fullUrl}`);
    const scriptRes = await fetch(fullUrl);
    console.log(`Status: ${scriptRes.status}, Size: ${scriptRes.data.length} bytes`);

    if (scriptRes.data.includes(NEW_CONTRACT)) {
      console.log(`>>> CONFIRMED: Found new contract ${NEW_CONTRACT} in live bundle ${scriptPath}`);
      foundNewInLive = true;
    }
    if (scriptRes.data.includes(OLD_CONTRACT)) {
      console.log(`>>> WARNING: Found old contract ${OLD_CONTRACT} in live bundle ${scriptPath}`);
      foundOldInLive = true;
    }
    if (scriptRes.data.includes('dec354a729a0')) {
      console.log(`>>> CONFIRMED: Found Demo 2 spec_id (dec354a729a0) in live bundle`);
    }
    if (scriptRes.data.includes('54bd67a9b46c')) {
      console.log(`>>> CONFIRMED: Found Demo 3 spec_id (54bd67a9b46c) in live bundle`);
    }
  }

  console.log('\n=============================================');
  console.log('LIVE BUNDLE VERIFICATION REPORT:');
  console.log('New Contract (0x13ac...7F73) Present in Live Bundle:', foundNewInLive);
  console.log('Old Contract (0xf227...9406) Present in Live Bundle:', foundOldInLive);
  console.log('=============================================');

  if (foundNewInLive && !foundOldInLive) {
    console.log('PASS: Live production bundle is 100% verified serving the new contract!');
    process.exit(0);
  } else {
    console.error('FAIL: Bundle does not meet verification requirements.');
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
