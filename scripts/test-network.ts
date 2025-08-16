import { ethers } from "hardhat";

async function main() {
  console.log("🔍 Testing network connectivity...");
  
  try {
    // Test basic connectivity
    const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8546");
    
    console.log("📡 Testing RPC connection...");
    const blockNumber = await provider.getBlockNumber();
    console.log("✅ Current block number:", blockNumber);
    
    console.log("🌐 Testing network info...");
    const network = await provider.getNetwork();
    console.log("✅ Network chainId:", network.chainId.toString());
    console.log("✅ Network name:", network.name);
    
    console.log("💰 Testing account access...");
    const [deployer] = await ethers.getSigners();
    const balance = await provider.getBalance(deployer.address);
    console.log("✅ Account:", deployer.address);
    console.log("✅ Balance:", ethers.formatEther(balance), "ETH");
    
    console.log("🚀 Network is working correctly!");
    
  } catch (error) {
    console.error("❌ Network connection failed:", error);
    
    if (error.message.includes("fetch")) {
      console.log("\n💡 Possible solutions:");
      console.log("1. Make sure Hardhat node is running: npm run node");
      console.log("2. Check if port 8546 is not blocked by firewall");
      console.log("3. Try using localhost instead of 127.0.0.1");
      console.log("4. Verify no other service is using port 8546");
    }
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Script failed:", error);
    process.exit(1);
  });
