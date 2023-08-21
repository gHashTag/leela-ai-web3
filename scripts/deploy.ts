const hre = require('hardhat');
const fs = require('fs');
require('dotenv').config();

let provider = process.env.TENDERLY_PROVIDER;
let username = process.env.TENDERLY_USERNAME;
let project = process.env.TENDERLY_PROJECT;

async function main() {
  const SimpleStorage = await hre.ethers.getContractFactory('LeelaGame');
  const simpleStorage = await SimpleStorage.deploy();

  await simpleStorage.deployed();

  console.log(`SimpleStorage deployed to ${simpleStorage.address}`);

  let data = { address: simpleStorage.address };

  fs.writeFile('./address.json', JSON.stringify(data), (err) => {
    if (err) console.log(err);
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
