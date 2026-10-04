# Contracts Reference (Read-Only)

> **Notice**: The canonical source of truth, deployment history, and complete test suites live in the dedicated repository:  
> **[https://github.com/huzyow155/clauselab-genlayer](https://github.com/huzyow155/clauselab-genlayer)**.  
> The files in this folder are **unmodified read-only reference copies** provided solely so that evaluators and auditors can inspect the on-chain validator consensus logic, adversarial scenario evaluation, and canary-calibrated adjudication directly within this repository.

---

## 1. ClauseLab Intelligent Contract (`ClauseLab.py`)
- **File**: [`ClauseLab.py`](ClauseLab.py)
- **Canonical Repo Path**: [`contracts/ClauseLab.py`](https://github.com/huzyow155/clauselab-genlayer/blob/main/contracts/ClauseLab.py)
- **Deployed Address (studionet)**: [`0x13ac18867642fdCd740EA14c6EA7588abdCb7F73`](https://explorer-studio.genlayer.com/address/0x13ac18867642fdCd740EA14c6EA7588abdCb7F73)
- **Deploy Transaction**: [`0xc5f20bf7bdd3d2569f1edfd0719d3d21fd98a128e976ce7a8d71b288aab391ec`](https://explorer-studio.genlayer.com/tx/0xc5f20bf7bdd3d2569f1edfd0719d3d21fd98a128e976ce7a8d71b288aab391ec)
- **Deployed Python Source SHA-256 (from deployment tx via `eth_getTransactionByHash`)**:  
  `812f70508bb321c0b27664f51055293fa08d5f737054111037d1a3294f034554`
- **Purpose**: Autonomous Intelligent Contract running decentralized validator LLMs to surface contract ambiguity before signing via adversarial scenario testing and evaluate disputes using in-band canary calibration and strict equivalence consensus (`gl.eq_principle.strict_eq`).

---

## 2. ClauseLabConsumer Contract (`ClauseLabConsumer.py`)
- **File**: [`ClauseLabConsumer.py`](ClauseLabConsumer.py)
- **Canonical Repo Path**: [`examples/consumer/consumer.py`](https://github.com/huzyow155/clauselab-genlayer/blob/main/examples/consumer/consumer.py)
- **Deployed Address (studionet)**: [`0x97B9c47d0d5750ff8d8FED3C846DB966e7b0ba0B`](https://explorer-studio.genlayer.com/address/0x97B9c47d0d5750ff8d8FED3C846DB966e7b0ba0B)
- **Deploy Transaction**: [`0xc6654e301e3f6599bdf76379c786804b7cc9e20051119aba1b18e8155d635d00`](https://explorer-studio.genlayer.com/tx/0xc6654e301e3f6599bdf76379c786804b7cc9e20051119aba1b18e8155d635d00)
- **Deployed Python Source SHA-256 (from deployment tx via `eth_getTransactionByHash`)**:  
  `0cb11e6c617b8e4686aff24af1f83fbf028350a31f1d95e7465b3e7914dd6438`
- **Purpose**: Downstream consumer smart contract performing cross-contract view queries to ClauseLab via `gl.get_contract_at(clauselab_address).view().get_ruling(spec_id, facts_id)` and gating settlements or escalating to human arbitrators if the canary check fails or the verdict is `UNRELIABLE`.
