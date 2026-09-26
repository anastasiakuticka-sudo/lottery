// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract Lottery {
    address public manager;
    address[] public players;

    uint256 public entryFee = 0.01 ether;

    event PlayerJoined(address player);
    event WinnerPicked(address winner, uint256 amount);

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

    function joinLottery() public payable {
        require(
            msg.value == entryFee,
            "Entry fee is 0.01 ETH"
        );

        players.push(msg.sender);

        emit PlayerJoined(msg.sender);
    }

    function getBalance() public view returns (uint256) {
        return address(this).balance;
    }

    function getPlayersCount() public view returns (uint256) {
        return players.length;
    }

    function pickWinner() public onlyManager {
        require(
            players.length > 0,
            "There are no players"
        );

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

        uint256 prize = address(this).balance;

        payable(winner).transfer(prize);

        emit WinnerPicked(winner, prize);

        delete players;
    }
}