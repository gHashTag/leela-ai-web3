import { ethers } from 'ethers';
import '@nomicfoundation/hardhat-toolbox';
import '@nomiclabs/hardhat-ethers';

import '@nomicfoundation/hardhat-verify';
require('dotenv').config();
// const tdly = require('@tenderly/hardhat-tenderly')

// tdly.setup({ automaticVerifications: true })
// console.log('process.env.TENDERLY_PROVIDER', process.env.TENDERLY_PROVIDER)

const ALCHEMY_API_KEY_URL = process.env.ALCHEMY_API_KEY_URL;

const PRIVATE_KEY = process.env.PRIVATE_KEY;

// const mnemonic = ''
// let mnemonicWallet = ethers.Wallet.fromPhrase(mnemonic)
// console.log('mnemonicWallet', mnemonicWallet)

// smart on ALCHEMY  0x5722c1727A8951D4105e4DB521e6A3a4c1a6CCDF

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: 'mumbai',
  solidity: {
    version: '0.8.0',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
      outputSelection: {
        '*': {
          '*': [
            'metadata',
            'evm.bytecode',
            'evm.deployedBytecode',
            'abi',
            'evm.sourceMap',
            'evm.deployedSourceMap',
          ],
        },
      },
    },
  },
  networks: {
    // tenderly: {
    //   url: process.env.TENDERLY_PROVIDER
    // },
    mumbai: {
      url: ALCHEMY_API_KEY_URL,
      accounts: [PRIVATE_KEY],
    },
  },
  polygonscan: {
    apiKey: process.env.POLYGON_PRIVATE_KEY,
  },
  etherscan: {
    apiKey: {
      polygonMumbai: process.env.POLYGON_PRIVATE_KEY,
    },
  },
  // tenderly: {
  //   username: process.env.TENDERLY_USERNAME, // tenderly username (or organization name)
  //   project: process.env.TENDERLY_PROJECT, // project name
  //   privateVerification: false // if true, contracts will be verified privately, if false, contracts will be verified publicly
  // }
};
