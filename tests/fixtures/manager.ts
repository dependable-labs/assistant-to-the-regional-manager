import { PublicKey } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AssistantToTheRegionalManager } from "../../target/types/assistant_to_the_regional_manager";
import { BankrunProvider } from "anchor-bankrun";
import { UserFixture, AccountFixture, splAccountFixture} from "./index";
import { derive_manager_config_address } from "../utils";

export class ManagerFixture {
  public program: Program<AssistantToTheRegionalManager>;
  public provider: BankrunProvider;
  public quoteMint: PublicKey;
  public quoteAta: splAccountFixture;
  public managerVaultConfigAcc: AccountFixture;

  public constructor(
    public _program: Program<AssistantToTheRegionalManager>,
    public _provider: BankrunProvider,
    public _quoteMint: PublicKey,
  ) {
    this.program = _program;
    this.provider = _provider;
    this.quoteMint = _quoteMint;
  }

  async create({
    user,
    name,
    symbol,
  }: {
    user: UserFixture;
    name: string;
    symbol: string;
  }): Promise<void> {
    await this.createCustom({
      user,
      name,
      symbol,
      curator: user,
      guardian: user,
      feeRecipient: user,
      skimRecipient: user,
    });
  }

  async createCustom({
    user,
    symbol,
    name,
    curator,
    guardian,
    feeRecipient,
    skimRecipient,
  }: {
    user: UserFixture;
    symbol: string;
    name: string;
    curator: UserFixture;
    guardian: UserFixture;
    feeRecipient: UserFixture;
    skimRecipient: UserFixture;
  }): Promise<void> {

    // set manager config account
    this.managerVaultConfigAcc = new AccountFixture(
      "managerVaultConfig",
      derive_manager_config_address(this.quoteMint, symbol, name, this.program.programId),
      this.program,
    );

    // set vault ata for the manager vault
    this.quoteAta = new splAccountFixture(
      "quoteAta",
      this.get_ata(this.quoteMint),
      this.program,
    );

    await this.program.methods
      .createManager({
        symbol,
        name,
        owner: user.key.publicKey,
        guardian: guardian.key.publicKey,
        feeRecipient: feeRecipient.key.publicKey,
        skimRecipient: skimRecipient.key.publicKey,
        curator: curator.key.publicKey,
        timelock: new anchor.BN(0),
        decimalsOffset: 0,
      })
      .accounts({
        user: user.key.publicKey,
        config: this.managerVaultConfigAcc.key,
        quoteMint: this.quoteMint,
        tokenProgram: anchor.utils.token.TOKEN_PROGRAM_ID,
        systemProgram: anchor.web3.SystemProgram.programId,
      })
      .signers([user.key.payer])
      .rpc();

  }

  // account related methods
  public get_ata(mint: PublicKey): PublicKey {
    return anchor.utils.token.associatedAddress({
      mint,
      owner: this.managerVaultConfigAcc.key,
    });
  }
}