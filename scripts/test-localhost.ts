import { ethers } from "hardhat";

async function main() {
  console.log("Testing localhost network connection...");
  
  // Get the signer
  const [deployer] = await ethers.getSigners();
  
  console.log("Connected account:", deployer.address);
  console.log("Account balance:", ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");
  
  // Get network info
  const network = await deployer.provider.getNetwork();
  console.log("Network chainId:", network.chainId.toString());
  console.log("Network name:", network.name);
  
  // Test a simple transaction (just getting gas price)
  const gasPrice = await deployer.provider.getFeeData();
  console.log("Current gas price:", ethers.formatUnits(gasPrice.gasPrice || 0, "gwei"), "gwei");
  
  console.log("✅ Localhost network is working correctly!");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Error testing localhost network:", error);
    process.exit(1);
  });
