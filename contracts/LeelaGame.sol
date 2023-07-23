// SPDX-License-Identifier: MIT
/* solhint-disable */
pragma solidity ^0.8.0;

import "./LeelaToken.sol";

contract LeelaGame {
    LeelaToken public leelaToken;
    address public leelaTokenAddress;

    uint8 constant MAX_ROLL = 6;
    uint8 constant WIN_PLAN = 68;
    uint8 constant TOTAL_PLANS = 72;

    struct Player {
        uint256 plan;
        uint256 previousPlan;
        bool isStart;
        bool isFinished;
        uint8 consecutiveSixes;
    }

    constructor(address _leelaTokenAddress) {
        leelaTokenAddress = _leelaTokenAddress;
        leelaToken = LeelaToken(_leelaTokenAddress);
        Player memory newPlayer;
        newPlayer.plan = 68;
        newPlayer.previousPlan = 68;
        players[msg.sender] = newPlayer;
    }

    mapping(address => Player) public players;
    mapping(address => uint8[]) public playerRolls;
    mapping(address => uint256[]) public playerPlans;

    event DiceRolled(
        address indexed roller,
        uint8 indexed rolled,
        uint256 indexed currentPlan
    );

    // Function for writing off tokens for each move
    function chargeTokenForRoll(address playerAddress) private {
        uint256 allowance = leelaToken.allowance(playerAddress, address(this));
        require(allowance >= 1, "Insufficient allowance for transfer");

        bool success = leelaToken.transferFrom(playerAddress, address(this), 1);
        require(success, "TransferFrom failed");
    }

    function rollDice() external returns (uint8) {
        uint8 rollResult = generateRandomNumber();
        playerRolls[msg.sender].push(rollResult);

        Player storage player = players[msg.sender];
        if (!player.isStart && rollResult == 6) {
            player.plan = 6;
            player.isStart = true;
            player.consecutiveSixes = 1;
            // chargeTokenForRoll(msg.sender);
            return rollResult;
        }

        handleRollResult(rollResult, msg.sender);
        // chargeTokenForRoll(msg.sender);
        emit DiceRolled(msg.sender, rollResult, player.plan);
        return rollResult;
    }

    function generateRandomNumber() private view returns (uint8) {
        uint256 randomNum = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    blockhash(block.number - 1),
                    msg.sender
                )
            )
        );
        uint8 roll = uint8((randomNum % MAX_ROLL) + 1);
        return roll;
    }

    function handleRollResult(uint8 roll, address playerAddress) private {
        Player storage player = players[playerAddress];
        if (!player.isStart) {
            if (roll == MAX_ROLL) {
                player.isStart = true;
                player.consecutiveSixes = 1;
                player.plan = 6;
                return;
            }
            return;
        }

        if (roll == MAX_ROLL) {
            player.consecutiveSixes += 1;
            if (player.consecutiveSixes == 3) {
                player.plan = player.previousPlan;
                player.consecutiveSixes = 0;
                return;
            }
        } else {
            player.consecutiveSixes = 0;
        }

        movePlayer(roll, playerAddress);
    }

    function movePlayer(uint8 roll, address playerAddress) private {
        Player storage player = players[playerAddress];
        player.previousPlan = player.plan;
        uint256 newPlan = player.plan + roll;

        // Snakes that lead the player downwards
        if (newPlan > TOTAL_PLANS) {
            newPlan = player.plan;
        }
        if (newPlan == 12) {
            newPlan = 8;
        } else if (newPlan == 16) {
            newPlan = 4;
        } else if (newPlan == 24) {
            newPlan = 7;
        } else if (newPlan == 29) {
            newPlan = 6;
        } else if (newPlan == 44) {
            newPlan = 9;
        } else if (newPlan == 52) {
            newPlan = 35;
        } else if (newPlan == 55) {
            newPlan = 3;
        } else if (newPlan == 61) {
            newPlan = 13;
        } else if (newPlan == 63) {
            newPlan = 2;
        } else if (newPlan == 72) {
            newPlan = 51;
        }
        // Arrows that lead the player upwards
        else if (newPlan == 10) {
            newPlan = 23;
        } else if (newPlan == 17) {
            newPlan = 69;
        } else if (newPlan == 20) {
            newPlan = 32;
        } else if (newPlan == 22) {
            newPlan = 60;
        } else if (newPlan == 27) {
            newPlan = 41;
        } else if (newPlan == 28) {
            newPlan = 50;
        } else if (newPlan == 37) {
            newPlan = 66;
        } else if (newPlan == 45) {
            newPlan = 67;
        } else if (newPlan == 46) {
            newPlan = 62;
        } else if (newPlan == 54) {
            newPlan = 68;
        } else if (newPlan > TOTAL_PLANS) {
            // Player overshoots the goal, stays in place
            newPlan = player.plan;
        }

        player.plan = newPlan;
        playerPlans[playerAddress].push(newPlan);

        // Check for finish
        if (newPlan == WIN_PLAN) {
            player.isFinished = true;
            player.previousPlan = newPlan;
            player.isStart = false;
        }
    }

    function getRollHistory(
        address player
    ) public view returns (uint8[] memory) {
        return playerRolls[player];
    }

    function checkGameStatus(
        address playerAddress
    ) public view returns (bool isStart, bool isFinished) {
        Player storage player = players[playerAddress];
        return (player.isStart, player.isFinished);
    }

    function getPlanHistory(
        address player
    ) public view returns (uint256[] memory) {
        return playerPlans[player];
    }
}
/* solhint-disable */
