#!/usr/bin/env node
// Reads the latest Foundry broadcast for a given chain and emits a typed JSON file
// with the deployed contract addresses. Run after `forge script Deploy.s.sol --broadcast`.

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");

const CHAINS = {
  84532: "base-sepolia",
  8453: "base",
};

const chainId = process.argv[2];
if (!chainId || !CHAINS[chainId]) {
  console.error(`Usage: node sync-addresses.mjs <chainId>\nSupported: ${Object.keys(CHAINS).join(", ")}`);
  process.exit(1);
}
const chainName = CHAINS[chainId];

const broadcastPath = resolve(
  repoRoot,
  `contracts/broadcast/Deploy.s.sol/${chainId}/run-latest.json`
);
if (!existsSync(broadcastPath)) {
  console.error(`[sync-addresses] no broadcast for chain ${chainId}: ${broadcastPath}`);
  process.exit(1);
}

const broadcast = JSON.parse(readFileSync(broadcastPath, "utf8"));
const txs = broadcast.transactions ?? [];

// Foundry records each CREATE in `transactions[].contractName` and `contractAddress`.
// Last deployment of each contract wins (impl + proxy share contractName, but proxies use ERC1967Proxy).
const contracts = {};
for (const tx of txs) {
  if (tx.transactionType !== "CREATE" && tx.transactionType !== "CREATE2") continue;
  const name = tx.contractName;
  if (!name) continue;
  // Track impl + proxy separately. Heuristic: ERC1967Proxy txs are proxy deployments;
  // we tag them by the order they appear (first proxy = position, second = vault).
  if (name === "ERC1967Proxy") {
    if (!contracts.positionProxy) contracts.positionProxy = tx.contractAddress;
    else if (!contracts.vaultProxy) contracts.vaultProxy = tx.contractAddress;
  } else {
    contracts[name] = tx.contractAddress;
  }
}

const output = {
  chainId: Number(chainId),
  chainName,
  deployedAt: new Date().toISOString(),
  txHash: txs[txs.length - 1]?.hash ?? null,
  contracts: {
    HearstVault: contracts.vaultProxy ?? null,
    HearstVaultImpl: contracts.HearstVault ?? null,
    HearstPosition: contracts.positionProxy ?? null,
    HearstPositionImpl: contracts.HearstPosition ?? null,
  },
};

const outputDir = resolve(repoRoot, "src/config/contracts");
if (!existsSync(outputDir)) mkdirSync(outputDir, { recursive: true });
const outputPath = resolve(outputDir, `${chainName}.json`);
writeFileSync(outputPath, JSON.stringify(output, null, 2) + "\n");
console.log(`[sync-addresses] wrote ${outputPath}`);
console.log(JSON.stringify(output.contracts, null, 2));
