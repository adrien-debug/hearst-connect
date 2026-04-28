// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { VaultFixture } from "../helpers/VaultFixture.sol";
import { HearstVault } from "../../src/HearstVault.sol";
import { IHearstVault } from "../../src/interfaces/IHearstVault.sol";
import { MockUSDC } from "../helpers/MockUSDC.sol";
import { MarketRegime, SignalType } from "../../src/types/Enums.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import { Vm } from "forge-std/Vm.sol";

/// @notice Lifecycle and integration scenarios that span multiple actions and verify
///         end-to-end correctness (maturity, recovery, multi-rebalance, fee flow).
contract LifecycleTest is VaultFixture {
    // ─── Maturity by target reached ───────────────────────────────────────────

    function test_maturity_targetReached_unlocksBeforeLockEnd() public {
        uint256 tokenId = _depositAs(alice, 10_000e6);
        // Target = 36% of 10k = 3,600 USDC of cumulative yield required.
        // Notify enough rewards so that alice's pending exceeds the target.
        // Net yield to alice (only staker, 100% of net): notifyAmount * (1 - perfFeeBps/10000)
        // To get 3,600 net to alice, need notify = 3600 / 0.85 ≈ 4236
        _notifyRewards(5_000e6);

        // Alice claims, target should be reached
        vm.prank(alice);
        uint256 paid = vault.claim(tokenId);
        assertGt(paid, 4_000e6, "alice receives most of net");

        IHearstVault.Position memory pos = vault.cohortInfo(tokenId);
        assertTrue(pos.matured, "position matured by target");
        assertEq(pos.lockEnd, block.timestamp, "lockEnd set to now");

        // Withdraw should now succeed despite lockup not having elapsed
        assertTrue(vault.isUnlocked(tokenId));
        vm.prank(alice);
        (uint256 principal, uint256 yieldAmt) = vault.withdraw(tokenId);
        assertEq(principal, 10_000e6);
        assertEq(yieldAmt, 0, "all yield already claimed");
    }

    // ─── Capital recovery extension ───────────────────────────────────────────

    function test_extendLock_extendsBeyondLockEnd() public {
        uint256 tokenId = _depositAs(alice, 5_000e6);
        // Walk past lockEnd; principal under, recovery needed.
        vm.warp(block.timestamp + LOCK_PERIOD + 1);
        assertTrue(vault.isUnlocked(tokenId), "would be unlocked without extension");

        vm.prank(operator);
        vault.extendLock(tokenId, 30); // 30 more days

        assertFalse(vault.isUnlocked(tokenId), "extension re-locks position");
        IHearstVault.Position memory pos = vault.cohortInfo(tokenId);
        assertEq(pos.extendedUntil, pos.lockEnd + 30 days);

        // Withdrawing now reverts
        vm.prank(alice);
        vm.expectRevert(HearstVault.StillLocked.selector);
        vault.withdraw(tokenId);

        // After the extension elapses, withdraw works
        vm.warp(uint256(pos.extendedUntil) + 1);
        vm.prank(alice);
        vault.withdraw(tokenId);
    }

    function test_extendLock_stacksAdditively() public {
        uint256 tokenId = _depositAs(alice, 5_000e6);
        IHearstVault.Position memory before_ = vault.cohortInfo(tokenId);

        vm.prank(operator);
        vault.extendLock(tokenId, 30);
        IHearstVault.Position memory afterFirst = vault.cohortInfo(tokenId);
        assertEq(afterFirst.extendedUntil, before_.lockEnd + 30 days);

        vm.prank(operator);
        vault.extendLock(tokenId, 60);
        IHearstVault.Position memory afterSecond = vault.cohortInfo(tokenId);
        assertEq(afterSecond.extendedUntil, afterFirst.extendedUntil + 60 days, "additive from prior end");
    }

    function test_extendLock_revertsAboveCap() public {
        uint256 tokenId = _depositAs(alice, 5_000e6);
        vm.prank(operator);
        vm.expectRevert(HearstVault.RecoveryCapExceeded.selector);
        vault.extendLock(tokenId, 731); // cap is 730
    }

    function test_extendLock_revertsOnMatured() public {
        uint256 tokenId = _depositAs(alice, 5_000e6);
        // Mature the position via target
        _notifyRewards(5_000e6);
        vm.prank(alice);
        vault.claim(tokenId);

        vm.prank(operator);
        vm.expectRevert(HearstVault.AlreadyMatured.selector);
        vault.extendLock(tokenId, 30);
    }

    function test_extendLock_revertsOnMissingPosition() public {
        vm.prank(operator);
        vm.expectRevert(HearstVault.PositionNotFound.selector);
        vault.extendLock(99_999, 30);
    }

    // ─── Treasury rotation ────────────────────────────────────────────────────

    function test_setTreasury_redirectsFutureWithdrawals() public {
        _depositAs(alice, 10_000e6);
        vm.warp(block.timestamp + 30 days);
        _notifyRewards(1_000e6);

        address newTreasury = makeAddr("newTreasury");
        vm.prank(admin);
        vault.setTreasury(newTreasury);
        assertEq(vault.treasury(), newTreasury, "treasury updated");

        uint256 mgmtBefore = vault.accruedMgmtFee();
        uint256 perfBefore = vault.accruedPerfFee();
        assertGt(mgmtBefore + perfBefore, 0, "fees accrued before withdrawal");

        vm.prank(admin);
        vault.withdrawFees();
        assertEq(usdc.balanceOf(newTreasury), mgmtBefore + perfBefore, "fees go to new treasury");
        assertEq(vault.accruedMgmtFee(), 0, "mgmt bucket emptied");
        assertEq(vault.accruedPerfFee(), 0, "perf bucket emptied");
    }

    function test_setTreasury_revertsOnZero() public {
        vm.prank(admin);
        vm.expectRevert(HearstVault.ZeroAddress.selector);
        vault.setTreasury(address(0));
    }

    // ─── Sweep ────────────────────────────────────────────────────────────────

    function test_sweep_recoversForeignErc20() public {
        MockUSDC dust = new MockUSDC();
        dust.mint(address(vault), 5_000);

        vm.prank(admin);
        vault.sweep(address(dust), treasury);
        assertEq(dust.balanceOf(treasury), 5_000);
        assertEq(dust.balanceOf(address(vault)), 0);
    }

    function test_sweep_revertsOnZeroDestination() public {
        MockUSDC dust = new MockUSDC();
        dust.mint(address(vault), 1);
        vm.prank(admin);
        vm.expectRevert(HearstVault.ZeroAddress.selector);
        vault.sweep(address(dust), address(0));
    }

    // ─── Pause / unpause ──────────────────────────────────────────────────────

    function test_pause_unpause_lifecycle() public {
        vm.prank(pauser);
        vault.pause();

        // deposit blocked
        vm.startPrank(alice);
        usdc.approve(address(vault), 5_000e6);
        vm.expectRevert();
        vault.deposit(5_000e6);
        vm.stopPrank();

        vm.prank(pauser);
        vault.unpause();

        // works again
        _depositAs(alice, 5_000e6);
        assertEq(vault.totalDeposits(), 5_000e6);
    }

    // ─── Rebalance: multi-step epoch tracking ─────────────────────────────────

    function test_multipleRebalances_writeSequentialEpochs() public {
        _depositAs(alice, 10_000e6);

        bytes32 sig1 = keccak256("sig-bull");
        bytes32 sig2 = keccak256("sig-side");
        bytes32 sig3 = keccak256("sig-bear");

        // Bull
        uint8[] memory w1 = new uint8[](3);
        w1[0] = 55;
        w1[1] = 25;
        w1[2] = 20;
        vm.prank(operator);
        vault.rebalance(w1, uint8(MarketRegime.BULL), uint8(SignalType.REBALANCE), sig1);

        // Sideways
        uint8[] memory w2 = new uint8[](3);
        w2[0] = 40;
        w2[1] = 30;
        w2[2] = 30;
        vm.warp(block.timestamp + 1 days);
        vm.prank(operator);
        vault.rebalance(w2, uint8(MarketRegime.SIDEWAYS), uint8(SignalType.YIELD_ROTATE), sig2);

        // Bear
        uint8[] memory w3 = new uint8[](3);
        w3[0] = 30;
        w3[1] = 45;
        w3[2] = 25;
        vm.warp(block.timestamp + 1 days);
        vm.prank(operator);
        vault.rebalance(w3, uint8(MarketRegime.BEAR), uint8(SignalType.REDUCE_RISK), sig3);

        // Verify each epoch snapshot
        (,, uint8 r0, uint8 t0,, uint128 tvl0, bytes32 id0) = vault.epochSnapshots(0);
        (,, uint8 r1, uint8 t1,,, bytes32 id1) = vault.epochSnapshots(1);
        (,, uint8 r2, uint8 t2,,, bytes32 id2) = vault.epochSnapshots(2);

        assertEq(r0, uint8(MarketRegime.BULL));
        assertEq(t0, uint8(SignalType.REBALANCE));
        assertEq(id0, sig1);
        assertEq(tvl0, 10_000e6);

        assertEq(r1, uint8(MarketRegime.SIDEWAYS));
        assertEq(t1, uint8(SignalType.YIELD_ROTATE));
        assertEq(id1, sig2);

        assertEq(r2, uint8(MarketRegime.BEAR));
        assertEq(t2, uint8(SignalType.REDUCE_RISK));
        assertEq(id2, sig3);

        assertEq(vault.currentEpoch(), 3);
        assertEq(uint8(vault.currentRegime()), uint8(MarketRegime.BEAR));
    }

    function test_rebalance_sameRegime_doesNotEmitRegimeChanged() public {
        // initial regime is SIDEWAYS
        uint8[] memory w = new uint8[](3);
        w[0] = 45;
        w[1] = 30;
        w[2] = 25;

        vm.recordLogs();
        vm.prank(operator);
        vault.rebalance(w, uint8(MarketRegime.SIDEWAYS), uint8(SignalType.REBALANCE), bytes32(0));

        Vm.Log[] memory logs = vm.getRecordedLogs();
        bytes32 regimeChangedTopic = keccak256("RegimeChanged(uint8,uint8)");
        for (uint256 i; i < logs.length; ++i) {
            assertTrue(logs[i].topics[0] != regimeChangedTopic, "must not emit RegimeChanged");
        }
    }

    function test_rebalance_invalidSignalType_reverts() public {
        uint8[] memory w = new uint8[](3);
        w[0] = 40;
        w[1] = 30;
        w[2] = 30;
        vm.prank(operator);
        vm.expectRevert(HearstVault.InvalidSignalType.selector);
        vault.rebalance(w, uint8(MarketRegime.BULL), 99, bytes32(0));
    }

    // ─── Multi-claim ──────────────────────────────────────────────────────────

    function test_multipleClaims_accrueCorrectly() public {
        uint256 tokenId = _depositAs(alice, 10_000e6);

        _notifyRewards(100e6);
        vm.prank(alice);
        uint256 paid1 = vault.claim(tokenId);

        // Second yield round
        _notifyRewards(100e6);
        vm.prank(alice);
        uint256 paid2 = vault.claim(tokenId);

        // Both claims should be approximately equal (alice is 100% staker, so net per round)
        assertApproxEqAbs(paid1, paid2, 1, "claims approximately equal");

        IHearstVault.Position memory pos = vault.cohortInfo(tokenId);
        assertEq(pos.cumulativePaid, paid1 + paid2);
    }

    // ─── Init guards ──────────────────────────────────────────────────────────

    function test_init_revertsOnZeroAdmin() public {
        uint8[] memory w = new uint8[](3);
        w[0] = 40;
        w[1] = 30;
        w[2] = 30;
        HearstVault.InitParams memory params = _initParams(address(0), 3, w);
        _expectInitRevert(HearstVault.ZeroAddress.selector, params);
    }

    function test_init_revertsOnInvalidPocketCount() public {
        uint8[] memory w = new uint8[](0);
        HearstVault.InitParams memory params = _initParams(admin, 0, w);
        _expectInitRevert(HearstVault.InvalidPocketCount.selector, params);
    }

    function test_init_revertsOnInvalidWeightSum() public {
        uint8[] memory w = new uint8[](3);
        w[0] = 50;
        w[1] = 30;
        w[2] = 30; // sums to 110
        HearstVault.InitParams memory params = _initParams(admin, 3, w);
        _expectInitRevert(HearstVault.InvalidWeights.selector, params);
    }

    function test_init_revertsOnFeeAboveCap() public {
        uint8[] memory w = new uint8[](3);
        w[0] = 40;
        w[1] = 30;
        w[2] = 30;
        HearstVault.InitParams memory params = _initParams(admin, 3, w);
        params.mgmtFeeBps = 501; // cap is 500
        _expectInitRevert(HearstVault.InvalidFee.selector, params);
    }

    // Helpers ───────────────────────────────────────────────────────────────────

    function _initParams(address admin_, uint8 pocketCount_, uint8[] memory weights_)
        internal
        view
        returns (HearstVault.InitParams memory)
    {
        return HearstVault.InitParams({
            asset: usdc,
            positionNft: vault.positionNft(),
            admin: admin_,
            treasury: treasury,
            pocketCount: pocketCount_,
            targetBps: 3600,
            lockPeriod: 7 days,
            minDeposit: 1_000e6,
            mgmtFeeBps: 150,
            perfFeeBps: 1500,
            baseAprBps: 1200,
            maxRecoveryDays: 730,
            maxTvl: 0,
            initialWeights: weights_,
            initialRegime: MarketRegime.SIDEWAYS
        });
    }

    function _expectInitRevert(bytes4 selector, HearstVault.InitParams memory params) internal {
        HearstVault impl = new HearstVault();
        bytes memory initCall = abi.encodeCall(HearstVault.initialize, (params));
        vm.expectRevert(selector);
        new ERC1967Proxy(address(impl), initCall);
    }
}
