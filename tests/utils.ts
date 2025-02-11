import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  PublicKey,
  Finality,
  LAMPORTS_PER_SOL,
} from "@solana/web3.js";
import { createMint } from "spl-token-bankrun";

import { startAnchor, BankrunProvider } from 'anchor-bankrun';
import { ProgramTestContext, Clock, BanksClient} from "solana-bankrun";
import { UserFixture, ManagerFixture } from "./fixtures/";
import { AssistantToTheRegionalManager } from "../target/types/assistant_to_the_regional_manager";
const IDL = require("../target/idl/assistant_to_the_regional_manager.json");

export const COMMITMENT: { commitment: Finality } = { commitment: "confirmed" };

export const PATHFINDER_PROGRAM_ID = new PublicKey("7ALFC87zvuPvpp9h5Stq9SSP3kTCUJfhtirEZVJmZYy4");

export function create_account_w_sol(
  context: ProgramTestContext,
  pubkey: PublicKey,
  sol_amount: number,
  data: Buffer = Buffer.alloc(0),
) {
  create_custom_account(
    context,
    pubkey,
    anchor.web3.SystemProgram.programId,
    LAMPORTS_PER_SOL * sol_amount,
    data,
    0
  );
}

export function create_custom_account(
  context: ProgramTestContext,
  pubkey: PublicKey,
  owner: PublicKey,
  lamports: number,
  data: Buffer,
  rentEpoch: number,
) {
  context.setAccount(pubkey, {
    executable: false,
    owner: owner,
    lamports: lamports,
    data: data,
    rentEpoch: rentEpoch,
  });
}

export function deriveMarketAddress(
  quoteMint: PublicKey,
  collateralMint: PublicKey,
  ltvFactor: anchor.BN,
  oracleId: PublicKey,
  programId: PublicKey
) {


  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("market"),
      quoteMint.toBuffer(),
      collateralMint.toBuffer(),
      Buffer.from(ltvFactor.toArray("le", 8)),
      oracleId.toBuffer(),
    ],
    programId
  )[0];
}


export function derive_manager_config_address(
  quoteMint: PublicKey,
  symbol: string,
  name: string,
  programId: PublicKey
) {
  return PublicKey.findProgramAddressSync(
    [
      Buffer.from("managerconfig"),
      quoteMint.toBuffer(),
      Buffer.from(symbol),
      Buffer.from(name),
    ],
    programId
  )[0];
}

export class TestUtils {
  private program: Program<AssistantToTheRegionalManager>;
  private provider: BankrunProvider;
  private banks: BanksClient;
  private context: ProgramTestContext;
  private quoteMint: PublicKey;
  private collateralMint: PublicKey;

  public static async create({
    quoteDecimals = 9,
  }: {
    quoteDecimals?: number,
  }): Promise<TestUtils> {
    const instance = new TestUtils();
    
    instance.context = await startAnchor('', [], []);
    instance.provider = new BankrunProvider(instance.context);
    instance.program = new Program<AssistantToTheRegionalManager>(IDL, instance.provider);
    instance.banks = instance.context.banksClient;

    const owner = instance.provider.wallet.publicKey;
    const payer = instance.provider.wallet.payer;

    instance.quoteMint = await createMint(
      instance.banks,
      payer,
      owner,
      owner,
      quoteDecimals
    );

    return instance;
  }

  public async createUser(quoteAmount: anchor.BN, collateralAmount: anchor.BN) {
    let user = new UserFixture(
      this.provider,
      this.quoteMint,
      this.collateralMint
    );

    await user.init_and_fund_accounts(
      quoteAmount,
    );

    return user;
  }

  public async initManagerFixture() {
    return new ManagerFixture(
      this.program,
      this.provider,
      this.quoteMint,
    );
  }

  // time utils
  public async moveTimeForward(seconds: number): Promise<void> {
    const currentClock = await this.context.banksClient.getClock();
    const newUnixTimestamp = currentClock.unixTimestamp + BigInt(seconds);
    const newClock = new Clock(
      currentClock.slot,
      currentClock.epochStartTimestamp,
      currentClock.epoch,
      currentClock.leaderScheduleEpoch,
      newUnixTimestamp
    );
    this.context.setClock(newClock);
  }

  public async getTime(): Promise<number> {
    const currentClock = await this.context.banksClient.getClock();
    return Number(currentClock.unixTimestamp);
  }
}
