require('@nomicfoundation/hardhat-toolbox');
require('@nomiclabs/hardhat-ethers');
require('dotenv').config();
const tdly = require('@tenderly/hardhat-tenderly');

tdly.setup({ automaticVerifications: true });
console.log('process.env.TENDERLY_PROVIDER', process.env.TENDERLY_PROVIDER);
/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: '0.8.20',
  mocha: {
    timeout: 20000,
  },
  networks: {
    tenderly: {
      url: process.env.TENDERLY_PROVIDER,
    },
  },
  tenderly: {
    username: process.env.TENDERLY_USERNAME, // tenderly username (or organization name)
    project: process.env.TENDERLY_PROJECT, // project name
    privateVerification: false, // if true, contracts will be verified privately, if false, contracts will be verified publicly
  },
};
