import { ethers, waffle } from "hardhat";
import { Contract, Wallet } from "ethers";
import chai, { expect } from "chai";
import { solidity } from "ethereum-waffle";
import { TransactionResponse } from "@ethersproject/abstract-provider";
import sinon from "sinon";
import crypto from "crypto";
import { deployTestContract } from "./test-helper";
import * as provider from "../lib/provider";

chai.use(solidity);

describe("BabySpirit", () => {
  const contractName: string = "BabySpirit";
  const contractSymbol: string = "BabySpirit";
  const contractBaseURI: string = "ipfs.io/ipfs/";

  let deployedContract: Contract;
  let wallet: Wallet;

  beforeEach(async () => {
    sinon.stub(provider, "getProvider").returns(waffle.provider);
    [wallet] = waffle.provider.getWallets();
    deployedContract = await deployTestContract(
      contractName,
      contractSymbol,
      contractBaseURI,
      20
    );
    // Minting inactive by default
    await deployedContract.switchMinting();
  });

  async function mintBabySpirit(
    quantity: number,
    tokenURIArray: string[],
    value: number
  ): Promise<TransactionResponse> {
    return deployedContract.mintBabySpirit(quantity, tokenURIArray, {
      value: value,
    });
  }

  function parseEther(value: number) {
    const _value = value.toString();
    return ethers.utils.parseEther(_value);
  }

  function generateRandomHash(length: number): string[] {
    let result = [];
    for (let i = 0; i < length; i++) {
      const hash = crypto.randomBytes(20).toString("hex");
      result.push(hash);
    }
    return result;
  }

  describe("Minting", async () => {
    it("Single mint", async () => {
      await expect(await deployedContract.balanceOf(wallet.address)).to.eq("0");
      await expect(await deployedContract.totalSupply()).to.eq(0);
      await mintBabySpirit(
        1,
        ["QmRpaAA9Ef4oQGeNqYSaPoGnqgphhVnqoRFuaA18SF2Ep3"],
        parseEther(1)
      );
      expect(await deployedContract.balanceOf(wallet.address)).to.eq("1");
      await expect(await deployedContract.totalSupply()).to.eq(1);
    });
    it("Multiple mint", async () => {
      await expect(await deployedContract.balanceOf(wallet.address)).to.eq("0");
      await expect(await deployedContract.totalSupply()).to.eq(0);
      await mintBabySpirit(
        2,
        [
          "QmRpaAA9Ef4oQGeNqYSaPoGnqgphhVnqoRFuaA18SF2Ep3",
          "RHAJrjlhxlrlrljlslallalRLlrRlAHSDKADKQEOQEWIbbb",
        ],
        parseEther(2)
      );
      expect(await deployedContract.balanceOf(wallet.address)).to.eq("2");
      await expect(await deployedContract.totalSupply()).to.eq(2);
    });
    it("Cannot mint more than 10 BabySpirit in one tx", async () => {
      await expect(await deployedContract.totalSupply()).to.eq(0);
      await mintBabySpirit(11, generateRandomHash(11), parseEther(11)).catch(
        (err) => {
          expect(
            err ===
              "VM Exception while processing transaction: reverted with reason string 'Cannot mint this number of BabySpirits in one go !'"
          );
        }
      );
    });
    it("Cannot mint more than total supply", async () => {
      await expect(await deployedContract.totalSupply()).to.eq(0);
      await mintBabySpirit(21, generateRandomHash(21), parseEther(21)).catch(
        (err) => {
          expect(
            err ===
              "Error: VM Exception while processing transaction: reverted with reason string 'Only 1,000 BabySpirits are available'"
          );
        }
      );
    });
    it("Reserve BabySpirit for team", async () => {
      await expect(await deployedContract.balanceOf(wallet.address)).to.eq("0");
      await expect(await deployedContract.totalSupply()).to.eq(0);
      await deployedContract.reserveBabySpirits(10, generateRandomHash(10));
      expect(await deployedContract.balanceOf(wallet.address)).to.eq("10");
      await expect(await deployedContract.totalSupply()).to.eq(10);
    });
  });

  describe("tokenURI", () => {
    it("Set new baseURI", async () => {
      await mintBabySpirit(
        1,
        ["QmRpaAA9Ef4oQGeNqYSaPoGnqgphhVnqoRFuaA18SF2Ep3"],
        parseEther(1)
      );
      await expect(await deployedContract.callStatic.tokenURI(0)).to.eq(
        "ipfs.io/ipfs/QmRpaAA9Ef4oQGeNqYSaPoGnqgphhVnqoRFuaA18SF2Ep3"
      );
    });
  });

  describe("fees", () => {
    it("Check that contract earns fees", async () => {
      const initialContractBal = await waffle.provider.getBalance(
        deployedContract.address
      );
      const formattedInitialContractBal = ethers.utils.formatEther(
        initialContractBal.toString()
      );
      await mintBabySpirit(
        1,
        ["QmRpaAA9Ef4oQGeNqYSaPoGnqgphhVnqoRFuaA18SF2Ep3"],
        parseEther(1)
      );
      const finalContractBal = await waffle.provider.getBalance(
        deployedContract.address
      );
      const formattedFinalContractBal = ethers.utils.formatEther(
        finalContractBal.toString()
      );
      expect(formattedFinalContractBal - formattedInitialContractBal).to.equal(
        1
      );
    });
    it("Withdraw fees from contract", async () => {
      const initalOwnerBal = await waffle.provider.getBalance(wallet.address);
      const formattedInitalOwnerBal = ethers.utils.formatEther(
        initalOwnerBal.toString()
      );

      await mintBabySpirit(
        1,
        ["QmRpaAA9Ef4oQGeNqYSaPoGnqgphhVnqoRFuaA18SF2Ep3"],
        parseEther(1)
      );

      // Check that contract received fees
      const contractBal = await waffle.provider.getBalance(
        deployedContract.address
      );
      const formattedContractBal = ethers.utils.formatEther(
        contractBal.toString()
      );
      expect(formattedContractBal).to.equal("1.0");

      await deployedContract.withdrawBalance();

      const finalOwnerBal = await waffle.provider.getBalance(wallet.address);
      const formattedFinalOwnerBal = ethers.utils.formatEther(
        finalOwnerBal.toString()
      );

      const finalContractBal = await waffle.provider.getBalance(
        deployedContract.address
      );
      const formattedFinalContractBal = ethers.utils.formatEther(
        finalContractBal.toString()
      );

      expect(formattedFinalOwnerBal > formattedInitalOwnerBal);
      expect(formattedFinalContractBal).to.equal("0.0");
    });
  });
});
