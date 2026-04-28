// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Test } from "forge-std/Test.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

import { HearstVault } from "../../src/HearstVault.sol";
import { HearstPosition } from "../../src/HearstPosition.sol";
import { IHearstPosition } from "../../src/interfaces/IHearstPosition.sol";
import { MarketRegime } from "../../src/types/Enums.sol";
import { MockUSDC } from "./MockUSDC.sol";

/// @notice Shared setUp for HearstVault unit tests. Deploys USDC, NFT, and vault behind UUPS
///         proxies with sane Prime defaults, and exposes labelled actor addresses.
abstract contract VaultFixture is Test {
    MockUSDC internal usdc;
    HearstVault internal vault;
    HearstPosition internal positionNft;

    address internal admin = makeAddr("admin");
    address internal operator = makeAddr("operator");
    address internal keeper = makeAddr("keeper");
    address internal pauser = makeAddr("pauser");
    address internal treasury = makeAddr("treasury");
    address internal alice = makeAddr("alice");
    address internal bob = makeAddr("bob");
    address internal carol = makeAddr("carol");

    uint64 internal constant MIN_DEPOSIT = 1_000e6; // 1k USDC for testnet
    uint16 internal constant TARGET_BPS = 3600; // 36%
    uint32 internal constant LOCK_PERIOD = 7 days;
    uint16 internal constant MGMT_FEE_BPS = 150; // 1.5% APR
    uint16 internal constant PERF_FEE_BPS = 1500; // 15%
    uint16 internal constant BASE_APR_BPS = 1200; // 12%
    uint128 internal constant MAX_TVL = 0; // uncapped on testnet

    function setUp() public virtual {
        usdc = new MockUSDC();

        // Predict the vault proxy address so we can initialize the position NFT pointing at it.
        // Deployment order from here: positionImpl, positionProxy, vaultImpl, vaultProxy.
        // Current nonce is N (used MockUSDC); next 4 deployments use nonces N..N+3.
        // vaultProxy will use nonce = current + 3.
        HearstPosition positionImpl = new HearstPosition();
        address predictedVault = vm.computeCreateAddress(address(this), vm.getNonce(address(this)) + 2);
        bytes memory positionInitWired =
            abi.encodeCall(HearstPosition.initialize, ("Hearst Prime Position", "HPP", predictedVault));
        ERC1967Proxy positionProxy = new ERC1967Proxy(address(positionImpl), positionInitWired);
        positionNft = HearstPosition(address(positionProxy));

        HearstVault vaultImpl = new HearstVault();

        uint8[] memory initialWeights = new uint8[](3);
        initialWeights[0] = 40;
        initialWeights[1] = 30;
        initialWeights[2] = 30;

        HearstVault.InitParams memory params = HearstVault.InitParams({
            asset: usdc,
            positionNft: IHearstPosition(address(positionNft)),
            admin: admin,
            treasury: treasury,
            pocketCount: 3,
            targetBps: TARGET_BPS,
            lockPeriod: LOCK_PERIOD,
            minDeposit: MIN_DEPOSIT,
            mgmtFeeBps: MGMT_FEE_BPS,
            perfFeeBps: PERF_FEE_BPS,
            baseAprBps: BASE_APR_BPS,
            maxRecoveryDays: 730,
            maxTvl: MAX_TVL,
            initialWeights: initialWeights,
            initialRegime: MarketRegime.SIDEWAYS
        });
        bytes memory vaultInit = abi.encodeCall(HearstVault.initialize, (params));
        ERC1967Proxy vaultProxy = new ERC1967Proxy(address(vaultImpl), vaultInit);
        vault = HearstVault(address(vaultProxy));
        require(address(vault) == predictedVault, "fixture: vault address mismatch");

        // Grant separate roles for tests
        vm.startPrank(admin);
        vault.grantRole(vault.OPERATOR_ROLE(), operator);
        vault.grantRole(vault.KEEPER_ROLE(), keeper);
        vault.grantRole(vault.PAUSER_ROLE(), pauser);
        vm.stopPrank();

        // Fund test users
        usdc.mint(alice, 100_000e6);
        usdc.mint(bob, 100_000e6);
        usdc.mint(carol, 100_000e6);
        usdc.mint(operator, 1_000_000e6); // for notifyRewardAmount
    }

    // ─── helpers ─────────────────────────────────────────────────────────────

    function _depositAs(address user, uint256 amount) internal returns (uint256 tokenId) {
        vm.startPrank(user);
        usdc.approve(address(vault), amount);
        tokenId = vault.deposit(amount);
        vm.stopPrank();
    }

    function _notifyRewards(uint256 amount) internal {
        vm.startPrank(operator);
        usdc.approve(address(vault), amount);
        vault.notifyRewardAmount(amount);
        vm.stopPrank();
    }

    function _rebalanceTo(uint8 a, uint8 b, uint8 c, MarketRegime regime, uint8 sigType) internal {
        uint8[] memory w = new uint8[](3);
        w[0] = a;
        w[1] = b;
        w[2] = c;
        vm.prank(operator);
        vault.rebalance(w, uint8(regime), sigType, keccak256("test-signal"));
    }
}
