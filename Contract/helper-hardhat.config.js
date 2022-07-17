const networks = {
  4: {
    name: "rinkeby",
    interval: 30,
  },
  31337: {
    name: "hardhat",
    interval: 10,
  },
};

const localNetworks = ["hardhat", "localhost"];

module.exports = { localNetworks, networks };
