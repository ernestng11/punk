// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

import "./ERC721.sol";
import "./ERC721Enumerable.sol";
import "./Ownable.sol";
import "./SafeMath.sol";
import "./Strings.sol";

contract BabySpirit is ERC721Enumerable, Ownable {

    using SafeMath for uint256;
    using Strings for uint256;

    string private m_BaseURI = "";    
    mapping (uint256 => string) private _tokenURIs;
    
    uint256 public maxBabySpirit = 1000;                               
    uint256 public babySpiritPrice = 1 * (10**18); // 1 Ether
    uint public maxBabySpiritPerMint = 10;                              
    bool public mintingActive = false;                                   

    constructor(
        string memory name,
        string memory symbol,
        string memory baseURI,
        uint256 _maxBabySpirit
    ) ERC721(name, symbol) {
        m_BaseURI = baseURI;
        setMaxSupply(_maxBabySpirit);
    }

    function mintBabySpirit(uint quantity, string[] memory _tokenURIArray) public payable {
        require(mintingActive, "Minting is not activated yet.");
        require(quantity > 0, "Why are you minting less than zero BabySpirits");
        require(
            totalSupply().add(quantity) <= maxBabySpirit,
            'Only 1,000 BabySpirits are available'
        );
        require(quantity <= maxBabySpiritPerMint, "Cannot mint this number of BabySpirits in one go !");
        require(babySpiritPrice.mul(quantity) <= msg.value, 'Ethereum sent is not sufficient.');

        for(uint i = 0; i < quantity; i++) {
            uint mintIndex = totalSupply();
            if (totalSupply() < maxBabySpirit) {
                _safeMint(msg.sender, mintIndex);
                _setTokenURI(mintIndex, _tokenURIArray[i]);
            }
        }
    }

    // reserve BabySpirits for team/giveaways
    function reserveBabySpirits(uint256 quantity, string[] memory _tokenURIArray) public onlyOwner {
        for(uint i = 0; i < quantity; i++) {
            uint mintIndex = totalSupply();
            if (mintIndex < maxBabySpirit) {
                _safeMint(msg.sender, mintIndex);
                _setTokenURI(mintIndex, _tokenURIArray[i]);
            }
        }
    }

    function switchMinting() public onlyOwner {
        mintingActive = !mintingActive;
    }

    function setMaxSupply(uint256 supply) private onlyOwner {
       maxBabySpirit = supply;
    }

    function setMaxQuantityPerMint (uint256 quantity) public onlyOwner {
        maxBabySpiritPerMint = quantity;
    }

    function setBaseURI(string memory baseURI) external onlyOwner() {
        m_BaseURI = baseURI;
    }

    function _baseURI() internal view override returns (string memory) {
        return m_BaseURI;
    }
    
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal virtual {
        require(_exists(tokenId), "ERC721Metadata: URI set of nonexistent token");
        _tokenURIs[tokenId] = _tokenURI;
    }
    
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721Metadata: URI query for nonexistent token");

        string memory _tokenURI = _tokenURIs[tokenId];
        string memory base = _baseURI();
            
        // If there is no base URI, return the token URI.
        if (bytes(base).length == 0) {
            return _tokenURI;
        }
        // If both are set, concatenate the baseURI and tokenURI (via abi.encodePacked).
        if (bytes(_tokenURI).length > 0) {
            return string(abi.encodePacked(base, _tokenURI));
        }
        // If there is a baseURI but no tokenURI, concatenate the tokenID to the baseURI.
        return string(abi.encodePacked(base, tokenId.toString()));
    }
        
    function withdrawBalance() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }

    /* Todo: Function to return all tokenID's of minter */

}
