const { ethers } = require("hardhat");

module.exports = (value) => {
  return ethers.utils.parseEther(value.toString());
};
