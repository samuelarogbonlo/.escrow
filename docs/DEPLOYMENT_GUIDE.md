# 🚀 Deployment Guide

Complete guide for deploying the `.escrow` smart contract to Polkadot parachains and connecting the frontend.

## 📋 **Prerequisites**

### **Development Tools**
- **Rust** 1.70+ with `wasm32-unknown-unknown` target
- **cargo-contract** 3.2.0+ (ink! contract tooling)
- **Node.js** 18+ and npm
- **Git**

### **Accounts & Tokens**
- **Polkadot.js** browser extension installed
- **Testnet account** with sufficient balance
- **USDT tokens** (for production) or test tokens

### **Install Required Tools**

```bash
# Install Rust
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source ~/.cargo/env

# Add WebAssembly target
rustup target add wasm32-unknown-unknown

# Install cargo-contract
cargo install --force --locked cargo-contract@3.2.0

# Verify installation
cargo contract --version
```

## 🏗️ **Contract Compilation**

### **1. Clone Repository**

```bash
git clone https://github.com/your-repo/escrow.git
cd escrow/contracts/escrow
```

### **2. Build Contract**

```bash
# Development build
cargo contract build

# Production build (optimized)
cargo contract build --release
```

**Output files:**
- `target/ink/escrow_contract.wasm` - Contract bytecode
- `target/ink/escrow_contract.json` - Contract metadata/ABI

### **3. Verify Build**

```bash
# Check contract size
ls -lh target/ink/escrow_contract.wasm

# Typical size: ~95KB
```

## 🌐 **Network Deployment**

### **Westend Testnet (Recommended for Testing)**

#### **Step 1: Setup Account**

1. **Install Polkadot.js Extension**
   - Visit [polkadot.js.org/extension](https://polkadot.js.org/extension/)
   - Install for your browser

2. **Create/Import Account**
   ```
   - Open extension → Create new account
   - Save seed phrase securely
   - Set network to "Westend"
   ```

3. **Get Testnet Tokens**
   - Visit [Westend Faucet](https://faucet.polkadot.io/)
   - Request WND tokens to your account
   - Wait for confirmation

#### **Step 2: Deploy via Polkadot.js Apps**

1. **Open Polkadot.js Apps**
   - Navigate to [polkadot.js.org/apps](https://polkadot.js.org/apps/)
   - Connect to Westend: `wss://westend-rpc.polkadot.io`

2. **Upload Contract**
   ```
   Developer → Contracts → Upload & deploy code
   
   Upload:
   - Contract bundle: escrow_contract.wasm
   - Contract metadata: escrow_contract.json
   ```

3. **Deploy Contract**
   ```
   Constructor: new
   Parameters:
   - fee_bps: 100            (1% fee)
   - fee_account: [your_account_id]
   - usdt_token: [usdt_contract_address]
   
   Value: 0 WND
   Gas limit: 100,000,000,000
   ```

4. **Confirm Deployment**
   - Sign transaction with your account
   - Wait for block confirmation
   - **Copy contract address** for later use

#### **Step 3: Verify Deployment**

```javascript
// Test contract call
const result = await contract.query.getEscrowCount(
  yourAccount,
  { value: 0, gasLimit: -1 }
);

console.log('Escrow count:', result.output.toHuman());
```

### **Alternative: CLI Deployment**

```bash
# Deploy using cargo-contract
cargo contract instantiate \
  --constructor new \
  --args 100 5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY 5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty \
  --suri "//Alice" \
  --url wss://westend-rpc.polkadot.io

# Response includes contract address
```

## 🔧 **Frontend Configuration**

### **Step 1: Install Dependencies**

```bash
cd ../../frontend
npm install
```

### **Step 2: Update Contract Configuration**

Edit `frontend/src/config/contract.ts`:

```typescript
export const CONTRACT_CONFIG = {
  // Replace with your deployed contract address
  address: '5GvRMZSLS6UzHwExFuw5Fw9Ybic1gRdWH9LFy79ssDbDiWvU',
  
  // Network configuration
  network: {
    name: 'Westend',
    rpcUrl: 'wss://westend-rpc.polkadot.io',
    ss58Format: 42,
  },
  
  // USDT token contract (update for production)
  usdtToken: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty',
  
  // Gas limits
  gasLimits: {
    createEscrow: 50_000_000_000,
    completeEscrow: 20_000_000_000,
    cancelEscrow: 20_000_000_000,
    query: 10_000_000_000,
  },
};
```

### **Step 3: Update Contract Metadata**

Copy the generated ABI to frontend:

```bash
# Copy contract metadata
cp ../contracts/escrow/target/ink/escrow_contract.json frontend/src/config/contract-abi.json
```

### **Step 4: Start Frontend**

```bash
# Development server
npm run dev

# Production build
npm run build
npm run preview
```

## 🧪 **Testing Deployment**

### **Basic Contract Tests**

```bash
cd contracts/escrow

# Run unit tests
cargo test

# Expected: All tests pass
```

### **Integration Testing**

```javascript
// Test in browser console (DevTools)
const testContractIntegration = async () => {
  // Connect to wallet
  const injected = await web3FromSource('polkadot-js');
  
  // Create test escrow
  const result = await contract.tx.createEscrow(
    { value: 0, gasLimit: 50_000_000_000 },
    'PROVIDER_ACCOUNT_ID',
    1000000 // 1 USDT (6 decimals)
  ).signAndSend(account, { signer: injected.signer });
  
  console.log('Transaction hash:', result.txHash);
};
```

### **Frontend Testing**

1. **Connect Wallet**
   - Open application
   - Click "Connect Wallet"
   - Authorize Polkadot.js extension

2. **Create Test Escrow**
   - Navigate to "Create Escrow"
   - Enter provider address
   - Set amount (e.g., 1.0 USDT)
   - Click "Create Escrow"

3. **Verify Transaction**
   - Check transaction in Polkadot.js Apps
   - Verify escrow appears in dashboard

## 📊 **Production Deployment**

### **Mainnet Considerations**

1. **Security Audit**
   - Conduct thorough code review
   - Professional security audit
   - Bug bounty program

2. **Gas Optimization**
   ```bash
   # Optimized build
   cargo contract build --release
   
   # Check contract size
   cargo contract info --manifest-path Cargo.toml
   ```

3. **Monitoring Setup**
   - Block explorer integration
   - Event monitoring
   - Error alerting

### **Polkadot Mainnet Deployment**

```bash
# Production deployment
cargo contract instantiate \
  --constructor new \
  --args 100 PRODUCTION_FEE_ACCOUNT PRODUCTION_USDT_TOKEN \
  --suri "YOUR_PRODUCTION_ACCOUNT" \
  --url wss://rpc.polkadot.io \
  --value 1000000000000  # 1 DOT for storage
```

### **Environment Variables**

Create `.env.production`:

```bash
VITE_CONTRACT_ADDRESS=YOUR_PRODUCTION_CONTRACT_ADDRESS
VITE_NETWORK_URL=wss://rpc.polkadot.io
VITE_USDT_CONTRACT=PRODUCTION_USDT_ADDRESS
VITE_NETWORK_NAME=Polkadot
```

## 🔐 **Security Checklist**

### **Pre-Deployment**
- [ ] Code reviewed by multiple developers
- [ ] All unit tests passing
- [ ] Integration tests on testnet
- [ ] Gas limits properly configured
- [ ] Error handling tested
- [ ] Emergency functions working

### **Post-Deployment**
- [ ] Contract address verified
- [ ] Basic functions tested on-chain
- [ ] Frontend connected successfully
- [ ] Event emissions working
- [ ] Fee collection functioning
- [ ] Pause/unpause mechanism tested

## 🚨 **Troubleshooting**

### **Common Issues**

#### **"Runtime error: Execution failed"**
```
Solution: Check gas limits and account balance
- Increase gas limit
- Ensure sufficient account balance
- Verify contract is not paused
```

#### **"Contract not found"**
```
Solution: Verify contract address and network
- Double-check contract address
- Confirm correct network connection
- Wait for block finalization
```

#### **"Insufficient allowance"**
```
Solution: USDT approval required
- Call USDT.approve(escrow_address, amount)
- Check current allowance
- Ensure sufficient USDT balance
```

### **Debug Commands**

```bash
# Check contract compilation
cargo contract check

# Validate metadata
cargo contract info

# Test specific function
cargo test test_create_escrow -- --nocapture
```

## 📋 **Deployment Checklist**

### **Pre-Deployment**
- [ ] Rust toolchain installed
- [ ] cargo-contract installed
- [ ] Contract compiled successfully
- [ ] Unit tests passing
- [ ] Testnet account funded
- [ ] USDT contract address identified

### **Deployment**
- [ ] Contract deployed to testnet
- [ ] Contract address recorded
- [ ] Basic function calls tested
- [ ] Events emitted correctly
- [ ] Fee mechanism working
- [ ] Frontend configuration updated

### **Post-Deployment**
- [ ] Integration tests completed
- [ ] Frontend connected successfully
- [ ] User flow tested end-to-end
- [ ] Error handling verified
- [ ] Documentation updated
- [ ] Team notified of deployment

## 📞 **Support**

### **Getting Help**

- **Documentation**: Check this guide and API reference
- **GitHub Issues**: Report bugs and feature requests
- **Discord**: Join community discussions
- **Email**: technical-support@escrow.polkadot.network

### **Emergency Procedures**

If you encounter critical issues:

1. **Pause Contract** (if you're the owner)
   ```javascript
   await contract.tx.pause();
   ```

2. **Contact Support** immediately
3. **Document the issue** with transaction hashes
4. **Preserve logs** and error messages

---

**Last Updated:** December 2024  
**Version:** 1.0.0  
**Network Support:** Westend, Rococo, Polkadot 

### 2. Deploy to Testnet

#### Constructor Parameters

The contract uses **tiered pricing** that automatically adjusts fees based on volume:

```rust
// Standard constructor with tiered pricing
EscrowContract::new(
    fee_bps: 100,              // Starting fee: 100 basis points = 1%
    fee_account: AccountId,    // Account to receive fees
    usdt_token: AccountId      // PSP22 USDT token contract address
)
```

**Tiered Fee Structure:**
- **Tier 0** (0 - $10M volume): 1.0% fee (100 basis points)
- **Tier 1** ($10M - $100M volume): 0.8% fee (80 basis points)  
- **Tier 2** ($100M+ volume): 0.5% fee (50 basis points)

*Note: The contract automatically updates fees as volume milestones are reached.* 