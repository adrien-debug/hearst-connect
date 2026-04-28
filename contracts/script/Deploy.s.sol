// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { Script, console2 } from "forge-std/Script.sol";
import { ERC1967Proxy } from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import { HearstVault } from "../src/HearstVault.sol";
import { HearstPosition } from "../src/HearstPosition.sol";
import { IHearstPosition } from "../src/interfaces/IHearstPosition.sol";
import { MarketRegime } from "../src/types/Enums.sol";

/// @notice Deploys HearstPosition + HearstVault behind UUPS proxies, grants roles to a multisig
///         (Safe), then renounces the deployer's DEFAULT_ADMIN_ROLE. Reverts if the deployer
///         retains admin power.
contract DeployScript is Script {
    struct DeployConfig {
        address asset; // USDC
        address admin; // Safe multisig (will hold all roles initially)
        address treasury; // fee recipient
        uint8 pocketCount;
        uint16 targetBps;
        uint32 lockPeriod;
        uint64 minDeposit;
        uint16 mgmtFeeBps;
        uint16 perfFeeBps;
        uint16 baseAprBps;
        uint32 maxRecoveryDays;
        uint128 maxTvl;
        string positionName;
        string positionSymbol;
    }

    function run() external {
        DeployConfig memory c = _loadConfig();

        uint256 deployerKey = vm.envUint("DEPLOYER_PRIVATE_KEY");
        address deployer = vm.addr(deployerKey);
        console2.log("Deployer:", deployer);
        console2.log("Admin (Safe):", c.admin);
        console2.log("Asset (USDC):", c.asset);

        vm.startBroadcast(deployerKey);

        HearstPosition positionImpl = new HearstPosition();
        address predictedVault = vm.computeCreateAddress(deployer, vm.getNonce(deployer) + 2);

        bytes memory positionInit =
            abi.encodeCall(HearstPosition.initialize, (c.positionName, c.positionSymbol, predictedVault));
        ERC1967Proxy positionProxy = new ERC1967Proxy(address(positionImpl), positionInit);
        HearstPosition position = HearstPosition(address(positionProxy));

        HearstVault vaultImpl = new HearstVault();

        uint8[] memory weights = _initialWeights(c.pocketCount);
        HearstVault.InitParams memory params = HearstVault.InitParams({
            asset: IERC20(c.asset),
            positionNft: IHearstPosition(address(position)),
            admin: c.admin,
            treasury: c.treasury,
            pocketCount: c.pocketCount,
            targetBps: c.targetBps,
            lockPeriod: c.lockPeriod,
            minDeposit: c.minDeposit,
            mgmtFeeBps: c.mgmtFeeBps,
            perfFeeBps: c.perfFeeBps,
            baseAprBps: c.baseAprBps,
            maxRecoveryDays: c.maxRecoveryDays,
            maxTvl: c.maxTvl,
            initialWeights: weights,
            initialRegime: MarketRegime.SIDEWAYS
        });
        bytes memory vaultInit = abi.encodeCall(HearstVault.initialize, (params));
        ERC1967Proxy vaultProxy = new ERC1967Proxy(address(vaultImpl), vaultInit);
        HearstVault vault = HearstVault(address(vaultProxy));
        require(address(vault) == predictedVault, "Deploy: vault address mismatch");

        vm.stopBroadcast();

        // Post-deploy assertions: deployer must NOT retain admin role.
        require(!vault.hasRole(vault.DEFAULT_ADMIN_ROLE(), deployer), "Deploy: deployer still has admin role");
        require(vault.hasRole(vault.DEFAULT_ADMIN_ROLE(), c.admin), "Deploy: admin role not granted");

        console2.log("HearstPosition impl:", address(positionImpl));
        console2.log("HearstPosition proxy:", address(position));
        console2.log("HearstVault impl:    ", address(vaultImpl));
        console2.log("HearstVault proxy:   ", address(vault));
    }

    function _loadConfig() internal view returns (DeployConfig memory c) {
        c.asset = vm.envAddress("ASSET_ADDRESS");
        c.admin = vm.envAddress("ADMIN_ADDRESS");
        c.treasury = vm.envOr("TREASURY_ADDRESS", c.admin);
        c.pocketCount = uint8(vm.envOr("POCKET_COUNT", uint256(3)));
        c.targetBps = uint16(vm.envOr("TARGET_BPS", uint256(3600)));
        c.lockPeriod = uint32(vm.envOr("LOCK_PERIOD", uint256(7 days)));
        c.minDeposit = uint64(vm.envOr("MIN_DEPOSIT", uint256(1_000e6)));
        c.mgmtFeeBps = uint16(vm.envOr("MGMT_FEE_BPS", uint256(150)));
        c.perfFeeBps = uint16(vm.envOr("PERF_FEE_BPS", uint256(1500)));
        c.baseAprBps = uint16(vm.envOr("BASE_APR_BPS", uint256(1200)));
        c.maxRecoveryDays = uint32(vm.envOr("MAX_RECOVERY_DAYS", uint256(730)));
        c.maxTvl = uint128(vm.envOr("MAX_TVL", uint256(0)));
        c.positionName = vm.envOr("POSITION_NAME", string("Hearst Prime Position"));
        c.positionSymbol = vm.envOr("POSITION_SYMBOL", string("HPP"));
    }

    function _initialWeights(uint8 pocketCount) internal pure returns (uint8[] memory w) {
        // Default Prime weights for sideways regime: 40 / 30 / 30
        if (pocketCount == 3) {
            w = new uint8[](3);
            w[0] = 40;
            w[1] = 30;
            w[2] = 30;
        } else if (pocketCount == 2) {
            w = new uint8[](2);
            w[0] = 70;
            w[1] = 30;
        } else {
            // Even split fallback
            w = new uint8[](pocketCount);
            uint8 each = uint8(100 / pocketCount);
            uint8 remainder = uint8(100 - uint256(each) * pocketCount);
            for (uint8 i; i < pocketCount; ++i) {
                w[i] = each;
            }
            w[0] += remainder;
        }
    }
}
