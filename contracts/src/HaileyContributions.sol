// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title HaileyContributions
 * @notice Attestation registry for community-curated cultural contributions on Hailey.
 * Verified contributions are written by Hailey's relayer and permanently indexed onchain.
 */
contract HaileyContributions {
    enum Kind { Collection, Curation, Story, Event } // v1 uses Collection only

    address public attestor; // relayer address
    mapping(bytes32 => bool) public attested; // contentHash => done
    mapping(address => mapping(bytes32 => uint32)) public count; // contributor => communityId => n

    event Attested(
        address indexed contributor,
        bytes32 indexed communityId,
        bytes32 contentHash,
        Kind kind,
        uint64 at
    );

    event AttestorUpdated(address indexed previousAttestor, address indexed newAttestor);

    error NotAttestor();
    error AlreadyAttested();
    error ZeroAddress();
    error ZeroContentHash();
    error ZeroCommunityId();

    constructor(address _attestor) {
        if (_attestor == address(0)) revert ZeroAddress();
        attestor = _attestor;
        emit AttestorUpdated(address(0), _attestor);
    }

    /**
     * @notice Records an attestation for a contributor in a community.
     * @param contributor Wallet address of the contributor receiving credit.
     * @param communityId keccak256 hash of the community slug.
     * @param contentHash Deterministic digest of item metadata & content.
     * @param kind Attestation category (Collection = 0).
     */
    function attest(
        address contributor,
        bytes32 communityId,
        bytes32 contentHash,
        Kind kind
    ) external {
        if (msg.sender != attestor) revert NotAttestor();
        if (contributor == address(0)) revert ZeroAddress();
        if (communityId == bytes32(0)) revert ZeroCommunityId();
        if (contentHash == bytes32(0)) revert ZeroContentHash();
        if (attested[contentHash]) revert AlreadyAttested();

        attested[contentHash] = true;
        unchecked {
            count[contributor][communityId]++;
        }

        emit Attested(contributor, communityId, contentHash, kind, uint64(block.timestamp));
    }

    /**
     * @notice Rotates the relayer/attestor address. Callable only by the current attestor.
     * @param newAttestor The new relayer address.
     */
    function setAttestor(address newAttestor) external {
        if (msg.sender != attestor) revert NotAttestor();
        if (newAttestor == address(0)) revert ZeroAddress();

        address previous = attestor;
        attestor = newAttestor;
        emit AttestorUpdated(previous, newAttestor);
    }
}
