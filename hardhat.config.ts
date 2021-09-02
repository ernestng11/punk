/**
 * @type import('hardhat/config').HardhatUserConfig
 */
import("@nomiclabs/hardhat-waffle");
import("@nomiclabs/hardhat-ethers");
import { HardhatUserConfig } from "hardhat/config";
import dotenv from "dotenv";
dotenv.config();
const { MAINNET_URL, TESTNET_URL, PRIVATE_KEY } = process.env;

import("./tasks/nft");

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more
let config: HardhatUserConfig;

const argv = process.argv;
if (argv[2] !== "test") {
  config = {
    solidity: "0.8.0",
    defaultNetwork: "testnet",
    networks: {
      localhost: {
        url: "http://127.0.0.1:8545",
      },
      hardhat: {},
      testnet: {
        url: TESTNET_URL,
        chainId: 4002,
        gasPrice: 60000000000,
        accounts: [`0x${PRIVATE_KEY}`],
      },
      mainnet: {
        url: MAINNET_URL,
        chainId: 250,
        gasPrice: 60000000000,
        accounts: [`0x${PRIVATE_KEY}`],
      },
    },
  };
} else {
  config = {
    solidity: "0.8.0",
  };
}

export default config;
