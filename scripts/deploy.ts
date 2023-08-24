const hre = require('hardhat');
const fs = require('fs');
require('dotenv').config();

async function main() {
  const LeelaGame = await hre.ethers.getContractFactory('LeelaGame');
  console.log('LeelaGame', LeelaGame);
  const leelaGame = await LeelaGame.deploy();
  console.log('leelaGame', leelaGame);
  console.log(`LeelaGame deployed to ${leelaGame.target}`);

  // Записываем адрес в файл address.json
  let data = { address: leelaGame.target };
  fs.writeFileSync('./address.json', JSON.stringify(data));

  // Получаем метаданные о контракте
  const contractArtifact = await hre.artifacts.readArtifact('LeelaGame');

  // Получите байткод и ABI
  const bytecode = contractArtifact.bytecode;
  const abi = contractArtifact.abi;

  // Сохраните байткод и ABI
  fs.writeFileSync('LeelaGameBytecode.json', JSON.stringify(bytecode, null, 2));
  fs.writeFileSync('LeelaGameABI.json', JSON.stringify(abi, null, 2));

  console.log('Bytecode and ABI saved.');

  if (hre.network.name === 'mumbai') {
    await hre.run('verify:verify', {
      address: data.address,
    });
  }
  // verification on the block explorer
  // npx hardhat verify --network mumbai 0xb970373d091b3b60f1048036aDD1a72A2497256A
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
