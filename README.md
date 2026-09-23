# Agreement Studio

Agreement Studio is a pre-signing contract workbench that surfaces textual ambiguity and calibrates dispute adjudication through GenLayer multi-validator consensus.

- **Live DApp**: [https://agreement-studio-genlayer.vercel.app](https://agreement-studio-genlayer.vercel.app)
- **GitHub Repository (dApp)**: [https://github.com/huzyow155/agreement-studio-genlayer](https://github.com/huzyow155/agreement-studio-genlayer)
- **Canonical Smart Contract Repository**: [https://github.com/huzyow155/clauselab-genlayer](https://github.com/huzyow155/clauselab-genlayer)
- **Network**: GenLayer Studionet (Chain ID `61999`)
- **Studionet RPC**: `https://studio.genlayer.com/api`
- **Block Explorer**: [https://explorer-studio.genlayer.com/](https://explorer-studio.genlayer.com/)

---

## Smart Contracts

The application interacts with verified Intelligent Contracts deployed on GenLayer Studionet. Reference copies with identical on-chain source hashes are included in [`contracts-reference/`](contracts-reference/).

| Contract | Purpose | Studionet Address | Explorer Link | Reference Source | Canonical Repository |
|---|---|---|---|---|---|
| **ClauseLab** | Core Intelligent Contract executing adversarial scenario consensus and canary-calibrated dispute adjudication | `0xf227D68595178A2192888c85E3550fEff4b79406` | [View on Explorer](https://explorer-studio.genlayer.com/address/0xf227D68595178A2192888c85E3550fEff4b79406) | [`contracts-reference/ClauseLab.py`](contracts-reference/ClauseLab.py) | [clauselab-genlayer](https://github.com/huzyow155/clauselab-genlayer) |
| **ClauseLabConsumer** | Downstream contract consuming ClauseLab rulings and escalating to human arbitration if canary validation fails | `0x9Fe97e71A0eeF88594abDea901B978519C98df34` | [View on Explorer](https://explorer-studio.genlayer.com/address/0x9Fe97e71A0eeF88594abDea901B978519C98df34) | [`contracts-reference/ClauseLabConsumer.py`](contracts-reference/ClauseLabConsumer.py) | [clauselab-genlayer](https://github.com/huzyow155/clauselab-genlayer) |

### On-Chain Source Verification
Both reference files in `contracts-reference/` have been verified against the deployment transactions on GenLayer Studionet RPC (`eth_getTransactionByHash`):
- `ClauseLab.py` deploy tx: `0xf2d7bfa406a46cef66fa643a8eb3dae7f35e94efa0e622600a47c9cf494a89c2`  
  **Deployed Code SHA-256:** `984ec7509168e04dcb615f44c198648d3594665f1f5daf7ee15bc128e83b9f10` *(Exact Match)*
- `ClauseLabConsumer.py` deploy tx: `0x12adde0727804c01062fcb5be5c2b980afc70c1aa745cf2fb39f53a94a267406`  
  **Deployed Code SHA-256:** `0cb11e6c617b8e4686aff24af1f83fbf028350a31f1d95e7465b3e7914dd6438` *(Exact Match)*

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
   - Once at least 4 green scenarios exist across 2 labels and both parties have signed, click **Lock Spec** to finalize the contract text and compute its immutable hash digest.

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
