import { ethers, waffle } from "hardhat";
import { Contract, Wallet } from "ethers";
import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import sinon from "sinon";
import { deployTestContract } from "./test-helper";
import * as provider from "../lib/provider";

chai.use(solidity);

describe("BabySpiritNFT", () => {
  const NFT_PRICE_INT = 1;
  const NFT_PRICE = ethers.utils.parseEther("1.0");
  const TOKEN_URI = "http://example.com/ip_records/42";
  let deployedContract: Contract;
  let wallet: Wallet;

  beforeEach(async () => {
    sinon.stub(provider, "getProvider").returns(waffle.provider);
    [wallet] = waffle.provider.getWallets();
    deployedContract = await deployTestContract("BabySpiritNFT");
  });

  async function mintNftDefault(): Promise<TransactionResponse> {
    return deployedContract.mintNFT(wallet.address, TOKEN_URI, {
      value: NFT_PRICE,
    });
  }

  describe("mintNft", async () => {
    it("emits the Transfer event", async () => {
      await expect(mintNftDefault())
        .to.emit(deployedContract, "Transfer")
        .withArgs(ethers.constants.AddressZero, wallet.address, "1");
    });

    it("returns the new item ID", async () => {
      await expect(
        await deployedContract.callStatic.mintNFT(wallet.address, TOKEN_URI, {
          value: NFT_PRICE,
        })
      ).to.eq("1");
    });

    it("increments the item ID", async () => {
      const STARTING_NEW_ITEM_ID = "1";
      const NEXT_NEW_ITEM_ID = "2";

      await expect(mintNftDefault())
        .to.emit(deployedContract, "Transfer")
        .withArgs(
          ethers.constants.AddressZero,
          wallet.address,
          STARTING_NEW_ITEM_ID
        );

      await expect(mintNftDefault())
        .to.emit(deployedContract, "Transfer")
        .withArgs(
          ethers.constants.AddressZero,
          wallet.address,
          NEXT_NEW_ITEM_ID
        );
    });

    it("cannot mint to address zero", async () => {
      const TX = deployedContract.mintNFT(
        ethers.constants.AddressZero,
        TOKEN_URI,
        { value: NFT_PRICE }
      );
      await expect(TX).to.be.revertedWith("ERC721: mint to the zero address");
    });
  });

  describe("balanceOf", () => {
    it("gets the count of NFTs for this address", async () => {
      await expect(await deployedContract.balanceOf(wallet.address)).to.eq("0");

      await mintNftDefault();

      expect(await deployedContract.balanceOf(wallet.address)).to.eq("1");
    });
  });

  describe("fees", () => {
    it("check that nft fee is deducted from minter", async () => {
      const initialWalletBal = await waffle.provider.getBalance(wallet.address);
      const formattedInitialWalletBal = ethers.utils.formatEther(
        initialWalletBal.toString()
      );

      await mintNftDefault();

      const finalWalletBal = await waffle.provider.getBalance(wallet.address);
      const formattedFinalWalletBal = ethers.utils.formatEther(
        finalWalletBal.toString()
      );

      expect(
        Math.round(formattedInitialWalletBal - formattedFinalWalletBal)
      ).to.equal(NFT_PRICE_INT);
    });
    it("check that contract earns nft fees", async () => {
      const initialContractBal = await waffle.provider.getBalance(
        deployedContract.address
      );
      const formattedInitialContractBal = ethers.utils.formatEther(
        initialContractBal.toString()
      );

      let formattedOldContractBal: number = formattedInitialContractBal;
      let newContractBal: any;
      let formattedNewContractBal: number;

      // Test Multiple Txs
      for (let i = 0; i < 3; i++) {
        await mintNftDefault();
        newContractBal = await wallet.provider.getBalance(
          deployedContract.address
        );
        formattedNewContractBal = ethers.utils.formatEther(
          newContractBal.toString()
        );
        expect(
          Math.round(formattedNewContractBal - formattedOldContractBal)
        ).to.equal(NFT_PRICE_INT);
        formattedOldContractBal = formattedNewContractBal;
      }
    });
  });
});
