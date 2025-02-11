use anchor_spl::token::*;
use anchor_lang::prelude::*;

use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateManagerArgs {
  pub owner: Pubkey,
  pub guardian: Pubkey,
  pub fee_recipient: Pubkey,
  pub skim_recipient: Pubkey,
  pub curator: Pubkey,
  pub timelock: u64,
  pub decimals_offset: u8,
  pub name: String,
  pub symbol: String,
}

#[derive(Accounts)]
#[instruction(args: CreateManagerArgs)]
pub struct CreateManager<'info> { 
  #[account(mut)]
  pub user: Signer<'info>,

  // vault
  #[account(
    init,
    payer = user,
    space = 8 + std::mem::size_of::<ManagerVaultConfig>(),
    seeds = [
        CONFIG_SEED_PREFIX,
        quote_mint.key().as_ref(),
        &args.symbol.as_bytes(),
        &args.name.as_bytes(),
    ],
    bump,
  )]
  pub config: Box<Account<'info, ManagerVaultConfig>>,

  #[account(constraint = quote_mint.is_initialized == true)]
  pub quote_mint: Box<Account<'info, Mint>>,

  pub system_program: Program<'info, System>,
  pub token_program: Program<'info, Token>,
}

impl<'info> CreateManager<'info> {
  pub fn handle(ctx: Context<CreateManager>, args: CreateManagerArgs) -> Result<()> {

    let CreateManager {
      config,
      ..
    } = ctx.accounts;

    // TODO: set symbol and name for the SPL token

    config.set_inner(ManagerVaultConfig {
        bump: ctx.bumps.config,
        curator: args.curator,
        guardian: args.guardian,
        fee_recipient: args.fee_recipient,
        skim_recipient: args.skim_recipient,
        timelock: args.timelock,
        fee: 0,  // Using u64 instead of u96
        decimals_offset: args.decimals_offset,
        pathfinder_program: PATHFINDER_PROGRAM_ID,  // The PATHFINDER immutable
        last_total_assets: 0,
    });

    Ok(())
  }
}
