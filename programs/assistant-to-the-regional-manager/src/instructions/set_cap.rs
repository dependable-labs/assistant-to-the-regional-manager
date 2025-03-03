use anchor_lang::prelude::*;
use anchor_spl::token::*;
use pathfinder as PATH;

use crate::state::*;
use crate::error::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct SetCapArgs {
    pub market_id: Pubkey,
    pub supply_cap: u64,
}

#[derive(Accounts)]
#[instruction(args: SetCapArgs)]
pub struct SetCap<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [
            CONFIG_SEED_PREFIX,
            config.quote_mint.as_ref(),
            config.symbol.as_bytes(),
            config.name.as_bytes(),
        ],
        bump = config.bump,
    )]
    pub config: Box<Account<'info, ManagerVaultConfig>>,
    
    #[account(
        mut,
        seeds = [
            QUEUE_SEED_PREFIX,
            config.key().as_ref(),
        ],
        bump,
    )]
    pub queue: Box<Account<'info, QueueState>>,

    #[account(
        mut,
        seeds = [
            MARKET_CONFIG_SEED_PREFIX,
            config.key().as_ref(),
            args.market_id.as_ref(),
        ],
        bump,
    )]
    pub market_config: Box<Account<'info, MarketConfig>>,

     // market
    // #[account(
    //     seeds = [
    //     MARKET_SEED_PREFIX,
    //     quote_mint.key().as_ref(),
    //     collateral_mint.key().as_ref(),
    //     &market.ltv_factor.to_le_bytes(),
    //     &market.oracle.id.to_bytes(),
    //     ],
    //     bump = market.bump,
    // )]
    // pub market: Account<'info, Market>,


    // // quote
    // #[account(constraint = quote_mint.key() == market.quote_mint.key())]
    // pub quote_mint: Account<'info, Mint>,

    // // collateral
    // #[account(constraint = collateral_mint.key() == market.collateral_mint.key())]
    // pub collateral_mint: Account<'info, Mint>,

    pub system_program: Program<'info, System>,
}

impl<'info> SetCap<'info> {
    pub fn handle(ctx: Context<SetCap>, args: SetCapArgs) -> Result<()> {
        let SetCap {
            market_config,
            queue,
            config,
            ..
        } = ctx.accounts;

        if args.supply_cap > 0 {
            // If market not enabled (cap was 0), add to withdraw queue
            if !market_config.enabled {
                queue.withdraw_queue.push(args.market_id);

                if queue.withdraw_queue.len() > MAX_QUEUE_LENGTH {
                    return err!(ManagerError::MaxQueueLengthExceeded);
                }

                market_config.enabled = true;

                // let view_market = ViewMarket {
                //     config: config.path_config.as_ref(),
                //     market: config.path_market.as_ref(),
                //     quote_mint: config.quote_mint.as_ref(),
                //     collateral_mint: config.collateral_mint.as_ref(),
                // };
                // let ctx = Context::new(
                //     &PATHFINDER_PROGRAM_ID, 
                //     view_market,
                //     &[],
                //     &[],
                // );

                // let expected_supply_assets = PATH::view_total_supply_assets(ctx)?;
                let expected_supply_assets = 0;

                // TODO: Update last total assets
                config.last_total_assets = config.last_total_assets
                    .checked_add(expected_supply_assets)
                    .ok_or(ManagerError::MathOverflow)?;

            }

            market_config.removable_at = 0;
        }

        market_config.cap = args.supply_cap;
        market_config.pending_cap = 0;

        Ok(())
    }
}
