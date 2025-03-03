import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { TestUtils, PATHFINDER_PROGRAM_ID } from "../utils";
import { ManagerFixture, UserFixture } from "../fixtures";
import { AssistantToTheRegionalManager } from "../../target/types/assistant_to_the_regional_manager";
import { assert } from "chai";

describe("queue", () => {
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

    await manager.create({
      user: owen,
      symbol: "USDCM",
      name: "USDC Manager",
    });
  });

  // it("successfully sets supply queue", async () => {
  //   await manager.updateMarketConfig({
  //     user: owen,
  //   });

  //   // await manager.setSupplyQueue({
  //   //   user: owen,
  //   //   newSupplyQueue: [
  //   //     new anchor.web3.PublicKey("CyHe5vmWj1dLeqsY6f5h3kroiE9tQTexAvzTqXfxMEvY"),
  //   //   ],
  //   // });

  // });
});
