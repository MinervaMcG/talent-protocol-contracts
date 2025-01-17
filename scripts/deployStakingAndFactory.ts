import { ethers, network, upgrades, waffle } from "hardhat";
import dayjs from "dayjs";
import type { TalentFactory, StakingMigration } from "../typechain-types";

const { parseUnits } = ethers.utils;
const { deployContract } = waffle;
interface NetworkConfig {
  usdStableCoinContract: string;
  talPriceInUsd: string;
  talentPriceInTal: string;
}

const alfajores: NetworkConfig = {
  usdStableCoinContract: process.env.ALFAJORES_CUSD!,
  talPriceInUsd: process.env.TAL_PRICE_IN_USD!,
  talentPriceInTal: process.env.TALENT_PRICE_IN_TAL!,
};

const hardhat: NetworkConfig = {
  usdStableCoinContract: process.env.LOCAL_STABLE!,
  talPriceInUsd: process.env.TAL_PRICE_IN_USD!,
  talentPriceInTal: process.env.TALENT_PRICE_IN_TAL!,
};

const celo: NetworkConfig = {
  usdStableCoinContract: process.env.MAINNET_CUSD!,
  talPriceInUsd: process.env.TAL_PRICE_IN_USD!,
  talentPriceInTal: process.env.TALENT_PRICE_IN_TAL!,
};

const mumbai: NetworkConfig = {
  usdStableCoinContract: process.env.MUMBAI_USDC!,
  talPriceInUsd: process.env.TAL_PRICE_IN_USD!,
  talentPriceInTal: process.env.TALENT_PRICE_IN_TAL!,
};

const matic: NetworkConfig = {
  usdStableCoinContract: process.env.MATIC_USDC!,
  talPriceInUsd: process.env.TAL_PRICE_IN_USD!,
  talentPriceInTal: process.env.TALENT_PRICE_IN_TAL!,
};

const Configs: Record<string, NetworkConfig> = {
  alfajores,
  celo,
  hardhat,
  mumbai,
  matic
};

async function main() {
  const config = Configs[network.name];

  if (!config) {
    throw `No config found for network ${config}`;
  }

  const [owner] = await ethers.getSigners();

  const FactoryFactory = await ethers.getContractFactory("TalentFactory");
  const factory = (await upgrades.deployProxy(FactoryFactory, [])) as TalentFactory;

  const StakingFactory = await ethers.getContractFactory("StakingMigration");
  const staking = (await upgrades.deployProxy(StakingFactory, [
    dayjs().add(10, "minute").unix(),
    dayjs().add(1, "year").unix(),
    ethers.utils.parseUnits("400000000"),
    config.usdStableCoinContract,
    factory.address,
    parseUnits(config.talPriceInUsd), // how much cUSD must be spent for 1 TAL
    parseUnits(config.talentPriceInTal), // how much TAL must be spent for 1 Talent Token
  ])) as StakingMigration;


  console.log(`
  TalentFactory: ${factory.address},
  Staking: ${staking.address}
  `);

  console.log("Factory: setting Staking as minter...");
  const tx = await factory.setMinter(staking.address);
  await tx.wait();

  console.log("Done");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
