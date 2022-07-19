const { network } = require("hardhat");
const { localNetworks, networks } = require("../helper-hardhat.config");
const verfiy = require("../scripts/verfiy");
module.exports = async ({ getNamedAccounts, deployments }) => {
  const { deployer } = await getNamedAccounts();
  const { deploy, log } = deployments;

  const contract = await deploy("Autometa", {
    from: deployer,
    args: [],
    log: true,
  });
  log("Contract deployed at ", contract.address);

  if (!localNetworks.includes(network.name)) {
    await verfiy(contract.address, []);
  }
};

module.exports.tags = ["factory", "all"];
