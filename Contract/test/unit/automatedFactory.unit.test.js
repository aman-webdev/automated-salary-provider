const { ethers, network, deployments } = require("hardhat");
const { localNetworks } = require("../../helper-hardhat.config");
const { abi } = require("../abis/AutomatedPayment.json");
const { assert, expect } = require("chai");
const convertToWei = require("../../scripts/convertToWei");
!localNetworks.includes(network.name)
  ? describe.skip
  : describe("Autometa Factory", () => {
      let autometaFactory, deployer, owner, employeeOne, employeeTwo;

      beforeEach(async () => {
        [deployer, owner, employeeOne, employeeTwo] = await ethers.getSigners();
        await deployments.fixture(["factory"]);
        autometaFactory = await ethers.getContract("Autometa", deployer);
      });

      describe("Contract Deployment", () => {
        it("Should deploy AutomatedPayment", async () => {
          await autometaFactory.deployContract(owner.address, 20);
          const automatedPaymentAddress =
            await autometaFactory.getContractAddress(owner.address);

          const automatedPayment = new ethers.Contract(
            automatedPaymentAddress,
            abi,
            owner
          );
          const automatedPaymentOwner = await automatedPayment.getOwner();
          const automatedPaymentInterval = await automatedPayment.getInterval();
          console.log(automatedPaymentOwner);
          assert.equal(automatedPaymentOwner, owner.address);
          assert.equal(automatedPaymentInterval.toString(), "20");
        });
      });

      describe("Interact with child contract", () => {
        let automatedPayment;
        beforeEach(async () => {
          await autometaFactory.deployContract(owner.address, 20);
          const automatedPaymentAddress =
            await autometaFactory.getContractAddress(owner.address);
          automatedPayment = new ethers.Contract(
            automatedPaymentAddress,
            abi,
            owner
          );
        });

        it("Should fund the contract", async () => {
          const deployedConnected = automatedPayment.connect(deployer);
          const initBalance = await automatedPayment.getBalance();
          await deployedConnected.fund({ value: convertToWei(10) });
          const afterBalance = await automatedPayment.getBalance();
          assert.equal(afterBalance.toString(), convertToWei("10"));
          assert.equal(initBalance.toString(), "0");
        });

        it("Should not add employee if the caller is not owner", async () => {
          const deployerConnected = automatedPayment.connect(deployer);
          await expect(
            deployerConnected.addEmployee(employeeOne.address, 10)
          ).to.be.revertedWithCustomError(
            automatedPayment,
            "AutomatedPayment__OnlyOwnerAllowed"
          );
        });

        describe("Check Upkeep", () => {
          beforeEach(async () => {
            await automatedPayment.addEmployee(
              employeeOne.address,
              ethers.utils.parseEther("2")
            );

            await automatedPayment.addEmployee(
              employeeTwo.address,
              ethers.utils.parseEther("4")
            );
          });
          it("Should return false if enough interval hasn't passed", async () => {
            await automatedPayment.fund({ value: convertToWei(10) });
            await network.provider.send("evm_increaseTime", [20 - 4]);
            await network.provider.send("evm_mine", []);
            const [result] = await automatedPayment.checkUpkeep([]);
            assert.equal(result, false);
          });

          it("Should return false if there are no employee", async () => {
            await automatedPayment.fund({ value: convertToWei(10) });
            await network.provider.send("evm_increaseTime", [20 + 1]);
            await network.provider.send("evm_mine", []);
            await automatedPayment.deleteEmployee(employeeOne.address);
            await automatedPayment.deleteEmployee(employeeTwo.address);
            const [result] = await automatedPayment.checkUpkeep([]);
            assert.equal(result, false);
          });

          it("Should return false if there are not enough funds to pay", async () => {
            await automatedPayment.fund({ value: convertToWei(1) });
            await network.provider.send("evm_increaseTime", [20 + 1]);
            await network.provider.send("evm_mine", []);
            const [result] = await automatedPayment.checkUpkeep("0x");
            assert.equal(result, false);
          });

          it("Should return true", async () => {
            await automatedPayment.fund({ value: convertToWei(10) });
            await network.provider.send("evm_increaseTime", [20 + 1]);
            await network.provider.send("evm_mine", []);
            const [result] = await automatedPayment.checkUpkeep([]);
            assert.equal(result, true);
          });
        });
      });
    });
