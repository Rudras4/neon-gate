import { ethers } from "hardhat";

async function main() {
  console.log("🧪 Simple Transaction Test...\n");

  try {
    // Get the signer
    const [deployer] = await ethers.getSigners();
    console.log("📱 Using account:", deployer.address);
    console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    // Send a simple transaction to yourself to mine the first block
    console.log("📤 Sending test transaction...");
    const tx = await deployer.sendTransaction({
      to: deployer.address,
      value: ethers.parseEther("0.0001")
    });

    console.log("📋 Transaction hash:", tx.hash);
    console.log("⏳ Waiting for confirmation...");

    const receipt = await tx.wait();
    if (receipt) {
      console.log("✅ Transaction confirmed!");
      console.log("   Block number:", receipt.blockNumber);
      console.log("   Gas used:", receipt.gasUsed.toString());
    } else {
      console.log("⚠️ Transaction confirmed but no receipt received");
    }

    // Check the latest block
    const latestBlock = await ethers.provider.getBlockNumber();
    console.log("🌐 Latest block:", latestBlock);

    console.log("\n🎉 Success! Network is now active with blocks.");
    console.log("   You can now test ticket purchases in the frontend!");
    
  } catch (error) {
    console.error("❌ Error:", error);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
