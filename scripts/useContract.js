const hre = require('hardhat');

const CONTRACT_ABI = require('../artifacts/contracts/LeelaGame.sol/LeelaGame.json');

const DEPLOYED_CONTRACT_ADDRESS = require('../address.json').address;
const PRIVATE_KEY = process.env.PRIVATE_KEY;
const TENDERLY_PROVIDER = process.env.TENDERLY_PROVIDER;

async function main() {
  let provider = new hre.ethers.providers.JsonRpcProvider(TENDERLY_PROVIDER);

  let signer = new hre.ethers.Wallet(PRIVATE_KEY, provider);
  const contract = new hre.ethers.Contract(
    DEPLOYED_CONTRACT_ADDRESS,
    CONTRACT_ABI['abi'],
    signer,
  );

  await contract.massiv(10);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
