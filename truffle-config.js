require('@babel/polyfill')
require('@babel/register')
require('@babel/core')
require('dotenv').config()
const HDWalletProvider = require("truffle-hdwallet-provider-privkey")
const privKeys = process.env.PRIVATE_KEYS || ""

module.exports = {

  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*'
    },
    rinkeby: {
      networkCheckTimeout: 10000,
      provider: function () {
        return new HDWalletProvider(
          privKeys.split(','),
          `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`
        )
      },
      gas: 5000000,
      gasPrice: 5000000000,
      network_id: 4
    },
    mumbai: {
      provider: function () {
        return new HDWalletProvider(
          privKeys.split(','),
          'https://rpc-mumbai.matic.today'
        )
      },
      network_id: 80001,
      confirmations: 2,
      timeoutBlocks: 200,
      skipDryRun: true
    }

  },

  contracts_directory: './src/contracts/',
  contracts_build_directory: './src/abis',
  compilers: {
    solc: {
      version: ">=0.5.6 <=0.8.7",
      optimizer: {
        enabled: false,
        runs: 200
      }
    },
  },
};
