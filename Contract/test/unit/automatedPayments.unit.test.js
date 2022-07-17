const { network, getNamedAccounts, deployments, ethers } = require("hardhat");
const { networks, localNetworks } = require("../../helper-hardhat.config");
const { assert, expect } = require("chai");
const convertToWei = require("../../scripts/convertToWei");

!localNetworks.includes(network.name)
  ? describe.skip
  : describe("Automated Payment", () => {
      let automatedPayment,
        deployer,
        funderOne,
        funderTwo,
        EmployeeOne,
        EmployeeTwo,
        funderConnectedContract;
      const INTERVAL = networks[network.config.chainId].interval;
      const fundAmount = ethers.utils.parseEther("1");

      beforeEach(async () => {
        await deployments.fixture(["contract"]);
        automatedPayment = await ethers.getContract(
          "AutomatedPayment",
          deployer
        );
        [deployer, funderOne, funderTwo, EmployeeOne, EmployeeTwo] =
          await ethers.getSigners();
        funderConnectedContract = automatedPayment.connect(funderOne);
      });

      describe("Deploy Contract", () => {
        it("Should deploy the contract", async () => {
          const owner = await automatedPayment.getOwner();
          const interval = await automatedPayment.getInterval();
          assert.equal(owner, deployer.address);
          assert.equal(interval.toString(), INTERVAL.toString());
        });
      });

      describe("Fund the contract", () => {
        it("Should allow funds", async () => {
          await deployer.sendTransaction({
            to: automatedPayment.address,
            value: fundAmount,
          });

          funderConnectedContract = automatedPayment.connect(funderOne);
          await funderConnectedContract.fund({ value: fundAmount });
          const balance = await automatedPayment.getBalance();

          const [funderFirst, funderSecond] =
            await automatedPayment.getFunders();
          const funderFirstAmount =
            await automatedPayment.coorespondingFunderAmount(funderFirst);
          const funderSecondAmount =
            await automatedPayment.coorespondingFunderAmount(funderSecond);
          assert(funderFirst === deployer.address);
          assert(funderSecond === funderOne.address);
          assert.equal(funderFirstAmount.toString(), fundAmount);
          assert.equal(funderSecondAmount.toString(), fundAmount);
          assert.equal(balance.toString(), fundAmount.mul(2));
        });
      });

      describe("Add Employee", () => {
        it("Should not add employee if the func is not called by owner", async () => {
          await expect(
            funderConnectedContract.addEmployee(
              EmployeeOne.address,
              ethers.utils.parseEther("2")
            )
          ).to.be.revertedWithCustomError(
            automatedPayment,
            "AutomatedPayment__OnlyOwnerAllowed"
          );
        });

        it("Should add employee", async () => {
          await automatedPayment.addEmployee(
            EmployeeOne.address,
            ethers.utils.parseEther("2")
          );
          await automatedPayment.addEmployee(
            EmployeeTwo.address,
            ethers.utils.parseEther("4")
          );
          const [empOne, empTwo] = await automatedPayment.getEmployees();
          const empOneSalary = await automatedPayment.getEmployeeSalary(empOne);
          const empTwoSalary = await automatedPayment.getEmployeeSalary(empTwo);
          assert.equal(empOne, EmployeeOne.address);
          assert.equal(empTwo, EmployeeTwo.address);
          assert.equal(
            empOneSalary.toString(),
            ethers.utils.parseEther("2").toString()
          );
          assert.equal(
            empTwoSalary.toString(),
            ethers.utils.parseEther("4").toString()
          );
        });
      });

      describe("Update Employee Salary", () => {
        it("Should not Update employee salary if the func is not called by owner", async () => {
          await expect(
            funderConnectedContract.updateEmployeeSalary(
              EmployeeOne.address,
              ethers.utils.parseEther("1")
            )
          ).to.be.revertedWithCustomError(
            automatedPayment,
            "AutomatedPayment__OnlyOwnerAllowed"
          );
        });

        it("Should not update the salary if employee doesn't exist", async () => {
          await expect(
            automatedPayment.updateEmployeeSalary(
              EmployeeOne.address,
              ethers.utils.parseEther("1")
            )
          ).to.be.revertedWithCustomError(
            automatedPayment,
            "AutomatedPayment__NotFound"
          );
        });

        it("Should update the employee", async () => {
          await automatedPayment.addEmployee(
            EmployeeOne.address,
            ethers.utils.parseEther("2")
          );

          await automatedPayment.updateEmployeeSalary(
            EmployeeOne.address,
            convertToWei(4)
          );

          const updatedEmployeeOneSalary =
            await automatedPayment.getEmployeeSalary(EmployeeOne.address);

          assert.equal(updatedEmployeeOneSalary.toString(), convertToWei(4));
        });
      });

      describe("Delete Employee", () => {
        it("Should delete the employee", async () => {
          await automatedPayment.addEmployee(
            EmployeeOne.address,
            convertToWei(2)
          );
          await automatedPayment.deleteEmployee(EmployeeOne.address);
          const employee = await automatedPayment.getEmployees();
          const empSalary = await automatedPayment.getEmployeeSalary(
            EmployeeOne.address
          );

          assert.equal(empSalary.toString(), "0");
          assert.equal(employee.length, 0);
        });
      });

      describe("Check upkeep", () => {
        beforeEach(async () => {
          await automatedPayment.addEmployee(
            EmployeeOne.address,
            ethers.utils.parseEther("2")
          );

          await automatedPayment.addEmployee(
            EmployeeTwo.address,
            ethers.utils.parseEther("4")
          );
        });

        it("Should return false if enough interval hasn't passed", async () => {
          await automatedPayment.fund({ value: convertToWei(10) });
          await network.provider.send("evm_increaseTime", [INTERVAL - 4]);
          await network.provider.send("evm_mine", []);
          const [result] = await automatedPayment.checkUpkeep([]);
          assert.equal(result, false);
        });

        it("Should return false if there are no employee", async () => {
          await automatedPayment.fund({ value: convertToWei(10) });
          await network.provider.send("evm_increaseTime", [INTERVAL + 1]);
          await network.provider.send("evm_mine", []);
          await automatedPayment.deleteEmployee(EmployeeOne.address);
          await automatedPayment.deleteEmployee(EmployeeTwo.address);
          const [result] = await automatedPayment.checkUpkeep([]);
          assert.equal(result, false);
        });

        it("Should return false if there are not enough funds to pay", async () => {
          await automatedPayment.fund({ value: convertToWei(1) });
          await network.provider.send("evm_increaseTime", [INTERVAL + 1]);
          await network.provider.send("evm_mine", []);
          const [result] = await automatedPayment.checkUpkeep([]);
          assert.equal(result, false);
        });

        it("Should return true", async () => {
          await automatedPayment.fund({ value: convertToWei(10) });
          await network.provider.send("evm_increaseTime", [INTERVAL + 1]);
          await network.provider.send("evm_mine", []);
          const [result] = await automatedPayment.checkUpkeep([]);
          assert.equal(result, true);
        });
      });

      describe("Perform Upkeep", () => {
        beforeEach(async () => {
          await automatedPayment.addEmployee(
            EmployeeOne.address,
            ethers.utils.parseEther("20")
          );

          await automatedPayment.addEmployee(
            EmployeeTwo.address,
            ethers.utils.parseEther("40")
          );
        });

        it("Should not be called if checkUpkeep is false", async () => {
          await automatedPayment.fund({ value: convertToWei(1) });
          await network.provider.send("evm_increaseTime", [INTERVAL + 1]);
          await network.provider.send("evm_mine", []);
          await expect(
            automatedPayment.performUpkeep([])
          ).to.be.revertedWithCustomError(
            automatedPayment,
            "AutomatedPayment__CannotPerformUpkeep"
          );
        });

        it("Should only be called after checkUpkeep is true", async () => {
          await automatedPayment.fund({ value: convertToWei(60) });
          await network.provider.send("evm_increaseTime", [INTERVAL + 1]);
          await network.provider.send("evm_mine", []);
          const tx = await automatedPayment.performUpkeep([]);
          assert(tx);
        });

        it("Pays the employees with their cooresponding salary", async () => {
          await automatedPayment.fund({ value: convertToWei(70) });
          await network.provider.send("evm_increaseTime", [INTERVAL + 1]);
          await network.provider.send("evm_mine", []);
          const empOneInitSalary = await EmployeeOne.getBalance();
          const empTwoInitSalary = await EmployeeTwo.getBalance();
          const empOneSalary = await automatedPayment.getEmployeeSalary(
            EmployeeOne.address
          );
          const empTwoSalary = await automatedPayment.getEmployeeSalary(
            EmployeeTwo.address
          );

          const contractInitBalance = await automatedPayment.getBalance();

          const intiStartTime = await automatedPayment.startTime();

          const tx = await automatedPayment.performUpkeep([]);

          const afterStartTime = await automatedPayment.startTime();

          const empOneAfterSalary = await EmployeeOne.getBalance();
          const empTwoAfterSalary = await EmployeeTwo.getBalance();

          const contractAfterBalance = await automatedPayment.getBalance();

          assert.equal(contractInitBalance.toString(), convertToWei(70));
          assert.equal(contractAfterBalance.toString(), convertToWei(10));
          assert.equal(
            empOneAfterSalary.toString(),
            empOneInitSalary.add(empOneSalary).toString()
          );
          assert.equal(
            empTwoAfterSalary.toString(),
            empTwoInitSalary.add(empTwoSalary).toString()
          );
          assert(intiStartTime.toString() < afterStartTime.toString());
        });
      });
    });
