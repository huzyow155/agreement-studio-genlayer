# Agreement Studio

Agreement Studio is a pre-signing contract workbench that surfaces textual ambiguity and calibrates dispute adjudication through GenLayer multi-validator consensus.

- **Deployed Preview DApp (Studionet)**: [https://agreement-studio-genlayer.vercel.app](https://agreement-studio-genlayer.vercel.app)
  - `/` — Cinematic landing page with live on-chain preview teaser and protocol walkthrough
  - `/app` — Full interactive pre-signing and adjudication workbench
- **Contract Explorer**: [https://explorer-studio.genlayer.com/address/0x13ac18867642fdCd740EA14c6EA7588abdCb7F73](https://explorer-studio.genlayer.com/address/0x13ac18867642fdCd740EA14c6EA7588abdCb7F73)
- **GitHub Repository (dApp)**: [https://github.com/huzyow155/agreement-studio-genlayer](https://github.com/huzyow155/agreement-studio-genlayer)
- **Canonical Smart Contract Repository**: [https://github.com/huzyow155/clauselab-genlayer](https://github.com/huzyow155/clauselab-genlayer)
- **Network**: GenLayer Studionet (Chain ID `61999`)
- **Studionet RPC**: `https://studio.genlayer.com/api`
- **Block Explorer**: [https://explorer-studio.genlayer.com/](https://explorer-studio.genlayer.com/)

---

## Smart Contract

The core agreement verification engine is deployed on GenLayer Studionet:

- **ClauseLab Contract Address**: [`0x13ac18867642fdCd740EA14c6EA7588abdCb7F73`](https://explorer-studio.genlayer.com/address/0x13ac18867642fdCd740EA14c6EA7588abdCb7F73)
- **Purpose**: Executes adversarial scenario consensus and canary-calibrated dispute adjudication across independent LLM validators.
- **Reference Source**: [`contracts-reference/ClauseLab.py`](contracts-reference/ClauseLab.py) (matches deploy transaction `0xc5f20bf7...`)
- **Canonical Repo**: [huzyow155/clauselab-genlayer](https://github.com/huzyow155/clauselab-genlayer)

<details>
<summary><strong>Technical Details & Downstream Consumer Contract</strong></summary>

### Downstream Consumer
- **ClauseLabConsumer Address**: [`0x97B9c47d0d5750ff8d8FED3C846DB966e7b0ba0B`](https://explorer-studio.genlayer.com/address/0x97B9c47d0d5750ff8d8FED3C846DB966e7b0ba0B)
- **Purpose**: Consumes ClauseLab rulings and escalates to human arbitration if canary validation fails.
- **Reference Source**: [`contracts-reference/ClauseLabConsumer.py`](contracts-reference/ClauseLabConsumer.py)

### On-Chain Source Verification
- `ClauseLab.py` deploy tx: [`0xc5f20bf7bdd3d2569f1edfd0719d3d21fd98a128e976ce7a8d71b288aab391ec`](https://explorer-studio.genlayer.com/tx/0xc5f20bf7bdd3d2569f1edfd0719d3d21fd98a128e976ce7a8d71b288aab391ec)
- `ClauseLabConsumer.py` deploy tx: [`0xc6654e301e3f6599bdf76379c786804b7cc9e20051119aba1b18e8155d635d00`](https://explorer-studio.genlayer.com/tx/0xc6654e301e3f6599bdf76379c786804b7cc9e20051119aba1b18e8155d635d00)

</details>

---

## Wallet Funding & Studionet Gas

- **Read Operations are Free**: Loading specifications, checking scenario statuses, and inspecting on-chain adjudication rulings require zero GEN and do not require connecting a wallet.
- **Write Operations & Gas**: The Agreement Studio workflow does not custody or transfer GEN (no escrow, stake, or deposit methods). On GenLayer Studionet (Chain ID 61999), gas consumption is currently not enforced (RPC gas price returns `0x0`). Connected browser wallets (e.g. MetaMask / Rabby via EIP-6963) and backend scripts can broadcast transactions without requiring prior native token funding.
- **Funding & Faucet Guidance**:
  1. The standalone public GenLayer faucet (`testnet-faucet.genlayer.foundation`) targets the testnet Asimov/Bradbury (chain ID: xem docs.genlayer.com, chưa xác minh trong phiên này), **not** Studionet (Chain 61999).
  2. GenLayer Studio (`studio.genlayer.com`) operates in an interactive developer sandbox environment that explicitly does not support token transfers or require gas consumption.
  3. No faucet transfer is required to test Agreement Studio on Studionet: simply connect your browser wallet and approve the Studionet network settings.

---

## How to Try It (Step-by-Step Flow)

Agreement Studio guides counterparties through an intuitive 5-step agreement lifecycle:

```
[1. Draft] ──> [2. Lock] ──> [3. Facts] ──> [4. Adjudicate] ──> [5. Result]
```

1. **Step 1: Draft the Clause & Add Edge Cases**
   - The drafting party enters the proposed natural-language clause and allowed outcome labels (e.g. `DELIVERED`, `BREACH`).
   - Both parties propose concrete hypothetical edge cases ("scenarios") representing realistic disagreements.

2. **Step 2: Test Scenarios with Validators & Lock Agreement**
   - Click **Run Scenario** to have independent GenLayer validators evaluate each hypothetical case against the clause.
   - If validators find the text ambiguous or disagree on the outcome, the scenario turns **Red** (`UNDECIDABLE`).
   - If red scenarios appear, parties amend the wording until all scenarios turn **Green**.
   - Once at least 4 green scenarios exist across 2 labels and both parties have signed, click **Lock Spec** to finalize the contract text and compute its locked hash digest on-chain.

3. **Step 3: Stipulate & Confirm Disputed Facts**
   - If a real-world dispute arises after performance, one party submits the factual situation under **Stipulate Facts**.
   - The counterparty reviews the factual statement and clicks **Confirm Facts** (requires 2 distinct parties).

4. **Step 4: Run Canary-Calibrated Adjudication**
   - Click **Adjudicate Dispute** (~28s consensus).
   - In a single atomic consensus transaction, validators evaluate:
     - An **in-band canary**: a held-back settled scenario with a known outcome, verifying the judge model is calibrated.
     - The **disputed facts**: classifying the dispute against the locked clause.

5. **Step 5: Inspect Verified Ruling**
   - View the authoritative ruling card displaying:
     - **Adjudicated Verdict**: Canonical decision (`DELIVERED`, `BREACH`, or `UNRELIABLE` if the canary fails).
     - **In-Band Canary Calibration**: Clear `PASS (1)` or `FAIL (0)` indicator proving model integrity.
     - **Bound Spec Digest**: The exact clause hash digest bound to this judgment.
     - Direct link to the GenLayer Studionet block explorer.

---

## Adjudication Result Breakdown

The UI renders the real, verified on-chain fields returned by `get_ruling`:

```json
{
  "schema_version": "1.0",
  "spec_id": "20f3293644c0",
  "facts_id": "f1830b46947f",
  "verdict": "DELIVERED",
  "canary_pass": true,
  "spec_hash": "ca1a92e7a869960991fd9be2c797b3a8c21b6dfe0a11d7e4292bdad1bcd5571c"
}
```

- `verdict`: Strict equivalence result from validators (`DELIVERED`, `BREACH`, or `UNRELIABLE`).
- `canary_pass`: Boolean confirming the validator model correctly judged the held-back test case.
- `spec_hash`: SHA-256 digest binding the ruling to the locked agreement version.
- `facts_id`: Identifier of the mutually confirmed dispute facts.

---

## Verified End-to-End Workflow Performance

- **Total Execution Time**: Measured at **193.6s (~3.23 minutes)** on GenLayer Studionet across all 16 consecutive transactions in the full workflow (agreement creation through canary adjudication).
- **Wallet Switches**: Reconciled to exactly **3 wallet switches** (Consolidated Actor Flow: Party A → Party B → Party A → Party B).
- **Consensus Latency & Transaction Timing**:
  - Across all 16 consecutive transactions, average transaction completion latency was **~12.1s per transaction** (193.6s total / 16 transactions).
  - Estimated breakdown by operation type (broad estimates derived from the verified total execution run, not logged individually per-action):
    - Standard state writes (`create_spec`, `invite`, `sign`, `lock`, `confirm_facts`): typical ~3s – ~8s.
    - Validator LLM evaluation writes (`run_scenario`, `adjudicate`): typical ~12s – ~30s.

---

## Known Limitations

1. **Canary as a Signal, Not a Proof**: Passing the held-back canary scenario indicates that validator LLMs correctly classify known edge cases at adjudication time, but it does not mathematically prove perfect interpretation across all novel dispute contexts.
2. **Anchor Bias Not Measured**: While settled scenarios serve as few-shot exemplars to align model reasoning, production impact on validator agreement rates has not been formally measured, and skewed examples could bias interpretations.
3. **No External Fact-Finding**: ClauseLab and Agreement Studio do not independently scrape real-world APIs or verify physical actions; rulings operate strictly on facts mutually agreed upon and confirmed by both counterparties on-chain.
4. **Studionet Environment**: GenLayer Studionet is a test environment that may periodically undergo state resets by network operators.

---

## Running Locally

### Prerequisites
- Node.js >= 18
- npm or pnpm

### Quickstart
```bash
git clone https://github.com/huzyow155/agreement-studio-genlayer.git
cd agreement-studio-genlayer
npm install
npm run dev
```

### Building for Production
```bash
npm run build
```

---

## License

MIT License. Copyright (c) 2026 huzyow155.
