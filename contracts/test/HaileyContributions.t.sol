// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface Vm {
    function prank(address) external;
    function expectEmit(bool, bool, bool, bool) external;
    function expectRevert(bytes4) external;
}

contract Test {
    Vm internal constant vm = Vm(address(uint160(uint256(keccak256("hevm cheat code")))));
}

import { HaileyContributions } from "../src/HaileyContributions.sol";

contract HaileyContributionsTest is Test {
    HaileyContributions public registry;

    address public attestor = address(0xA11CE);
    address public contributor = address(0xB0B);
    address public stranger = address(0xCAFE);

    bytes32 public communityId = keccak256("streetwear-archive");
    bytes32 public contentHash = keccak256("hailey:v1|item-1|col-1|streetwear-archive|hash1");
    bytes32 public contentHash2 = keccak256("hailey:v1|item-2|col-1|streetwear-archive|hash2");

    event Attested(
        address indexed contributor,
        bytes32 indexed communityId,
        bytes32 contentHash,
        HaileyContributions.Kind kind,
        uint64 at
    );

    function setUp() public {
        registry = new HaileyContributions(attestor);
    }

    // 1. Success increments count and emits Attested event
    function test_Attest_Success() public {
        assertEq(registry.count(contributor, communityId), 0);
        assertFalse(registry.attested(contentHash));

        vm.prank(attestor);
        vm.expectEmit(true, true, false, true);
        emit Attested(
            contributor,
            communityId,
            contentHash,
            HaileyContributions.Kind.Collection,
            uint64(block.timestamp)
        );

        registry.attest(
            contributor,
            communityId,
            contentHash,
            HaileyContributions.Kind.Collection
        );

        assertEq(registry.count(contributor, communityId), 1);
        assertTrue(registry.attested(contentHash));

        // Subsequent different hash increments count to 2
        vm.prank(attestor);
        registry.attest(
            contributor,
            communityId,
            contentHash2,
            HaileyContributions.Kind.Collection
        );
        assertEq(registry.count(contributor, communityId), 2);
    }

    // 2. Non-attestor reverts with NotAttestor()
    function test_Attest_RevertsWhenNotAttestor() public {
        vm.prank(stranger);
        vm.expectRevert(HaileyContributions.NotAttestor.selector);
        registry.attest(
            contributor,
            communityId,
            contentHash,
            HaileyContributions.Kind.Collection
        );
    }

    // 3. Duplicate content hash reverts with AlreadyAttested()
    function test_Attest_RevertsOnDuplicateHash() public {
        vm.prank(attestor);
        registry.attest(
            contributor,
            communityId,
            contentHash,
            HaileyContributions.Kind.Collection
        );

        // Attempt second attestation with same hash
        vm.prank(attestor);
        vm.expectRevert(HaileyContributions.AlreadyAttested.selector);
        registry.attest(
            contributor,
            communityId,
            contentHash,
            HaileyContributions.Kind.Collection
        );
    }

    // 3b. Zero contributor address reverts with ZeroAddress()
    function test_Attest_RevertsOnZeroContributor() public {
        vm.prank(attestor);
        vm.expectRevert(HaileyContributions.ZeroAddress.selector);
        registry.attest(
            address(0),
            communityId,
            contentHash,
            HaileyContributions.Kind.Collection
        );
    }

    // 3c. Zero community ID reverts with ZeroCommunityId()
    function test_Attest_RevertsOnZeroCommunityId() public {
        vm.prank(attestor);
        vm.expectRevert(HaileyContributions.ZeroCommunityId.selector);
        registry.attest(
            contributor,
            bytes32(0),
            contentHash,
            HaileyContributions.Kind.Collection
        );
    }

    // 3d. Zero content hash reverts with ZeroContentHash()
    function test_Attest_RevertsOnZeroContentHash() public {
        vm.prank(attestor);
        vm.expectRevert(HaileyContributions.ZeroContentHash.selector);
        registry.attest(
            contributor,
            communityId,
            bytes32(0),
            HaileyContributions.Kind.Collection
        );
    }

    // 4. setAttestor works only by current attestor; non-attestor reverts
    function test_SetAttestor_Success() public {
        address newAttestor = address(0xDA7A);

        vm.prank(attestor);
        registry.setAttestor(newAttestor);
        assertEq(registry.attestor(), newAttestor);

        // New attestor can now attest
        vm.prank(newAttestor);
        registry.attest(
            contributor,
            communityId,
            contentHash,
            HaileyContributions.Kind.Collection
        );
        assertEq(registry.count(contributor, communityId), 1);
    }

    function test_SetAttestor_RevertsWhenNotAttestor() public {
        vm.prank(stranger);
        vm.expectRevert(HaileyContributions.NotAttestor.selector);
        registry.setAttestor(stranger);
    }

    function test_SetAttestor_RevertsOnZeroAddress() public {
        vm.prank(attestor);
        vm.expectRevert(HaileyContributions.ZeroAddress.selector);
        registry.setAttestor(address(0));
    }

    function test_Constructor_RevertsOnZeroAddress() public {
        vm.expectRevert(HaileyContributions.ZeroAddress.selector);
        new HaileyContributions(address(0));
    }
}

function assertEq(uint256 a, uint256 b) pure {
    require(a == b, "assertEq uint failed");
}

function assertEq(address a, address b) pure {
    require(a == b, "assertEq address failed");
}

function assertTrue(bool a) pure {
    require(a, "assertTrue failed");
}

function assertFalse(bool a) pure {
    require(!a, "assertFalse failed");
}
