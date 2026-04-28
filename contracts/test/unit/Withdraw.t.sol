// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { VaultFixture } from "../helpers/VaultFixture.sol";
import { HearstVault } from "../../src/HearstVault.sol";

contract WithdrawTest is VaultFixture {
    function test_withdraw_revertsBeforeLockEnd() public {
        uint256 tokenId = _depositAs(alice, 5_000e6);
        vm.prank(alice);
        vm.expectRevert(HearstVault.StillLocked.selector);
        vault.withdraw(tokenId);
    }

    function test_withdraw_succeedsAfterLockEnd() public {
        uint256 tokenId = _depositAs(alice, 5_000e6);
        vm.warp(block.timestamp + LOCK_PERIOD + 1);

        uint256 balBefore = usdc.balanceOf(alice);
        vm.prank(alice);
        (uint256 principal, uint256 yieldAmount) = vault.withdraw(tokenId);
        assertEq(principal, 5_000e6);
        assertEq(yieldAmount, 0);
        assertEq(usdc.balanceOf(alice), balBefore + 5_000e6);
        assertEq(vault.totalDeposits(), 0);
    }

    function test_withdraw_returnsPendingYield() public {
        uint256 tokenId = _depositAs(alice, 5_000e6);
        // operator notifies 100 USDC of yield (15% perf = 15, mgmt small, ~85 to alice)
        _notifyRewards(100e6);

        uint256 pending = vault.pendingRewards(tokenId);
        assertGt(pending, 80e6, "alice should have most of the 85 net");
        assertLt(pending, 86e6, "but bounded above");

        vm.warp(block.timestamp + LOCK_PERIOD + 1);
        uint256 balBefore = usdc.balanceOf(alice);
        vm.prank(alice);
        (uint256 principal, uint256 yieldAmount) = vault.withdraw(tokenId);
        assertEq(principal, 5_000e6);
        assertEq(yieldAmount, pending);
        assertEq(usdc.balanceOf(alice), balBefore + 5_000e6 + yieldAmount);
    }

    function test_withdraw_burnsNft() public {
        uint256 tokenId = _depositAs(alice, 5_000e6);
        vm.warp(block.timestamp + LOCK_PERIOD + 1);
        vm.prank(alice);
        vault.withdraw(tokenId);
        // querying ownerOf a burnt NFT reverts (OZ v5 behavior)
        vm.expectRevert();
        positionNft.ownerOf(tokenId);
    }

    function test_withdraw_onlyOwner() public {
        uint256 tokenId = _depositAs(alice, 5_000e6);
        vm.warp(block.timestamp + LOCK_PERIOD + 1);
        vm.prank(bob);
        vm.expectRevert(HearstVault.NotPositionOwner.selector);
        vault.withdraw(tokenId);
    }

    function test_userCohortIds_updatesAfterWithdraw() public {
        uint256 t1 = _depositAs(alice, 2_000e6);
        uint256 t2 = _depositAs(alice, 3_000e6);
        vm.warp(block.timestamp + LOCK_PERIOD + 1);

        vm.prank(alice);
        vault.withdraw(t1);
        uint256[] memory ids = vault.userCohortIds(alice);
        assertEq(ids.length, 1);
        assertEq(ids[0], t2);
    }
}
