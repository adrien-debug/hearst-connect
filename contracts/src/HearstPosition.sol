// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.24;

import { ERC721Upgradeable } from "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";

/// @title HearstPosition
/// @notice Soulbound ERC-721 representing a single deposit cohort in a HearstVault.
///         Mint and burn are gated to the configured vault. Transfers are disabled in v1
///         (KYC continuity); ungate post-audit by upgrading.
contract HearstPosition is ERC721Upgradeable {
    error NotVault();
    error Soulbound();
    error ZeroVault();

    address public vault;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    function initialize(string memory name_, string memory symbol_, address vault_) external initializer {
        if (vault_ == address(0)) revert ZeroVault();
        __ERC721_init(name_, symbol_);
        vault = vault_;
    }

    modifier onlyVault() {
        if (msg.sender != vault) revert NotVault();
        _;
    }

    function mint(address to, uint256 tokenId) external onlyVault {
        _safeMint(to, tokenId);
    }

    function burn(uint256 tokenId) external onlyVault {
        _burn(tokenId);
    }

    /// @dev OZ v5 hook fires for mint, transfer, burn. Allow only mint (from=0) and burn (to=0).
    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        address from = _ownerOf(tokenId);
        if (from != address(0) && to != address(0)) {
            revert Soulbound();
        }
        return super._update(to, tokenId, auth);
    }
}
