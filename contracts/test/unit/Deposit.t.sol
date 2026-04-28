// SPDX-License-Identifier: MIT
pragma solidity 0.8.24;

import { VaultFixture } from "../helpers/VaultFixture.sol";
import { HearstVault } from "../../src/HearstVault.sol";
import { HearstPosition } from "../../src/HearstPosition.sol";
import { IHearstVault } from "../../src/interfaces/IHearstVault.sol";

contract DepositTest is VaultFixture {
    function test_deposit_mintsCohortNft() public {
        uint256 tokenId = _depositAs(alice, 5_000e6);
        assertEq(positionNft.ownerOf(tokenId), alice, "NFT minted to depositor");
        assertEq(positionNft.balanceOf(alice), 1, "alice has 1 cohort");
        assertEq(usdc.balanceOf(address(vault)), 5_000e6, "vault holds USDC");
    }

    function test_deposit_recordsPositionCorrectly() public {
        uint256 tokenId = _depositAs(alice, 5_000e6);
        IHearstVault.Position memory p = vault.cohortInfo(tokenId);
        assertEq(p.principal, 5_000e6, "principal");
        assertEq(p.depositTime, block.timestamp, "deposit time");
        assertEq(p.lockEnd, block.timestamp + LOCK_PERIOD, "lockEnd");
        assertEq(p.cumulativePaid, 0, "cumulativePaid");
        assertFalse(p.matured, "not matured");
    }

    function test_deposit_multiCohortSameUser() public {
        uint256 t1 = _depositAs(alice, 2_000e6);
        vm.warp(block.timestamp + 1 days);
        uint256 t2 = _depositAs(alice, 3_000e6);

        assertEq(positionNft.balanceOf(alice), 2, "two NFTs");
        uint256[] memory ids = vault.userCohortIds(alice);
        assertEq(ids.length, 2);
        assertEq(ids[0], t1);
        assertEq(ids[1], t2);
        assertEq(vault.totalDeposits(), 5_000e6);
    }

    function test_deposit_revertsBelowMin() public {
        vm.startPrank(alice);
        usdc.approve(address(vault), MIN_DEPOSIT - 1);
        vm.expectRevert(HearstVault.BelowMinDeposit.selector);
        vault.deposit(MIN_DEPOSIT - 1);
        vm.stopPrank();
    }

    function test_deposit_soulboundRevertsOnTransfer() public {
        uint256 tokenId = _depositAs(alice, 5_000e6);
        vm.prank(alice);
        vm.expectRevert(HearstPosition.Soulbound.selector);
        positionNft.transferFrom(alice, bob, tokenId);
    }

    function test_deposit_emitsDepositEvent() public {
        vm.startPrank(alice);
        usdc.approve(address(vault), 5_000e6);
        vm.expectEmit(true, true, false, true);
        emit IHearstVault.Deposit(alice, 1, 5_000e6, 0);
        vault.deposit(5_000e6);
        vm.stopPrank();
    }

    function test_deposit_multiUser_independentCohorts() public {
        uint256 a = _depositAs(alice, 5_000e6);
        uint256 b = _depositAs(bob, 7_000e6);
        assertEq(positionNft.ownerOf(a), alice);
        assertEq(positionNft.ownerOf(b), bob);
        assertEq(vault.totalDeposits(), 12_000e6);
    }
}
