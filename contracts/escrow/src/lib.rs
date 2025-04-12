#![cfg_attr(not(feature = "std"), no_std)]

use ink_lang as ink;

#[ink::contract]
mod escrow {
    use ink_storage::collections::HashMap;
    
    #[derive(Debug, PartialEq, Eq, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub enum EscrowStatus {
        Active,
        Completed,
        Cancelled,
    }
    
    #[ink(storage)]
    pub struct EscrowContract {
        escrows: HashMap<u128, EscrowData>,
        next_id: u128,
        owner: AccountId,
    }
    
    #[derive(Debug, scale::Encode, scale::Decode)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct EscrowData {
        client: AccountId,
        provider: AccountId,
        amount: Balance,
        status: EscrowStatus,
        timelock: Timestamp,
    }
    
    impl EscrowContract {
        #[ink(constructor)]
        pub fn new() -> Self {
            Self {
                escrows: HashMap::new(),
                next_id: 1,
                owner: Self::env().caller(),
            }
        }
        
        #[ink(message)]
        pub fn create_escrow(&mut self, provider: AccountId, timelock: Timestamp) -> u128 {
            let id = self.next_id;
            self.next_id += 1;
            
            self.escrows.insert(id, EscrowData {
                client: Self::env().caller(),
                provider,
                amount: 0,
                status: EscrowStatus::Active,
                timelock,
            });
            
            id
        }
    }
}
