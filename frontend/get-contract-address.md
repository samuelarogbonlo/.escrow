# Get Your Contract Address

## Steps to find your contract address:

1. **Go to Contracts UI**: https://contracts-ui.substrate.io/
2. **Make sure you're on Aleph Zero Testnet**
3. **Look in the sidebar** for "Escrow Contract_v5"
4. **Click on it** and you'll see the contract address at the top
5. **Copy the address** (it looks like: `5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY`)

## Update the frontend:

1. **Edit**: `frontend/src/config/contract.ts`
2. **Replace**: `YOUR_CONTRACT_ADDRESS_HERE` 
3. **With**: Your actual contract address

## Example:
```typescript
ADDRESS: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY',
```

After updating the address, your frontend should be able to connect to your deployed contract!