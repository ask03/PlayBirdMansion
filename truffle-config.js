require('@babel/polyfill')
require('@babel/register')
require('@babel/core')
require('dotenv').config()

module.exports = {


  networks: {
    development: {
      host: '127.0.0.1',
      port: 8545,
      network_id: '*'
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
        enabled: true,
        runs: 200
      }
    },
  },
};
