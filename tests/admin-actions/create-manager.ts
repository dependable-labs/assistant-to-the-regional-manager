import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TestUtils, PATHFINDER_PROGRAM_ID } from "../utils";
import { ManagerFixture, UserFixture } from "../fixtures";
import { AssistantToTheRegionalManager } from "../../target/types/assistant_to_the_regional_manager";
import { assert } from "chai";

describe("create-manager", () => {
  let test: TestUtils;
  let manager: ManagerFixture;
  let owen: UserFixture;

  beforeEach(async () => {
    test = await TestUtils.create({
      quoteDecimals: 9,
    });

    owen = await test.createUser(
      new anchor.BN(1_000 * 1e9),
      new anchor.BN(0)
    );

    manager = await test.initManagerFixture(); 
  });


  it("successfully creates manager account", async () => {

    await manager.create({
      user: owen,
      symbol: "USDCM",
      name: "USDC Manager",
    });

    const managerAccountData = await manager.managerVaultConfigAcc.get_data();
    assert.equal(managerAccountData.guardian.toBase58(), owen.key.publicKey.toBase58());
    assert.equal(managerAccountData.curator.toBase58(), owen.key.publicKey.toBase58());
    assert.equal(managerAccountData.feeRecipient.toBase58(), owen.key.publicKey.toBase58());
    assert.equal(managerAccountData.skimRecipient.toBase58(), owen.key.publicKey.toBase58());
    assert.equal(managerAccountData.timelock, 0);
    assert.equal(managerAccountData.decimalsOffset, 0);
    assert.equal(managerAccountData.lastTotalAssets, 0);
    assert.equal(managerAccountData.pathfinderProgram.toBase58(), PATHFINDER_PROGRAM_ID.toBase58());

  });
});
