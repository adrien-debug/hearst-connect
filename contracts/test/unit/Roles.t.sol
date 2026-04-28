// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { VaultFixture } from "../helpers/VaultFixture.sol";
import { HearstVault } from "../../src/HearstVault.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";

contract RolesTest is VaultFixture {
    function test_pause_onlyPauser() public {
        bytes32 pauserRole = vault.PAUSER_ROLE();
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, alice, pauserRole
            )
        );
        vm.prank(alice);
        vault.pause();

        vm.prank(pauser);
        vault.pause();
    }

    function test_pause_blocksDepositOnly() public {
        vm.prank(pauser);
        vault.pause();

        // deposit blocked
        vm.startPrank(alice);
        usdc.approve(address(vault), 5_000e6);
        vm.expectRevert();
        vault.deposit(5_000e6);
        vm.stopPrank();
    }

    function test_pause_doesNotBlockClaim() public {
        uint256 tokenId = _depositAs(alice, 5_000e6);
        _notifyRewards(100e6);

        vm.prank(pauser);
        vault.pause();

        // claim still works
        vm.prank(alice);
        vault.claim(tokenId);
    }

    function test_pause_doesNotBlockWithdraw() public {
        uint256 tokenId = _depositAs(alice, 5_000e6);
        vm.warp(block.timestamp + LOCK_PERIOD + 1);

        vm.prank(pauser);
        vault.pause();

        vm.prank(alice);
        vault.withdraw(tokenId);
    }

    function test_advanceEpoch_onlyKeeper() public {
        bytes32 keeperRole = vault.KEEPER_ROLE();
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, alice, keeperRole
            )
        );
        vm.prank(alice);
        vault.advanceEpoch();

        vm.prank(keeper);
        vault.advanceEpoch();
    }

    function test_setFees_onlyAdmin() public {
        vm.expectRevert(
            abi.encodeWithSelector(
                IAccessControl.AccessControlUnauthorizedAccount.selector, operator, bytes32(0)
            )
        );
        vm.prank(operator);
        vault.setFees(200, 1500);

        vm.prank(admin);
        vault.setFees(200, 1500);
    }

    function test_setFees_revertsAboveCap() public {
        vm.prank(admin);
        vm.expectRevert(HearstVault.InvalidFee.selector);
        vault.setFees(501, 1500);

        vm.prank(admin);
        vm.expectRevert(HearstVault.InvalidFee.selector);
        vault.setFees(150, 3001);
    }

    function test_sweep_blocksAsset() public {
        vm.prank(admin);
        vm.expectRevert(HearstVault.AssetSweepBlocked.selector);
        vault.sweep(address(usdc), treasury);
    }
}
