import { deployTestContract, getTestWallet } from "./test-helper";
import { waffle, run } from "hardhat";
import { expect } from "chai";
import sinon from "sinon";
import * as provider from "../lib/provider";

describe("tasks", () => {
  beforeEach(async () => {
    sinon.stub(provider, "getProvider").returns(waffle.provider);
    const wallet = getTestWallet();
    sinon.stub(process, "env").value({
      PUBLIC_KEY: wallet.publicKey,
      PRIVATE_KEY: wallet.privateKey,
    });
  });

  describe("deploy-contract", () => {
    it("calls through and returns the transaction object", async () => {
      sinon.stub(process.stdout, "write");

      await run("deploy-contract");

      await expect(process.stdout.write).to.have.been.calledWith(
        "Contract address: 0x610178dA211FEF7D417bC0e6FeD39F05609AD788"
      );
    });
  });

  describe("mint-nft", () => {
    beforeEach(async () => {
      const deployedContract = await deployTestContract("BabySpiritNFT");
      process.env.NFT_CONTRACT_ADDRESS = deployedContract.address;
    });

    it("calls through and returns the transaction object", async () => {
      sinon.stub(process.stdout, "write");

      await run("mint-nft", { tokenUri: "https://example.com/record/4" });

      await expect(process.stdout.write).to.have.been.calledWith(
        "TX hash: 0x6abb3d1427da2b2d5c432db5e2a379471f7158fb7c31ac4709292a2d22c489fa"
      );
    });
  });
});
