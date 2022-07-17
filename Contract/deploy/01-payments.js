const { network } = require("hardhat");
const { localNetworks } = require("../helper-hardhat.config");
const verfiy = require("../scripts/verfiy");

module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();

  const { log, deploy } = deployments;
  const args = [deployer, 10];

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
