# 🔐 .escrow - Decentralized Escrow Platform

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![ink! version](https://img.shields.io/badge/ink!-5.1.1-blue)](https://use.ink/)
[![Build Status](https://img.shields.io/badge/build-passing-green)](https://github.com/your-repo/escrow)

A secure, transparent, and efficient escrow platform built on Polkadot for the global freelance economy. Features automatic **tiered pricing** that starts at 1% and decreases to 0.5% as platform volume grows.

## 🌟 **Overview**

.escrow is a trustless escrow solution that enables secure transactions between freelancers and clients without requiring intermediaries. Built using ink! smart contracts on Polkadot, it provides transparent, automated escrow services with minimal fees.

## 🚀 Key Features

- **Volume-Based Pricing**: 1% → 0.8% → 0.5% as we grow together
- **Lightning Fast**: 6-second settlement vs 5-10 days traditional
- **Truly Global**: Works anywhere with USDT stablecoins
- **Trustless**: Smart contracts handle everything automatically
- **Transparent**: All fees and volume milestones are public
- **Secure**: 30-day timelock protection and battle-tested contracts

### 🎯 **Use Cases**

- **Freelance Services** - Secure payments for completed work
- **Digital Products** - Safe transactions for software, designs, content
- **Consulting** - Milestone-based project payments
- **E-commerce** - Buyer protection for digital goods

### 💰 **USDT Integration**

- **Asset Hub Integration** - Native USDT support via runtime APIs
- **PSP22 Compatibility** - Works with standard token contracts  
- **Multi-Chain Ready** - Supports Polkadot, Kusama, and Aleph Zero
- **Precision Handling** - Accurate 6-decimal USDT calculations
- **Fee Optimization** - Minimized costs on Asset Hub chains

## 💰 **Pricing Tiers**

| Tier | Volume Range | Fee | Savings vs Traditional |
|------|--------------|-----|----------------------|
| 🚀 Launch | $0 - $10M | **1.0%** | 97% cheaper |
| 💪 Growth | $10M - $100M | **0.8%** | 98% cheaper |  
| 🏆 Scale | $100M+ | **0.5%** | 99% cheaper |

*Traditional escrow services charge 3.25% + take 5-10 days*

## 🏗️ **Architecture**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React Frontend │    │  ink! Contract   │    │  USDT Token     │
│   (TypeScript)   │◄──►│   (Escrow Logic) │◄──►│  (PSP22)        │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                        │                        │
         │                        │                        │
    ┌────▼────┐              ┌────▼────┐              ┌────▼────┐
    │ Wallet  │              │ Polkadot│              │ Token   │
    │Connect  │              │ Network │              │ Transfers│
    └─────────┘              └─────────┘              └─────────┘
```

## 🚀 **Quick Start**

### Prerequisites

- **Node.js** 18+ 
- **Rust** with `cargo-contract` 3.2.0+
- **Polkadot.js** browser extension
- **Git**

### 1️⃣ **Clone Repository**

```bash
git clone https://github.com/your-repo/escrow.git
cd escrow
```

### 2️⃣ **Setup Frontend**

```bash
cd frontend
npm install
npm run dev
```

Frontend will be available at `http://localhost:3000`

### 3️⃣ **Build Contracts**

```bash
cd contracts/escrow
cargo contract build
```

Compiled contract: `target/ink/escrow_contract.wasm`

### 4️⃣ **Deploy Contract**

See [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) for detailed instructions.

### 5️⃣ **Connect & Test**

1. Install Polkadot.js extension
2. Create/import account on Westend testnet
3. Get testnet tokens from faucet
4. Connect wallet to application
5. Create your first escrow!

## 📁 **Project Structure**

```
escrow/
├── 📁 contracts/           # Smart contracts
│   ├── 📁 escrow/         # Main escrow contract
│   │   ├── src/lib.rs     # Contract implementation
│   │   ├── Cargo.toml     # Dependencies
│   │   └── target/        # Compiled outputs
│   └── 📁 lib/           # Shared libraries
├── 📁 frontend/           # React application
│   ├── 📁 src/
│   │   ├── 📁 components/ # UI components  
│   │   ├── 📁 hooks/      # Contract integration
│   │   ├── 📁 config/     # Network & contract config
│   │   └── 📁 types/      # TypeScript definitions
│   ├── package.json      # Dependencies
│   └── public/           # Static assets
├── 📁 docs/              # Documentation
│   ├── API_REFERENCE.md  # Contract API docs
│   ├── DEPLOYMENT_GUIDE.md # Deployment instructions
│   └── PLATFORM_ARTICLE.md # Technical article
└── README.md             # This file
```

## 🔧 **Development**

### **Running Tests**

#### **Prerequisites for Frontend Testing**
First, install vitest globally (required for running frontend tests):

```bash
# Install vitest globally
npm install -g vitest

# Or install project dependencies (includes vitest as dev dependency)
cd frontend
npm install
```

#### **Running Tests**

```bash
# Contract tests (38 comprehensive tests including end-to-end workflow)
cd contracts/escrow
cargo test

# Frontend tests (35 tests all passing - requires vitest)
cd frontend
npm test

# Or run vitest directly
vitest

# Run tests in watch mode
vitest --watch

# Run tests with coverage
vitest --coverage
```

#### **Frontend Test Requirements**
The frontend tests use **Vitest** as the test runner. If you encounter `vitest: command not found`, ensure you have either:
1. Installed vitest globally: `npm install -g vitest`
2. Run via npm script: `npm test` (recommended)
3. Use npx: `npx vitest`

### **Local Development**

```bash
# Start mock API (for frontend development)
cd frontend
npm run server

# Start frontend dev server
npm run dev
```

### **Building for Production**

```bash
# Build optimized contract
cd contracts/escrow
cargo contract build --release

# Build frontend
cd frontend
npm run build
```

## 🌐 **Networks & USDT Integration**

| Network | Status | Contract Address | USDT Support |
|---------|--------|------------------|--------------|
| **Westend Asset Hub** | 🚧 Ready to Deploy | TBA | ✅ Runtime USDT (Asset ID 2022) |
| **Polkadot Asset Hub** | 🔮 Future | TBA | ✅ Runtime USDT (Asset ID 1984) |
| **Aleph Zero Testnet** | ✅ Active | `5GvRMZSLS6UzHwExFuw5Fw9Ybic1gRdWH9LFy79ssDbDiWvU` | ✅ PSP22 USDT |
| **Paseo Testnet** | ✅ Updated | TBA | ❌ No USDT (official Polkadot testnet) |

## 📋 **Smart Contract API**

### **Core Functions**

```rust
// Create new escrow
create_escrow(provider: AccountId, amount: Balance) -> Result<u32, EscrowError>

// Complete escrow (release funds)
complete_escrow(escrow_id: u32) -> Result<(), EscrowError>

// Cancel escrow (refund client)
cancel_escrow(escrow_id: u32) -> Result<(), EscrowError>

// Query escrow details
get_escrow(escrow_id: u32) -> Option<EscrowData>
```

See [API Reference](./docs/API_REFERENCE.md) for complete documentation.

## 🛡️ **Security**

- ✅ **Reentrancy Protection** - Safe external calls
- ✅ **Access Controls** - Role-based permissions  
- ✅ **Input Validation** - Comprehensive checks
- ✅ **Emergency Controls** - Pause/unpause functionality
- ✅ **Comprehensive Testing** - 38 unit tests + end-to-end workflow test
- ✅ **Code Auditing** - Peer-reviewed implementation

## 🤝 **Contributing**

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

### **Development Guidelines**

- Write tests for new features
- Follow Rust/TypeScript best practices
- Update documentation for API changes
- Ensure contracts compile without warnings

## 📖 **Documentation**

- 📚 [API Reference](./docs/API_REFERENCE.md) - Complete contract API
- 🚀 [Deployment Guide](./docs/DEPLOYMENT_GUIDE.md) - Step-by-step deployment
- 📝 [Platform Article](./docs/PLATFORM_ARTICLE.md) - Technical deep-dive
- 🧪 [Testing Guide](./docs/TESTING_GUIDE.md) - Testing procedures

## 🎉 **Roadmap**

### **Milestone 1** ✅ (Complete)
- Core escrow functionality with tiered pricing
- USDT integration (PSP22 + Asset Hub ready)
- Basic UI with 35 passing tests
- Testnet deployment on Aleph Zero
- Security fixes and comprehensive testing
- Dispute resolution and deadline extensions

### **Milestone 2** 🚧 (In Progress)  
- Advanced UI features and real-time updates
- Enhanced USDT integration with approval flows
- Mobile optimization and accessibility
- Analytics dashboard and user insights

### **Milestone 3** 🔮 (Planned)
- Governance features
- Cross-chain support
- Advanced analytics
- Mainnet launch

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 **Links**

- **Demo**: [https://escrow-demo.polkadot.network](https://escrow-demo.polkadot.network)
- **Documentation**: [https://docs.escrow.polkadot.network](https://docs.escrow.polkadot.network)
- **Discord**: [https://discord.gg/polkadot-escrow](https://discord.gg/polkadot-escrow)
- **Twitter**: [@PolkadotEscrow](https://twitter.com/PolkadotEscrow)

## 👨‍💻 **Authors**

- **Samuel Arogbonlo** - *Initial work* - [@sbayo971](https://github.com/sbayo971)

## 🙏 **Acknowledgments**

- Web3 Foundation for grant support
- Polkadot community for feedback
- ink! team for excellent tooling
- Parity Technologies for Substrate framework

---

**Built with ❤️ for the Polkadot ecosystem**

## 🔧 Smart Contract Features

### Automatic Tier Management
```rust
// Fees automatically decrease with volume
pub fn complete_escrow(&mut self, escrow_id: u32) -> Result<(), EscrowError> {
    // ... escrow completion logic ...
    
    // Update total volume and check for tier changes
    self.total_volume += escrow.amount;
    self.update_fee_tier();  // Auto-reduces fees at milestones
    
    // Calculate fee using current tier
    let fee = (escrow.amount * self.fee_bps as Balance) / 10000;
    // ...
}
```

### Volume Tracking & Transparency
```rust
pub fn get_current_tier(&self) -> u8;           // 0, 1, or 2
pub fn get_current_fee_percentage(&self) -> String; // "1.0%", "0.8%", "0.5%"
pub fn get_total_volume(&self) -> Balance;      // Total $ processed
pub fn get_volume_to_next_tier(&self) -> Balance; // $ until next tier
```

### Core Escrow Functions
- `create_escrow(provider, amount)` - Create new escrow with USDT
- `complete_escrow(escrow_id)` - Release funds to provider (client only)
- `cancel_escrow(escrow_id)` - Return funds to client (both parties)
- `process_expired_escrow(escrow_id)` - Handle expired escrows (30-day timelock)
- `flag_dispute(escrow_id, reason)` - Flag escrow for dispute resolution
- `request_deadline_extension(escrow_id, new_deadline, reason)` - Request deadline extension
- `approve_deadline_extension(escrow_id)` - Approve pending extension request

### Comprehensive Testing
The contract includes a complete end-to-end test (`comprehensive_usdt_integration_test`) that validates:
- USDT integration with 6-decimal precision 
- Asset Hub runtime asset support (Asset ID 1984/2022)
- PSP22 token contract compatibility
- Fee calculations across all pricing tiers
- Complete escrow workflow (create → complete → cancel)

### Security Features
- **Timelock Protection**: 30-day default expiration with customizable duration
- **Dispute Resolution**: Built-in dispute flagging and resolution workflow
- **Deadline Extensions**: Mutual consent deadline extension capability
- **Multi-signature Ready**: Owner controls for emergency situations
- **Pause Functionality**: Emergency stop mechanism
- **Allowance Security**: Fixed allowance reset vulnerability
- **Comprehensive Events**: Full audit trail for all transactions
- **PVM-Ready Architecture**: Future-proof for runtime API integration 