import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AssistantToTheRegionalManager } from "../target/types/assistant_to_the_regional_manager";

describe("assistant-to-the-regional-manager", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.AssistantToTheRegionalManager as Program<AssistantToTheRegionalManager>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
