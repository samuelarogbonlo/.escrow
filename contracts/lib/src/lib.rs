#![cfg_attr(not(feature = "std"), no_std)]

use ink::prelude::vec::Vec;
use openbrush::traits::AccountId;
use openbrush::traits::Balance;
use openbrush::traits::Timestamp;
use openbrush::contracts::psp22::PSP22Error;
use scale::{Decode, Encode};

/// The status of an escrow.
#[derive(Debug, PartialEq, Eq, Encode, Decode, scale_info::TypeInfo)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum EscrowStatus {
    /// The escrow is active and funds are locked.
    Active,
    /// The escrow has been completed and funds released.
    Completed,
    /// The escrow has been cancelled and funds returned.
    Cancelled,
    /// The escrow is in dispute.
    Disputed,
}

/// The status of a milestone.
#[derive(Debug, PartialEq, Eq, Encode, Decode, scale_info::TypeInfo)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum MilestoneStatus {
    /// The milestone is pending completion.
    Pending,
    /// The milestone has been completed.
    Completed,
    /// The milestone is in dispute.
    Disputed,
}

/// A milestone for an escrow.
#[derive(Debug, Encode, Decode, scale_info::TypeInfo)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub struct Milestone {
    /// The title of the milestone.
    pub title: Vec<u8>,
    /// The description of the milestone.
    pub description: Vec<u8>,
    /// The percentage of the total escrow amount.
    pub percentage: u8,
    /// The amount for this milestone.
    pub amount: Balance,
    /// The status of the milestone.
    pub status: MilestoneStatus,
    /// The deadline for the milestone.
    pub deadline: Option<Timestamp>,
    /// When the milestone was completed.
    pub completed_at: Option<Timestamp>,
}

/// Errors that can occur during escrow operations.
#[derive(Debug, PartialEq, Eq, Encode, Decode, scale_info::TypeInfo)]
#[cfg_attr(feature = "std", derive(scale_info::TypeInfo))]
pub enum EscrowError {
    /// An error occurred in the PSP22 token operations.
    PSP22Error(PSP22Error),
    /// Caller is not authorized to perform this action.
    NotAuthorized,
    /// The escrow does not exist.
    EscrowNotFound,
    /// The milestone does not exist.
    MilestoneNotFound,
    /// The escrow is not in the required status.
    InvalidEscrowStatus,
    /// The milestone is not in the required status.
    InvalidMilestoneStatus,
    /// The milestone percentages do not add up to 100%.
    InvalidMilestones,
    /// The escrow amount is invalid.
    InvalidAmount,
    /// Cannot perform this action on an escrow in dispute.
    InDispute,
    /// A deadline has passed.
    DeadlinePassed,
    /// The percentage is invalid (must be between 1 and 100).
    InvalidPercentage,
    /// Custom error with a message.
    Custom(Vec<u8>),
}

impl From<PSP22Error> for EscrowError {
    fn from(error: PSP22Error) -> Self {
        EscrowError::PSP22Error(error)
    }
}

/// Interface for the escrow contract.
#[openbrush::trait_definition]
pub trait Escrow {
    /// Creates a new escrow between a client and provider.
    #[ink(message)]
    fn create_escrow(
        &mut self, 
        provider: AccountId, 
        amount: Balance, 
        milestones: Vec<(Vec<u8>, Vec<u8>, u8, Option<Timestamp>)>,
        token_address: AccountId
    ) -> Result<(), EscrowError>;

    /// Releases funds for a completed milestone.
    #[ink(message)]
    fn release_milestone(&mut self, escrow_id: u32, milestone_id: u32) -> Result<(), EscrowError>;

    /// Confirms completion of a milestone by the provider.
    #[ink(message)]
    fn confirm_milestone(&mut self, escrow_id: u32, milestone_id: u32) -> Result<(), EscrowError>;

    /// Cancels an escrow by mutual agreement.
    #[ink(message)]
    fn cancel_escrow(&mut self, escrow_id: u32) -> Result<(), EscrowError>;

    /// Creates a dispute for an escrow.
    #[ink(message)]
    fn create_dispute(&mut self, escrow_id: u32, milestone_id: u32, reason: Vec<u8>) -> Result<(), EscrowError>;

    /// Gets an escrow by ID.
    #[ink(message)]
    fn get_escrow(&self, escrow_id: u32) -> Result<Vec<u8>, EscrowError>;

    /// Gets all escrows for a user.
    #[ink(message)]
    fn get_user_escrows(&self, user: AccountId) -> Vec<u32>;
} 