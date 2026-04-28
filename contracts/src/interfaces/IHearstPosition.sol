// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.24;

interface IHearstPosition {
    function vault() external view returns (address);
    function mint(address to, uint256 tokenId) external;
    function burn(uint256 tokenId) external;
    function ownerOf(uint256 tokenId) external view returns (address);
    function balanceOf(address owner) external view returns (uint256);
}
