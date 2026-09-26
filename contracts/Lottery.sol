// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Lottery {
    address public manager;
    address[] public players;

    mapping(address => string) public nicknames;

    uint256 public entryFee = 0.01 ether;

    event PlayerJoined(address player, string nickname);
    event WinnerPicked(address winner, string nickname, uint256 amount);

    constructor() {
        manager = msg.sender;
    }

    modifier onlyManager() {
        require(
            msg.sender == manager,
            "Only manager can perform this action"
        );
        _;
    }

    function joinLottery(string memory nickname) public payable {
        require(msg.value == entryFee, "Entry fee is 0.01 ETH");
        require(bytes(nickname).length > 0, "Nickname cannot be empty");

        players.push(msg.sender);
        nicknames[msg.sender] = nickname;

        emit PlayerJoined(msg.sender, nickname);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getPlayersCount() public view returns (uint256) {
        return players.length;
    }

    function getPlayers()
        public
        view
        returns (address[] memory, string[] memory)
    {
        string[] memory playerNicknames = new string[](players.length);

        for (uint256 i = 0; i < players.length; i++) {
            playerNicknames[i] = nicknames[players[i]];
        }

        return (players, playerNicknames);
    }

    function pickWinner() public onlyManager {
        require(players.length > 0, "There are no players");

        uint256 randomNumber = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    players.length
                )
            )
        );

        uint256 winnerIndex = randomNumber % players.length;

        address winner = players[winnerIndex];
        string memory winnerNickname = nicknames[winner];

        uint256 prize = address(this).balance;

        payable(winner).transfer(prize);

        emit WinnerPicked(winner, winnerNickname, prize);

        delete players;
    }
}