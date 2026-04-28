// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.24;

import { Initializable } from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import { UUPSUpgradeable } from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";
import {
    AccessControlUpgradeable
} from "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { PausableUpgradeable } from "@openzeppelin/contracts-upgradeable/utils/PausableUpgradeable.sol";

import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import { SafeCast } from "@openzeppelin/contracts/utils/math/SafeCast.sol";

import { IHearstVault } from "./interfaces/IHearstVault.sol";
import { IHearstPosition } from "./interfaces/IHearstPosition.sol";
import { MarketRegime, SignalType } from "./types/Enums.sol";

/// @title HearstVault
/// @notice Cohort-based USDC vault with on-chain rebalancing attestation. The underlying yield
///         strategy (mining infra, USDC yield, BTC hedged) is custodied off-chain. This contract
///         records: principal per cohort (NFT), allocation weights per epoch, signal-driven
///         rebalances, and yield distribution from operator notifications.
/// @dev Each deposit mints a soulbound HearstPosition NFT. Reward accounting is MasterChef-style
///      (accRewardPerShare). Fees: management (per-second on TVL) and performance (skimmed from
///      each reward notification). No swaps, no oracle, no MEV surface.
contract HearstVault is
    IHearstVault,
    Initializable,
    UUPSUpgradeable,
    AccessControlUpgradeable,
    ReentrancyGuard,
    PausableUpgradeable
{
    using SafeERC20 for IERC20;
    using SafeCast for uint256;

    // ─── Roles ───────────────────────────────────────────────────────────────
    bytes32 public constant OPERATOR_ROLE = keccak256("OPERATOR_ROLE");
    bytes32 public constant KEEPER_ROLE = keccak256("KEEPER_ROLE");
    bytes32 public constant PAUSER_ROLE = keccak256("PAUSER_ROLE");

    // ─── Constants ───────────────────────────────────────────────────────────
    uint256 public constant ACC_PRECISION = 1e18;
    uint256 public constant BPS = 10_000;
    uint256 public constant YEAR = 365 days;
    uint16 public constant MAX_MGMT_FEE_BPS = 500; // 5% per year cap
    uint16 public constant MAX_PERF_FEE_BPS = 3000; // 30% cap
    uint8 public constant MAX_POCKET_COUNT = 8;

    // ─── Errors ──────────────────────────────────────────────────────────────
    error BelowMinDeposit();
    error AboveMaxTvl();
    error NotPositionOwner();
    error NothingToClaim();
    error StillLocked();
    error InvalidWeights();
    error InvalidPocketCount();
    error InvalidRegime();
    error InvalidSignalType();
    error InvalidFee();
    error ZeroAddress();
    error AssetSweepBlocked();
    error NoStakers();
    error RecoveryCapExceeded();
    error AlreadyMatured();
    error PositionNotFound();
    error PositionListDesync();

    // ─── Config (set at init) ────────────────────────────────────────────────
    struct VaultConfig {
        IERC20 asset;
        uint8 pocketCount;
        uint16 targetBps; // cumulative yield target per cohort, e.g. 3600 = 36%
        uint32 lockPeriod; // seconds
        uint64 minDeposit; // in asset wei (USDC: 6 decimals)
        uint16 mgmtFeeBps; // annualized
        uint16 perfFeeBps; // applied on every notifyRewardAmount
        uint16 baseAprBps; // marketed APR, used in EpochSnapshot
        uint32 maxRecoveryDays;
        uint128 maxTvl; // 0 = uncapped
    }

    VaultConfig public cfg;
    IHearstPosition public positionNft;
    address public treasury;

    // ─── Reward accounting (MasterChef) ──────────────────────────────────────
    uint256 public accRewardPerShare; // scaled by ACC_PRECISION
    uint128 public totalDeposits;
    uint64 public lastFeeAccrualTime;
    uint32 public currentEpoch;

    // ─── Fee buckets ─────────────────────────────────────────────────────────
    uint128 public mgmtFeeDebt; // owed to treasury, not yet covered by a notify
    uint128 public accruedMgmtFee; // skimmed, ready to withdraw
    uint128 public accruedPerfFee;

    // ─── Allocation state ────────────────────────────────────────────────────
    uint8[] internal _currentWeights;
    MarketRegime public override currentRegime;

    // ─── Cohort positions ────────────────────────────────────────────────────
    mapping(uint256 => Position) public positions;
    uint256 public nextTokenId;

    mapping(address => uint256[]) internal _userTokenIds;
    mapping(uint256 => uint256) internal _tokenIndexInUserArray; // 1-indexed; 0 == absent

    // ─── Epoch snapshots ─────────────────────────────────────────────────────
    mapping(uint32 => EpochSnapshot) public epochSnapshots;

    // ─── Reserved storage gap ────────────────────────────────────────────────
    uint256[40] private _gap;

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() {
        _disableInitializers();
    }

    struct InitParams {
        IERC20 asset;
        IHearstPosition positionNft;
        address admin;
        address treasury;
        uint8 pocketCount;
        uint16 targetBps;
        uint32 lockPeriod;
        uint64 minDeposit;
        uint16 mgmtFeeBps;
        uint16 perfFeeBps;
        uint16 baseAprBps;
        uint32 maxRecoveryDays;
        uint128 maxTvl;
        uint8[] initialWeights;
        MarketRegime initialRegime;
    }

    function initialize(InitParams calldata p) external initializer {
        __AccessControl_init();
        __Pausable_init();

        if (address(p.asset) == address(0) || address(p.positionNft) == address(0)) {
            revert ZeroAddress();
        }
        if (p.admin == address(0) || p.treasury == address(0)) revert ZeroAddress();
        if (p.pocketCount == 0 || p.pocketCount > MAX_POCKET_COUNT) revert InvalidPocketCount();
        if (p.mgmtFeeBps > MAX_MGMT_FEE_BPS || p.perfFeeBps > MAX_PERF_FEE_BPS) revert InvalidFee();
        if (p.initialWeights.length != p.pocketCount) revert InvalidWeights();
        _validateWeightsSum(p.initialWeights);

        cfg = VaultConfig({
            asset: p.asset,
            pocketCount: p.pocketCount,
            targetBps: p.targetBps,
            lockPeriod: p.lockPeriod,
            minDeposit: p.minDeposit,
            mgmtFeeBps: p.mgmtFeeBps,
            perfFeeBps: p.perfFeeBps,
            baseAprBps: p.baseAprBps,
            maxRecoveryDays: p.maxRecoveryDays,
            maxTvl: p.maxTvl
        });
        positionNft = p.positionNft;
        treasury = p.treasury;
        _currentWeights = p.initialWeights;
        currentRegime = p.initialRegime;
        lastFeeAccrualTime = uint64(block.timestamp);
        nextTokenId = 1;

        _grantRole(DEFAULT_ADMIN_ROLE, p.admin);
        _grantRole(OPERATOR_ROLE, p.admin);
        _grantRole(KEEPER_ROLE, p.admin);
        _grantRole(PAUSER_ROLE, p.admin);
    }

    // ─── User actions ────────────────────────────────────────────────────────

    function deposit(uint256 amount) external override nonReentrant whenNotPaused returns (uint256 tokenId) {
        if (amount < cfg.minDeposit) revert BelowMinDeposit();
        if (cfg.maxTvl != 0 && uint256(totalDeposits) + amount > cfg.maxTvl) revert AboveMaxTvl();

        _accrueMgmtFee();

        cfg.asset.safeTransferFrom(msg.sender, address(this), amount);

        tokenId = nextTokenId++;
        positions[tokenId] = Position({
            principal: amount.toUint128(),
            rewardDebt: ((amount * accRewardPerShare) / ACC_PRECISION).toUint128(),
            depositTime: uint64(block.timestamp),
            lockEnd: uint64(block.timestamp + cfg.lockPeriod),
            extendedUntil: 0,
            cumulativePaid: 0,
            matured: false
        });
        totalDeposits = (uint256(totalDeposits) + amount).toUint128();

        _userTokenIds[msg.sender].push(tokenId);
        _tokenIndexInUserArray[tokenId] = _userTokenIds[msg.sender].length;

        positionNft.mint(msg.sender, tokenId);

        emit Deposit(msg.sender, tokenId, amount, currentEpoch);
    }

    function claim(uint256 tokenId) external override nonReentrant returns (uint256 amount) {
        if (positionNft.ownerOf(tokenId) != msg.sender) revert NotPositionOwner();
        _accrueMgmtFee();

        Position storage p = positions[tokenId];
        amount = _pending(p);
        if (amount == 0) revert NothingToClaim();

        p.rewardDebt = ((uint256(p.principal) * accRewardPerShare) / ACC_PRECISION).toUint128();
        p.cumulativePaid = (uint256(p.cumulativePaid) + amount).toUint128();
        _checkMaturity(tokenId, p);

        cfg.asset.safeTransfer(msg.sender, amount);
        emit Claim(msg.sender, tokenId, amount);
    }

    function withdraw(uint256 tokenId)
        external
        override
        nonReentrant
        returns (uint256 principal_, uint256 yieldAmount)
    {
        if (positionNft.ownerOf(tokenId) != msg.sender) revert NotPositionOwner();
        _accrueMgmtFee();

        Position storage p = positions[tokenId];
        if (!_isUnlocked(p)) revert StillLocked();

        yieldAmount = _pending(p);
        principal_ = p.principal;

        totalDeposits = (uint256(totalDeposits) - principal_).toUint128();
        _removeFromUserList(msg.sender, tokenId);
        delete positions[tokenId];
        positionNft.burn(tokenId);

        cfg.asset.safeTransfer(msg.sender, principal_ + yieldAmount);
        emit Withdraw(msg.sender, tokenId, principal_, yieldAmount);
    }

    // ─── Operator actions ────────────────────────────────────────────────────

    /// @notice Distribute USDC yield to active cohorts. Operator transfers `amount` USDC into the
    ///         vault (must approve first); perf fee skimmed, mgmt fee debt settled, remainder
    ///         compounds via accRewardPerShare.
    function notifyRewardAmount(uint256 amount) external override onlyRole(OPERATOR_ROLE) nonReentrant {
        if (totalDeposits == 0) revert NoStakers();
        _accrueMgmtFee();

        cfg.asset.safeTransferFrom(msg.sender, address(this), amount);

        uint256 perfFee = (amount * cfg.perfFeeBps) / BPS;
        uint256 afterPerf = amount - perfFee;

        uint256 mgmtPay = mgmtFeeDebt > afterPerf ? afterPerf : mgmtFeeDebt;
        // mgmtPay <= mgmtFeeDebt (uint128) by construction; cast cannot truncate.
        // forge-lint: disable-next-line(unsafe-typecast)
        mgmtFeeDebt -= uint128(mgmtPay);
        accruedMgmtFee = (uint256(accruedMgmtFee) + mgmtPay).toUint128();
        accruedPerfFee = (uint256(accruedPerfFee) + perfFee).toUint128();

        uint256 net = afterPerf - mgmtPay;
        if (net > 0) {
            accRewardPerShare += (net * ACC_PRECISION) / totalDeposits;
        }

        emit RewardsNotified(amount, net, perfFee);
    }

    function rebalance(uint8[] calldata newWeights, uint8 regime, uint8 signalType, bytes32 signalId)
        external
        override
        onlyRole(OPERATOR_ROLE)
    {
        if (newWeights.length != cfg.pocketCount) revert InvalidPocketCount();
        if (regime > uint8(MarketRegime.BEAR)) revert InvalidRegime();
        if (signalType > uint8(SignalType.REDUCE_RISK)) revert InvalidSignalType();
        _validateWeightsSum(newWeights);

        _accrueMgmtFee();
        uint32 epoch = currentEpoch;
        _writeEpochSnapshot(regime, signalType, signalId);

        _currentWeights = newWeights;
        MarketRegime oldRegime = currentRegime;
        currentRegime = MarketRegime(regime);

        if (oldRegime != currentRegime) {
            emit RegimeChanged(uint8(oldRegime), regime);
        }
        emit RebalanceExecuted(epoch, newWeights, regime, signalType, signalId, msg.sender);
    }

    /// @notice Closes the current epoch without changing weights. Intended to be called by a
    ///         keeper bot for periodic snapshots (regardless of rebalance frequency).
    function advanceEpoch() external override onlyRole(KEEPER_ROLE) {
        _accrueMgmtFee();
        uint32 epoch = currentEpoch;
        _writeEpochSnapshot(uint8(currentRegime), uint8(SignalType.NONE), bytes32(0));
        emit EpochAdvanced(epoch, uint64(block.timestamp));
    }

    /// @notice Capital recovery: extend a cohort's lockup by `extraDays` so the off-chain mining
    ///         infrastructure can continue accruing yield to recover underwater principal. The
    ///         extension is additive from whichever is later: the original lockEnd or the prior
    ///         extension. Cap is per-call (against `maxRecoveryDays`); operator can call multiple
    ///         times if longer recovery is needed, each call subject to the same cap.
    function extendLock(uint256 tokenId, uint32 extraDays) external onlyRole(OPERATOR_ROLE) {
        if (extraDays > cfg.maxRecoveryDays) revert RecoveryCapExceeded();
        Position storage p = positions[tokenId];
        if (p.principal == 0) revert PositionNotFound();
        if (p.matured) revert AlreadyMatured();

        uint64 baseEnd = p.extendedUntil > p.lockEnd ? p.extendedUntil : p.lockEnd;
        p.extendedUntil = uint64(uint256(baseEnd) + uint256(extraDays) * 1 days);
        emit RecoveryExtension(tokenId, p.extendedUntil);
    }

    // ─── Admin / governance ──────────────────────────────────────────────────

    function setFees(uint16 mgmtBps, uint16 perfBps) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (mgmtBps > MAX_MGMT_FEE_BPS || perfBps > MAX_PERF_FEE_BPS) revert InvalidFee();
        _accrueMgmtFee();
        cfg.mgmtFeeBps = mgmtBps;
        cfg.perfFeeBps = perfBps;
        emit FeesUpdated(mgmtBps, perfBps);
    }

    function setMaxTvl(uint128 newCap) external onlyRole(DEFAULT_ADMIN_ROLE) {
        emit MaxTvlUpdated(cfg.maxTvl, newCap);
        cfg.maxTvl = newCap;
    }

    function setTreasury(address newTreasury) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (newTreasury == address(0)) revert ZeroAddress();
        emit TreasuryUpdated(treasury, newTreasury);
        treasury = newTreasury;
    }

    /// @notice Sweep accrued fees to the configured treasury. The recipient is fixed by
    ///         `setTreasury` to limit blast radius if an admin key is compromised.
    function withdrawFees() external onlyRole(DEFAULT_ADMIN_ROLE) {
        address to = treasury;
        uint256 mgmt = accruedMgmtFee;
        uint256 perf = accruedPerfFee;
        accruedMgmtFee = 0;
        accruedPerfFee = 0;
        if (mgmt + perf > 0) {
            cfg.asset.safeTransfer(to, mgmt + perf);
        }
        emit FeesWithdrawn(to, mgmt, perf);
    }

    function pause() external onlyRole(PAUSER_ROLE) {
        _pause();
    }

    function unpause() external onlyRole(PAUSER_ROLE) {
        _unpause();
    }

    function sweep(address token, address to) external onlyRole(DEFAULT_ADMIN_ROLE) {
        if (token == address(cfg.asset)) revert AssetSweepBlocked();
        if (to == address(0)) revert ZeroAddress();
        uint256 bal = IERC20(token).balanceOf(address(this));
        if (bal > 0) IERC20(token).safeTransfer(to, bal);
    }

    function _authorizeUpgrade(address) internal override onlyRole(DEFAULT_ADMIN_ROLE) { }

    // ─── Views ───────────────────────────────────────────────────────────────

    function pendingRewards(uint256 tokenId) external view override returns (uint256) {
        return _pending(positions[tokenId]);
    }

    function cohortInfo(uint256 tokenId) external view override returns (Position memory) {
        return positions[tokenId];
    }

    function userCohortIds(address user) external view override returns (uint256[] memory) {
        return _userTokenIds[user];
    }

    function pocketWeights() external view override returns (uint8[] memory) {
        return _currentWeights;
    }

    function isUnlocked(uint256 tokenId) external view returns (bool) {
        return _isUnlocked(positions[tokenId]);
    }

    function targetReached(uint256 tokenId) external view returns (bool) {
        Position storage p = positions[tokenId];
        return p.matured || p.cumulativePaid >= (uint256(p.principal) * cfg.targetBps) / BPS;
    }

    // ─── Internal ────────────────────────────────────────────────────────────

    function _pending(Position storage p) internal view returns (uint256) {
        if (p.principal == 0) return 0;
        uint256 accumulated = (uint256(p.principal) * accRewardPerShare) / ACC_PRECISION;
        return accumulated > p.rewardDebt ? accumulated - p.rewardDebt : 0;
    }

    function _isUnlocked(Position storage p) internal view returns (bool) {
        if (p.matured) return true;
        if (p.extendedUntil != 0) return block.timestamp >= p.extendedUntil;
        return block.timestamp >= p.lockEnd;
    }

    function _checkMaturity(uint256 tokenId, Position storage p) internal {
        if (p.matured) return;
        uint256 target = (uint256(p.principal) * cfg.targetBps) / BPS;
        if (p.cumulativePaid >= target) {
            p.matured = true;
            p.lockEnd = uint64(block.timestamp);
            emit PositionMatured(tokenId, "target");
        }
    }

    function _accrueMgmtFee() internal {
        uint64 nowTs = uint64(block.timestamp);
        uint64 elapsed = nowTs - lastFeeAccrualTime;
        if (elapsed == 0) return;
        if (totalDeposits != 0 && cfg.mgmtFeeBps != 0) {
            uint256 owed = (uint256(totalDeposits) * cfg.mgmtFeeBps * elapsed) / (BPS * YEAR);
            if (owed > 0) {
                mgmtFeeDebt = (uint256(mgmtFeeDebt) + owed).toUint128();
                emit MgmtFeeAccrued(owed);
            }
        }
        lastFeeAccrualTime = nowTs;
    }

    /// @dev Writes the snapshot at `currentEpoch`, then increments. So `epochSnapshots[N]` holds
    ///      the state captured AT the close of epoch N. `rewardsDistributed` is reserved for a
    ///      future per-epoch tracker; for V1 it stays 0.
    function _writeEpochSnapshot(uint8 regime, uint8 signalType, bytes32 signalId) internal {
        epochSnapshots[currentEpoch] = EpochSnapshot({
            timestamp: uint64(block.timestamp),
            aprBps: cfg.baseAprBps,
            regime: regime,
            signalType: signalType,
            rewardsDistributed: 0,
            tvlAtSnapshot: totalDeposits,
            signalId: signalId
        });
        unchecked {
            ++currentEpoch;
        }
    }

    function _validateWeightsSum(uint8[] memory weights) internal pure {
        uint256 sum;
        uint256 len = weights.length;
        for (uint256 i; i < len; ++i) {
            sum += weights[i];
        }
        if (sum != 100) revert InvalidWeights();
    }

    function _removeFromUserList(address user, uint256 tokenId) internal {
        uint256 idxPlusOne = _tokenIndexInUserArray[tokenId];
        if (idxPlusOne == 0) revert PositionListDesync();
        uint256 idx = idxPlusOne - 1;
        uint256[] storage list = _userTokenIds[user];
        uint256 lastIdx = list.length - 1;
        if (idx != lastIdx) {
            uint256 lastToken = list[lastIdx];
            list[idx] = lastToken;
            _tokenIndexInUserArray[lastToken] = idxPlusOne;
        }
        list.pop();
        delete _tokenIndexInUserArray[tokenId];
    }
}
