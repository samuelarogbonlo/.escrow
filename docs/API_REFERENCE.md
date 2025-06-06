# 📚 Smart Contract API Reference

Complete documentation for the `.escrow` ink! smart contract API.

## 📝 **Contract Overview**

The escrow contract provides secure, trustless escrow services using USDT tokens. All interactions are recorded on-chain with comprehensive event logging.

**Contract Address (Westend):** `5GvRMZSLS6UzHwExFuw5Fw9Ybic1gRdWH9LFy79ssDbDiWvU`

## 🏗️ **Data Structures**

### **EscrowData**

Primary data structure for escrow information.

```rust
pub struct EscrowData {
    pub client: AccountId,       // Escrow creator (funds provider)
    pub provider: AccountId,     // Service provider (funds recipient)
    pub amount: Balance,         // Total USDT amount in escrow
    pub status: EscrowStatus,    // Current escrow state
    pub created_at: Timestamp,   // Block timestamp of creation
}
```

### **EscrowStatus**

Enumeration of possible escrow states.

```rust
pub enum EscrowStatus {
    Active,     // Escrow is live, awaiting completion
    Completed,  // Funds released to provider
    Cancelled,  // Funds returned to client
    Disputed,   // Under dispute resolution (future)
}
```

### **EscrowError**

Error types returned by contract functions.

```rust
pub enum EscrowError {
    NotAuthorized,           // Caller lacks permission
    EscrowNotFound,          // Invalid escrow ID
    InvalidStatus,           // Operation not allowed in current state
    ContractPaused,          // Contract is paused by owner
    InsufficientBalance,     // Insufficient funds for operation
    TransferFailed,          // Native token transfer failed
    TokenTransferFailed,     // PSP22 token transfer failed
    InsufficientAllowance,   // Insufficient USDT allowance
    PSP22Error(PSP22Error),  // Underlying PSP22 error
}
```

## 🔧 **Constructor**

### **new**

Creates a new escrow contract instance.

```rust
#[ink(constructor)]
pub fn new(
    fee_bps: u16,           // Fee in basis points (50 = 0.5%)
    fee_account: AccountId, // Account to receive platform fees
    usdt_token: AccountId   // USDT token contract address
) -> Self
```

**Parameters:**
- `fee_bps`: Platform fee in basis points (50 = 0.5%)
- `fee_account`: AccountId to receive collected fees
- `usdt_token`: Address of PSP22 USDT token contract

**Example:**
```rust
// Create contract with 0.5% fee
let contract = EscrowContract::new(
    50,                              // 0.5% fee
    fee_collector_account,            // Fee recipient
    usdt_token_contract_address       // USDT contract
);
```

## 📋 **Core Functions**

### **create_escrow**

Creates a new escrow with USDT tokens.

```rust
#[ink(message)]
pub fn create_escrow(
    &mut self,
    provider: AccountId,  // Service provider address
    amount: Balance       // USDT amount to escrow
) -> Result<u32, EscrowError>
```

**Requirements:**
- Client must approve USDT spending for this contract first
- Contract must not be paused
- Amount must be greater than 0

**Returns:** 
- `Ok(u32)`: New escrow ID
- `Err(EscrowError)`: Error details

**Events Emitted:**
```rust
EscrowCreated {
    escrow_id: u32,
    client: AccountId,
    provider: AccountId,
    amount: Balance,
}
```

**Example:**
```javascript
// Frontend integration
const api = new ApiPromise(...);
const contract = new ContractPromise(api, abi, contractAddress);

// First approve USDT spending
await usdtContract.tx.approve(contractAddress, amount);

// Create escrow
const result = await contract.tx.createEscrow(
    { value: 0, gasLimit: -1 },
    providerAddress,
    amount
);
```

### **complete_escrow**

Releases funds to the service provider (client only).

```rust
#[ink(message)]
pub fn complete_escrow(
    &mut self,
    escrow_id: u32
) -> Result<(), EscrowError>
```

**Authorization:** Only the client (escrow creator) can call this.

**Requirements:**
- Escrow must exist
- Escrow status must be `Active`
- Contract must not be paused

**Actions:**
1. Calculates platform fee (amount × fee_bps ÷ 10000)
2. Transfers (amount - fee) to provider
3. Transfers fee to fee_account
4. Updates escrow status to `Completed`

**Events Emitted:**
```rust
EscrowCompleted {
    escrow_id: u32,
    amount: Balance,    // Amount sent to provider (after fee)
    fee: Balance,       // Fee collected
}
```

### **cancel_escrow**

Returns funds to the client (client or provider can call).

```rust
#[ink(message)]
pub fn cancel_escrow(
    &mut self,
    escrow_id: u32
) -> Result<(), EscrowError>
```

**Authorization:** Either client or provider can cancel.

**Requirements:**
- Escrow must exist
- Escrow status must be `Active`
- Contract must not be paused

**Actions:**
1. Returns full amount to client (no fees deducted)
2. Updates escrow status to `Cancelled`

**Events Emitted:**
```rust
EscrowCancelled {
    escrow_id: u32,
}
```

## 🔍 **Query Functions**

### **get_escrow**

Retrieves escrow details by ID.

```rust
#[ink(message)]
pub fn get_escrow(&self, escrow_id: u32) -> Option<EscrowData>
```

**Returns:**
- `Some(EscrowData)`: Escrow details if found
- `None`: Escrow doesn't exist

### **get_user_escrows**

Gets list of escrow IDs for a specific user.

```rust
#[ink(message)]
pub fn get_user_escrows(&self, user: AccountId) -> Vec<u32>
```

**Returns:** Vector of escrow IDs where user is either client or provider.

### **get_escrow_count**

Returns total number of escrows created.

```rust
#[ink(message)]
pub fn get_escrow_count(&self) -> u32
```

### **get_contract_balance**

Returns contract's current USDT balance.

```rust
#[ink(message)]
pub fn get_contract_balance(&self) -> Balance
```

## ⚙️ **Configuration Functions**

### **get_owner**

Returns contract owner address.

```rust
#[ink(message)]
pub fn get_owner(&self) -> AccountId
```

### **get_fee_bps**

Returns current platform fee in basis points.

```rust
#[ink(message)]
pub fn get_fee_bps(&self) -> u16
```

### **get_usdt_token**

Returns USDT token contract address.

```rust
#[ink(message)]
pub fn get_usdt_token(&self) -> AccountId
```

### **is_paused**

Returns contract pause status.

```rust
#[ink(message)]
pub fn is_paused(&self) -> bool
```

## 👑 **Owner Functions**

### **set_fee**

Updates platform fee (owner only).

```rust
#[ink(message)]
pub fn set_fee(&mut self, new_fee_bps: u16) -> Result<(), EscrowError>
```

### **set_usdt_token**

Updates USDT token contract address (owner only).

```rust
#[ink(message)]
pub fn set_usdt_token(&mut self, new_usdt_token: AccountId) -> Result<(), EscrowError>
```

### **pause**

Pauses contract operations (owner only).

```rust
#[ink(message)]
pub fn pause(&mut self) -> Result<(), EscrowError>
```

### **unpause**

Resumes contract operations (owner only).

```rust
#[ink(message)]
pub fn unpause(&mut self) -> Result<(), EscrowError>
```

### **emergency_withdraw**

Emergency token recovery function (owner only).

```rust
#[ink(message)]
pub fn emergency_withdraw(&mut self, amount: Balance) -> Result<(), EscrowError>
```

**⚠️ Warning:** This function should only be used in emergency situations.

## 📊 **Events**

### **EscrowCreated**

Emitted when a new escrow is created.

```rust
#[ink(event)]
pub struct EscrowCreated {
    #[ink(topic)]
    escrow_id: u32,
    #[ink(topic)]
    client: AccountId,
    #[ink(topic)]
    provider: AccountId,
    amount: Balance,
}
```

### **EscrowCompleted**

Emitted when an escrow is completed.

```rust
#[ink(event)]
pub struct EscrowCompleted {
    #[ink(topic)]
    escrow_id: u32,
    amount: Balance,  // Amount after fees
    fee: Balance,     // Fee collected
}
```

### **EscrowCancelled**

Emitted when an escrow is cancelled.

```rust
#[ink(event)]
pub struct EscrowCancelled {
    #[ink(topic)]
    escrow_id: u32,
}
```

## 🔗 **Integration Examples**

### **Frontend Integration (JavaScript)**

```javascript
import { ApiPromise, WsProvider } from '@polkadot/api';
import { ContractPromise } from '@polkadot/api-contract';

// Connect to Westend
const wsProvider = new WsProvider('wss://westend-rpc.polkadot.io');
const api = await ApiPromise.create({ provider: wsProvider });

// Contract setup
const contractAddress = '5GvRMZSLS6UzHwExFuw5Fw9Ybic1gRdWH9LFy79ssDbDiWvU';
const contract = new ContractPromise(api, abi, contractAddress);

// Create escrow
const createEscrow = async (provider, amount) => {
  const { result, output } = await contract.query.createEscrow(
    senderAddress,
    { value: 0, gasLimit: -1 },
    provider,
    amount
  );
  
  if (result.isOk) {
    // Submit transaction
    await contract.tx.createEscrow(
      { value: 0, gasLimit: output.gasRequired },
      provider,
      amount
    ).signAndSend(senderKeypair);
  }
};

// Query escrow
const getEscrow = async (escrowId) => {
  const { result, output } = await contract.query.getEscrow(
    senderAddress,
    { value: 0, gasLimit: -1 },
    escrowId
  );
  
  return result.isOk ? output.toHuman() : null;
};
```

### **Testing Integration (Rust)**

```rust
#[cfg(test)]
mod tests {
    use super::*;
    
    #[ink::test]
    fn test_complete_escrow_flow() {
        let accounts = ink::env::test::default_accounts::<ink::env::DefaultEnvironment>();
        let mut contract = EscrowContract::new(250, accounts.eve, accounts.django);
        
        // Create escrow
        let escrow_id = contract.create_escrow(accounts.bob, 10000).unwrap();
        assert_eq!(escrow_id, 0);
        
        // Verify escrow
        let escrow = contract.get_escrow(0).unwrap();
        assert_eq!(escrow.amount, 10000);
        assert!(matches!(escrow.status, EscrowStatus::Active));
        
        // Complete escrow
        contract.complete_escrow(0).unwrap();
        
        // Verify completion
        let escrow = contract.get_escrow(0).unwrap();
        assert!(matches!(escrow.status, EscrowStatus::Completed));
    }
}
```

## ⚡ **Gas Limits**

Recommended gas limits for contract operations:

| Operation | Gas Limit |
|-----------|-----------|
| `create_escrow` | 50,000,000,000 |
| `complete_escrow` | 20,000,000,000 |
| `cancel_escrow` | 20,000,000,000 |
| `get_escrow` | 10,000,000,000 |
| `get_user_escrows` | 10,000,000,000 |

## 🛡️ **Security Considerations**

1. **USDT Allowance**: Clients must approve USDT spending before creating escrows
2. **Access Control**: Only authorized parties can complete/cancel escrows
3. **Reentrancy**: Contract uses proper state updates before external calls
4. **Emergency Controls**: Owner can pause contract and withdraw stuck funds
5. **Input Validation**: All inputs are validated before processing

## 🐛 **Error Handling**

Always check for errors when calling contract functions:

```javascript
try {
  const result = await contract.tx.createEscrow(...);
  if (result.isError) {
    console.error('Transaction failed:', result.asError);
  }
} catch (error) {
  console.error('Contract call failed:', error);
}
```

## 📞 **Support**

For technical support or questions:
- **GitHub Issues**: 
- **Discord**: [Discord community](https://discord.gg/polkadot-escrow)
- **Email**: support@escrow.polkadot.network

---

**Last Updated:** December 2024  
**Contract Version:** 1.0.0  
**ink! Version:** 4.3.0 

## Overview

The `.escrow` contract implements automatic volume-based fee reduction:
- **Tier 0** (0 - $10M): 1.0% fee
- **Tier 1** ($10M - $100M): 0.8% fee
- **Tier 2** ($100M+): 0.5% fee

## Core Functions

### `create_escrow(provider: AccountId, amount: Balance) -> Result<u32, EscrowError>`

Creates a new escrow contract with USDT tokens. The fee is automatically calculated based on current volume tier.

**Parameters:**
- `provider`: Account that will receive payment upon completion
- `amount`: Amount in USDT (6 decimals, e.g., 1000000 = $1)

**Returns:** Escrow ID on success

**Example:**
```rust
// Create $1000 escrow - fee depends on current tier
let escrow_id = contract.create_escrow(provider_account, 1000 * 1_000_000)?;
```

### `complete_escrow(escrow_id: u32) -> Result<(), EscrowError>`

Completes an escrow, releasing funds to the provider minus the current tier fee. Automatically updates total volume and checks for tier progression.

**Internal Process:**
1. Updates `total_volume` with escrow amount
2. Calls `update_fee_tier()` to check for tier changes
3. Calculates fee using current tier rate
4. Transfers funds to provider and fee to fee account

**Parameters:**
- `escrow_id`: The escrow to complete

**Auth:** Only the client (escrow creator) can call this

**Example:**
```rust
// Complete escrow - fee calculated at current tier
contract.complete_escrow(escrow_id)?;
```

## Tiered Pricing Functions

### `get_current_tier() -> u8`

Returns the current fee tier (0, 1, or 2).

**Returns:**
- `0`: Tier 0 (1.0% fee)
- `1`: Tier 1 (0.8% fee)  
- `2`: Tier 2 (0.5% fee)

### `get_current_fee_percentage() -> String`

Returns human-readable fee percentage for current tier.

**Returns:** `"1.0%"`, `"0.8%"`, or `"0.5%"`

### `get_total_volume() -> Balance`

Returns total dollar value processed by the platform (in USDT with 6 decimals).

**Example:**
```rust
let volume = contract.get_total_volume();
// Convert to human readable: volume / 1_000_000 = dollars
```

### `get_volume_to_next_tier() -> Balance`

Returns the volume needed to reach the next lower fee tier.

**Returns:** 
- At Tier 0: Volume needed for Tier 1 ($10M - current_volume)
- At Tier 1: Volume needed for Tier 2 ($100M - current_volume)
- At Tier 2: `0` (already at lowest fee)

### `get_fee_bps() -> u16`

Returns current fee in basis points (100 = 1.0%, 80 = 0.8%, 50 = 0.5%).

## Fee Calculation Examples

### Tier 0 (Launch): 1.0% Fee
```rust
// $1000 escrow at 1.0% fee
let amount = 1000 * 1_000_000;     // $1000 in USDT
let fee = amount * 100 / 10000;    // $10 fee
let provider_amount = amount - fee; // $990 to provider
```

### Tier 1 (Growth): 0.8% Fee  
```rust
// $1000 escrow at 0.8% fee
let amount = 1000 * 1_000_000;     // $1000 in USDT
let fee = amount * 80 / 10000;     // $8 fee
let provider_amount = amount - fee; // $992 to provider
```

### Tier 2 (Scale): 0.5% Fee
```rust
// $1000 escrow at 0.5% fee
let amount = 1000 * 1_000_000;     // $1000 in USDT
let fee = amount * 50 / 10000;     // $5 fee
let provider_amount = amount - fee; // $995 to provider
```