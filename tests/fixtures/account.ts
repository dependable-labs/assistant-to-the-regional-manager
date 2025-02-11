import { PublicKey } from '@solana/web3.js';
import { Program } from "@coral-xyz/anchor";
import { AssistantToTheRegionalManager } from "../../target/types/assistant_to_the_regional_manager";
import { getAccount } from '@solana/spl-token';


export class AccountFixture {
  public name: string;
  public key: PublicKey;
  public program: Program<AssistantToTheRegionalManager>;

  public constructor(
    public _name: string,
    public _key: PublicKey,
    public _program: Program<AssistantToTheRegionalManager>,
  ) {
    this.name = _name;
    this.key = _key;
    this.program = _program;
  }

  public async get_data(): Promise<any> {
    try {
      return await this.program.account[this.name].fetch(this.key);
    } catch (e) {
      return undefined;
    }
  }
}

export class splAccountFixture extends AccountFixture {
  public async getTokenBalance(): Promise<bigint> {
    const account = await getAccount(this.program.provider.connection, this.key);
    return account.amount;
  }

}