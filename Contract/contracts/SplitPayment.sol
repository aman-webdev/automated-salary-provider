// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;

import "@chainlink/contracts/src/v0.8/interfaces/KeeperCompatibleInterface.sol";

error AutomatedPayment__NotFound();
error AutomatedPayment__OnlyOwnerAllowed();
error AutomatedPayment__NotEnoughFunds();
error AutomatedPayment__NotEnoughTimePassed();

contract AutomatedPayment is KeeperCompatibleInterface {
    uint256 public immutable i_interval;
    uint256 public startTime;
    address immutable i_owner;
    address payable[] public employees;
    address[] public funders;
    mapping(address => uint256) public coorespondingEmployeeSalary;
    mapping(address => uint256) public coorespondingFunderAmount;

    constructor(address owner, uint256 interval) {
        i_owner = owner;
        i_interval = interval;
        startTime = block.timestamp;
    }

    function fund() public payable {
        funders.push(msg.sender);
        coorespondingFunderAmount[msg.sender] += msg.value;
    }

    function addEmployee(address payable employee, uint256 salary)
        public
        onlyOwner
    {
        employees.push(employee);
        coorespondingEmployeeSalary[employee] = salary;
    }

    function updateEmployeeSalary(address employee, uint256 salary)
        public
        onlyOwner
    {
        uint256 index = isEmployee(employee);
        coorespondingEmployeeSalary[employee] = salary;
    }

    function deleteEmployee(address employee) public onlyOwner {
        uint256 index = isEmployee(employee);
        delete employees[index];
        delete coorespondingEmployeeSalary[employee];
    }

    function isEmployee(address employee) public view returns (uint256) {
        for (uint256 i = 0; i < employees.length; i++) {
            if (employees[i] == employee) {
                return i;
            }
        }

        revert AutomatedPayment__NotFound();
    }

    function checkUpkeep(
        bytes memory /*checkData*/
    )
        public
        view
        override
        returns (
            bool upKeepNeeded,
            bytes memory /* performData*/
        )
    {
        bool timePassed = (block.timestamp - startTime) > i_interval;
        bool isOwner = (msg.sender == i_owner);
        bool enoughFunds = (address(this).balance >= getTotalSalariesAmount());
        upKeepNeeded = (timePassed && isOwner && enoughFunds);
    }

    function performUpkeep(
        bytes calldata /*performData*/
    ) external override {
        (bool upkeepNeeded, ) = checkUpkeep("");
        if (!upkeepNeeded) {
            revert AutomatedPayment__NotEnoughTimePassed();
        }
        for (uint256 i = 0; i < employees.length; i++) {
            employees[i].transfer(coorespondingEmployeeSalary[employees[i]]);
        }
        startTime = block.timestamp;
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getFunders() public view returns (address[] memory) {
        return funders;
    }

    function getEmployees()
        public
        view
        onlyOwner
        returns (address payable[] memory)
    {
        return employees;
    }

    function getEmployeeSalary(address employee)
        public
        view
        onlyOwner
        returns (uint256)
    {
        return coorespondingEmployeeSalary[employee];
    }

    function getTotalSalariesAmount() internal view returns (uint256) {
        uint256 totalAmount;
        for (uint256 i = 0; i < employees.length; i++) {
            totalAmount += coorespondingEmployeeSalary[employees[i]];
        }

        return totalAmount;
    }

    modifier areEnoughFundsAvailable() {
        uint256 totalAmount = getTotalSalariesAmount();
        if (totalAmount > address(this).balance)
            revert AutomatedPayment__NotEnoughFunds();
        _;
    }

    modifier onlyOwner() {
        if (i_owner != msg.sender) revert AutomatedPayment__OnlyOwnerAllowed();
        _;
    }
}
