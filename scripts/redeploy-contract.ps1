# ==============================================================================
# scripts/redeploy-contract.ps1
# Deploys HaileyContributions to Monad Testnet using Foundry on Windows.
# ==============================================================================

if (-not $env:MONAD_RPC_URL -or -not $env:ATTESTOR_PRIVATE_KEY -or -not $env:ATTESTOR_ADDRESS) {
    Write-Error "Error: MONAD_RPC_URL, ATTESTOR_PRIVATE_KEY, and ATTESTOR_ADDRESS must be set in your environment or .env.local."
    exit 1
}

Write-Host "Deploying HaileyContributions to Monad Testnet ($env:MONAD_RPC_URL)..." -ForegroundColor Cyan
Write-Host "Attestor address: $env:ATTESTOR_ADDRESS" -ForegroundColor Gray

Push-Location "contracts"
try {
    forge script script/Deploy.s.sol:DeployScript `
      --rpc-url "$env:MONAD_RPC_URL" `
      --private-key "$env:ATTESTOR_PRIVATE_KEY" `
      --broadcast `
      --verify $false
} finally {
    Pop-Location
}

Write-Host "Deployment finished! Copy the deployed address into CONTRACT_ADDRESS in .env.local" -ForegroundColor Green
