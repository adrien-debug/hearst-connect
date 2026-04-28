// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { VaultFixture } from "../helpers/VaultFixture.sol";
import { HearstPosition } from "../../src/HearstPosition.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/// @notice Direct tests against the HearstPosition NFT (mint/burn gating, soulbound enforcement,
///         init guards). The vault's interactions with it are covered in Deposit/Withdraw tests.
contract PositionTest is VaultFixture {
    function test_mint_revertsForNonVault() public {
        vm.prank(alice);
        vm.expectRevert(HearstPosition.NotVault.selector);
        positionNft.mint(alice, 1);
    }

    function test_burn_revertsForNonVault() public {
        uint256 tokenId = _depositAs(alice, 5_000e6);
        vm.prank(alice);
        vm.expectRevert(HearstPosition.NotVault.selector);
        positionNft.burn(tokenId);
    }

    function test_init_revertsOnZeroVault() public {
        HearstPosition impl = new HearstPosition();
        bytes memory init = abi.encodeCall(HearstPosition.initialize, ("X", "X", address(0)));
        vm.expectRevert(HearstPosition.ZeroVault.selector);
        new ERC1967Proxy(address(impl), init);
    }

    function test_init_cannotBeCalledTwice() public {
        // already initialized in fixture
        vm.expectRevert(); // InvalidInitialization from OZ Initializable
        positionNft.initialize("Y", "Y", address(this));
    }

    function test_implementation_initializerDisabled() public {
        HearstPosition impl = new HearstPosition();
        vm.expectRevert(); // InvalidInitialization
        impl.initialize("Z", "Z", address(0xdead));
    }

    function test_safeTransferFrom_alsoSoulbound() public {
        uint256 tokenId = _depositAs(alice, 5_000e6);
        vm.prank(alice);
        vm.expectRevert(HearstPosition.Soulbound.selector);
        positionNft.safeTransferFrom(alice, bob, tokenId);
    }
}
