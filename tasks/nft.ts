import { task } from "hardhat/config";
import { Contract, ContractFactory } from "ethers";
import { getWallet } from "../lib/wallet";

task("deploy-contract", "Deploy NFT contract").setAction(async (_, hre) => {
  return hre.ethers
    .getContractFactory("BabySpirit", getWallet())
    .then((contractFactory: ContractFactory) =>
      contractFactory.deploy("Baby Spirit", "BabySpirit", "ipfs.io/babyspirit/")
    )
    .then((result: Contract) => {
      process.stdout.write(`Contract address: ${result.address}`);
    });
});
