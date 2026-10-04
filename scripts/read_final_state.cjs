const { createClient, chains } = require('genlayer-js');
const client = createClient({ chain: chains.studionet });

async function main() {
  const specId = '6231570e7a32';
  const spec = await client.readContract({
    address: '0x13ac18867642fdCd740EA14c6EA7588abdCb7F73',
    functionName: 'get_spec',
    args: [specId]
  });
  console.log('=== GET_SPEC ===');
  console.log(spec);

  const factsIdRaw = await client.readContract({
    address: '0x13ac18867642fdCd740EA14c6EA7588abdCb7F73',
    functionName: 'get_latest_facts_id',
    args: [specId]
  });
  const factsId = typeof factsIdRaw === 'string' ? factsIdRaw.replace(/^"|"$/g, '') : factsIdRaw;
  console.log('=== LATEST_FACTS_ID ===');
  console.log(factsId);

  const facts = await client.readContract({
    address: '0x13ac18867642fdCd740EA14c6EA7588abdCb7F73',
    functionName: 'get_facts',
    args: [specId, factsId]
  });
  console.log('=== GET_FACTS ===');
  console.log(facts);

  const ruling = await client.readContract({
    address: '0x13ac18867642fdCd740EA14c6EA7588abdCb7F73',
    functionName: 'get_ruling',
    args: [specId, factsId]
  });
  console.log('=== GET_RULING ===');
  console.log(ruling);
}

main().catch(console.error);
