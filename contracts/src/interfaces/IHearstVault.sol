// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.24;

import { MarketRegime } from "../types/Enums.sol";

interface IHearstVault {
    struct Position {
        uint128 principal;
        uint128 rewardDebt;
        uint64 depositTime;
        uint64 lockEnd;
        uint64 extendedUntil;
        uint128 cumulativePaid;
        bool matured;
    }

    struct EpochSnapshot {
        uint64 timestamp;
        uint16 aprBps;
        uint8 regime;
        uint8 signalType;
        uint128 rewardsDistributed;
        uint128 tvlAtSnapshot;
        bytes32 signalId;
    }

    event Deposit(address indexed user, uint256 indexed tokenId, uint256 amount, uint32 epoch);
    event Claim(address indexed user, uint256 indexed tokenId, uint256 amount);
    event Withdraw(address indexed user, uint256 indexed tokenId, uint256 principal, uint256 yieldAmount);
    event RebalanceExecuted(
        uint32 indexed epoch,
        uint8[] weights,
        uint8 regime,
        uint8 signalType,
        bytes32 indexed signalId,
        address indexed operator
    );
    event EpochAdvanced(uint32 indexed epoch, uint64 timestamp);
    event RegimeChanged(uint8 oldRegime, uint8 newRegime);
    event RewardsNotified(uint256 grossAmount, uint256 netToStakers, uint256 perfFee);
    event MgmtFeeAccrued(uint256 amount);
    event FeesWithdrawn(address indexed to, uint256 mgmt, uint256 perf);
    event PositionMatured(uint256 indexed tokenId, bytes32 reason);
    event RecoveryExtension(uint256 indexed tokenId, uint64 extendedUntil);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);
    event FeesUpdated(uint16 mgmtBps, uint16 perfBps);
    event MaxTvlUpdated(uint128 oldCap, uint128 newCap);

    function deposit(uint256 amount) external returns (uint256 tokenId);
    function claim(uint256 tokenId) external returns (uint256 amount);
    function withdraw(uint256 tokenId) external returns (uint256 principal, uint256 yieldAmount);
    function rebalance(uint8[] calldata newWeights, uint8 regime, uint8 signalType, bytes32 signalId) external;
    function notifyRewardAmount(uint256 amount) external;
    function advanceEpoch() external;

    function pendingRewards(uint256 tokenId) external view returns (uint256);
    function cohortInfo(uint256 tokenId) external view returns (Position memory);
    function userCohortIds(address user) external view returns (uint256[] memory);
    function pocketWeights() external view returns (uint8[] memory);
    function currentRegime() external view returns (MarketRegime);
}
