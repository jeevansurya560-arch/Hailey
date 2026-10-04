#!/usr/bin/env bash
set -euo pipefail

# ==============================================================================
# scripts/redeploy-contract.sh
# Deploys HaileyContributions to Monad Testnet using Foundry.
# Usage:
#   export MONAD_RPC_URL="https://testnet-rpc.monad.xyz"
#   export ATTESTOR_ADDRESS="0x..."
#   export ATTESTOR_PRIVATE_KEY="0x..."
#   ./scripts/redeploy-contract.sh
# ==============================================================================

if [ -z "${MONAD_RPC_URL:-}" ] || [ -z "${ATTESTOR_PRIVATE_KEY:-}" ] || [ -z "${ATTESTOR_ADDRESS:-}" ]; then
  echo "Error: MONAD_RPC_URL, ATTESTOR_PRIVATE_KEY, and ATTESTOR_ADDRESS must be set in the environment."
  exit 1
fi

echo "Deploying HaileyContributions to Monad Testnet ($MONAD_RPC_URL)..."
echo "Attestor address: $ATTESTOR_ADDRESS"

cd contracts
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url "$MONAD_RPC_URL" \
  --private-key "$ATTESTOR_PRIVATE_KEY" \
  --broadcast \
  --verify false

echo "Deployment complete! Copy the deployed contract address to CONTRACT_ADDRESS and VITE_CONTRACT_ADDRESS in .env.local"
