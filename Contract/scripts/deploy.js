const { ethers } = require("hardhat");
const { abi } = require("./AutomatedPayment.json");
const deploy = async () => {
  const [deployer] = await ethers.getSigners();
  const Autometa = await ethers.getContractFactory("Autometa");
  const autometa = await Autometa.deploy();

  const deploy = await autometa.deployContract(10);
  const address = await autometa.deployments(deployer.address);
  const AutomatedPayment = new ethers.Contract(address, abi, deployer);

  const owner = await AutomatedPayment.i_owner();
  console.log(owner, deployer.address, autometa.address);

  await AutomatedPayment.fund({ value: 100 });
  const b = await AutomatedPayment.getBalance();
  console.log(b.toString());
};

deploy();
