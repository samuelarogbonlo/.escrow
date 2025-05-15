#![cfg_attr(not(feature = "std"), no_std)]

use ink::prelude::{
    string::String,
    vec::Vec,
};
use ink::storage::Mapping;
use openbrush::{
    contracts::{
        ownable::{self, *},
        psp22::{self, PSP22Ref},
    },
    modifiers,
    traits::{Storage, AccountId, Balance, Timestamp},
};
use escrow_lib::{
    Escrow as EscrowTrait,
    EscrowStatus,
    EscrowError,
    Milestone,
    MilestoneStatus,
};

// Define the storage for the contract
#[ink::contract]
pub mod escrow {
    use super::*;

    /// A single escrow between a client and a provider.
    #[derive(Debug, scale::Encode, scale::Decode, scale_info::TypeInfo)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct EscrowData {
        /// The ID of the escrow.
        pub id: u32,
        /// The client who created the escrow.
        pub client: AccountId,
        /// The provider who will receive the funds.
        pub provider: AccountId,
        /// The total amount of the escrow.
        pub amount: Balance,
        /// The token used for payment (PSP22 address).
        pub token: AccountId,
        /// The current status of the escrow.
        pub status: EscrowStatus,
        /// The milestones for the escrow.
        pub milestones: Vec<Milestone>,
        /// When the escrow was created.
        pub created_at: Timestamp,
        /// When the escrow was completed or cancelled (if applicable).
        pub completed_at: Option<Timestamp>,
    }

    /// A dispute related to an escrow.
    #[derive(Debug, scale::Encode, scale::Decode, scale_info::TypeInfo)]
    #[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
    pub struct Dispute {
        /// The ID of the dispute.
        pub id: u32,
        /// The escrow ID.
        pub escrow_id: u32,
        /// The milestone ID (if applicable).
        pub milestone_id: Option<u32>,
        /// The account that initiated the dispute.
        pub initiator: AccountId,
        /// The reason for the dispute.
        pub reason: Vec<u8>,
        /// When the dispute was created.
        pub created_at: Timestamp,
        /// When the dispute was resolved (if applicable).
        pub resolved_at: Option<Timestamp>,
    }

    /// The storage of the contract.
    #[ink(storage)]
    #[derive(Default, Storage)]
    pub struct EscrowContract {
        #[storage_field]
        ownable: ownable::Data,
        /// Counter for escrow IDs.
        escrow_count: u32,
        /// Counter for dispute IDs.
        dispute_count: u32,
        /// Mapping from escrow ID to escrow data.
        escrows: Mapping<u32, EscrowData>,
        /// Mapping from dispute ID to dispute data.
        disputes: Mapping<u32, Dispute>,
        /// Mapping from account to escrow IDs.
        user_escrows: Mapping<AccountId, Vec<u32>>,
        /// Platform fee percentage (in basis points, e.g., 50 = 0.5%).
        fee_bps: u16,
        /// The account where fees are sent.
        fee_account: AccountId,
    }

    /// Implementation of the contract.
    impl EscrowContract {
        /// Creates a new escrow contract.
        #[ink(constructor)]
        pub fn new(fee_bps: u16, fee_account: AccountId) -> Self {
            let mut instance = Self::default();
            instance.fee_bps = fee_bps;
            instance.fee_account = fee_account;
            let caller = Self::env().caller();
            ownable::Internal::_init_with_owner(&mut instance, caller);
            instance
        }

        /// Sets the platform fee percentage.
        #[ink(message)]
        #[modifiers(only_owner)]
        pub fn set_fee_bps(&mut self, fee_bps: u16) -> Result<(), EscrowError> {
            if fee_bps > 1000 {
                // Max 10%
                return Err(EscrowError::Custom(
                    String::from("Fee too high").into_bytes(),
                ));
            }
            self.fee_bps = fee_bps;
            Ok(())
        }

        /// Sets the fee account.
        #[ink(message)]
        #[modifiers(only_owner)]
        pub fn set_fee_account(&mut self, fee_account: AccountId) -> Result<(), EscrowError> {
            self.fee_account = fee_account;
            Ok(())
        }

        /// Calculates the fee for an amount.
        fn calculate_fee(&self, amount: Balance) -> Balance {
            amount * self.fee_bps as u128 / 10000
        }

        /// Resolves a dispute in favor of the client or provider.
        #[ink(message)]
        #[modifiers(only_owner)]
        pub fn resolve_dispute(&mut self, dispute_id: u32, in_favor_of_client: bool) -> Result<(), EscrowError> {
            let dispute = self.disputes.get(dispute_id).ok_or(EscrowError::Custom(
                String::from("Dispute not found").into_bytes(),
            ))?;

            let escrow_id = dispute.escrow_id;
            let mut escrow = self.escrows.get(escrow_id).ok_or(EscrowError::EscrowNotFound)?;

            if escrow.status != EscrowStatus::Disputed {
                return Err(EscrowError::InvalidEscrowStatus);
            }

            // Set escrow back to active
            escrow.status = EscrowStatus::Active;

            // If the dispute was about a specific milestone, handle it
            if let Some(milestone_id) = dispute.milestone_id {
                if milestone_id as usize >= escrow.milestones.len() {
                    return Err(EscrowError::MilestoneNotFound);
                }

                // Get the milestone
                let milestone = &mut escrow.milestones[milestone_id as usize];

                // If resolving in favor of client, keep milestone as pending
                // If resolving in favor of provider, mark milestone as completed
                if in_favor_of_client {
                    milestone.status = MilestoneStatus::Pending;
                } else {
                    milestone.status = MilestoneStatus::Completed;
                    milestone.completed_at = Some(self.env().block_timestamp());

                    // Release funds for the milestone
                    let token = PSP22Ref::new(escrow.token);
                    let fee = self.calculate_fee(milestone.amount);
                    let provider_amount = milestone.amount - fee;

                    if fee > 0 {
                        PSP22Ref::transfer(
                            &token,
                            self.fee_account,
                            fee,
                            Vec::<u8>::new(),
                        )?;
                    }

                    PSP22Ref::transfer(
                        &token,
                        escrow.provider,
                        provider_amount,
                        Vec::<u8>::new(),
                    )?;
                }
            }

            // Update dispute as resolved
            let mut updated_dispute = dispute;
            updated_dispute.resolved_at = Some(self.env().block_timestamp());
            self.disputes.insert(dispute_id, &updated_dispute);

            // Update escrow
            self.escrows.insert(escrow_id, &escrow);

            Ok(())
        }
    }

    /// Implementation of the Escrow trait.
    impl EscrowTrait for EscrowContract {
        /// Creates a new escrow between a client and provider.
        #[ink(message)]
        fn create_escrow(
            &mut self,
            provider: AccountId,
            amount: Balance,
            milestones: Vec<(Vec<u8>, Vec<u8>, u8, Option<Timestamp>)>,
            token_address: AccountId,
        ) -> Result<(), EscrowError> {
            let caller = self.env().caller();

            // Basic validation
            if provider == caller {
                return Err(EscrowError::Custom(
                    String::from("Client and provider cannot be the same").into_bytes(),
                ));
            }

            if amount == 0 {
                return Err(EscrowError::InvalidAmount);
            }

            if milestones.is_empty() {
                return Err(EscrowError::InvalidMilestones);
            }

            // Check that milestone percentages add up to 100%
            let total_percentage: u8 = milestones.iter().map(|(_, _, p, _)| p).sum();
            if total_percentage != 100 {
                return Err(EscrowError::InvalidMilestones);
            }

            // Create milestone objects
            let mut milestone_objects = Vec::new();
            let mut running_amount: Balance = 0;

            for (i, (title, description, percentage, deadline)) in milestones.iter().enumerate() {
                if *percentage == 0 || *percentage > 100 {
                    return Err(EscrowError::InvalidPercentage);
                }

                let milestone_amount = amount * (*percentage as u128) / 100;
                running_amount += milestone_amount;

                // Handle potential rounding errors for the last milestone
                let final_amount = if i == milestones.len() - 1 {
                    milestone_amount + (amount - running_amount)
                } else {
                    milestone_amount
                };

                milestone_objects.push(Milestone {
                    title: title.clone(),
                    description: description.clone(),
                    percentage: *percentage,
                    amount: final_amount,
                    status: MilestoneStatus::Pending,
                    deadline: *deadline,
                    completed_at: None,
                });
            }

            // Transfer tokens to contract
            let token = PSP22Ref::new(token_address);
            PSP22Ref::transfer_from(
                &token,
                caller,
                Self::env().account_id(),
                amount,
                Vec::<u8>::new(),
            )?;

            // Create the escrow
            let escrow_id = self.escrow_count;
            self.escrow_count += 1;

            let escrow = EscrowData {
                id: escrow_id,
                client: caller,
                provider,
                amount,
                token: token_address,
                status: EscrowStatus::Active,
                milestones: milestone_objects,
                created_at: self.env().block_timestamp(),
                completed_at: None,
            };

            // Store the escrow
            self.escrows.insert(escrow_id, &escrow);

            // Update user escrows
            let mut client_escrows = self.user_escrows.get(caller).unwrap_or_default();
            client_escrows.push(escrow_id);
            self.user_escrows.insert(caller, &client_escrows);

            let mut provider_escrows = self.user_escrows.get(provider).unwrap_or_default();
            provider_escrows.push(escrow_id);
            self.user_escrows.insert(provider, &provider_escrows);

            Ok(())
        }

        /// Releases funds for a completed milestone.
        #[ink(message)]
        fn release_milestone(&mut self, escrow_id: u32, milestone_id: u32) -> Result<(), EscrowError> {
            let caller = self.env().caller();
            let mut escrow = self.escrows.get(escrow_id).ok_or(EscrowError::EscrowNotFound)?;

            // Check that caller is the client
            if caller != escrow.client {
                return Err(EscrowError::NotAuthorized);
            }

            // Check escrow status
            if escrow.status != EscrowStatus::Active {
                return Err(EscrowError::InvalidEscrowStatus);
            }

            // Check milestone exists
            if milestone_id as usize >= escrow.milestones.len() {
                return Err(EscrowError::MilestoneNotFound);
            }

            // Check milestone status
            let milestone = &mut escrow.milestones[milestone_id as usize];
            if milestone.status != MilestoneStatus::Pending {
                return Err(EscrowError::InvalidMilestoneStatus);
            }

            // Update milestone status
            milestone.status = MilestoneStatus::Completed;
            milestone.completed_at = Some(self.env().block_timestamp());

            // Transfer funds to provider
            let token = PSP22Ref::new(escrow.token);
            let fee = self.calculate_fee(milestone.amount);
            let provider_amount = milestone.amount - fee;

            if fee > 0 {
                PSP22Ref::transfer(
                    &token,
                    self.fee_account,
                    fee,
                    Vec::<u8>::new(),
                )?;
            }

            PSP22Ref::transfer(
                &token,
                escrow.provider,
                provider_amount,
                Vec::<u8>::new(),
            )?;

            // Check if all milestones are completed
            let all_completed = escrow
                .milestones
                .iter()
                .all(|m| m.status == MilestoneStatus::Completed);

            if all_completed {
                escrow.status = EscrowStatus::Completed;
                escrow.completed_at = Some(self.env().block_timestamp());
            }

            // Update escrow
            self.escrows.insert(escrow_id, &escrow);

            Ok(())
        }

        /// Confirms completion of a milestone by the provider.
        #[ink(message)]
        fn confirm_milestone(&mut self, escrow_id: u32, milestone_id: u32) -> Result<(), EscrowError> {
            let caller = self.env().caller();
            let escrow = self.escrows.get(escrow_id).ok_or(EscrowError::EscrowNotFound)?;

            // Check that caller is the provider
            if caller != escrow.provider {
                return Err(EscrowError::NotAuthorized);
            }

            // Check escrow status
            if escrow.status != EscrowStatus::Active {
                return Err(EscrowError::InvalidEscrowStatus);
            }

            // Nothing to do here, just emit an event to notify the client
            // that the provider has completed the milestone

            Ok(())
        }

        /// Cancels an escrow by mutual agreement.
        #[ink(message)]
        fn cancel_escrow(&mut self, escrow_id: u32) -> Result<(), EscrowError> {
            let caller = self.env().caller();
            let mut escrow = self.escrows.get(escrow_id).ok_or(EscrowError::EscrowNotFound)?;

            // Check that caller is either the client or provider
            if caller != escrow.client && caller != escrow.provider {
                return Err(EscrowError::NotAuthorized);
            }

            // Check escrow status
            if escrow.status != EscrowStatus::Active {
                return Err(EscrowError::InvalidEscrowStatus);
            }

            // Calculate remaining funds
            let released_amount: Balance = escrow
                .milestones
                .iter()
                .filter(|m| m.status == MilestoneStatus::Completed)
                .map(|m| m.amount)
                .sum();

            let remaining_amount = escrow.amount - released_amount;

            // Return remaining funds to client
            if remaining_amount > 0 {
                let token = PSP22Ref::new(escrow.token);
                PSP22Ref::transfer(
                    &token,
                    escrow.client,
                    remaining_amount,
                    Vec::<u8>::new(),
                )?;
            }

            // Update escrow status
            escrow.status = EscrowStatus::Cancelled;
            escrow.completed_at = Some(self.env().block_timestamp());

            // Update escrow
            self.escrows.insert(escrow_id, &escrow);

            Ok(())
        }

        /// Creates a dispute for an escrow.
        #[ink(message)]
        fn create_dispute(&mut self, escrow_id: u32, milestone_id: u32, reason: Vec<u8>) -> Result<(), EscrowError> {
            let caller = self.env().caller();
            let mut escrow = self.escrows.get(escrow_id).ok_or(EscrowError::EscrowNotFound)?;

            // Check that caller is either the client or provider
            if caller != escrow.client && caller != escrow.provider {
                return Err(EscrowError::NotAuthorized);
            }

            // Check escrow status
            if escrow.status != EscrowStatus::Active {
                return Err(EscrowError::InvalidEscrowStatus);
            }

            // Check milestone exists
            if milestone_id as usize >= escrow.milestones.len() {
                return Err(EscrowError::MilestoneNotFound);
            }

            // Update escrow status
            escrow.status = EscrowStatus::Disputed;
            let milestone = &mut escrow.milestones[milestone_id as usize];
            milestone.status = MilestoneStatus::Disputed;

            // Create dispute
            let dispute_id = self.dispute_count;
            self.dispute_count += 1;

            let dispute = Dispute {
                id: dispute_id,
                escrow_id,
                milestone_id: Some(milestone_id),
                initiator: caller,
                reason,
                created_at: self.env().block_timestamp(),
                resolved_at: None,
            };

            // Store the dispute
            self.disputes.insert(dispute_id, &dispute);

            // Update escrow
            self.escrows.insert(escrow_id, &escrow);

            Ok(())
        }

        /// Gets an escrow by ID.
        #[ink(message)]
        fn get_escrow(&self, escrow_id: u32) -> Result<Vec<u8>, EscrowError> {
            let escrow = self.escrows.get(escrow_id).ok_or(EscrowError::EscrowNotFound)?;
            Ok(scale::Encode::encode(&escrow))
        }

        /// Gets all escrows for a user.
        #[ink(message)]
        fn get_user_escrows(&self, user: AccountId) -> Vec<u32> {
            self.user_escrows.get(user).unwrap_or_default()
        }
    }

    #[cfg(test)]
    mod tests {
        use super::*;
        use ink::env::{test, DefaultEnvironment};

        // Helper function to create a test contract
        fn create_contract() -> EscrowContract {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            EscrowContract::new(50, accounts.charlie) // 0.5% fee
        }

        #[ink::test]
        fn constructor_works() {
            let accounts = test::default_accounts::<DefaultEnvironment>();
            let escrow = create_contract();
            assert_eq!(escrow.fee_bps, 50);
            assert_eq!(escrow.fee_account, accounts.charlie);
            assert_eq!(escrow.escrow_count, 0);
            assert_eq!(escrow.dispute_count, 0);
        }

        // More tests would be implemented here
    }
} 