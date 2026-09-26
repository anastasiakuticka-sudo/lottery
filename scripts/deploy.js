import hre from "hardhat";

const connection = await hre.network.connect();
const { viem } = connection;

const publicClient = await viem.getPublicClient();

const walletClients = await viem.getWalletClients();
const walletClient = walletClients[0];

const artifact = await hre.artifacts.readArtifact("Lottery");

const hash = await walletClient.deployContract({
  abi: artifact.abi,
  bytecode: artifact.bytecode,
});

const receipt = await publicClient.waitForTransactionReceipt({
  hash,
});

console.log("Lottery deployed successfully!");
console.log("Contract address:", receipt.contractAddress);