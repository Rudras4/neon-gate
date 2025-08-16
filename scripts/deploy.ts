import { ethers } from "hardhat";
import { EventFactory, TicketResale } from "../typechain-types";
import * as fs from "fs";

async function main() {
  const [deployer] = await ethers.getSigners();
  
  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());
  
  // Deploy EventFactory
  console.log("\nDeploying EventFactory...");
  const EventFactory = await ethers.getContractFactory("EventFactory");
  const eventFactory = await EventFactory.deploy();
  await eventFactory.waitForDeployment();
  
  console.log("EventFactory deployed to:", await eventFactory.getAddress());
  
  // Deploy TicketResale
  console.log("\nDeploying TicketResale...");
  const TicketResale = await ethers.getContractFactory("TicketResale");
  const ticketResale = await TicketResale.deploy();
  await ticketResale.waitForDeployment();
  
  console.log("TicketResale deployed to:", await ticketResale.getAddress());
  
  // Verify deployment
  console.log("\nVerifying deployment...");
  
  const eventFactoryCode = await ethers.provider.getCode(await eventFactory.getAddress());
  const ticketResaleCode = await ethers.provider.getCode(await ticketResale.getAddress());
  
  if (eventFactoryCode !== "0x") {
    console.log("✅ EventFactory deployed successfully");
  } else {
    console.log("❌ EventFactory deployment failed");
  }
  
  if (ticketResaleCode !== "0x") {
    console.log("✅ TicketResale deployed successfully");
  } else {
    console.log("❌ TicketResale deployment failed");
  }
  
  // Get network info
  const network = await ethers.provider.getNetwork();
  console.log("\nNetwork:", network.name, "Chain ID:", network.chainId);
  
  // Save deployment info
  const deploymentInfo = {
    network: network.name,
    chainId: network.chainId.toString(),
    deployer: deployer.address,
    contracts: {
      EventFactory: await eventFactory.getAddress(),
      TicketResale: await ticketResale.getAddress(),
    },
    timestamp: new Date().toISOString(),
  };
  
  console.log("\nDeployment Summary:");
  console.log(JSON.stringify(deploymentInfo, null, 2));
  
  // Save to file
  const deploymentPath = `./deployments/${network.name}-${network.chainId}.json`;
  
  // Ensure deployments directory exists
  if (!fs.existsSync("./deployments")) {
    fs.mkdirSync("./deployments", { recursive: true });
  }
  
  fs.writeFileSync(deploymentPath, JSON.stringify(deploymentInfo, null, 2));
  console.log(`\nDeployment info saved to: ${deploymentPath}`);
  
  // Instructions for verification
  console.log("\n📋 Next Steps:");
  console.log("1. Update your .env file with the contract addresses");
  console.log("2. Verify contracts on block explorer:");
  
  if (network.chainId === 43113n) { // Avalanche Fuji
    console.log(`   EventFactory: https://testnet.snowtrace.io/address/${await eventFactory.getAddress()}#code`);
    console.log(`   TicketResale: https://testnet.snowtrace.io/address/${await ticketResale.getAddress()}#code`);
  } else if (network.chainId === 11155111n) { // Sepolia
    console.log(`   EventFactory: https://sepolia.etherscan.io/address/${await eventFactory.getAddress()}#code`);
    console.log(`   TicketResale: https://sepolia.etherscan.io/address/${await ticketResale.getAddress()}#code`);
  }
  
  console.log("\n3. Run verification commands:");
  console.log(`   npx hardhat verify --network ${network.name} ${await eventFactory.getAddress()}`);
  console.log(`   npx hardhat verify --network ${network.name} ${await ticketResale.getAddress()}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
