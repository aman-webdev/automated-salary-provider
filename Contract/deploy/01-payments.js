const { network } = require("hardhat");
const { localNetworks, networks } = require("../helper-hardhat.config");
const verfiy = require("../scripts/verfiy");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();

  const { log, deploy } = deployments;
  const args = [deployer, networks[network.config.chainId].interval];

  const contract = await deploy("AutomatedPayment", {
    from: deployer,
    args,
    log: true,
    waitConfirmations: network.config.blockConfirmations,
  });

  log("Contract deployed at ", contract.address);

  if (!localNetworks.includes(network.name)) {
    await verfiy(contract.address, args);
  }
};

module.exports.tags = ["contract"];
