// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { VaultFixture } from "../helpers/VaultFixture.sol";
import { HearstVault } from "../../src/HearstVault.sol";

contract RewardsAndFeesTest is VaultFixture {
    function test_notifyRewards_distributesProRata() public {
        _depositAs(alice, 4_000e6); // 40% share
        _depositAs(bob, 6_000e6); // 60% share

        // skip mgmt fee accrual for cleaner math
        _notifyRewards(100e6);

        // perf 15% = 15, mgmt accrued ~0 (no time passed since deposit)
        // net = 85
        uint256 alicePending = vault.pendingRewards(1);
        uint256 bobPending = vault.pendingRewards(2);
        assertApproxEqAbs(alicePending, 34e6, 1e3, "alice ~40% of 85");
        assertApproxEqAbs(bobPending, 51e6, 1e3, "bob ~60% of 85");
    }

    function test_perfFeeAccrues() public {
        _depositAs(alice, 10_000e6);
        _notifyRewards(200e6);
        assertEq(vault.accruedPerfFee(), 30e6, "15% of 200 = 30");
    }

    function test_mgmtFeeAccruesOverTime() public {
        _depositAs(alice, 10_000e6);
        // advance 30 days
        vm.warp(block.timestamp + 30 days);
        _notifyRewards(1_000e6);

        // mgmt fee owed: 10_000e6 * 150 / 10_000 * 30/365 = 12.328e6
        // perf: 1000 * 15% = 150
        // afterPerf = 850, mgmtPay = min(12.328, 850) = 12.328
        uint256 mgmtAccrued = vault.accruedMgmtFee();
        assertApproxEqAbs(mgmtAccrued, 12_328_767, 1e3, "~12.328 USDC mgmt fee");
        assertEq(vault.mgmtFeeDebt(), 0, "all settled");
    }

    function test_withdrawFees_paysTreasury() public {
        _depositAs(alice, 10_000e6);
        vm.warp(block.timestamp + 30 days);
        _notifyRewards(1_000e6);

        uint256 mgmt = vault.accruedMgmtFee();
        uint256 perf = vault.accruedPerfFee();
        uint256 total = mgmt + perf;
        assertGt(total, 0);

        vm.prank(admin);
        vault.withdrawFees();
        assertEq(usdc.balanceOf(treasury), total, "fees go to configured treasury");
        assertEq(vault.accruedMgmtFee(), 0);
        assertEq(vault.accruedPerfFee(), 0);
    }

    function test_notifyRewards_revertsIfNoStakers() public {
        vm.startPrank(operator);
        usdc.approve(address(vault), 100e6);
        vm.expectRevert(HearstVault.NoStakers.selector);
        vault.notifyRewardAmount(100e6);
        vm.stopPrank();
    }

    function test_claim_payOutAndUpdatesDebt() public {
        uint256 tokenId = _depositAs(alice, 5_000e6);
        _notifyRewards(100e6);
        uint256 pendingBefore = vault.pendingRewards(tokenId);
        assertGt(pendingBefore, 0);

        uint256 balBefore = usdc.balanceOf(alice);
        vm.prank(alice);
        uint256 paid = vault.claim(tokenId);
        assertEq(paid, pendingBefore);
        assertEq(usdc.balanceOf(alice), balBefore + paid);
        assertEq(vault.pendingRewards(tokenId), 0, "no more pending");
    }

    function test_claim_revertsIfNothing() public {
        uint256 tokenId = _depositAs(alice, 5_000e6);
        vm.prank(alice);
        vm.expectRevert(HearstVault.NothingToClaim.selector);
        vault.claim(tokenId);
    }
}
