import { task, types } from "hardhat/config";
import { Contract, ContractFactory } from "ethers";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import { env } from "../lib/env";
import { getContract } from "../lib/contract";
import { getWallet } from "../lib/wallet";
import { ethers } from "ethers";

const publicKey = env("PUBLIC_KEY");

task("deploy-contract", "Deploy NFT contract").setAction(async (_, hre) => {
  return hre.ethers
    .getContractFactory("BabySpiritNFT", getWallet())
    .then((contractFactory: ContractFactory) => contractFactory.deploy())
    .then((result: Contract) => {
      process.stdout.write(`Contract address: ${result.address}`);
    });
});

task("mint-nft", "Mint an NFT")
  .addParam("tokenUri", "Your ERC721 Token URI", undefined, types.string)
  .setAction(async (tokenUri, hre) => {
    return getContract("BabySpiritNFT", hre)
      .then((contract: Contract) => {
        return contract.mintNFT(publicKey, tokenUri, {
          gasLimit: 600_000,
          value: ethers.utils.parseEther("1.0"),
        });
      })
      .then((tr: TransactionResponse) => {
        process.stdout.write(`TX hash: ${tr.hash}`);
      });
  });
