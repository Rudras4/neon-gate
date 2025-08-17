import { ethers } from "hardhat";

async function main() {
  console.log("⛏️  Mining first block by sending a transaction...\n");

  try {
    // Get the signer
    const [deployer] = await ethers.getSigners();
    console.log("📱 Using account:", deployer.address);
    console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH\n");

    // Send a small transaction to yourself to mine the first block
    const tx = await deployer.sendTransaction({
      to: deployer.address,
      value: ethers.parseEther("0.0001")
    });

    console.log("📤 Transaction sent:", tx.hash);
    console.log("⏳ Waiting for confirmation...");

    const receipt = await tx.wait();
    console.log("✅ Transaction confirmed in block:", receipt.blockNumber);

    // Get latest block
    const latestBlock = await ethers.provider.getBlockNumber();
    console.log("🌐 Latest Block:", latestBlock);

    console.log("\n🎉 First block mined! Network is now active.");
    
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
