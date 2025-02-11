use anchor_lang::prelude::*;

declare_id!("4JpJWm53pKAwsyJ5HxGoXRwFFW8FSr49mYjkRKzn7pyj");

pub mod instructions;
pub mod state;
pub mod error;

use crate::instructions::*;

#[program]
pub mod assistant_to_the_regional_manager {
    use super::*;

    pub fn create_manager(ctx: Context<CreateManager>, args: CreateManagerArgs) -> Result<()> {
        CreateManager::handle(ctx, args)
    }
}


#[derive(Accounts)]
pub struct Initialize {}
