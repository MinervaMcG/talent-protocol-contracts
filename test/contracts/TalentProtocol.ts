import chai from "chai";
import { ethers, waffle } from "hardhat";
import { solidity } from "ethereum-waffle";

import { TalentProtocol } from "../../typechain/TalentProtocol";
import TalentProtocolArtifact from "../../artifacts/contracts/TalentProtocol.sol/TalentProtocol.json";

chai.use(solidity);

const { expect } = chai;
const { parseUnits } = ethers.utils;
const { deployContract } = waffle;

describe("TalentProtocol", () => {
  let signers: any;
  let creator: any;

  let tal: TalentProtocol;

  beforeEach(async () => {
    signers = await ethers.getSigners();
    creator = signers[0];
  });

  it("can be deployed", async () => {
    const action = deployContract(creator, TalentProtocolArtifact, [
      "TalentProtocol",
      "TAL",
      parseUnits("1000"),
    ]);

    await expect(action).not.to.be.reverted;
  });

  describe("functions", () => {
    beforeEach(async () => {
      tal = (await deployContract(creator, TalentProtocolArtifact, [
        "TalentProtocol",
        "TAL",
        parseUnits("123"),
      ])) as TalentProtocol;
    });

    it("has the given name and symbol", async () => {
      expect(await tal.name()).to.eq("TalentProtocol");
      expect(await tal.symbol()).to.eq("TAL");
    });

    it("has the expected number of decimal places", async () => {
      expect(await tal.decimals()).to.eq(18);
    });

    it("mints the full supply to the creator", async () => {
      expect(await tal.totalSupply()).to.eq(parseUnits("123"));
      expect(await tal.balanceOf(creator.address)).to.eq(parseUnits("123"));
    });
  });
});
