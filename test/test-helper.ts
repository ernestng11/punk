import sinon from "sinon";
import chai from "chai";
import sinonChai from "sinon-chai";
import { ethers as hardhatEthers, waffle } from "hardhat";
import { Contract, Wallet, ContractFactory } from "ethers";

chai.use(sinonChai);

afterEach(() => {
  sinon.restore();
});

export function deployTestContract(
  name: string,
  options: {
    args: any[];
  }
) {
  return hardhatEthers
    .getContractFactory(name, getTestWallet())
    .then((contractFactory: ContractFactory) =>
      contractFactory.deploy(name, options)
    );
}

export function getTestWallet(): Wallet {
  return waffle.provider.getWallets()[0];
}
