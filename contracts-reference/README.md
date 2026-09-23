# Contracts Reference (Read-Only)

> **Notice**: The canonical source of truth, deployment history, and complete test suites live in the dedicated repository:  
> **[https://github.com/huzyow155/clauselab-genlayer](https://github.com/huzyow155/clauselab-genlayer)**.  
> The files in this folder are **unmodified read-only reference copies** provided solely so that evaluators and auditors can inspect the on-chain validator consensus logic, adversarial scenario evaluation, and canary-calibrated adjudication directly within this repository.

---

## 1. ClauseLab Intelligent Contract (`ClauseLab.py`)
- **File**: [`ClauseLab.py`](ClauseLab.py)
- **Canonical Repo Path**: [`contracts/ClauseLab.py`](https://github.com/huzyow155/clauselab-genlayer/blob/main/contracts/ClauseLab.py)
- **Deployed Address (studionet)**: [`0xf227D68595178A2192888c85E3550fEff4b79406`](https://explorer-studio.genlayer.com/address/0xf227D68595178A2192888c85E3550fEff4b79406)
- **Deploy Transaction**: [`0xf2d7bfa406a46cef66fa643a8eb3dae7f35e94efa0e622600a47c9cf494a89c2`](https://explorer-studio.genlayer.com/tx/0xf2d7bfa406a46cef66fa643a8eb3dae7f35e94efa0e622600a47c9cf494a89c2)
- **Deployed Python Source SHA-256 (from deployment tx via `eth_getTransactionByHash`)**:  
  `984ec7509168e04dcb615f44c198648d3594665f1f5daf7ee15bc128e83b9f10`
- **Purpose**: Autonomous Intelligent Contract running decentralized validator LLMs to surface contract ambiguity before signing via adversarial scenario testing and evaluate disputes using in-band canary calibration and strict equivalence consensus (`gl.eq_principle.strict_eq`).

---

## 2. ClauseLabConsumer Contract (`ClauseLabConsumer.py`)
- **File**: [`ClauseLabConsumer.py`](ClauseLabConsumer.py)
- **Canonical Repo Path**: [`examples/consumer/consumer.py`](https://github.com/huzyow155/clauselab-genlayer/blob/main/examples/consumer/consumer.py)
- **Deployed Address (studionet)**: [`0x9Fe97e71A0eeF88594abDea901B978519C98df34`](https://explorer-studio.genlayer.com/address/0x9Fe97e71A0eeF88594abDea901B978519C98df34)
- **Deploy Transaction**: [`0x12adde0727804c01062fcb5be5c2b980afc70c1aa745cf2fb39f53a94a267406`](https://explorer-studio.genlayer.com/tx/0x12adde0727804c01062fcb5be5c2b980afc70c1aa745cf2fb39f53a94a267406)
- **Deployed Python Source SHA-256 (from deployment tx via `eth_getTransactionByHash`)**:  
  `0cb11e6c617b8e4686aff24af1f83fbf028350a31f1d95e7465b3e7914dd6438`
- **Purpose**: Downstream consumer smart contract performing cross-contract view queries to ClauseLab via `gl.get_contract_at(clauselab_address).view().get_ruling(spec_id, facts_id)` and gating settlements or escalating to human arbitrators if the canary check fails or the verdict is `UNRELIABLE`.
