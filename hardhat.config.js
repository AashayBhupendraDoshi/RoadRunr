require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan")
require('dotenv').config({ path: '.env' });
//const { PRIVATE_KEY } = process.env;

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

// If you are using MetaMask, be sure to change the chainId to 1337
module.exports = {
  solidity: "0.8.4",
  networks: {
    hardhat: {
      chainId: 1337
    },
    iotex_testnet: {
      url: 'https://babel-api.testnet.iotex.io',
      accounts: [ process.env.ACCOUNT1_PRIVATE_KEY ],
      chainId: 4690,
      gas: 8500000,
      gasPrice: 1000000000000
    },
    iotex_mainnet: {
      url: 'https://babel-api.mainnet.iotex.io',
      accounts: [ process.env.ACCOUNT1_PRIVATE_KEY ],
      chainId: 4689,
      gas: 8500000,
      gasPrice: 1000000000000
    },
    rinkeby_testnet: {
      url: process.env.ALCHEMY_RINKEBY,
      accounts: [ process.env.ACCOUNT1_PRIVATE_KEY ]
    }
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API
  }
};