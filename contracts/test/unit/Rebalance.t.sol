// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { VaultFixture } from "../helpers/VaultFixture.sol";
import { HearstVault } from "../../src/HearstVault.sol";
import { IAccessControl } from "@openzeppelin/contracts/access/IAccessControl.sol";
import { MarketRegime, SignalType } from "../../src/types/Enums.sol";

contract RebalanceTest is VaultFixture {
    bytes32 constant SIGNAL_ID = keccak256("agent-signal-001");

    function test_rebalance_updatesWeightsAndRegime() public {
        _depositAs(alice, 5_000e6);
        _rebalanceTo(55, 25, 20, MarketRegime.BULL, uint8(SignalType.REBALANCE));

        uint8[] memory w = vault.pocketWeights();
        assertEq(w.length, 3);
        assertEq(w[0], 55);
        assertEq(w[1], 25);
        assertEq(w[2], 20);
        assertEq(uint8(vault.currentRegime()), uint8(MarketRegime.BULL));
    }

    function test_rebalance_advancesEpoch() public {
        uint32 e0 = vault.currentEpoch();
        _rebalanceTo(55, 25, 20, MarketRegime.BULL, uint8(SignalType.REBALANCE));
        assertEq(vault.currentEpoch(), e0 + 1);
    }

    function test_rebalance_writesEpochSnapshot() public {
        _depositAs(alice, 5_000e6);
        uint32 epochBefore = vault.currentEpoch();
        _rebalanceTo(55, 25, 20, MarketRegime.BULL, uint8(SignalType.REBALANCE));

        (uint64 ts, uint16 aprBps, uint8 regime, uint8 sigType,, uint128 tvl, bytes32 sigId) =
            vault.epochSnapshots(epochBefore);
        assertEq(ts, block.timestamp);
        assertEq(aprBps, BASE_APR_BPS);
        assertEq(regime, uint8(MarketRegime.BULL));
        assertEq(sigType, uint8(SignalType.REBALANCE));
        assertEq(tvl, 5_000e6);
        assertEq(sigId, keccak256("test-signal"));
    }

    function test_rebalance_revertsOnBadSum() public {
        uint8[] memory w = new uint8[](3);
        w[0] = 50;
        w[1] = 30;
        w[2] = 30; // sums to 110
        vm.prank(operator);
        vm.expectRevert(HearstVault.InvalidWeights.selector);
        vault.rebalance(w, uint8(MarketRegime.BULL), uint8(SignalType.REBALANCE), SIGNAL_ID);
    }

    function test_rebalance_revertsOnBadLength() public {
        uint8[] memory w = new uint8[](2);
        w[0] = 50;
        w[1] = 50;
        vm.prank(operator);
        vm.expectRevert(HearstVault.InvalidPocketCount.selector);
        vault.rebalance(w, uint8(MarketRegime.BULL), uint8(SignalType.REBALANCE), SIGNAL_ID);
    }

    function test_rebalance_revertsOnBadRegime() public {
        uint8[] memory w = new uint8[](3);
        w[0] = 40;
        w[1] = 30;
        w[2] = 30;
        vm.prank(operator);
        vm.expectRevert(HearstVault.InvalidRegime.selector);
        vault.rebalance(w, 99, uint8(SignalType.REBALANCE), SIGNAL_ID);
    }

    function test_rebalance_revertsForNonOperator() public {
        uint8[] memory w = new uint8[](3);
        w[0] = 40;
        w[1] = 30;
        w[2] = 30;
        bytes32 opRole = vault.OPERATOR_ROLE();
        vm.expectRevert(
            abi.encodeWithSelector(IAccessControl.AccessControlUnauthorizedAccount.selector, alice, opRole)
        );
        vm.prank(alice);
        vault.rebalance(w, uint8(MarketRegime.BULL), uint8(SignalType.REBALANCE), SIGNAL_ID);
    }

    function test_rebalance_sameWeightsDifferentRegime_changesRegime() public {
        // Same weights as initial but flip to BULL — should still update regime and emit
        // RegimeChanged. Sanity check that weights-equal != regime-equal.
        uint8[] memory w = new uint8[](3);
        w[0] = 40;
        w[1] = 30;
        w[2] = 30;
        vm.prank(operator);
        vault.rebalance(w, uint8(MarketRegime.BULL), uint8(SignalType.REBALANCE), SIGNAL_ID);
        assertEq(uint8(vault.currentRegime()), uint8(MarketRegime.BULL));
    }
}
