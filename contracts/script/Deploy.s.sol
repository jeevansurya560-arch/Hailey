// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface Vm {
    function startBroadcast() external;
    function startBroadcast(uint256 privateKey) external;
    function stopBroadcast() external;
    function envAddress(string calldata) external view returns (address);
    function envUint(string calldata) external view returns (uint256);
}

contract Script {
    Vm internal constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
}

import { HaileyContributions } from "../src/HaileyContributions.sol";

contract DeployScript is Script {
    function run() external returns (HaileyContributions registry) {
        address attestor = vm.envAddress("ATTESTOR_ADDRESS");

        vm.startBroadcast();
        registry = new HaileyContributions(attestor);
        vm.stopBroadcast();
    }
}
