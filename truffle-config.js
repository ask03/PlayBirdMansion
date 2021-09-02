require('@babel/polyfill')
require('@babel/register')
require('@babel/core')
require('dotenv').config()
const HDWalletProvider = require("truffle-hdwallet-provider-privkey")
const privKey = process.env.PRIVATE_KEY || ""

module.exports = {


  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*'
    },
    rinkeby: {
      provider: function () {
        return new HDWalletProvider(
          privKey,
          `https://rinkeby.infura.io/v3/${process.env.INFURA_API_KEY}`
        )
      },
      gas: 5000000,
      gasPrice: 25000000000,
      network_id: 4
    }

  },

  // Set default mocha options here, use special reporters etc.
  mocha: {
    // timeout: 100000
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
