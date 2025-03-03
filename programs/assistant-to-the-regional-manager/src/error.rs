use anchor_lang::prelude::*;

#[error_code]
pub enum ManagerError {
    #[msg("Unauthorized curator")]
    UnauthorizedCurator,

    #[msg("Unauthorized market")]
    UnauthorizedMarket,

    #[msg("Max queue length exceeded")]
    MaxQueueLengthExceeded,

    #[msg("Invalid market config")]
    InvalidMarketConfig,

    #[msg("Math overflow")]
    MathOverflow,
}