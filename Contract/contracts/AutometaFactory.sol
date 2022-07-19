// SPDX-License-Identifier: MIT
pragma solidity ^0.8.8;
import "./AutomatedPayment.sol";

contract Autometa {
    mapping(address => address) public deployments;

    function deployContract(address owner, uint256 interval)
        external
        returns (address)
    {
        AutomatedPayment automatedPayment = new AutomatedPayment(
            owner,
            interval
        );
        deployments[owner] = address(automatedPayment);
    }

    function getContractAddress(address owner) public view returns (address) {
        return deployments[owner];
    }
}
