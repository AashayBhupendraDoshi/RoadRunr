// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Burnable.sol";

/// @custom:security-contact aashay@motodb.io
contract RRNFT is ERC721, ERC721URIStorage, Pausable, Ownable, ERC721Burnable {
    // Fired when tokens are deposited to this contract
    event ContractDeposit(address indexed sender, uint amount);
    // base URI for NFTs
    string private _buri;
    constructor(string memory buri) ERC721("RRNFT", "RRT") {
        _buri = buri;
    }

    // Setter function to change baseURI
    function setBaseURI(string memory buri) public onlyOwner {
        require(bytes(buri).length > 0, "wrong base uri");
        _buri = buri;
    }

    function _baseURI() internal view override returns (string memory) {
        return _buri;
    }

    // To pause all contract functions
    function pause() public onlyOwner {
        _pause();
    }

    // To unpause all contract functions
    function unpause() public onlyOwner {
        _unpause();
    }

    function safeMint(address to, uint256 tokenId, string memory uri)
        public
        onlyOwner
    {
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
    }

    function _beforeTokenTransfer(address from, address to, uint256 tokenId)
        internal
        whenNotPaused
        override
    {
        super._beforeTokenTransfer(from, to, tokenId);
    }

    // The following functions are overrides required by Solidity.

    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }


    function withdraw() public payable onlyOwner {
    // Waithdraw function to transfer contract balance to the contract owner
    // Later transfer the tokens to the multisig
    (bool os, ) = payable(owner()).call{value: address(this).balance}("");
    require(os);
    }

    receive() external payable{
    // Payable fallback function to accept payments
        // Emit Deposit event
        emit ContractDeposit(msg.sender, msg.value);
    }
}
